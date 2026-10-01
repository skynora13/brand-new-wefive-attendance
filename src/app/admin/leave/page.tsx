"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminLeavePage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchLeaves = async () => {
    try {
      const res = await fetch("/api/admin/leaves"); // Wait, I need an API for this
      const data = await res.json();
      if (data.success) setLeaves(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const updateLeaveStatus = async (id: string, status: string) => {
    if (!confirm(`Are you sure you want to mark this leave as ${status}?`)) return;
    
    setProcessingId(id);
    try {
      const res = await fetch(`/api/leaves/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchLeaves();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
      <p className="text-gray-500 mt-1">Manage employee time off requests</p>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-6">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading leave requests...</div>
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No leave requests found in the system.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{leave.user?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{leave.user?.email || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{leave.type}</div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(leave.startDate), 'dd MMM yyyy')} - {format(new Date(leave.endDate), 'dd MMM yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {leave.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      leave.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {leave.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          disabled={processingId === leave.id}
                          onClick={() => updateLeaveStatus(leave.id, 'APPROVED')}
                          className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md"
                        >
                          Approve
                        </button>
                        <button 
                          disabled={processingId === leave.id}
                          onClick={() => updateLeaveStatus(leave.id, 'REJECTED')}
                          className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                       <span className="text-gray-400 italic">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
