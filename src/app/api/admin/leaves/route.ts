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
    const leaves = await prisma.leaveRequest.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: leaves });
  } catch (error) {
    console.error("Error fetching admin leaves:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch leave requests" }, { status: 500 });
  }
}
