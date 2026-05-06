import { useState } from 'react'
import { Textarea } from '../ui/Input'
import { Button } from '../ui/Button'
import { Brain, FileText, Send, CheckCircle2 } from 'lucide-react'
import { Badge } from '../ui/Badge'

export default function VerificationWorkspace({ consultation, log, onReply }) {
  const [reply, setReply] = useState(consultation?.doctorReply || '')
  const [submitting, setSubmitting] = useState(false)
  const isReviewed = consultation?.status === 'REVIEWED'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reply.trim() || isReviewed) return
    setSubmitting(true)
    // API CALL PLACEHOLDER: Parent handles the actual POST /api/v1/consultations/reply call
    await onReply(consultation.id, reply)
    setSubmitting(false)
  }

  if (!consultation) {
    return (
      <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center h-full min-h-[500px]">
        <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-4 text-slate-300">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="font-semibold text-slate-700">No Patient Selected</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-xs text-center">
          Select a patient from the queue to review their symptoms and AI analysis.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
      {/* Left: Patient Data & AI Insights */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(15,118,110,0.04)] border border-slate-100 flex flex-col h-full overflow-y-auto">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-teal-600" />
            AI Clinical Analysis
          </h2>
          <p className="text-sm text-slate-500 mt-1">Review the raw symptoms and AgenticMed's findings.</p>
        </div>

        <div className="space-y-6 flex-1">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Patient Reported Symptoms</p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-slate-700 text-sm leading-relaxed">{consultation.symptoms || log?.symptoms || 'No symptoms provided.'}</p>
            </div>
          </div>

          {log ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">AI Preliminary Diagnosis</p>
                <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl">
                  <p className="text-xl font-bold text-slate-900 mb-2">{log.finalDiagnosis}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-teal-200/50 h-2 rounded-full overflow-hidden">
                      <div className="bg-teal-600 h-full rounded-full" style={{ width: `${log.confidenceScore}%` }} />
                    </div>
                    <span className="text-sm font-bold text-teal-800">{log.confidenceScore?.toFixed(1)}% Conf.</span>
                  </div>
                </div>
              </div>
              
              {log.isEmergency && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-sm font-semibold flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Emergency Severity Flagged
                </div>
              )}

              {log.reasoning && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">AI Reasoning</p>
                  <p className="text-sm text-slate-600 bg-white border border-slate-200 p-4 rounded-xl shadow-sm leading-relaxed">
                    {log.reasoning}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-100">
              <p className="text-sm text-slate-500">AI Analysis log not available for this consultation.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Verification Editor */}
      <div className="bg-slate-900 rounded-2xl p-6 shadow-xl flex flex-col h-full relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="mb-6 relative z-10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Verification Workspace
          </h2>
          <p className="text-sm text-slate-400 mt-1">Provide your verified diagnosis and next steps.</p>
        </div>

        <div className="flex-1 flex flex-col relative z-10">
          {isReviewed ? (
             <div className="flex-1 flex flex-col items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center">
               <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">Response Sent Successfully</h3>
               <p className="text-slate-400 text-sm max-w-sm">
                 The patient has received your verified diagnosis and instructions in their portal.
               </p>
               <div className="mt-6 text-left w-full bg-slate-900 p-4 rounded-lg border border-slate-700">
                 <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Your Reply:</p>
                 <p className="text-slate-300 text-sm leading-relaxed">{reply}</p>
               </div>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <textarea
                className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-xl p-5 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-base leading-relaxed"
                placeholder="Based on the AI analysis and clinical assessment, my verified diagnosis is... I recommend the following steps..."
                value={reply}
                onChange={e => setReply(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                className="w-full mt-6 py-6 text-lg bg-blue-600 hover:bg-blue-500 text-white border-none shadow-[0_0_20px_rgba(37,99,235,0.3)]" 
                size="lg" 
                disabled={submitting || !reply.trim()}
              >
                {submitting ? 'Sending securely…' : <><Send className="w-5 h-5 mr-2" /> Send Verified Diagnosis</>}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
