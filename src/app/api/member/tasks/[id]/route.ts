import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { status } = data;

    // Verify assignment
    const assignment = await prisma.taskAssignment.findUnique({
      where: {
        taskId_userId: {
          taskId: params.id,
          userId: session.user.id
        }
      }
    });

    if (!assignment) {
      return NextResponse.json({ success: false, error: "Not assigned to this task" }, { status: 403 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ success: false, error: "Failed to update task" }, { status: 500 });
  }
}
