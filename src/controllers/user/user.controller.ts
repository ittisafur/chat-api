import { Request, Response } from 'express';
import { prisma } from '../../server';
import logger from '../../config/logger';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        country: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    logger.error('Get profile error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isVerified: true,
        id: { not: req.user?.id }, // Exclude current user
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        country: true,
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    logger.error('Get all users error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const group = await prisma.group.create({
      data: {
        name,
        members: {
          create: {
            userId: req.user?.id as string,
          },
        },
      },
    });

    return res.status(201).json(group);
  } catch (error) {
    logger.error('Create group error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getGroups = async (req: Request, res: Response) => {
  try {
    const groups = await prisma.groupMember.findMany({
      where: {
        userId: req.user?.id,
      },
      select: {
        group: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
        joinedAt: true,
      },
    });

    const formattedGroups = groups.map((membership) => ({
      id: membership.group.id,
      name: membership.group.name,
      createdAt: membership.group.createdAt,
      updatedAt: membership.group.updatedAt,
      memberCount: membership.group._count.members,
      joinedAt: membership.joinedAt,
    }));

    return res.status(200).json(formattedGroups);
  } catch (error) {
    logger.error('Get groups error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const joinGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.user?.id as string,
          groupId,
        },
      },
    });

    if (existingMembership) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    const membership = await prisma.groupMember.create({
      data: {
        userId: req.user?.id as string,
        groupId,
      },
      include: {
        group: {
          select: {
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: `Joined group: ${membership.group.name}`,
      groupId: membership.groupId,
      joinedAt: membership.joinedAt,
    });
  } catch (error) {
    logger.error('Join group error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const leaveGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.user?.id as string,
          groupId,
        },
      },
    });

    if (!membership) {
      return res.status(404).json({ message: 'Not a member of this group' });
    }

    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId: req.user?.id as string,
          groupId,
        },
      },
    });

    return res.status(200).json({
      message: 'Left group successfully',
      groupId,
    });
  } catch (error) {
    logger.error('Leave group error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getGroupMembers = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: req.user?.id as string,
          groupId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    const members = await prisma.groupMember.findMany({
      where: {
        groupId,
      },
      select: {
        userId: true,
        joinedAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const formattedMembers = members.map((member) => ({
      id: member.userId,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      email: member.user.email,
      joinedAt: member.joinedAt,
    }));

    return res.status(200).json(formattedMembers);
  } catch (error) {
    logger.error('Get group members error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
