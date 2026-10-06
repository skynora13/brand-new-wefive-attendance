import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LogOut, LayoutDashboard, Clock, Calendar, Bell, User, CheckSquare, Video, BarChart2, FileText } from "lucide-react";
import LogoutButton from "./LogoutButton";

import LiveClock from "@/components/LiveClock";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MEMBER") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-accent text-gray-900 flex flex-col fixed inset-y-0 left-0 overflow-y-auto border-r border-yellow-200/50">
        <div className="p-6 sticky top-0 bg-accent z-10">
          <h1 className="text-2xl font-bold text-primary">WeFive</h1>
          <p className="text-sm font-medium text-gray-700">Member Portal</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 pb-6 font-medium">
          <Link href="/member/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/member/attendance" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <Clock size={20} />
            <span>Attendance</span>
          </Link>
          <Link href="/member/leave" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <Calendar size={20} />
            <span>Leave</span>
          </Link>
          <Link href="/member/tasks" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <CheckSquare size={20} />
            <span>Tasks</span>
          </Link>
          <Link href="/member/topics" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <FileText size={20} />
            <span>My Topics</span>
          </Link>
          <Link href="/member/notifications" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <Bell size={20} />
            <span>Notifications</span>
          </Link>
          <Link href="/member/meetings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <Video size={20} />
            <span>Meetings</span>
          </Link>
          <Link href="/member/performance" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <BarChart2 size={20} />
            <span>Scorecard</span>
          </Link>
          <Link href="/member/profile" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors text-gray-800 hover:text-primary">
            <User size={20} />
            <span>Profile</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-primary/10 sticky bottom-0 bg-accent z-10">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Welcome, {session.user.name}</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 font-medium">
              <LiveClock />
            </div>
          </div>
        </header>
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
