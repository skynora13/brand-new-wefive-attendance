"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Video, Plus, Calendar, Clock, Link as LinkIcon, Users } from "lucide-react";
import Link from "next/link";

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    try {
      const res = await fetch("/api/admin/meetings");
      const data = await res.json();
      if (data.success) {
        setMeetings(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="text-primary" size={24}/> Meeting Management
          </h1>
          <p className="text-gray-500 mt-1">Schedule meetings and invite team members</p>
        </div>
        <Link 
          href="/admin/meetings/add"
          className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Schedule Meeting
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading meetings...</div>
        ) : meetings.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Video size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No meetings scheduled</h3>
            <p className="text-gray-500 mt-1">Click "Schedule Meeting" to create your first meeting.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {meetings.map((meeting) => {
              const isPast = new Date(meeting.endTime) < new Date();
              return (
                <div key={meeting.id} className={`p-6 transition-colors ${isPast ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${isPast ? 'text-gray-600' : 'text-gray-900'} flex items-center gap-2`}>
                        {meeting.title}
                        {isPast && <span className="px-2 py-0.5 text-xs font-semibold bg-gray-200 text-gray-600 rounded-full">Completed</span>}
                        {!isPast && new Date(meeting.startTime) < new Date() && <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>Live Now</span>}
                      </h3>
                      
                      {meeting.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{meeting.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={16} className="text-primary/70" />
                          <span>{format(new Date(meeting.startTime), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={16} className="text-primary/70" />
                          <span>{format(new Date(meeting.startTime), 'hh:mm a')} - {format(new Date(meeting.endTime), 'hh:mm a')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users size={16} className="text-primary/70" />
                          <span>{meeting.participants.length} Invited</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Invited:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {meeting.participants.slice(0, 5).map((p: any) => (
                            <span key={p.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200">
                              {p.user.name.split(' ')[0]}
                            </span>
                          ))}
                          {meeting.participants.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200">
                              +{meeting.participants.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center items-end gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                      {meeting.url && !isPast ? (
                        <a 
                          href={meeting.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full text-center bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-blue-200"
                        >
                          <Video size={16} /> Join GMeet
                        </a>
                      ) : meeting.url && isPast ? (
                         <span className="w-full text-center text-gray-400 text-sm flex items-center justify-center gap-1"><LinkIcon size={14}/> Link Expired</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
