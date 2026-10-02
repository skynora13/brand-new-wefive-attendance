import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assignTopic } from "@/lib/assignmentEngine";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });

    const topics = await prisma.topic.findMany({
      where: admin?.organizationId ? { organizationId: admin.organizationId } : {},
      include: {
        creator: { select: { id: true, name: true } },
        assignments: {
          include: {
            member: { select: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ topics });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    });

    const topic = await prisma.topic.create({
      data: {
        ...data,
        createdBy: session.user.id,
        organizationId: admin?.organizationId,
      },
    });

    if (topic.assignmentMode === "AUTOMATIC") {
      await assignTopic(topic.id, admin?.organizationId);
    }

    return NextResponse.json({ topic }, { status: 201 });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
