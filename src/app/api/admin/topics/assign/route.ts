import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assignTopic } from "@/lib/assignmentEngine";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topicId, memberId } = await request.json();
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });

    if (memberId) {
      // Manual assignment
      const topic = await prisma.topic.findUnique({ where: { id: topicId } });
      if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const assignment = await prisma.topicAssignment.create({
        data: {
          topicId,
          memberId,
          assignedBy: session.user.id,
          assignmentType: "MANUAL",
          status: "ASSIGNED",
        }
      });
      await prisma.topic.update({
        where: { id: topicId },
        data: { status: "ASSIGNED" }
      });
      await prisma.topicAssignmentHistory.create({
        data: {
          topicId,
          newMemberId: memberId,
          assignedBy: session.user.id,
          assignmentType: "MANUAL",
          reason: "Manually assigned by admin"
        }
      });
      return NextResponse.json({ assignment }, { status: 200 });
    } else {
      // Auto assignment
      const assignment = await assignTopic(topicId, admin?.organizationId);
      if (assignment) {
        return NextResponse.json({ assignment }, { status: 200 });
      } else {
        return NextResponse.json({ error: "Could not assign automatically (maybe no members or already assigned)" }, { status: 400 });
      }
    }

  } catch (error) {
    console.error("Error assigning topic:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
