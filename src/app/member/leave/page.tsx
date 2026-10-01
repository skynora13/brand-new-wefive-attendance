"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, FileText, CheckCircle, XCircle, Clock } from "lucide-react";

export default function MemberLeavePage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    type: "CASUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const fetchLeaves = async () => {
    try {
      const res = await fetch("/api/leaves");
      const data = await res.json();
      if (data.success) {
        setLeaves(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setFormData({ type: "CASUAL", startDate: "", endDate: "", reason: "" });
        fetchLeaves();
      } else {
        setError(data.error || "Failed to submit request");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "APPROVED": return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-semibold flex items-center gap-1 w-max"><CheckCircle size={12}/> Approved</span>;
      case "REJECTED": return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs font-semibold flex items-center gap-1 w-max"><XCircle size={12}/> Rejected</span>;
      default: return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs font-semibold flex items-center gap-1 w-max"><Clock size={12}/> Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500 mt-1">Request time off and view your balances</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {showForm ? "Cancel Request" : "+ New Leave Request"}
        </button>
      </div>

      {/* Leave Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <CalendarIcon size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Casual Leave</p>
            <p className="text-2xl font-bold text-gray-900">12 <span className="text-sm font-normal text-gray-400">/ 12 days</span></p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <CalendarIcon size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Sick Leave</p>
            <p className="text-2xl font-bold text-gray-900">6 <span className="text-sm font-normal text-gray-400">/ 6 days</span></p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CalendarIcon size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Earned Leave</p>
            <p className="text-2xl font-bold text-gray-900">0 <span className="text-sm font-normal text-gray-400">/ 0 days</span></p>
          </div>
        </div>
      </div>

      {/* Leave Form Modal/Inline */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-primary/20 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-primary"/> 
            Submit Leave Request
          </h2>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
                <select 
                  required name="type" value={formData.type} onChange={handleChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2 bg-white"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="MEDICAL">Medical Leave</option>
                  <option value="EMERGENCY">Emergency Leave</option>
                  <option value="EARNED">Earned Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input required type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <textarea 
                required name="reason" value={formData.reason} onChange={handleChange} rows={3}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2"
                placeholder="Please provide a brief reason for your leave request..."
              />
            </div>
            <div className="flex justify-end pt-2">
              <button 
                type="submit" disabled={submitting}
                className="bg-primary text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave History Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Leave History</h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading leave requests...</div>
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            You have not submitted any leave requests yet.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {leave.type.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(leave.startDate), 'dd MMM yyyy')} - {format(new Date(leave.endDate), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {leave.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(leave.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {format(new Date(leave.createdAt), 'dd MMM yyyy')}
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
