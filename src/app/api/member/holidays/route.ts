import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Only return upcoming or current year holidays for members
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    
    const holidays = await prisma.holiday.findMany({
      where: {
        date: { gte: startOfYear }
      },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json({ success: true, data: holidays });
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch holidays" }, { status: 500 });
  }
}
