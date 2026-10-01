import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";

export default async function MemberAttendanceHistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  const records = await prisma.attendanceRecord.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      date: 'desc'
    },
    take: 30
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
      <p className="text-gray-500 mt-1">View your past attendance records</p>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mt-6">
        {records.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No attendance records found. Your punches will appear here.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch In</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch Out</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Hours</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {format(new Date(record.date), 'EEE, dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.punchIn ? format(new Date(record.punchIn), 'hh:mm a') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.punchOut ? format(new Date(record.punchOut), 'hh:mm a') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.workHours ? `${record.workHours.toFixed(2)} hrs` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                      record.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                      record.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status}
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
