import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { name, phone } = data;

    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone; // Allow clearing phone

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      }
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
