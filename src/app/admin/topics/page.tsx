"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { format } from "date-fns";

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState("ROUND_ROBIN");
  const [showSettings, setShowSettings] = useState(false);

  const fetchTopics = async () => {
    const res = await fetch("/api/admin/topics");
    if (res.ok) {
      const data = await res.json();
      setTopics(data.topics);
    }
    setLoading(false);
  };

  const fetchSettings = async () => {
    const res = await fetch("/api/settings/assignment");
    if (res.ok) {
      const data = await res.json();
      setStrategy(data.strategy);
    }
  };

  useEffect(() => {
    fetchTopics();
    fetchSettings();
  }, []);

  const saveSettings = async (newStrategy: string) => {
    setStrategy(newStrategy);
    await fetch("/api/settings/assignment", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ strategy: newStrategy }),
    });
  };

  if (loading) return <div className="p-8">Loading topics...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Topics</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Settings size={18} /> Settings
          </button>
          <Link
            href="/admin/topics/add"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={18} /> New Topic
          </Link>
        </div>
      </div>

      {showSettings && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Assignment Strategy</h2>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="strategy" 
                value="ROUND_ROBIN" 
                checked={strategy === "ROUND_ROBIN"}
                onChange={(e) => saveSettings(e.target.value)}
              />
              Round Robin
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="strategy" 
                value="BALANCED_WORKLOAD" 
                checked={strategy === "BALANCED_WORKLOAD"}
                onChange={(e) => saveSettings(e.target.value)}
              />
              Balanced Workload
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="strategy" 
                value="CATEGORY_BASED" 
                checked={strategy === "CATEGORY_BASED"}
                onChange={(e) => saveSettings(e.target.value)}
              />
              Category-Based
            </label>
          </div>
        </div>
      )}

      <div className="bg-white rounded-md shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 border-b text-sm font-medium text-gray-500">Title</th>
              <th className="px-6 py-3 border-b text-sm font-medium text-gray-500">Priority</th>
              <th className="px-6 py-3 border-b text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 border-b text-sm font-medium text-gray-500">Mode</th>
              <th className="px-6 py-3 border-b text-sm font-medium text-gray-500">Due Date</th>
              <th className="px-6 py-3 border-b text-sm font-medium text-gray-500">Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {topics.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No topics found.
                </td>
              </tr>
            ) : (
              topics.map((topic) => (
                <tr key={topic.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4">{topic.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      topic.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                      topic.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {topic.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      topic.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      topic.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      topic.status === 'ASSIGNED' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {topic.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{topic.assignmentMode}</td>
                  <td className="px-6 py-4 text-sm">
                    {topic.dueDate ? format(new Date(topic.dueDate), 'MMM dd, yyyy') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {topic.assignments && topic.assignments.length > 0 
                      ? topic.assignments.map((a: any) => a.member.name).join(", ") 
                      : <span className="text-gray-400">Unassigned</span>}
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
