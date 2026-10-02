"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminAssignmentsPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = async () => {
    const res = await fetch("/api/admin/topics");
    if (res.ok) {
      const data = await res.json();
      setTopics(data.topics);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const triggerAutoAssign = async (topicId: string) => {
    try {
      const res = await fetch("/api/admin/topics/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      });
      if (res.ok) {
        alert("Assigned successfully!");
        fetchTopics();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to assign");
      }
    } catch (error) {
      console.error(error);
      alert("Error assigning topic");
    }
  };

  if (loading) return <div className="p-8">Loading assignments...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Topic Assignments</h1>
      </div>

      <div className="bg-white rounded-md shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 border-b text-sm font-medium text-gray-500">Topic</th>
              <th className="px-6 py-3 border-b text-sm font-medium text-gray-500">Mode</th>
              <th className="px-6 py-3 border-b text-sm font-medium text-gray-500">Assigned To</th>
              <th className="px-6 py-3 border-b text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 border-b text-sm font-medium text-gray-500">Progress</th>
              <th className="px-6 py-3 border-b text-sm font-medium text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {topics.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No assignments found.
                </td>
              </tr>
            ) : (
              topics.map((topic) => (
                <tr key={topic.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{topic.title}</td>
                  <td className="px-6 py-4 text-sm">{topic.assignmentMode}</td>
                  <td className="px-6 py-4 text-sm">
                    {topic.assignments && topic.assignments.length > 0 ? (
                      topic.assignments.map((a: any) => (
                        <div key={a.id}>{a.member.name}</div>
                      ))
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {topic.assignments && topic.assignments.length > 0 ? (
                      topic.assignments.map((a: any) => (
                        <div key={a.id}>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            a.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            a.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {a.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {topic.assignments && topic.assignments.length > 0 ? (
                      topic.assignments.map((a: any) => (
                        <div key={a.id}>{a.progress}%</div>
                      ))
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {(!topic.assignments || topic.assignments.length === 0) && (
                      <button
                        onClick={() => triggerAutoAssign(topic.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Auto Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
