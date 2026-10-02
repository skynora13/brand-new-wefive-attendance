import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignments = await prisma.topicAssignment.findMany({
      where: { memberId: session.user.id },
      include: {
        topic: true,
        assigner: { select: { id: true, name: true } },
      },
      orderBy: { assignedAt: "desc" },
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Error fetching member topics:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
