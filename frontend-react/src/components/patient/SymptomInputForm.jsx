import { useState } from 'react'
import { Textarea, Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Send, Activity } from 'lucide-react'

export default function SymptomInputForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ symptoms: '', glucose: '', bp: '', bmi: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.symptoms.trim()) return
    // API CALL PLACEHOLDER: This component passes the form data up to the parent.
    // The parent will call POST /api/v1/triage with this payload.
    onSubmit({
      symptoms: form.symptoms,
      currentGlucose: form.glucose ? parseInt(form.glucose) : null,
      currentBloodPressure: form.bp ? parseInt(form.bp) : null,
      currentBmi: form.bmi ? parseFloat(form.bmi) : null,
    })
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(15,118,110,0.08)] border border-slate-100 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" />
          Symptom Assessment
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Describe what you're experiencing in detail for our AI Medical Board to analyze.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
        <Textarea
          label="Your Symptoms *"
          placeholder="e.g., I've had a persistent headache for 3 days, accompanied by slight nausea and sensitivity to light..."
          rows={6}
          value={form.symptoms}
          onChange={e => setForm(p => ({ ...p, symptoms: e.target.value }))}
          required
          className="flex-1 resize-none"
        />
        
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Current Vitals (Optional)
          </p>
          <div className="grid grid-cols-3 gap-4">
            <Input 
              label="Glucose" 
              type="number" 
              placeholder="mg/dL" 
              value={form.glucose} 
              onChange={e => setForm(p => ({ ...p, glucose: e.target.value }))} 
            />
            <Input 
              label="Diastolic BP" 
              type="number" 
              placeholder="mmHg" 
              value={form.bp} 
              onChange={e => setForm(p => ({ ...p, bp: e.target.value }))} 
            />
            <Input 
              label="BMI" 
              type="number" 
              step="0.1" 
              placeholder="kg/m²" 
              value={form.bmi} 
              onChange={e => setForm(p => ({ ...p, bmi: e.target.value }))} 
            />
          </div>
        </div>

        <Button type="submit" className="w-full py-6 text-lg" size="lg" disabled={loading || !form.symptoms.trim()}>
          {loading ? (
            <><span className="animate-spin mr-2 text-xl">⟳</span> Analyzing Symptoms…</>
          ) : (
            <><Send className="w-5 h-5 mr-2" /> Request AI Triage</>
          )}
        </Button>
      </form>
    </div>
  )
}
