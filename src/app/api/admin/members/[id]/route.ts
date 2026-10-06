import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Delete all dependent records in a transaction to avoid foreign key constraints
    await prisma.$transaction([
      prisma.attendanceRecord.deleteMany({ where: { userId: id } }),
      prisma.leaveRequest.deleteMany({ where: { userId: id } }),
      prisma.leaveBalance.deleteMany({ where: { userId: id } }),
      prisma.taskAssignment.deleteMany({ where: { userId: id } }),
      prisma.taskComment.deleteMany({ where: { userId: id } }),
      prisma.auditLog.deleteMany({ where: { actorId: id } }),
      prisma.topicAssignmentHistory.deleteMany({
        where: {
          OR: [
            { previousMemberId: id },
            { newMemberId: id },
            { assignedBy: id }
          ]
        }
      }),
      prisma.topicAssignment.deleteMany({ where: { memberId: id } }),
      prisma.user.delete({ where: { id } })
    ]);

    return NextResponse.json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting member:", error);
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Don't allow password updates through this general endpoint (should be separate)
    const { password, ...updateData } = data;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}
