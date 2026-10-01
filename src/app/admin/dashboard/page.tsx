import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import { Users, UserCheck, Clock, UserX, Calendar, Briefcase, Activity } from "lucide-react";

export default async function AdminDashboard() {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const today = startOfDay(istTime);
  const endToday = endOfDay(istTime);

  // Fallback data if DB fails during SSR
  let stats = {
    totalMembers: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
    onLeave: 0,
    currentlyWorking: 0,
    totalHours: 0,
    overtime: 0,
  };

  try {
    const totalMembers = await prisma.user.count({
      where: { role: "MEMBER" },
    });

    const todayAttendance = await prisma.attendanceRecord.findMany({
      where: { date: today },
    });

    const present = todayAttendance.filter(a => a.status === "PRESENT").length;
    const late = todayAttendance.filter(a => a.status === "LATE").length;
    const onLeave = todayAttendance.filter(a => a.status === "ON_LEAVE").length;
    const working = todayAttendance.filter(a => a.punchIn && !a.punchOut).length;
    
    let totalWorkHours = 0;
    let totalOvertimeHours = 0;
    
    todayAttendance.forEach(a => {
      if (a.workHours) totalWorkHours += a.workHours;
      if (a.overtimeHours) totalOvertimeHours += a.overtimeHours;
    });

    const absent = totalMembers - present - late - onLeave;

    stats = {
      totalMembers,
      presentToday: present,
      lateToday: late,
      absentToday: absent > 0 ? absent : 0,
      onLeave,
      currentlyWorking: working,
      totalHours: Math.round(totalWorkHours * 10) / 10,
      overtime: Math.round(totalOvertimeHours * 10) / 10,
    };
  } catch (error) {
    console.error("Error fetching admin stats", error);
  }

  const statCards = [
    { label: "Total Members", value: stats.totalMembers, icon: <Users size={24} className="text-primary" /> },
    { label: "Present Today", value: stats.presentToday, icon: <UserCheck size={24} className="text-green-600" /> },
    { label: "Late Today", value: stats.lateToday, icon: <Clock size={24} className="text-yellow-600" /> },
    { label: "Absent Today", value: stats.absentToday, icon: <UserX size={24} className="text-red-600" /> },
    { label: "On Leave", value: stats.onLeave, icon: <Calendar size={24} className="text-blue-600" /> },
    { label: "Currently Working", value: stats.currentlyWorking, icon: <Activity size={24} className="text-accent" /> },
    { label: "Total Hours", value: stats.totalHours, icon: <Briefcase size={24} className="text-purple-600" /> },
    { label: "Overtime (Hrs)", value: stats.overtime, icon: <Clock size={24} className="text-orange-600" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Summary of today's attendance and activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
            <div className="p-3 rounded-full bg-gray-50">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <a href="/admin/members" className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors">
            Manage Members
          </a>
          <a href="/admin/attendance" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors">
            View Attendance
          </a>
          <a href="/admin/leave" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors">
            Leave Requests
          </a>
        </div>
      </div>
    </div>
  );
}
