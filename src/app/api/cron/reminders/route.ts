import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In a real production environment, this would be triggered by a Cron Job (like Vercel Cron) every day at 7:00 PM.
export async function GET(request: Request) {
  try {
    // 1. Get all today's attendance records where the user has punched in but NOT punched out yet.
    // For simplicity in SQLite, we just look for records created today.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeAttendances = await prisma.attendanceRecord.findMany({
      where: {
        date: {
          gte: today
        },
        punchOut: null,
        punchIn: { not: null }
      }
    });

    if (activeAttendances.length === 0) {
      return NextResponse.json({ success: true, message: "No active users found to remind." });
    }

    // 2. Create a notification for each of these users reminding them to check out.
    const notifications = activeAttendances.map(att => ({
      userId: att.userId,
      title: "Friendly Reminder: Time to Checkout! 🕒",
      content: "It's around 7:00 PM. If you are wrapping up your work for the day, please remember to punch out on your attendance dashboard to accurately log your hours.",
      type: "REMINDER",
      link: "/member/attendance",
      isRead: false
    }));

    // Prisma SQLite doesn't natively support createMany easily, but we can do a transaction.
    for (const notif of notifications) {
      await prisma.notification.create({
        data: notif
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully sent checkout reminders to ${notifications.length} members.` 
    });
  } catch (error) {
    console.error("Error triggering reminders:", error);
    return NextResponse.json({ success: false, error: "Failed to run reminder cron" }, { status: 500 });
  }
}
