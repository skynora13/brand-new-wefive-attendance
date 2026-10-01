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
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        shift: true,
      }
    });

    if (!user) {
       return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Remove password before sending to client
    const { password, ...safeUser } = user;

    return NextResponse.json({ success: true, data: safeUser });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}
