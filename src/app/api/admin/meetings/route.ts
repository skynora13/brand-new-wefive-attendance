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
    const meetings = await prisma.meeting.findMany({
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        },
        creator: { select: { name: true } }
      },
      orderBy: { startTime: 'desc' }
    });

    return NextResponse.json({ success: true, data: meetings });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch meetings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { title, description, startTime, endTime, url, participantIds } = data;

    if (!title || !startTime || !endTime || !participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        url,
        creatorId: session.user.id,
        participants: {
          create: participantIds.map((userId: string) => ({
            userId
          }))
        }
      },
      include: {
        participants: {
          include: { user: { select: { name: true } } }
        }
      }
    });

    return NextResponse.json({ success: true, data: meeting });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json({ success: false, error: "Failed to create meeting" }, { status: 500 });
  }
}
