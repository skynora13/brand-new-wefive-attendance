"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CheckSquare, AlertTriangle, Clock, Plus } from "lucide-react";

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    assigneeId: "",
  });

  const fetchData = async () => {
    try {
      const [tasksRes, membersRes] = await Promise.all([
        fetch("/api/admin/tasks"),
        fetch("/api/admin/members/compact")
      ]);
      
      const tasksData = await tasksRes.json();
      const membersData = await membersRes.json();
      
      if (tasksData.success) setTasks(tasksData.data);
      if (membersData.success) setMembers(membersData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setFormData({ title: "", description: "", priority: "MEDIUM", dueDate: "", assigneeId: "" });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'URGENT': return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-medium flex items-center gap-1"><AlertTriangle size={12}/> Urgent</span>;
      case 'HIGH': return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded font-medium">High</span>;
      case 'LOW': return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">Low</span>;
      default: return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">Medium</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-500 mt-1">Assign and monitor employee tasks</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          {showForm ? "Cancel" : <><Plus size={16} /> Assign Task</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-primary/20 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckSquare size={20} className="text-primary"/> 
            Assign New Task
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" placeholder="e.g. Complete Monthly Report" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
                <select required name="assigneeId" value={formData.assigneeId} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2 bg-white">
                  <option value="">Select an employee...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                <select required name="priority" value={formData.priority} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2 bg-white">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary border px-3 py-2" placeholder="Provide detailed instructions..." />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={submitting} className="bg-primary text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-70">
                {submitting ? "Assigning..." : "Assign Task"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <CheckSquare size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No tasks assigned yet</h3>
            <p className="text-gray-500 mt-1">Click "Assign Task" to assign work to employees.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold mr-2">
                        {task.assignments[0]?.user?.name.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-900">{task.assignments[0]?.user?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(task.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'REVIEW' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
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
