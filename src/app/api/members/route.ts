import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: "Email is already in use." }, { status: 400 });
    }

    if (data.employeeId) {
       const existingEmployeeId = await prisma.user.findUnique({
         where: { employeeId: data.employeeId },
       });
       if (existingEmployeeId) {
         return NextResponse.json({ success: false, error: "Employee ID is already in use." }, { status: 400 });
       }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const newMember = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone || null,
        employeeId: data.employeeId || null,
        department: data.department || null,
        role: data.role || "MEMBER",
        status: data.status || "ACTIVE",
        shiftId: data.shiftId || null,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : null,
      },
    });

    // Create an audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CREATE_MEMBER",
        targetType: "USER",
        targetId: newMember.id,
        metadata: JSON.stringify({ email: newMember.email, name: newMember.name }),
      }
    });

    return NextResponse.json({ success: true, data: { id: newMember.id, name: newMember.name } });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json({ success: false, error: "Failed to create member." }, { status: 500 });
  }
}
