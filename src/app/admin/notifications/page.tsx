"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Bell, Send, CheckCircle2, Clock, AlertTriangle, Info, Plus } from "lucide-react";

export default function AdminNotificationsPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "INFO",
    targetUsers: [] as string[]
  });

  const fetchData = async () => {
    try {
      const [histRes, memRes] = await Promise.all([
        fetch("/api/admin/notifications"),
        fetch("/api/admin/members/compact")
      ]);
      const histData = await histRes.json();
      const memData = await memRes.json();
      if (histData.success) setHistory(histData.data);
      if (memData.success) setMembers(memData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTargetToggle = (id: string) => {
    setFormData(prev => {
      const isSelected = prev.targetUsers.includes(id);
      if (isSelected) {
        return { ...prev, targetUsers: prev.targetUsers.filter(uid => uid !== id) };
      } else {
        return { ...prev, targetUsers: [...prev.targetUsers, id] };
      }
    });
  };

  const selectAll = () => {
    setFormData(prev => ({ ...prev, targetUsers: members.map(m => m.id) }));
  };

  const clearAll = () => {
    setFormData(prev => ({ ...prev, targetUsers: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.targetUsers.length === 0) {
      alert("Please select at least one member to notify.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          targetUsers: formData.targetUsers.length === members.length ? "ALL" : formData.targetUsers
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setFormData({ title: "", content: "", type: "INFO", targetUsers: [] });
        fetchData();
        alert(data.message);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "REMINDER": return <Clock className="text-orange-500" size={18} />;
      case "ALERT": return <AlertTriangle className="text-red-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="text-primary" size={24}/> Notifications Center
          </h1>
          <p className="text-gray-500 mt-1">Push custom reminders and alerts directly to members</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          {showForm ? "Cancel" : <><Plus size={16} /> Send Notification</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-primary/20 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Create Custom Notification</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notification Title *</label>
                  <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2 text-sm" placeholder="e.g. End of Month Timesheets" />
                </div>
                
                <div className="w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2 text-sm">
                    <option value="INFO">Information</option>
                    <option value="REMINDER">Reminder</option>
                    <option value="ALERT">Alert / Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Content *</label>
                <textarea required name="content" value={formData.content} onChange={handleChange} rows={3} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2 text-sm" placeholder="Type your message here..." />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Select Recipients *</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={selectAll} className="text-xs text-primary font-medium hover:underline">Select All</button>
                    <span className="text-gray-300">|</span>
                    <button type="button" onClick={clearAll} className="text-xs text-gray-500 font-medium hover:underline">Clear</button>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {members.map(member => (
                    <label key={member.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 shadow-sm transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.targetUsers.includes(member.id)}
                        onChange={() => handleTargetToggle(member.id)}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-sm font-medium text-gray-700 truncate">{member.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button type="submit" disabled={submitting} className="bg-primary text-white px-8 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center gap-2">
                {submitting ? "Sending..." : <><Send size={16}/> Send Notification</>}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-800">Notification History (Last 100)</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No notifications have been sent yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
            {history.map((notif) => (
              <div key={notif.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{notif.title}</h3>
                      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                        {format(new Date(notif.createdAt), 'MMM dd, yyyy h:mm a')}
                      </span>
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {notif.content}
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-500">
                        To: <span className="text-gray-700">{notif.user.name}</span>
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${notif.isRead ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {notif.isRead ? 'Read' : 'Unread'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
