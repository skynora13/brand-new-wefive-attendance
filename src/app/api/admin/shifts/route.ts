import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const shifts = await prisma.shift.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: shifts });
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch shifts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { name, startTime, endTime, gracePeriod, workingDays, isDefault } = data;

    if (!name || !startTime || !endTime || !workingDays) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // If making this the default shift, unset the others
    if (isDefault) {
      await prisma.shift.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    const shift = await prisma.shift.create({
      data: {
        name,
        startTime,
        endTime,
        gracePeriod: parseInt(gracePeriod) || 0,
        workingDays,
        isDefault: !!isDefault
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CREATE_SHIFT",
        targetType: "SYSTEM",
        targetId: shift.id,
        metadata: JSON.stringify({ name, startTime, endTime })
      }
    });

    return NextResponse.json({ success: true, data: shift });
  } catch (error) {
    console.error("Error creating shift:", error);
    return NextResponse.json({ success: false, error: "Failed to create shift" }, { status: 500 });
  }
}
