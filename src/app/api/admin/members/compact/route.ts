import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const members = await prisma.user.findMany({
      where: { role: "MEMBER" },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch members" }, { status: 500 });
  }
}
