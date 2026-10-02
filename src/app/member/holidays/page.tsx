"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PartyPopper } from "lucide-react";

export default function MemberHolidaysPage() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHolidays = async () => {
    try {
      const res = await fetch("/api/member/holidays");
      const data = await res.json();
      if (data.success) {
        setHolidays(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="text-primary" size={24}/> Company Holiday Calendar
          </h1>
          <p className="text-gray-500 mt-1">Upcoming official holidays for this year</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden min-h-[50vh]">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse flex flex-col items-center">
             <CalendarIcon size={32} className="mb-2 text-gray-400" />
            Loading calendar...
          </div>
        ) : holidays.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <PartyPopper size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No holidays scheduled</h3>
            <p className="text-gray-500 mt-1">The administration has not set up any upcoming holidays yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {holidays.map((holiday) => {
              const isPast = new Date(holiday.date) < new Date(new Date().setHours(0,0,0,0));
              
              return (
                <div key={holiday.id} className={`p-6 transition-colors flex items-center gap-6 ${isPast ? 'bg-gray-50/50 opacity-70' : 'hover:bg-gray-50'}`}>
                  
                  <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl flex-shrink-0 ${isPast ? 'bg-gray-200 text-gray-500' : 'bg-primary text-white shadow-md shadow-primary/20'}`}>
                    <span className="text-xs font-bold uppercase tracking-widest">{format(new Date(holiday.date), 'MMM')}</span>
                    <span className="text-3xl font-black">{format(new Date(holiday.date), 'dd')}</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold ${isPast ? 'text-gray-600' : 'text-gray-900'} flex items-center gap-3`}>
                      {holiday.name}
                      {isPast && <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-gray-200 text-gray-600 rounded-full">Passed</span>}
                    </h3>
                    <p className={`mt-1 font-medium ${isPast ? 'text-gray-500' : 'text-primary'}`}>
                      {format(new Date(holiday.date), 'EEEE, yyyy')}
                    </p>
                    {holiday.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{holiday.description}</p>
                    )}
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
