"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Trash2, MapPin } from "lucide-react";

export default function AdminHolidaysPage() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    description: ""
  });

  const fetchHolidays = async () => {
    try {
      const res = await fetch("/api/admin/holidays");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setFormData({ name: "", date: "", description: "" });
        fetchHolidays();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this holiday?")) return;
    try {
      const res = await fetch(`/api/admin/holidays?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchHolidays();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="text-primary" size={24}/> Company Holidays
          </h1>
          <p className="text-gray-500 mt-1">Manage public and organizational holidays</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          {showForm ? "Cancel" : <><Plus size={16} /> Add Holiday</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-primary/20 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Add New Holiday</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" placeholder="e.g. Independence Day" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" placeholder="Any details..." />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button type="submit" disabled={submitting} className="bg-primary text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center gap-2">
                {submitting ? "Saving..." : "Save Holiday"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading calendar...</div>
        ) : holidays.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <CalendarIcon size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No holidays added</h3>
            <p className="text-gray-500 mt-1">Click "Add Holiday" to define the organizational calendar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holiday</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {holidays.map((holiday) => {
                  const isPast = new Date(holiday.date) < new Date(new Date().setHours(0,0,0,0));
                  
                  return (
                    <tr key={holiday.id} className={`${isPast ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${isPast ? 'text-gray-500' : 'text-gray-900'}`}>
                            {format(new Date(holiday.date), 'MMM dd, yyyy')}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">{format(new Date(holiday.date), 'EEEE')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isPast ? 'bg-gray-300' : 'bg-primary'}`}></div>
                          <span className={`text-sm font-semibold ${isPast ? 'text-gray-600' : 'text-gray-900'}`}>{holiday.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{holiday.description || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleDelete(holiday.id)} className="text-red-500 hover:text-red-700 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
