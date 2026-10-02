import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash('admin@123', 10);
    
    // Check if admin already exists to prevent duplicate seeding errors
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@wefive.com' }
    });

    if (existingAdmin) {
      return NextResponse.json({ message: 'Database already seeded!' });
    }

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

    return NextResponse.json({ message: 'Database seeded successfully on production!' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
