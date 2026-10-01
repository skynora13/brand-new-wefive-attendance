"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Video, Calendar, Clock, User } from "lucide-react";

export default function MemberMeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    try {
      const res = await fetch("/api/member/meetings");
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
            <Video className="text-primary" size={24}/> My Meetings
          </h1>
          <p className="text-gray-500 mt-1">View your upcoming meetings and join links</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-gray-500 animate-pulse bg-white rounded-lg border border-gray-100">
            Loading your schedule...
          </div>
        ) : meetings.length === 0 ? (
          <div className="col-span-full p-12 text-center flex flex-col items-center bg-white rounded-lg border border-gray-100">
            <Video size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No upcoming meetings</h3>
            <p className="text-gray-500 mt-1">You have not been invited to any meetings yet.</p>
          </div>
        ) : (
          meetings.map((meeting) => {
            const isPast = new Date(meeting.endTime) < new Date();
            const isLive = !isPast && new Date(meeting.startTime) < new Date();
            
            return (
              <div key={meeting.id} className={`bg-white rounded-lg shadow-sm border ${isLive ? 'border-green-300 shadow-green-100' : 'border-gray-100'} overflow-hidden flex flex-col transition-all hover:shadow-md`}>
                
                {/* Card Header */}
                <div className={`p-4 ${isLive ? 'bg-green-50/50' : 'bg-gray-50/50'} border-b border-gray-100 flex justify-between items-start`}>
                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-gray-900 leading-tight">{meeting.title}</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-gray-500">
                      <User size={14}/> <span>Organized by {meeting.creator.name}</span>
                    </div>
                  </div>
                  {isLive && (
                    <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>Live
                    </span>
                  )}
                  {isPast && (
                     <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-gray-100 text-gray-500 rounded-full">
                     Ended
                   </span>
                  )}
                </div>
                
                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col">
                  {meeting.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{meeting.description}</p>
                  )}
                  
                  <div className="mt-auto space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar size={16} className="text-primary/70" />
                      <span className="font-medium">{format(new Date(meeting.startTime), 'EEEE, MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock size={16} className="text-primary/70" />
                      <span>{format(new Date(meeting.startTime), 'hh:mm a')} - {format(new Date(meeting.endTime), 'hh:mm a')}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer / Action */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto">
                  {isPast ? (
                    <button disabled className="w-full py-2 bg-gray-200 text-gray-500 rounded-md text-sm font-semibold cursor-not-allowed">
                      Meeting Ended
                    </button>
                  ) : meeting.url ? (
                    <a 
                      href={meeting.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`w-full flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-colors ${
                        isLive 
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' 
                          : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                      }`}
                    >
                      <Video size={16} /> Join Google Meet
                    </a>
                  ) : (
                    <button disabled className="w-full py-2 bg-gray-100 text-gray-400 rounded-md text-sm font-semibold cursor-not-allowed border border-gray-200">
                      No URL Provided
                    </button>
                  )}
                </div>
                
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
