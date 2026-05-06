import { useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { checkPrescription } from '../../api/api'
import { ShieldCheck, AlertTriangle, FlaskConical } from 'lucide-react'

const PRESETS = [
  { label: 'Safe — Headache + Paracetamol', data: { diagnosis: 'Headache', antibiotic_name: 'Paracetamol', dosage_mg: 500, duration_days: 3, patient_age: 30 } },
  { label: 'Misuse — Viral Cold + Amoxicillin 1000mg', data: { diagnosis: 'Viral Cold', antibiotic_name: 'Amoxicillin', dosage_mg: 1000, duration_days: 14, patient_age: 30 } },
  { label: 'Anomaly — Fever + Overdose', data: { diagnosis: 'Fever', antibiotic_name: 'Amoxicillin', dosage_mg: 2000, duration_days: 30, patient_age: 5 } },
]

export default function MisuseMonitor() {
  const [form, setForm] = useState({ diagnosis: '', antibiotic_name: '', dosage_mg: '', duration_days: '', patient_age: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const loadPreset = (preset) => { setForm(preset.data); setResult(null); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setResult(null); setError('')
    try {
      const payload = {
        diagnosis: form.diagnosis,
        antibiotic_name: form.antibiotic_name,
        dosage_mg: parseInt(form.dosage_mg),
        duration_days: parseInt(form.duration_days),
        patient_age: parseInt(form.patient_age),
      }
      const res = await checkPrescription(payload)
      setResult(res.data)
    } catch (err) {
      setError('ML service unavailable. Ensure Python microservice is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  const isSafe = result?.status === 'SAFE'

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prescription Misuse Monitor</h1>
          <p className="text-slate-500 mt-1">Run the Hybrid ML model (Gradient Boosting + Isolation Forest) against any prescription to detect misuse or anomalies.</p>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => loadPreset(p)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-slate-400" />
                <CardTitle>Prescription Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Diagnosis" placeholder="e.g. Viral Cold, Headache, Dengue" value={form.diagnosis} onChange={set('diagnosis')} required />
                <Input label="Drug / Antibiotic Name" placeholder="e.g. Paracetamol, Amoxicillin" value={form.antibiotic_name} onChange={set('antibiotic_name')} required />
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Dosage (mg)" type="number" placeholder="500" value={form.dosage_mg} onChange={set('dosage_mg')} required />
                  <Input label="Duration (days)" type="number" placeholder="5" value={form.duration_days} onChange={set('duration_days')} required />
                  <Input label="Patient Age" type="number" placeholder="30" value={form.patient_age} onChange={set('patient_age')} required />
                </div>
                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (<><span className="animate-spin mr-2">⟳</span> Running ML Safety Check…</>) : 'Run ML Safety Check'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Result */}
          <div>
            {!result && !loading && (
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center h-full py-16 text-slate-400">
                  <ShieldCheck className="w-12 h-12 mb-3 opacity-30" />
                  <p className="font-medium">Awaiting Analysis</p>
                  <p className="text-sm mt-1 text-center">Fill in the prescription or choose a preset and click Run.</p>
                </CardContent>
              </Card>
            )}

            {loading && (
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-600 font-medium">Hybrid ML model running…</p>
                  <p className="text-xs text-slate-400 mt-1">Gradient Boosting + Isolation Forest</p>
                </CardContent>
              </Card>
            )}

            {result && (
              <Card className={isSafe ? 'border-emerald-300' : 'border-red-400'}>
                <CardContent className="py-6 space-y-5">
                  {/* Status banner */}
                  <div className={`rounded-xl p-5 flex items-center gap-4 ${isSafe ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isSafe ? 'bg-emerald-100' : 'bg-red-100'}`}>
                      {isSafe
                        ? <ShieldCheck className="w-6 h-6 text-emerald-600" />
                        : <AlertTriangle className="w-6 h-6 text-red-600" />
                      }
                    </div>
                    <div>
                      <Badge variant={isSafe ? 'success' : 'danger'} className="text-sm px-3 py-1 mb-1">
                        {isSafe ? 'CLINICALLY SAFE' : 'MISUSE / ANOMALY DETECTED'}
                      </Badge>
                      <p className={`text-sm leading-relaxed ${isSafe ? 'text-emerald-800' : 'text-red-800'}`}>{result.reason}</p>
                    </div>
                  </div>

                  {/* Flags */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model Flags</p>
                    <div className="flex gap-2 flex-wrap">
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${result.classifier_flag ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                        Classifier: {result.classifier_flag ? 'FLAGGED' : 'Clear'}
                      </div>
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${result.anomaly_flag ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                        Isolation Forest: {result.anomaly_flag ? 'ANOMALY' : 'Normal'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
