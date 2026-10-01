import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin@123', 10);
  
  const organization = await prisma.organization.create({
    data: {
      name: 'WeFive',
    },
  });

  const defaultShift = await prisma.shift.create({
    data: {
      organizationId: organization.id,
      name: 'Default Shift',
      startTime: '09:00',
      endTime: '18:00',
      gracePeriod: 15,
      workingDays: '1,2,3,4,5,6',
      isDefault: true,
    }
  });

  await prisma.user.upsert({
    where: { email: 'admin@wefive.com' },
    update: {},
    create: {
      email: 'admin@wefive.com',
      name: 'Administrator',
      password: hashedPassword,
      role: 'ADMIN',
      organizationId: organization.id,
      shiftId: defaultShift.id,
    },
  });

  console.log('Database seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
