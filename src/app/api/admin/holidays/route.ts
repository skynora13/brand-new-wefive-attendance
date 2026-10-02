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
    const holidays = await prisma.holiday.findMany({
      orderBy: { date: 'asc' }
    });

    return NextResponse.json({ success: true, data: holidays });
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch holidays" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { name, date, description } = data;

    if (!name || !date) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const holiday = await prisma.holiday.create({
      data: {
        name,
        date: new Date(date),
        description
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CREATE_HOLIDAY",
        targetType: "SYSTEM",
        targetId: holiday.id,
        metadata: JSON.stringify({ name, date })
      }
    });

    return NextResponse.json({ success: true, data: holiday });
  } catch (error) {
    console.error("Error creating holiday:", error);
    return NextResponse.json({ success: false, error: "Failed to create holiday" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing holiday ID" }, { status: 400 });
    }

    await prisma.holiday.delete({
      where: { id }
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "DELETE_HOLIDAY",
        targetType: "SYSTEM",
        targetId: id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting holiday:", error);
    return NextResponse.json({ success: false, error: "Failed to delete holiday" }, { status: 500 });
  }
}
