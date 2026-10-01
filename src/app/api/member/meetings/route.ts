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
    const meetings = await prisma.meetingParticipant.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        meeting: {
          include: {
            creator: { select: { name: true } }
          }
        }
      },
      orderBy: {
        meeting: {
          startTime: 'asc'
        }
      }
    });

    // Map to just return the meetings for easier frontend consumption
    const mappedMeetings = meetings.map(m => ({
      ...m.meeting,
      participantId: m.id,
      joined: m.joined
    }));

    return NextResponse.json({ success: true, data: mappedMeetings });
  } catch (error) {
    console.error("Error fetching member meetings:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch meetings" }, { status: 500 });
  }
}
