import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../server';
import logger from '../../config/logger';
import { sendVerificationEmail } from '../../services/email.service';

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, country } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verifyToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        country,
        verifyToken,
      },
    });

    await sendVerificationEmail(user.email, user.verifyToken as string);

    return res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.',
    });
  } catch (error) {
    logger.error('Registration error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const admin = await prisma.admin.findUnique({
        where: { email },
      });

      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          role: 'admin',
        },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions,
      );

      return res.status(200).json({
        token,
        user: {
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: 'admin',
        },
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Email not verified' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: 'user',
      },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions,
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        role: 'user',
      },
    });
  } catch (error) {
    logger.error('Login error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const user = await prisma.user.findFirst({
      where: { verifyToken: token },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verifyToken: null,
      },
    });

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error('Email verification error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: { verifyToken },
    });

    await sendVerificationEmail(user.email, verifyToken);

    return res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    logger.error('Resend verification error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
