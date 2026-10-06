import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Use IST date
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const today = startOfDay(istTime);
  
  try {
    const attendance = await prisma.attendanceRecord.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      include: {
        breaks: true
      }
    });
    
    return NextResponse.json({ success: true, data: attendance });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await request.json(); // "PUNCH_IN" or "PUNCH_OUT"
  
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const today = startOfDay(istTime);
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { shift: true },
    });
    
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const shift = user.shift;
    
    if (action === "PUNCH_IN") {
      // Check if already punched in
      const existing = await prisma.attendanceRecord.findUnique({
        where: {
          userId_date: {
            userId: session.user.id,
            date: today,
          },
        },
      });

      if (existing) {
        return NextResponse.json({ success: false, error: "Already punched in for today" }, { status: 400 });
      }

      // Calculate LATE or PRESENT based on shift
      let status = "PRESENT";
      if (shift) {
        const shiftStartParts = shift.startTime.split(':');
        const shiftStartTime = new Date(istTime);
        shiftStartTime.setHours(parseInt(shiftStartParts[0]), parseInt(shiftStartParts[1]), 0, 0);
        
        // Add grace period
        const latestTime = new Date(shiftStartTime.getTime() + (shift.gracePeriod * 60000));
        
        if (istTime > latestTime) {
          status = "LATE";
        }
      }

      const attendance = await prisma.attendanceRecord.create({
        data: {
          userId: user.id,
          date: today,
          punchIn: now, // Storing absolute time, assuming backend timezone is UTC but calculations are in IST
          status: status as any,
        },
        include: { breaks: true }
      });
      
      return NextResponse.json({ success: true, data: attendance });
      
    } else if (action === "PUNCH_OUT") {
      const existing = await prisma.attendanceRecord.findUnique({
        where: {
          userId_date: {
            userId: session.user.id,
            date: today,
          },
        },
        include: { breaks: true }
      });

      if (!existing || !existing.punchIn) {
        return NextResponse.json({ success: false, error: "No punch in record found" }, { status: 400 });
      }

      if (existing.punchOut) {
        return NextResponse.json({ success: false, error: "Already punched out for today" }, { status: 400 });
      }

      // If there is an active break, auto-end it
      const activeBreak = existing.breaks.find((b: any) => !b.endTime);
      let additionalBreakHours = 0;
      if (activeBreak) {
         const breakDuration = (now.getTime() - new Date(activeBreak.startTime).getTime()) / (1000 * 60 * 60);
         await prisma.attendanceBreak.update({
           where: { id: activeBreak.id },
           data: { endTime: now, duration: breakDuration }
         });
         additionalBreakHours = breakDuration;
      }

      // Calculate work hours
      const workMs = now.getTime() - existing.punchIn.getTime();
      const totalHours = workMs / (1000 * 60 * 60);
      const totalBreakHours = (existing.breakHours || 0) + additionalBreakHours;
      const workHours = Math.max(0, totalHours - totalBreakHours);
      
      // Calculate overtime if shift exists
      let overtimeHours = 0;
      if (shift) {
        const shiftStartParts = shift.startTime.split(':');
        const shiftEndParts = shift.endTime.split(':');
        
        const startH = parseInt(shiftStartParts[0]);
        const startM = parseInt(shiftStartParts[1]);
        const endH = parseInt(shiftEndParts[0]);
        const endM = parseInt(shiftEndParts[1]);
        
        const shiftDurationHours = (endH - startH) + (endM - startM) / 60;
        
        if (workHours > shiftDurationHours) {
          overtimeHours = workHours - shiftDurationHours;
        }
      }

      const attendance = await prisma.attendanceRecord.update({
        where: { id: existing.id },
        data: {
          punchOut: now,
          workHours,
          overtimeHours,
          breakHours: totalBreakHours
        },
        include: { breaks: true }
      });
      
      return NextResponse.json({ success: true, data: attendance });
    } else if (action === "START_BREAK") {
      const existing = await prisma.attendanceRecord.findUnique({
        where: {
          userId_date: {
            userId: session.user.id,
            date: today,
          },
        },
        include: { breaks: true }
      });
      if (!existing || !existing.punchIn) return NextResponse.json({ success: false, error: "Not punched in" }, { status: 400 });
      if (existing.punchOut) return NextResponse.json({ success: false, error: "Already punched out" }, { status: 400 });
      
      const activeBreak = existing.breaks.find((b: any) => !b.endTime);
      if (activeBreak) return NextResponse.json({ success: false, error: "Already on a break" }, { status: 400 });

      await prisma.attendanceBreak.create({
        data: {
          attendanceId: existing.id,
          startTime: now,
        }
      });

      const updated = await prisma.attendanceRecord.findUnique({ where: { id: existing.id }, include: { breaks: true } });
      return NextResponse.json({ success: true, data: updated });
    } else if (action === "END_BREAK") {
      const existing = await prisma.attendanceRecord.findUnique({
        where: {
          userId_date: {
            userId: session.user.id,
            date: today,
          },
        },
        include: { breaks: true }
      });
      if (!existing) return NextResponse.json({ success: false, error: "Not punched in" }, { status: 400 });
      
      const activeBreak = existing.breaks.find((b: any) => !b.endTime);
      if (!activeBreak) return NextResponse.json({ success: false, error: "Not currently on a break" }, { status: 400 });

      const duration = (now.getTime() - new Date(activeBreak.startTime).getTime()) / (1000 * 60 * 60);

      await prisma.attendanceBreak.update({
        where: { id: activeBreak.id },
        data: { endTime: now, duration }
      });

      const updated = await prisma.attendanceRecord.update({
        where: { id: existing.id },
        data: { breakHours: (existing.breakHours || 0) + duration },
        include: { breaks: true }
      });

      return NextResponse.json({ success: true, data: updated });
    }
    
    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to process attendance" }, { status: 500 });
  }
}
