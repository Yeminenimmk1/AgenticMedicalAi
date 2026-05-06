import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getPatientHistory, getPatientConsults } from '../../api/api'
import AppLayout from '../../components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Clock, MessageSquare, AlertTriangle } from 'lucide-react'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr)
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function MyHistory() {
  const { user } = useAuth()
  const [logs, setLogs]       = useState([])
  const [consults, setConsults] = useState([])
  const [loading, setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      getPatientHistory(user.username).catch(() => ({ data: [] })),
      getPatientConsults(user.username).catch(() => ({ data: [] })),
    ]).then(([h, c]) => { setLogs(h.data); setConsults(c.data) })
      .finally(() => setLoading(false))
  }, [user.username])

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Health History</h1>
          <p className="text-slate-500 mt-1">Review your past AI diagnoses and doctor responses.</p>
        </div>

        {loading && <div className="h-48 bg-slate-100 rounded-xl animate-pulse" />}

        {/* Doctor replies */}
        {consults.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Doctor Replies</h2>
            <div className="space-y-3">
              {consults.map(c => (
                <Card key={c.id} className={c.status === 'REVIEWED' ? 'border-emerald-200' : ''}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Consultation with {c.doctorUsername}</p>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(c.createdAt)}</p>
                        </div>
                      </div>
                      <Badge variant={c.status === 'REVIEWED' ? 'success' : 'warning'}>{c.status}</Badge>
                    </div>
                    {c.doctorReply && (
                      <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
                        <p className="text-xs font-semibold text-emerald-700 mb-1">Doctor's Response</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{c.doctorReply}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* AI Diagnosis logs */}
        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">AI Diagnosis Logs</h2>
          {logs.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No history yet</p>
              <p className="text-sm mt-1">Run a Symptom Check to see results here.</p>
            </div>
          )}
          <div className="space-y-3">
            {logs.map((log, i) => (
              <Card key={log.diagnosisId || i}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {log.isEmergency && <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{log.finalDiagnosis || 'Unknown'}</p>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(log.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.isEmergency && <Badge variant="danger">Emergency</Badge>}
                      <Badge variant="default">{log.confidenceScore?.toFixed(0)}% confidence</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
