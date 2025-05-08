import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seed...');
    console.log('Admin email:', process.env.ADMIN_EMAIL);
    console.log('Admin password length:', process.env.ADMIN_PASSWORD?.length || 0);

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be defined in environment variables');
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    console.log('Password hashed successfully');

    const admin = await prisma.admin.upsert({
      where: { email: process.env.ADMIN_EMAIL },
      update: {},
      create: {
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
      },
    });

    console.log(`Default admin created/updated: ${admin.email} (ID: ${admin.id})`);
    return admin;
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error; // Re-throw to fail the seed command
  }
}

main()
  .then(async (result) => {
    console.log('Seeding completed successfully:', result);
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seeding process:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
