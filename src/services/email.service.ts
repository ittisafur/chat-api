import SibApiV3Sdk from 'sib-api-v3-sdk';
import logger from '../config/logger';

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    const verificationUrl = `${process.env.API_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.sender = {
      email: process.env.EMAIL_FROM || 'noreply@ittisafur.com',
      name: 'Chat API',
    };
    sendSmtpEmail.subject = 'Email Verification';
    sendSmtpEmail.htmlContent = `
      <h1>Email Verification</h1>
      <p>Please click on the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>If you did not request this verification, please ignore this email.</p>
    `;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    logger.info(`Verification email sent to ${email}`);
    return data;
  } catch (error) {
    logger.error('Error sending verification email', error);

    if (process.env.NODE_ENV === 'development') {
      logger.info(`[DEV] Verification token for ${email}: ${token}`);

      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        await prisma.user.update({
          where: { email },
          data: { isVerified: true },
        });

        logger.info(`[DEV] User ${email} automatically verified for testing`);
      } catch (dbError) {
        logger.error('Failed to auto-verify user', dbError);
      }
    }

    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.sender = {
      email: process.env.EMAIL_FROM || 'noreply@ittisafur.com',
      name: 'Chat API',
    };
    sendSmtpEmail.subject = 'Password Reset';
    sendSmtpEmail.htmlContent = `
      <h1>Password Reset</h1>
      <p>Please click on the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you did not request a password reset, please ignore this email.</p>
    `;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    logger.info(`Password reset email sent to ${email}`);
    return data;
  } catch (error) {
    logger.error('Error sending password reset email', error);
    throw new Error('Failed to send password reset email');
  }
};
