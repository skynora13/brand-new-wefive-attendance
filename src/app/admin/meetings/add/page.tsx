"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Video, ArrowLeft, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

export default function AddMeetingPage() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    url: "",
    participantIds: [] as string[]
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/admin/members/compact");
        const data = await res.json();
        if (data.success) {
          setMembers(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMembers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleParticipantToggle = (id: string) => {
    setFormData(prev => {
      const isSelected = prev.participantIds.includes(id);
      if (isSelected) {
        return { ...prev, participantIds: prev.participantIds.filter(pid => pid !== id) };
      } else {
        return { ...prev, participantIds: [...prev.participantIds, id] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.participantIds.length === 0) {
      alert("Please select at least one participant");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin/meetings");
      } else {
        alert(data.error);
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/meetings" className="p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule New Meeting</h1>
          <p className="text-gray-500 mt-1">Create a meeting request and invite team members</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title *</label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" placeholder="e.g. Weekly Sync" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
              <input required type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
              <input required type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting URL (Google Meet) *</label>
              <div className="flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  <LinkIcon size={16} />
                </span>
                <input required type="url" name="url" value={formData.url} onChange={handleChange} className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none focus:ring-primary focus:border-primary border border-gray-300" placeholder="https://meet.google.com/xxx-xxxx-xxx" />
                <a 
                  href="https://meet.google.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-50 border border-l-0 border-blue-200 rounded-r-md text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Video size={14} className="mr-2"/> Create GMeet
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-1">Click "Create GMeet" to open a new Google Meet room, then <b>copy the generated URL</b> and paste it here.</p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description / Agenda</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" placeholder="Agenda items..." />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Invite Participants *</label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50 grid grid-cols-2 md:grid-cols-3 gap-3">
                {members.map(member => (
                  <label key={member.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 shadow-sm transition-colors">
                    <input 
                      type="checkbox" 
                      checked={formData.participantIds.includes(member.id)}
                      onChange={() => handleParticipantToggle(member.id)}
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
              {submitting ? "Sending Invites..." : <><Video size={18}/> Schedule & Invite</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
