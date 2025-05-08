import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { httpServer } from './app';
import logger from './config/logger';

dotenv.config();

export const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to database');

    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`User API docs available at http://localhost:${PORT}/api/docs/user`);
      logger.info(`Admin API docs available at http://localhost:${PORT}/api/docs/admin`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info('Disconnected from database');
  process.exit(0);
});

startServer();
