"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function MemberTopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAssignment = async () => {
      const res = await fetch("/api/member/topics");
      if (res.ok) {
        const data = await res.json();
        const found = data.assignments.find((a: any) => a.id === params.id);
        if (found) {
          setAssignment(found);
          setStatus(found.status);
          setProgress(found.progress);
          setNotes(found.notes || "");
        }
      }
      setLoading(false);
    };
    fetchAssignment();
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/member/topics/${params.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, progress, notes }),
      });
      if (res.ok) {
        alert("Progress updated successfully!");
        router.refresh();
      } else {
        alert("Failed to update progress");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating progress");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading topic details...</div>;
  if (!assignment) return <div className="p-8">Topic assignment not found.</div>;

  const { topic } = assignment;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/member/topics" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{topic.title}</h1>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ml-auto ${
          status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
          status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {status.replace("_", " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-white rounded-md shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap mb-6">{topic.description || "No description."}</p>
          
          <h2 className="text-lg font-semibold mb-4">Instructions</h2>
          <p className="text-gray-700 whitespace-pre-wrap mb-6">{topic.instructions || "No specific instructions."}</p>
          
          {topic.referenceUrl && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Reference URL</h2>
              <a href={topic.referenceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                {topic.referenceUrl}
              </a>
            </div>
          )}
        </div>

        <div className="bg-white rounded-md shadow p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 font-medium w-24">Priority:</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  topic.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                  topic.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>{topic.priority}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 font-medium w-24">Category:</span>
                <span>{topic.category || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 font-medium w-24">Est. Time:</span>
                <span className="flex items-center gap-1"><Clock size={14}/> {topic.estimatedMinutes ? `${topic.estimatedMinutes} min` : "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 font-medium w-24">Due Date:</span>
                <span className="flex items-center gap-1"><Calendar size={14}/> {topic.dueDate ? format(new Date(topic.dueDate), 'MMM dd, yyyy') : "-"}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Update Progress</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                >
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Progress ({progress}%)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Notes</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  placeholder="Add your progress notes here..."
                />
              </div>

              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? "Saving..." : <><CheckCircle size={16}/> Save Updates</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
