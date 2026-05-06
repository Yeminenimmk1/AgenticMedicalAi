import { Inbox, Eye, Clock, User } from 'lucide-react'
import { Badge } from '../ui/Badge'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr)
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function PatientQueueTable({ queue, loading, onSelect, selectedId }) {
  if (loading) {
    return <div className="h-full bg-slate-100 rounded-2xl animate-pulse min-h-[500px]" />
  }

  if (queue.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center h-full min-h-[500px]">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="font-semibold text-slate-700">No Pending Consultations</h3>
        <p className="text-sm text-slate-500 mt-1">You're all caught up for now.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_4px_20px_-4px_rgba(15,118,110,0.04)] h-full flex flex-col">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Incoming Queue
        </h2>
        <p className="text-sm text-slate-500 mt-1">Select a patient request to begin verification.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-white shadow-sm">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Time</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {queue.map(req => (
              <tr 
                key={req.id} 
                onClick={() => onSelect(req)}
                className={`cursor-pointer transition-colors ${selectedId === req.id ? 'bg-blue-50/50 border-l-4 border-blue-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${selectedId === req.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {req.patientUsername?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-semibold text-slate-900">{req.patientUsername}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {timeAgo(req.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={req.status === 'REVIEWED' ? 'success' : 'warning'}>
                    {req.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
