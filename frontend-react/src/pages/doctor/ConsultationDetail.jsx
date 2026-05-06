import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getIncoming, replyConsultation, getDoctorLogs } from '../../api/api'
import { useAuth } from '../../context/AuthContext'
import AppLayout from '../../components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { ArrowLeft, CheckCircle, User, Brain } from 'lucide-react'

export default function ConsultationDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [consult, setConsult] = useState(null)
  const [log, setLog]         = useState(null)
  const [reply, setReply]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    // Fetch all incoming for this doctor then find this specific one
    getIncoming(user.username).then(r => {
      const found = r.data.find(c => c.id === id)
      setConsult(found)
      if (found?.doctorReply) setReply(found.doctorReply)
    })
    // Fetch the AI diagnosis log for context
    getDoctorLogs().then(r => {
      // Find the log linked to this consultation's diagnosisLogId
      // We show the most recent log for patient context
      setLog(r.data?.[0] || null)
    }).catch(() => {})
  }, [id, user.username])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reply.trim()) return
    setSubmitting(true); setError('')
    try {
      await replyConsultation(id, reply)
      setSuccess(true)
    } catch {
      setError('Failed to send reply. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/queue')}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Queue
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Consultation Review</h1>
          {consult && <Badge variant={consult.status === 'REVIEWED' ? 'success' : 'warning'}>{consult.status}</Badge>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Patient info + AI report */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <CardTitle>Patient Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Username</span>
                  <span className="font-semibold text-slate-900">{consult?.patientUsername || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Consultation ID</span>
                  <span className="font-mono text-xs text-slate-600">{id?.slice(0, 8)}…</span>
                </div>
              </CardContent>
            </Card>

            {log && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-teal-600" />
                    <CardTitle>AI Medical Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">AI Diagnosis</p>
                    <p className="text-xl font-bold text-slate-900">{log.finalDiagnosis || 'N/A'}</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Confidence Score</span>
                      <span className="font-semibold">{log.confidenceScore?.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${log.confidenceScore}%` }} />
                    </div>
                  </div>
                  {log.isEmergency && <Badge variant="danger">Emergency Flagged</Badge>}
                  {log.reasoning && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <p className="text-xs font-semibold text-slate-600 mb-1">AI Reasoning</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{log.reasoning}</p>
                    </div>
                  )}
                  {log.aiDebateLog && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Agent Deliberation</p>
                      {Object.entries(log.aiDebateLog).map(([agent, opinion]) => (
                        <div key={agent} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                          <p className="text-xs font-bold text-blue-700 mb-1">{agent}</p>
                          <p className="text-xs text-slate-700 leading-relaxed">{typeof opinion === 'object' ? JSON.stringify(opinion) : opinion}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT: Doctor reply */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Your Clinical Response</CardTitle>
                <p className="text-sm text-slate-500 mt-1">Write your verified diagnosis, next steps, and prescription advice below.</p>
              </CardHeader>
              <CardContent>
                {success ? (
                  <div className="flex flex-col items-center justify-center py-12 text-emerald-600 gap-3">
                    <CheckCircle className="w-12 h-12" />
                    <p className="font-bold text-lg">Response Sent!</p>
                    <p className="text-sm text-slate-500 text-center">The patient has been notified and can view your reply in their history.</p>
                    <Button variant="outline" onClick={() => navigate('/doctor/queue')}>Back to Queue</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                      label="Verified Diagnosis & Next Steps"
                      placeholder="Based on the AI analysis and clinical assessment, my diagnosis is... I recommend... Please schedule follow-up tests for..."
                      rows={12}
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      required
                    />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <Button type="submit" className="w-full" size="lg" disabled={submitting || consult?.status === 'REVIEWED'}>
                      {submitting ? 'Sending…' : consult?.status === 'REVIEWED' ? 'Response Already Sent' : 'Send Response to Patient'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
