"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Bell, CheckCircle2, Clock, Info, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MemberNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/member/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/member/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/member/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };


  const getIcon = (type: string) => {
    switch (type) {
      case "REMINDER": return <Clock className="text-orange-500" size={24} />;
      case "ALERT": return <AlertTriangle className="text-red-500" size={24} />;
      default: return <Info className="text-blue-500" size={24} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="text-primary" size={24}/> Notifications 
            {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
          </h1>
          <p className="text-gray-500 mt-1">Stay updated with system alerts and reminders</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-sm px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-md shadow-sm transition-colors flex items-center gap-2 font-medium"
            >
              <CheckCircle2 size={16} /> Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden min-h-[50vh]">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Bell size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="text-gray-500 mt-1">You have no new notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-5 transition-colors relative ${!notif.isRead ? 'bg-orange-50/30' : 'hover:bg-gray-50'}`}
              >
                {!notif.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 rounded-r-md"></div>
                )}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className={`text-base ${!notif.isRead ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                        {format(new Date(notif.createdAt), 'MMM dd, h:mm a')}
                      </span>
                    </div>
                    
                    <p className={`mt-1 text-sm ${!notif.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                      {notif.content}
                    </p>

                    <div className="mt-3 flex items-center gap-4">
                      {notif.link && (
                        <Link href={notif.link} className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                          View Details <ArrowRight size={14} />
                        </Link>
                      )}
                      
                      {!notif.isRead && (
                        <button 
                          onClick={() => markAsRead(notif.id)}
                          className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
