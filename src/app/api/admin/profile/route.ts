import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
       return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const { password, ...safeUser } = user;
    return NextResponse.json({ success: true, data: safeUser });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { name, email, password } = data;

    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) {
      // check if email is taken
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json({ success: false, error: "Email is already in use" }, { status: 400 });
      }
      updateData.email = email;
    }
    
    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }
}
