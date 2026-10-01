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
    const leaves = await prisma.leaveRequest.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: leaves });
  } catch (error) {
    console.error("Error fetching leaves:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch leave requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "MEMBER") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { type, startDate, endDate, reason } = data;

    if (!type || !startDate || !endDate || !reason) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return NextResponse.json({ success: false, error: "End date cannot be before start date" }, { status: 400 });
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId: session.user.id,
        type,
        startDate: start,
        endDate: end,
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, data: leaveRequest });
  } catch (error) {
    console.error("Error submitting leave:", error);
    return NextResponse.json({ success: false, error: "Failed to submit leave request" }, { status: 500 });
  }
}
