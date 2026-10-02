import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setting = await prisma.systemSetting.findUnique({
      where: { key: "assignment_strategy" },
    });

    let strategy = "ROUND_ROBIN";
    if (setting) {
      try {
        const val = JSON.parse(setting.value);
        strategy = val.strategy || "ROUND_ROBIN";
      } catch (e) {}
    }

    return NextResponse.json({ strategy });
  } catch (error) {
    console.error("Error fetching setting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { strategy } = await request.json();

    const setting = await prisma.systemSetting.upsert({
      where: { key: "assignment_strategy" },
      update: { value: JSON.stringify({ strategy }) },
      create: { key: "assignment_strategy", value: JSON.stringify({ strategy }) },
    });

    return NextResponse.json({ strategy });
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
