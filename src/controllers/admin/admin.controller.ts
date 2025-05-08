import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../server';
import logger from '../../config/logger';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        country: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sentMessages: true,
            groupMembers: true,
          },
        },
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    logger.error('Admin get all users error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        country: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        groupMembers: {
          select: {
            groupId: true,
            joinedAt: true,
            group: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Format groups
    const groups = user.groupMembers.map((membership) => ({
      id: membership.groupId,
      name: membership.group.name,
      joinedAt: membership.joinedAt,
    }));

    // Return user without raw group members data
    const { groupMembers, ...userData } = user;
    return res.status(200).json({
      ...userData,
      groups,
    });
  } catch (error) {
    logger.error('Admin get user by ID error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json(admins);
  } catch (error) {
    logger.error('Admin get all admins error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAdminById = async (req: Request, res: Response) => {
  try {
    const { adminId } = req.params;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    return res.status(200).json(admin);
  } catch (error) {
    logger.error('Admin get admin by ID error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already used by a user' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: 'Admin created successfully',
      admin,
    });
  } catch (error) {
    logger.error('Admin create admin error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
    });

    return res.status(200).json(groups);
  } catch (error) {
    logger.error('Admin get all groups error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            userId: true,
            joinedAt: true,
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const members = group.members.map((membership) => ({
      id: membership.userId,
      email: membership.user.email,
      firstName: membership.user.firstName,
      lastName: membership.user.lastName,
      joinedAt: membership.joinedAt,
    }));

    const { members: rawMembers, ...groupData } = group;
    return res.status(200).json({
      ...groupData,
      members,
      messageCount: group._count.messages,
    });
  } catch (error) {
    logger.error('Admin get group by ID error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
