import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const monthStr = url.searchParams.get("month");
    
    let startDate = startOfMonth(new Date());
    let endDate = endOfMonth(new Date());

    if (monthStr) {
      const targetDate = new Date(monthStr);
      startDate = startOfMonth(targetDate);
      endDate = endOfMonth(targetDate);
    }

    const [totalMembers, presentRecords, leaveRecords, absentRecords, lateRecords] = await Promise.all([
      prisma.user.count({ where: { role: "MEMBER", status: "ACTIVE" } }),
      prisma.attendanceRecord.count({ where: { date: { gte: startDate, lte: endDate }, status: "PRESENT" } }),
      prisma.attendanceRecord.count({ where: { date: { gte: startDate, lte: endDate }, status: "ON_LEAVE" } }),
      prisma.attendanceRecord.count({ where: { date: { gte: startDate, lte: endDate }, status: "ABSENT" } }),
      prisma.attendanceRecord.count({ where: { date: { gte: startDate, lte: endDate }, status: "LATE" } }),
    ]);

    // Get member summary
    const members = await prisma.user.findMany({
      where: { role: "MEMBER" },
      select: {
        id: true,
        name: true,
        employeeId: true,
        department: true,
        attendances: {
          where: { date: { gte: startDate, lte: endDate } },
          select: { status: true, workHours: true }
        }
      }
    });

    const memberStats = members.map(m => {
      let present = 0, absent = 0, late = 0, onLeave = 0, totalHours = 0;
      m.attendances.forEach(a => {
        if (a.status === 'PRESENT') present++;
        if (a.status === 'ABSENT') absent++;
        if (a.status === 'LATE') late++;
        if (a.status === 'ON_LEAVE') onLeave++;
        if (a.workHours) totalHours += a.workHours;
      });
      return {
        id: m.id,
        name: m.name,
        employeeId: m.employeeId,
        department: m.department,
        present,
        absent,
        late,
        onLeave,
        totalHours
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: { totalMembers, presentRecords, leaveRecords, absentRecords, lateRecords },
        memberStats
      }
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json({ success: false, error: "Failed to generate report" }, { status: 500 });
  }
}
