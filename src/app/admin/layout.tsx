import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LogOut, LayoutDashboard, Users, Calendar, Clock, Briefcase, Bell, Settings, FileText, CheckSquare, Shield, Video, BarChart2 } from "lucide-react";
import LogoutButton from "../member/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-accent text-gray-900 flex flex-col fixed inset-y-0 left-0 overflow-y-auto border-r border-yellow-200/50">
        <div className="p-6 sticky top-0 bg-accent z-10">
          <h1 className="text-2xl font-bold text-primary">WeFive</h1>
          <p className="text-sm font-medium text-gray-700">Admin Portal</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4 pb-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <LayoutDashboard size={20} />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/attendance" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <Clock size={20} />
            <span className="text-sm font-medium">Attendance</span>
          </Link>
          <Link href="/admin/members" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <Users size={20} />
            <span className="text-sm font-medium">Members</span>
          </Link>
          <Link href="/admin/leave" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <Calendar size={20} />
            <span className="text-sm font-medium">Leave Management</span>
          </Link>
          <Link href="/admin/shifts" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <Briefcase size={20} />
            <span className="text-sm font-medium">Shifts</span>
          </Link>
          <Link href="/admin/holidays" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <Calendar size={20} />
            <span className="text-sm font-medium">Holidays</span>
          </Link>
          <Link href="/admin/tasks" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <CheckSquare size={20} />
            <span className="text-sm font-medium">Tasks</span>
          </Link>
          <Link href="/admin/reports" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <FileText size={20} />
            <span className="text-sm font-medium">Reports</span>
          </Link>
          <Link href="/admin/notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <Bell size={20} />
            <span className="text-sm font-medium">Notifications</span>
          </Link>
          <Link href="/admin/audit" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <Shield size={20} />
            <span className="text-sm font-medium">Audit Logs</span>
          </Link>
          <Link href="/admin/meetings" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <Video size={20} />
            <span className="text-sm font-medium">Meetings</span>
          </Link>
          <Link href="/admin/performance" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <BarChart2 size={20} />
            <span className="text-sm font-medium">Performance Scorecard</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <Settings size={20} />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-primary/10 sticky bottom-0 bg-accent z-10">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Administrator Control</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 font-medium">
              {new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full' })}
            </div>
          </div>
        </header>
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
