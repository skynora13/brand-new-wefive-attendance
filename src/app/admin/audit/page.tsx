"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Shield, Filter, Clock, User as UserIcon, Activity, AlertCircle } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit?filter=${filter}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const getActionIcon = (action: string) => {
    if (action.includes("CREATE") || action.includes("ADD")) return <span className="w-2 h-2 rounded-full bg-green-500"></span>;
    if (action.includes("DELETE") || action.includes("REMOVE")) return <span className="w-2 h-2 rounded-full bg-red-500"></span>;
    if (action.includes("UPDATE") || action.includes("EDIT")) return <span className="w-2 h-2 rounded-full bg-blue-500"></span>;
    if (action.includes("LOGIN") || action.includes("LOGOUT")) return <span className="w-2 h-2 rounded-full bg-purple-500"></span>;
    return <span className="w-2 h-2 rounded-full bg-gray-500"></span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-primary" size={24}/> System Audit Logs
          </h1>
          <p className="text-gray-500 mt-1">Monitor all administrative and system-level activities</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 p-0"
            >
              <option value="ALL">All Events</option>
              <option value="AUTH">Authentication</option>
              <option value="SYSTEM">System & Users</option>
              <option value="ATTENDANCE">Attendance</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse flex flex-col items-center">
            <Activity size={32} className="mb-2 text-gray-400" />
            Loading security logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Shield size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No activity recorded</h3>
            <p className="text-gray-500 mt-1">No logs match the selected filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={14} />
                        {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.actor ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {log.actor.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{log.actor.name}</div>
                            <div className="text-xs text-gray-500">{log.actor.role}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <AlertCircle size={16} /> <span className="text-sm italic">System Event</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="text-sm font-bold text-gray-700">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-md bg-gray-100 text-gray-800 border border-gray-200">
                        {log.targetType} {log.targetId && `#${log.targetId.substring(0,6)}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate font-mono bg-gray-50 p-1 rounded border border-gray-100">
                        {log.metadata ? log.metadata : 'No additional metadata'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
