import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 10);

  const admin = await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'ittisafur@gmail.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'ittisafur@gmail.com',
      password: hashedPassword,
      firstName: 'Ittisafur',
      lastName: 'Rahman',
    },
  });

  console.log(`Default admin created: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
