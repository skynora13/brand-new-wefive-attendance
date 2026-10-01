"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { BarChart2, TrendingUp, Target, Calendar, Award } from "lucide-react";

export default function MemberPerformancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  const fetchScorecard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/member/performance?month=${selectedMonth}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScorecard();
  }, [selectedMonth]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 50) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };
  
  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="text-primary" size={24}/> My Performance Scorecard
          </h1>
          <p className="text-gray-500 mt-1">Track your monthly operational scores and metrics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-primary focus:border-primary bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 animate-pulse bg-white rounded-lg border border-gray-100">
          Loading your scorecard...
        </div>
      ) : !data ? (
        <div className="p-12 text-center flex flex-col items-center bg-white rounded-lg border border-gray-100 shadow-sm">
          <Award size={48} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Scorecard Available</h3>
          <p className="text-gray-500 mt-1">Your manager has not yet published your performance scorecard for {format(new Date(selectedMonth), "MMMM yyyy")}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900">{format(new Date(selectedMonth), "MMMM yyyy")} Performance</h2>
              <p className="text-gray-500 mt-2 font-medium">Evaluated by Administration</p>
            </div>
            <div className={`px-8 py-6 rounded-2xl border-2 flex flex-col items-center justify-center min-w-[200px] ${getScoreColor(data.overallScore)}`}>
              <span className="text-sm font-bold uppercase tracking-wider opacity-80 mb-1">Overall Score</span>
              <span className="text-5xl font-black">{data.overallScore}%</span>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Target size={20} className="text-primary"/> Operational Breakdown
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Attendance */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><Calendar size={16}/> Attendance</span>
                  <span className="font-bold text-xl text-gray-900">{data.attendanceScore}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className={`h-3 rounded-full ${getProgressColor(data.attendanceScore)}`} style={{ width: `${data.attendanceScore}%` }}></div>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><Target size={16}/> Task Completion</span>
                  <span className="font-bold text-xl text-gray-900">{data.taskScore}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className={`h-3 rounded-full ${getProgressColor(data.taskScore)}`} style={{ width: `${data.taskScore}%` }}></div>
                </div>
              </div>

              {/* Shoots */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-gray-700 flex items-center gap-2"><TrendingUp size={16}/> Shoot Quality</span>
                  <span className="font-bold text-xl text-gray-900">{data.shootScore}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className={`h-3 rounded-full ${getProgressColor(data.shootScore)}`} style={{ width: `${data.shootScore}%` }}></div>
                </div>
              </div>

            </div>

            {data.comments && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Manager Comments & Feedback:</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{data.comments}</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
