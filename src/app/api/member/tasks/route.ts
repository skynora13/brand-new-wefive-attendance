import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        assignments: {
          some: {
            userId: session.user.id
          }
        }
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tasks" }, { status: 500 });
  }
}
