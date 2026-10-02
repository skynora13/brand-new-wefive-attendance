"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { BookOpen } from "lucide-react";

export default function MemberTopicsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    const res = await fetch("/api/member/topics");
    if (res.ok) {
      const data = await res.json();
      setAssignments(data.assignments);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  if (loading) return <div className="p-8">Loading your topics...</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Assigned Topics</h1>
        <p className="text-gray-500">View and manage your topic assignments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-md shadow">
            You don't have any topics assigned yet.
          </div>
        ) : (
          assignments.map((assignment) => (
            <Link key={assignment.id} href={`/member/topics/${assignment.id}`}>
              <div className="bg-white rounded-md shadow p-6 hover:shadow-lg transition-shadow border border-gray-100 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <BookOpen size={24} />
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    assignment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    assignment.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {assignment.status.replace("_", " ")}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{assignment.topic.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
                  {assignment.topic.description || "No description provided."}
                </p>

                <div className="mt-auto">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Progress</span>
                    <span>{assignment.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className={`h-2 rounded-full ${assignment.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${assignment.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Assigned: {format(new Date(assignment.assignedAt), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
