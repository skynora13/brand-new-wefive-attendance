import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { status, adminComment } = data;

    if (!["APPROVED", "REJECTED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const leave = await prisma.leaveRequest.update({
      where: { id: params.id },
      data: {
        status,
        adminComment: adminComment || null,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: `LEAVE_${status}`,
        targetType: "LEAVE_REQUEST",
        targetId: leave.id,
      }
    });

    return NextResponse.json({ success: true, data: leave });
  } catch (error) {
    console.error("Error updating leave:", error);
    return NextResponse.json({ success: false, error: "Failed to update leave request" }, { status: 500 });
  }
}
