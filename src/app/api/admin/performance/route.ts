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
    const url = new URL(request.url);
    const month = url.searchParams.get("month"); // e.g. "2026-09"

    if (!month) {
      return NextResponse.json({ success: false, error: "Month parameter is required" }, { status: 400 });
    }

    const members = await prisma.user.findMany({
      where: { role: "MEMBER" },
      include: {
        scorecards: {
          where: { month }
        }
      }
    });

    const data = members.map(member => {
      const scorecard = member.scorecards[0];
      return {
        userId: member.id,
        name: member.name,
        department: member.department,
        hasScorecard: !!scorecard,
        scorecardId: scorecard?.id || null,
        attendanceScore: scorecard?.attendanceScore || 0,
        taskScore: scorecard?.taskScore || 0,
        shootScore: scorecard?.shootScore || 0,
        overallScore: scorecard?.overallScore || 0,
        comments: scorecard?.comments || "",
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching scorecards:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch scorecards" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { userId, month, attendanceScore, taskScore, shootScore, comments } = data;

    const overallScore = ((parseFloat(attendanceScore) + parseFloat(taskScore) + parseFloat(shootScore)) / 3).toFixed(2);

    const scorecard = await prisma.performanceScorecard.upsert({
      where: {
        userId_month: {
          userId,
          month
        }
      },
      update: {
        attendanceScore: parseFloat(attendanceScore),
        taskScore: parseFloat(taskScore),
        shootScore: parseFloat(shootScore),
        overallScore: parseFloat(overallScore),
        comments
      },
      create: {
        userId,
        month,
        attendanceScore: parseFloat(attendanceScore),
        taskScore: parseFloat(taskScore),
        shootScore: parseFloat(shootScore),
        overallScore: parseFloat(overallScore),
        comments
      }
    });

    return NextResponse.json({ success: true, data: scorecard });
  } catch (error) {
    console.error("Error saving scorecard:", error);
    return NextResponse.json({ success: false, error: "Failed to save scorecard" }, { status: 500 });
  }
}
