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
    const notifications = await prisma.notification.findMany({
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { title, content, type, targetUsers } = data; // targetUsers is array of userIds or "ALL"

    if (!title || !content || !targetUsers) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    let userIds: string[] = [];

    if (targetUsers === "ALL") {
      const members = await prisma.user.findMany({ where: { role: "MEMBER", status: "ACTIVE" } });
      userIds = members.map(m => m.id);
    } else if (Array.isArray(targetUsers)) {
      userIds = targetUsers;
    } else {
      return NextResponse.json({ success: false, error: "Invalid target users" }, { status: 400 });
    }

    if (userIds.length === 0) {
      return NextResponse.json({ success: false, error: "No target users found" }, { status: 400 });
    }

    // Create notifications for each user
    for (const userId of userIds) {
      await prisma.notification.create({
        data: {
          userId,
          title,
          content,
          type: type || "INFO",
          isRead: false
        }
      });
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "SEND_NOTIFICATION",
        targetType: "SYSTEM",
        metadata: JSON.stringify({ title, targetCount: userIds.length })
      }
    });

    return NextResponse.json({ success: true, message: `Sent to ${userIds.length} members` });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ success: false, error: "Failed to send notification" }, { status: 500 });
  }
}
