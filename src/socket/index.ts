import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import logger from '../config/logger';

interface JwtPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
  };
}

const setupSocketIO = (io: Server): void => {
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || !user.isVerified) {
        return next(new Error('Invalid user or email not verified'));
      }

      socket.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      logger.error('Socket authentication error', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.user?.id}`);

    if (socket.user) {
      socket.join(`user:${socket.user.id}`);
    }

    socket.on('direct-message', async (data: { receiverId: string; content: string }) => {
      try {
        if (!socket.user) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        const { receiverId, content } = data;

        const receiver = await prisma.user.findUnique({
          where: { id: receiverId },
        });

        if (!receiver) {
          socket.emit('error', { message: 'Receiver not found' });
          return;
        }

        const message = await prisma.message.create({
          data: {
            content,
            senderId: socket.user.id,
            receiverId,
          },
        });

        io.to(`user:${receiverId}`).emit('direct-message', {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          createdAt: message.createdAt,
        });

        socket.emit('message-sent', {
          id: message.id,
          content: message.content,
          receiverId: message.receiverId,
          createdAt: message.createdAt,
        });
      } catch (error) {
        logger.error('Direct message error', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('join-group', async (data: { groupId: string }) => {
      try {
        if (!socket.user) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        const { groupId } = data;

        const group = await prisma.group.findUnique({
          where: { id: groupId },
        });

        if (!group) {
          socket.emit('error', { message: 'Group not found' });
          return;
        }

        const membership = await prisma.groupMember.findUnique({
          where: {
            userId_groupId: {
              userId: socket.user.id,
              groupId,
            },
          },
        });

        if (!membership) {
          await prisma.groupMember.create({
            data: {
              userId: socket.user.id,
              groupId,
            },
          });
        }

        socket.join(`group:${groupId}`);

        socket.emit('group-joined', { groupId });

        socket.to(`group:${groupId}`).emit('user-joined', {
          groupId,
          userId: socket.user.id,
        });
      } catch (error) {
        logger.error('Join group error', error);
        socket.emit('error', { message: 'Failed to join group' });
      }
    });

    socket.on('leave-group', async (data: { groupId: string }) => {
      try {
        if (!socket.user) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        const { groupId } = data;

        await prisma.groupMember.delete({
          where: {
            userId_groupId: {
              userId: socket.user.id,
              groupId,
            },
          },
        });

        socket.leave(`group:${groupId}`);

        socket.emit('group-left', { groupId });

        socket.to(`group:${groupId}`).emit('user-left', {
          groupId,
          userId: socket.user.id,
        });
      } catch (error) {
        logger.error('Leave group error', error);
        socket.emit('error', { message: 'Failed to leave group' });
      }
    });

    socket.on('group-message', async (data: { groupId: string; content: string }) => {
      try {
        if (!socket.user) {
          socket.emit('error', { message: 'Authentication required' });
          return;
        }

        const { groupId, content } = data;

        const membership = await prisma.groupMember.findUnique({
          where: {
            userId_groupId: {
              userId: socket.user.id,
              groupId,
            },
          },
        });

        if (!membership) {
          socket.emit('error', { message: 'You are not a member of this group' });
          return;
        }

        const message = await prisma.groupMessage.create({
          data: {
            content,
            userId: socket.user.id,
            groupId,
          },
        });

        io.to(`group:${groupId}`).emit('group-message', {
          id: message.id,
          content: message.content,
          userId: message.userId,
          groupId: message.groupId,
          createdAt: message.createdAt,
        });
      } catch (error) {
        logger.error('Group message error', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user?.id}`);
    });
  });
};

export default setupSocketIO;
