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
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit")) || 50;
    const filter = url.searchParams.get("filter") || "ALL"; // ALL, AUTH, SYSTEM, ATTENDANCE

    const whereClause: any = {};
    if (filter === "AUTH") {
      whereClause.targetType = "AUTHENTICATION";
    } else if (filter === "ATTENDANCE") {
      whereClause.targetType = "ATTENDANCE";
    } else if (filter === "SYSTEM") {
      whereClause.targetType = { in: ["USER", "SETTINGS", "ORGANIZATION"] };
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        actor: { select: { name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
