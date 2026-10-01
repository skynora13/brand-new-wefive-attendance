"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Clock, Play, Square, AlertCircle, CheckCircle2 } from "lucide-react";

export default function MemberDashboard() {
  const { data: session } = useSession();
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/attendance");
      const data = await res.json();
      if (data.success) {
        setAttendance(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handlePunch = async (action: "PUNCH_IN" | "PUNCH_OUT") => {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      
      if (data.success) {
        setAttendance(data.data);
      } else {
        setError(data.error || "Action failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Today's Attendance</h2>
        <p className="text-gray-500 mb-8">
          {format(new Date(), "EEEE, do MMMM yyyy")}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-center justify-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {!attendance ? (
          <div className="space-y-6">
            <div className="text-gray-400 mb-6">
              <Clock size={64} className="mx-auto opacity-50" />
            </div>
            <button
              onClick={() => handlePunch("PUNCH_IN")}
              disabled={actionLoading}
              className="mx-auto flex items-center justify-center gap-3 bg-primary text-white text-xl font-medium px-12 py-4 rounded-full hover:bg-primary/90 transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Play fill="currentColor" size={24} />
              {actionLoading ? "Processing..." : "PUNCH IN"}
            </button>
            <p className="text-sm text-gray-500">
              Your time will be recorded in IST
            </p>
          </div>
        ) : !attendance.punchOut ? (
          <div className="space-y-6">
            <div className="mb-6 p-6 bg-green-50 border border-green-100 rounded-2xl inline-block text-left min-w-[300px]">
              <div className="flex items-center gap-3 text-green-700 font-semibold mb-2">
                <CheckCircle2 size={24} />
                <span>Successfully Punched In</span>
              </div>
              <div className="text-sm text-green-800 space-y-1">
                <p>Status: <span className="font-bold">{attendance.status}</span></p>
                <p>Time: {new Date(attendance.punchIn).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
              </div>
            </div>
            
            <button
              onClick={() => handlePunch("PUNCH_OUT")}
              disabled={actionLoading}
              className="mx-auto flex items-center justify-center gap-3 bg-red-600 text-white text-xl font-medium px-12 py-4 rounded-full hover:bg-red-700 transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Square fill="currentColor" size={24} />
              {actionLoading ? "Processing..." : "PUNCH OUT"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
             <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-2xl inline-block text-left min-w-[300px]">
              <div className="flex items-center gap-3 text-gray-700 font-semibold mb-4 text-lg">
                <CheckCircle2 size={24} className="text-green-500" />
                <span>Attendance Completed</span>
              </div>
              <div className="text-sm text-gray-600 space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span>Status</span>
                  <span className="font-bold text-gray-900">{attendance.status}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Punch In</span>
                  <span className="font-medium">{new Date(attendance.punchIn).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Punch Out</span>
                  <span className="font-medium">{new Date(attendance.punchOut).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Total Hours</span>
                  <span className="font-bold text-primary">{attendance.workHours?.toFixed(2)} hrs</span>
                </div>
                {attendance.overtimeHours > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Overtime</span>
                    <span className="font-bold">{attendance.overtimeHours?.toFixed(2)} hrs</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Leave Balance</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Casual Leave</span>
              <span className="font-medium">12 / 12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sick Leave</span>
              <span className="font-medium">6 / 6</span>
            </div>
            <a href="/member/leave" className="text-primary text-sm font-medium mt-4 inline-block hover:underline">Apply for Leave &rarr;</a>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Upcoming Tasks</h3>
          <p className="text-sm text-gray-500 italic">No tasks assigned currently.</p>
        </div>
      </div>
    </div>
  );
}
