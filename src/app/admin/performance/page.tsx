"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { BarChart2, Save, Edit3, CheckCircle, Search } from "lucide-react";

export default function AdminPerformancePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Default to previous month or current if you prefer
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [searchTerm, setSearchTerm] = useState("");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    attendanceScore: 0,
    taskScore: 0,
    shootScore: 0,
    comments: ""
  });

  const fetchScorecards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/performance?month=${selectedMonth}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScorecards();
  }, [selectedMonth]);

  const handleEdit = (record: any) => {
    setEditingId(record.userId);
    setEditForm({
      attendanceScore: record.attendanceScore,
      taskScore: record.taskScore,
      shootScore: record.shootScore,
      comments: record.comments
    });
  };

  const handleSave = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          month: selectedMonth,
          ...editForm
        })
      });
      const result = await res.json();
      if (result.success) {
        setEditingId(null);
        fetchScorecards();
      }
    } catch (err) {
      console.error("Failed to save", err);
    }
  };

  const filteredData = data.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.department && d.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 70) return "text-blue-600 bg-blue-50";
    if (score >= 50) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="text-primary" size={24}/> Monthly Performance
          </h1>
          <p className="text-gray-500 mt-1">Manage and evaluate employee performance scores</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search members..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm w-64"
            />
          </div>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading scorecards...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance<br/><span className="text-[10px] text-gray-400 font-normal">Score (0-100)</span></th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Task<br/><span className="text-[10px] text-gray-400 font-normal">Score (0-100)</span></th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Shoot<br/><span className="text-[10px] text-gray-400 font-normal">Score (0-100)</span></th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Overall<br/><span className="text-[10px] text-gray-400 font-normal">Average</span></th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No members found for this criteria.</td>
                  </tr>
                ) : filteredData.map((record) => {
                  const isEditing = editingId === record.userId;
                  
                  return (
                    <tr key={record.userId} className={isEditing ? 'bg-blue-50/30' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mr-3">
                            {record.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{record.name}</div>
                            <div className="text-xs text-gray-500">{record.department || 'No Dept'}</div>
                          </div>
                        </div>
                      </td>
                      
                      {isEditing ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input type="number" min="0" max="100" value={editForm.attendanceScore} onChange={e => setEditForm({...editForm, attendanceScore: Number(e.target.value)})} className="w-20 text-center border-gray-300 rounded shadow-sm focus:ring-primary focus:border-primary px-2 py-1 text-sm" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input type="number" min="0" max="100" value={editForm.taskScore} onChange={e => setEditForm({...editForm, taskScore: Number(e.target.value)})} className="w-20 text-center border-gray-300 rounded shadow-sm focus:ring-primary focus:border-primary px-2 py-1 text-sm" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input type="number" min="0" max="100" value={editForm.shootScore} onChange={e => setEditForm({...editForm, shootScore: Number(e.target.value)})} className="w-20 text-center border-gray-300 rounded shadow-sm focus:ring-primary focus:border-primary px-2 py-1 text-sm" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-gray-400 text-sm italic">Auto</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleSave(record.userId)} className="text-green-600 hover:text-green-900 mr-3 flex items-center gap-1 inline-flex">
                              <Save size={16}/> Save
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm font-medium text-gray-900">{record.hasScorecard ? record.attendanceScore : '-'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm font-medium text-gray-900">{record.hasScorecard ? record.taskScore : '-'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm font-medium text-gray-900">{record.hasScorecard ? record.shootScore : '-'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {record.hasScorecard ? (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getScoreColor(record.overallScore)}`}>
                                {record.overallScore}%
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">Not Evaluated</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleEdit(record)} className="text-primary hover:text-primary/80 flex items-center gap-1 inline-flex justify-end w-full">
                              {record.hasScorecard ? <><Edit3 size={16}/> Edit</> : <><CheckCircle size={16}/> Evaluate</>}
                            </button>
                          </td>
                        </>
                      )}
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
