"use client";

import { useState, useEffect } from "react";
import { format, subMonths } from "date-fns";
import { FileText, Download, TrendingUp, Users, Clock, AlertCircle } from "lucide-react";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Default to current month
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?month=${selectedMonth}`);
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
    fetchReport();
  }, [selectedMonth]);

  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { jsPDF } = await import("jspdf");

      const element = document.getElementById("report-container");
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`WeFive_Attendance_Report_${selectedMonth}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Reports</h1>
          <p className="text-gray-500 mt-1">Generate and export attendance summaries</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:ring-primary focus:border-primary"
          />
          <button 
            onClick={handleExportPDF}
            disabled={exporting || loading}
            className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            <Download size={16} /> {exporting ? "Generating PDF..." : "Export to PDF"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 animate-pulse bg-white rounded-lg border border-gray-100 shadow-sm">
          Generating report data...
        </div>
      ) : data ? (
        <div id="report-container" className="space-y-6 p-4 bg-gray-50 rounded-lg">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24}/></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">{data.summary.totalMembers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={24}/></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Present Days</p>
                  <p className="text-2xl font-bold text-gray-900">{data.summary.presentRecords}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Clock size={24}/></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Late Arrivals</p>
                  <p className="text-2xl font-bold text-gray-900">{data.summary.lateRecords}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={24}/></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Absent Days</p>
                  <p className="text-2xl font-bold text-gray-900">{data.summary.absentRecords}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Member Details Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Member Attendance Breakdown</h2>
              <span className="text-sm text-gray-500 font-medium">{format(new Date(selectedMonth), "MMMM yyyy")}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Leave</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Work Hours</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.memberStats.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No members found.
                      </td>
                    </tr>
                  ) : (
                    data.memberStats.map((stat: any) => (
                      <tr key={stat.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{stat.name}</div>
                          <div className="text-sm text-gray-500">{stat.employeeId || stat.department || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{stat.present}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">{stat.late}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{stat.absent}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.onLeave}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {stat.totalHours > 0 ? `${stat.totalHours.toFixed(1)} hrs` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-red-500 bg-red-50 rounded-lg">Failed to load report data.</div>
      )}
    </div>
  );
}
