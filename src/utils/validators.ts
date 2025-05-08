import { z } from 'zod';

export const registerUserSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
  country: z.string().min(2, 'Country must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const createAdminSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
});

export const sendMessageSchema = z.object({
  receiverId: z.string().uuid('Invalid receiver ID'),
  content: z.string().min(1, 'Message content is required'),
});

export const createGroupSchema = z.object({
  name: z.string().min(3, 'Group name must be at least 3 characters'),
});

export const joinGroupSchema = z.object({
  groupId: z.string().uuid('Invalid group ID'),
});

export const sendGroupMessageSchema = z.object({
  groupId: z.string().uuid('Invalid group ID'),
  content: z.string().min(1, 'Message content is required'),
});
