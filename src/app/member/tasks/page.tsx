"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CheckSquare, Clock, AlertTriangle, AlertCircle, ArrowRight } from "lucide-react";

export default function MemberTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/member/tasks");
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/member/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error(err);
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
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-500 mt-1">View and manage tasks assigned to you by the Admin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">To Do</p>
            <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'TODO').length}</p>
          </div>
          <div className="p-3 bg-gray-50 text-gray-400 rounded-full"><Clock size={24}/></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><ArrowRight size={24}/></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed</p>
            <p className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'COMPLETED').length}</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-full"><CheckSquare size={24}/></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading assigned tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <CheckSquare size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No tasks assigned</h3>
            <p className="text-gray-500 mt-1">You currently have no tasks assigned to you.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Update</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs mt-1">{task.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(task.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {task.dueDate ? (
                      <span className={new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'text-red-600 font-medium flex items-center gap-1' : 'text-gray-500'}>
                        {new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' && <AlertCircle size={14} />}
                        {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">No due date</span>
                    )}
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <select 
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="border border-gray-300 rounded-md text-sm py-1 pl-2 pr-8 focus:ring-primary focus:border-primary"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REVIEW">Ready for Review</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
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
