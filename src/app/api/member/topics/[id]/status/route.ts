import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, progress, notes } = await request.json();

    const assignment = await prisma.topicAssignment.findUnique({
      where: { id: params.id },
      include: { topic: true },
    });

    if (!assignment || assignment.memberId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const updated = await prisma.topicAssignment.update({
      where: { id: params.id },
      data: {
        status: status || assignment.status,
        progress: progress !== undefined ? progress : assignment.progress,
        notes: notes !== undefined ? notes : assignment.notes,
        completedAt: status === "COMPLETED" && assignment.status !== "COMPLETED" ? new Date() : assignment.completedAt,
      },
    });

    // Also update topic status if it was completed
    if (status === "COMPLETED") {
      await prisma.topic.update({
        where: { id: assignment.topicId },
        data: { status: "COMPLETED" },
      });
    } else if (status === "IN_PROGRESS" && assignment.topic.status !== "IN_PROGRESS") {
      await prisma.topic.update({
        where: { id: assignment.topicId },
        data: { status: "IN_PROGRESS" },
      });
    }

    return NextResponse.json({ assignment: updated });
  } catch (error) {
    console.error("Error updating topic status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
