import { Brain, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react'

export default function AiInsightsCard({ result, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 h-full flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mb-6" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Analyzing Medical Data…</h3>
        <p className="text-slate-500 text-sm text-center max-w-xs">
          Our Multi-Agent Medical Board is deliberating on your symptoms and vitals.
        </p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 border-dashed h-full flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-6 text-slate-400 rotate-3">
          <Brain className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Awaiting Symptoms</h3>
        <p className="text-slate-500 text-sm text-center max-w-xs leading-relaxed">
          Submit your symptoms using the form to receive a preliminary AI diagnosis and Digital Twin risk assessment.
        </p>
      </div>
    )
  }

  const { finalDiagnosis, confidenceScore, isEmergency, reasoning, diabetesRiskScore, heartRiskScore, overallHealthScore } = result

  return (
    <div className={`bg-white rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(15,118,110,0.08)] border ${isEmergency ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-100'} h-full flex flex-col`}>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-teal-600" />
            AI Clinical Insights
          </h2>
          <p className="text-sm text-slate-500 mt-1">Preliminary assessment by AgenticMed</p>
        </div>
        {isEmergency ? (
          <div className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-red-200">
            <ShieldAlert className="w-4 h-4" /> Emergency
          </div>
        ) : (
          <div className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-teal-100">
            <CheckCircle2 className="w-4 h-4" /> Analyzed
          </div>
        )}
      </div>

      <div className="flex-1 space-y-8">
        {/* Primary Diagnosis */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Likely Condition</p>
          <h3 className={`text-3xl font-black mb-3 ${isEmergency ? 'text-red-700' : 'text-slate-900'}`}>
            {finalDiagnosis}
          </h3>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-500 font-medium">AI Confidence Level</span>
              <span className="font-bold text-slate-900">{confidenceScore?.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-teal-500 h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${confidenceScore}%` }} 
              />
            </div>
          </div>
          
          {reasoning && (
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
              <span className="font-semibold text-slate-700 block mb-1">AI Reasoning:</span>
              {reasoning}
            </p>
          )}
        </div>

        {/* Digital Twin Scores */}
        <div className="border-t border-slate-100 pt-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Digital Twin Risk Profiling</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Overall Vitality', value: overallHealthScore, color: 'bg-teal-500', bg: 'bg-teal-50' },
              { label: 'Cardiac Risk', value: heartRiskScore, color: heartRiskScore > 50 ? 'bg-red-500' : 'bg-orange-400', bg: 'bg-orange-50' },
              { label: 'Diabetes Risk', value: diabetesRiskScore, color: diabetesRiskScore > 50 ? 'bg-red-500' : 'bg-amber-400', bg: 'bg-amber-50' },
            ].map(score => (
              <div key={score.label} className={`${score.bg} p-4 rounded-xl border border-white shadow-sm`}>
                <p className="text-2xl font-black text-slate-900 mb-1">{score.value?.toFixed(0)}<span className="text-sm font-medium text-slate-500">%</span></p>
                <p className="text-xs font-medium text-slate-600 line-clamp-1">{score.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
