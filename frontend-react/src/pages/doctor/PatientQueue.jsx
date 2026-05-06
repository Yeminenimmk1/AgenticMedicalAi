import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getIncoming } from '../../api/api'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Clock, Eye, Inbox } from 'lucide-react'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr)
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function PatientQueue() {
  const { user } = useAuth()
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getIncoming(user.username)
      .then(r => setQueue(r.data))
      .finally(() => setLoading(false))
  }, [user.username])

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Patient Queue</h1>
            <p className="text-slate-500 mt-1">Incoming consultation requests awaiting your review.</p>
          </div>
          <Badge variant="info" className="text-sm px-3 py-1">{queue.length} requests</Badge>
        </div>

        {loading && <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />}

        {!loading && queue.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Inbox className="w-12 h-12 mb-3 opacity-40" />
              <p className="font-semibold">No pending consultations</p>
              <p className="text-sm mt-1">New requests will appear here when patients forward their AI analysis.</p>
            </CardContent>
          </Card>
        )}

        <Card>
          {queue.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {queue.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                            {req.patientUsername?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{req.patientUsername}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Clock className="w-3.5 h-3.5" /> {timeAgo(req.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={req.status === 'REVIEWED' ? 'success' : 'warning'}>{req.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant={req.status === 'REVIEWED' ? 'ghost' : 'primary'}
                          onClick={() => navigate(`/doctor/review/${req.id}`)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          {req.status === 'REVIEWED' ? 'View' : 'Review'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}
