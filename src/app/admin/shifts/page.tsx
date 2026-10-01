"use client";

import { useState, useEffect } from "react";
import { Briefcase, Plus, Clock, Users, Star, AlertCircle, Calendar } from "lucide-react";

export default function AdminShiftsPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    startTime: "09:00",
    endTime: "18:00",
    gracePeriod: 15,
    isDefault: false,
    days: {
      "1": true,  // Monday
      "2": true,  // Tuesday
      "3": true,  // Wednesday
      "4": true,  // Thursday
      "5": true,  // Friday
      "6": false, // Saturday
      "0": false, // Sunday
    }
  });

  const fetchShifts = async () => {
    try {
      const res = await fetch("/api/admin/shifts");
      const data = await res.json();
      if (data.success) {
        setShifts(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "isDefault") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDayChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: !prev.days[day as keyof typeof prev.days]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct working days string (e.g. "1,2,3,4,5")
    const workingDays = Object.entries(formData.days)
      .filter(([_, isSelected]) => isSelected)
      .map(([day, _]) => day)
      .join(",");

    if (!workingDays) {
      alert("Please select at least one working day.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        startTime: formData.startTime,
        endTime: formData.endTime,
        gracePeriod: Number(formData.gracePeriod),
        isDefault: formData.isDefault,
        workingDays
      };

      const res = await fetch("/api/admin/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        fetchShifts();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDays = (daysStr: string) => {
    const daysArr = daysStr.split(",");
    const map: Record<string, string> = { "0":"Sun", "1":"Mon", "2":"Tue", "3":"Wed", "4":"Thu", "5":"Fri", "6":"Sat" };
    return daysArr.map(d => map[d]).join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="text-primary" size={24}/> Shift Management
          </h1>
          <p className="text-gray-500 mt-1">Configure operational timings and grace periods</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          {showForm ? "Cancel" : <><Plus size={16} /> Create Shift</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-primary/20 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Create New Shift</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" placeholder="e.g. Morning Shift" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                <input required type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                <input required type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grace Period (Minutes) *</label>
                <div className="flex rounded-md shadow-sm">
                  <input required type="number" min="0" max="120" name="gracePeriod" value={formData.gracePeriod} onChange={handleChange} className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-primary focus:border-primary border border-gray-300" />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    mins
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Arrivals after Start Time + Grace Period will be marked Late.</p>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} className="rounded text-primary focus:ring-primary h-5 w-5" />
                  <span className="text-sm font-medium text-gray-900">Set as Default Shift</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Working Days *</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { val: "1", label: "Mon" }, { val: "2", label: "Tue" }, { val: "3", label: "Wed" },
                    { val: "4", label: "Thu" }, { val: "5", label: "Fri" }, { val: "6", label: "Sat" }, { val: "0", label: "Sun" }
                  ].map(day => (
                    <button 
                      key={day.val}
                      type="button"
                      onClick={() => handleDayChange(day.val)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors border ${
                        formData.days[day.val as keyof typeof formData.days] 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button type="submit" disabled={submitting} className="bg-primary text-white px-8 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center gap-2">
                {submitting ? "Saving..." : "Save Shift Configuration"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-gray-500 animate-pulse bg-white rounded-lg border border-gray-100">
            Loading shifts...
          </div>
        ) : shifts.length === 0 ? (
          <div className="col-span-full p-12 text-center flex flex-col items-center bg-white rounded-lg border border-gray-100 shadow-sm">
            <Briefcase size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No shifts configured</h3>
            <p className="text-gray-500 mt-1">Click "Create Shift" to set up your first operational shift.</p>
          </div>
        ) : (
          shifts.map((shift) => (
            <div key={shift.id} className={`bg-white rounded-xl shadow-sm border ${shift.isDefault ? 'border-primary/50 shadow-primary/5' : 'border-gray-100'} overflow-hidden flex flex-col relative`}>
              
              {shift.isDefault && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-sm">
                  <Star size={10} className="fill-white"/> Default
                </div>
              )}

              <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                <h3 className="text-xl font-bold text-gray-900 pr-16">{shift.name}</h3>
                
                <div className="flex items-center gap-4 mt-4 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex-1 text-center border-r border-gray-100 pr-4">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Start</span>
                    <span className="text-lg font-black text-gray-900">{shift.startTime}</span>
                  </div>
                  <div className="flex-1 text-center pl-4">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">End</span>
                    <span className="text-lg font-black text-gray-900">{shift.endTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <Clock size={18} className="text-primary mt-0.5" />
                  <div>
                    <span className="block font-semibold text-gray-900">Grace Period</span>
                    <span>{shift.gracePeriod} minutes (Arrivals after {shift.startTime} will be late)</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <Calendar size={18} className="text-primary mt-0.5" />
                  <div>
                    <span className="block font-semibold text-gray-900">Working Days</span>
                    <span>{formatDays(shift.workingDays)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto flex justify-between items-center text-sm font-medium text-gray-500">
                <span className="flex items-center gap-1.5"><Users size={16}/> {shift._count?.users || 0} Members Assigned</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${shift.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {shift.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
