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
    const tasks = await prisma.task.findMany({
      include: {
        assignments: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Error fetching admin tasks:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { title, description, priority, dueDate, assigneeId } = data;

    if (!title || !assigneeId) {
      return NextResponse.json({ success: false, error: "Title and Assignee are required" }, { status: 400 });
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "TODO",
        assignments: {
          create: {
            userId: assigneeId
          }
        }
      },
      include: {
        assignments: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ success: false, error: "Failed to create task" }, { status: 500 });
  }
}
