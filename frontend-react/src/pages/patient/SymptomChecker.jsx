import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { submitTriage } from '../../api/api'
import AppLayout from '../../components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Textarea, Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import EmergencyModal from '../../components/EmergencyModal'
import { Activity, ChevronDown, ChevronUp, Send } from 'lucide-react'

export default function SymptomChecker() {
  const { user } = useAuth()
  const [form, setForm] = useState({ symptoms: '', glucose: '', bp: '', bmi: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDebate, setShowDebate] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setResult(null); setLoading(true)
    try {
      const payload = {
        username: user.username,
        symptoms: form.symptoms,
        currentGlucose: form.glucose ? parseInt(form.glucose) : null,
        currentBloodPressure: form.bp ? parseInt(form.bp) : null,
        currentBmi: form.bmi ? parseFloat(form.bmi) : null,
      }
      const res = await submitTriage(payload)
      setResult(res.data)
      if (res.data.isEmergency) setShowEmergency(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Triage failed. Ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const healthScore = result?.overallHealthScore ?? 0
  const diabetesRisk = result?.diabetesRiskScore ?? 0
  const heartRisk    = result?.heartRiskScore ?? 0

  return (
    <AppLayout>
      <EmergencyModal
        open={showEmergency}
        diagnosis={result?.finalDiagnosis}
        confidence={result?.confidenceScore}
        onClose={() => setShowEmergency(false)}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Symptom Checker</h1>
          <p className="text-slate-500 mt-1">Describe your symptoms and our AI medical board will analyze them in real-time.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input form */}
          <Card>
            <CardHeader><CardTitle>Describe Your Symptoms</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <Textarea
                  label="Symptoms *"
                  placeholder="e.g. I have crushing chest pain radiating to my left arm, shortness of breath, and I feel dizzy..."
                  rows={5}
                  value={form.symptoms}
                  onChange={e => setForm(p => ({ ...p, symptoms: e.target.value }))}
                  required
                />
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Current Vitals (Optional — improves accuracy)</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Input label="Glucose (mg/dL)" type="number" placeholder="e.g. 95" value={form.glucose} onChange={e => setForm(p => ({ ...p, glucose: e.target.value }))} />
                    <Input label="BP Diastolic" type="number" placeholder="e.g. 80" value={form.bp} onChange={e => setForm(p => ({ ...p, bp: e.target.value }))} />
                    <Input label="BMI" type="number" step="0.1" placeholder="e.g. 22.5" value={form.bmi} onChange={e => setForm(p => ({ ...p, bmi: e.target.value }))} />
                  </div>
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (<><span className="animate-spin mr-2">⟳</span> AI is analyzing…</>) : (<><Send className="w-4 h-4 mr-2" /> Initiate AI Triage</>)}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Right: Results */}
          <div className="space-y-4">
            {!result && !loading && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Activity className="w-7 h-7 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">Awaiting Analysis</p>
                  <p className="text-slate-400 text-sm mt-1">Submit your symptoms to see AI results here.</p>
                </CardContent>
              </Card>
            )}

            {loading && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-600 font-medium">AI Medical Board deliberating…</p>
                  <p className="text-slate-400 text-sm mt-1">This usually takes 10–20 seconds</p>
                </CardContent>
              </Card>
            )}

            {result && (
              <>
                {/* Main diagnosis card */}
                <Card className={result.isEmergency ? 'border-red-400 shadow-red-100 shadow-md' : ''}>
                  <CardHeader className={result.isEmergency ? 'bg-red-50' : ''}>
                    <div className="flex items-center justify-between">
                      <CardTitle>AI Diagnosis Result</CardTitle>
                      {result.isEmergency
                        ? <Badge variant="danger">🚨 Emergency</Badge>
                        : <Badge variant="success">Analyzed</Badge>
                      }
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Preliminary Diagnosis</p>
                      <p className="text-2xl font-bold text-slate-900">{result.finalDiagnosis}</p>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-600 font-medium">AI Confidence</span>
                        <span className="font-bold text-slate-900">{result.confidenceScore?.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-teal-500 h-2.5 rounded-full transition-all duration-700" style={{ width: `${result.confidenceScore}%` }} />
                      </div>
                    </div>
                    {result.reasoning && (
                      <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100 leading-relaxed">{result.reasoning}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Digital Twin scores */}
                <Card>
                  <CardHeader><CardTitle>Digital Twin Risk Scores</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: 'Overall Health', value: healthScore, color: healthScore > 60 ? 'bg-emerald-500' : 'bg-red-500' },
                      { label: 'Diabetes Risk', value: diabetesRisk, color: diabetesRisk > 50 ? 'bg-red-500' : 'bg-amber-400' },
                      { label: 'Heart Risk', value: heartRisk, color: heartRisk > 50 ? 'bg-red-500' : 'bg-orange-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">{label}</span>
                          <span className="font-semibold text-slate-900">{value?.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* AI Debate log */}
                {result.aiDebateLog && (
                  <Card>
                    <button
                      onClick={() => setShowDebate(p => !p)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors rounded-xl"
                    >
                      <span className="font-semibold text-slate-900 text-sm">View AI Agent Deliberation</span>
                      {showDebate ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {showDebate && (
                      <CardContent className="pt-0 space-y-3">
                        {Object.entries(result.aiDebateLog).map(([agent, opinion]) => (
                          <div key={agent} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">{agent}</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{typeof opinion === 'object' ? JSON.stringify(opinion) : opinion}</p>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
