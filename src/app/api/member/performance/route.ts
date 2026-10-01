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
    const url = new URL(request.url);
    const month = url.searchParams.get("month");

    if (!month) {
      return NextResponse.json({ success: false, error: "Month parameter is required" }, { status: 400 });
    }

    const scorecard = await prisma.performanceScorecard.findUnique({
      where: {
        userId_month: {
          userId: session.user.id,
          month: month
        }
      }
    });

    return NextResponse.json({ success: true, data: scorecard });
  } catch (error) {
    console.error("Error fetching member scorecard:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch scorecard" }, { status: 500 });
  }
}
