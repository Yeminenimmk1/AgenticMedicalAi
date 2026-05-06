import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getIncoming, getDoctorLogs, replyConsultation } from '../../api/api'
import AppLayout from '../../components/layout/AppLayout'

// Modular Components
import PatientQueueTable from '../../components/doctor/PatientQueueTable'
import VerificationWorkspace from '../../components/doctor/VerificationWorkspace'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [queue, setQueue] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConsult, setSelectedConsult] = useState(null)

  useEffect(() => {
    // Fetch queue and logs simultaneously
    Promise.all([
      getIncoming(user.username).catch(() => ({ data: [] })),
      getDoctorLogs().catch(() => ({ data: [] }))
    ]).then(([queueRes, logsRes]) => {
      setQueue(queueRes.data)
      setLogs(logsRes.data)
    }).finally(() => setLoading(false))
  }, [user.username])

  const handleReply = async (consultId, replyText) => {
    // API CALL PLACEHOLDER: Submitting the doctor's verified diagnosis
    await replyConsultation(consultId, replyText)
    // Update local state to mark as REVIEWED
    setQueue(prev => prev.map(c => c.id === consultId ? { ...c, status: 'REVIEWED', doctorReply: replyText } : c))
    setSelectedConsult(prev => prev?.id === consultId ? { ...prev, status: 'REVIEWED', doctorReply: replyText } : prev)
  }

  // Find the AI log corresponding to the selected consultation
  const getSelectedLog = () => {
    if (!selectedConsult) return null
    // The DiagnosisLog entity has a nested 'patient' object with a 'username'
    return logs.find(l => l.patient?.username === selectedConsult.patientUsername) || null
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <AppLayout>
      <div className="h-[calc(100vh-64px)] flex flex-col max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex-shrink-0">
          <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">{greeting}, Dr. {user?.fullName || user?.username}</p>
          <h1 className="text-3xl font-black text-slate-900 mt-1">Clinical Verification Portal</h1>
          <p className="text-slate-500 mt-1">Review AI triage reports and provide verified medical diagnoses.</p>
        </div>

        {/* Master-Detail Split Screen */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8">
          
          {/* Master: Queue Table (Takes up 4 columns on large screens) */}
          <div className="lg:col-span-4 h-full">
            <PatientQueueTable 
              queue={queue} 
              loading={loading} 
              onSelect={setSelectedConsult}
              selectedId={selectedConsult?.id}
            />
          </div>

          {/* Detail: Verification Workspace (Takes up 8 columns) */}
          <div className="lg:col-span-8 h-full">
            <VerificationWorkspace 
              consultation={selectedConsult}
              log={getSelectedLog()}
              onReply={handleReply}
            />
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
