import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    let org = await prisma.organization.findFirst();
    
    // If no org exists, create a default one
    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: "WeFive",
          timezone: "Asia/Kolkata",
        }
      });
    }

    return NextResponse.json({ success: true, data: org });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { name, timezone } = data;

    let org = await prisma.organization.findFirst();
    if (!org) {
      return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });
    }

    const updated = await prisma.organization.update({
      where: { id: org.id },
      data: { name, timezone },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
