import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { doctorLogin } from '../../api/api'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { UserCog, AlertCircle, ShieldCheck } from 'lucide-react'

export default function DoctorLogin() {
  const [form, setForm] = useState({ doctorId: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await doctorLogin(form)
      const data = res.data
      if (data.role !== 'DOCTOR') {
        setError('Access denied. This portal is for registered doctors only.')
        return
      }
      login(data)
      navigate('/doctor/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Doctor credentials. Please verify your ID and email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel — blue for doctor */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-800 to-blue-950 items-center justify-center p-12">
        <div className="text-white max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-8">
            <UserCog className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-4 leading-tight">Clinical<br />Intelligence Portal</h1>
          <p className="text-blue-200 text-lg leading-relaxed">Review AI-generated diagnoses, manage patient consultations, and monitor prescription safety — all in one place.</p>
          <div className="mt-10 p-4 bg-white/10 rounded-xl border border-white/20">
            <div className="flex items-center gap-2 text-blue-200 text-sm mb-2">
              <ShieldCheck className="w-4 h-4" /> Restricted Access
            </div>
            <p className="text-xs text-blue-300">This portal is exclusively for registered medical professionals. Unauthorized access is prohibited.</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-2">Doctor Portal</p>
            <h2 className="text-3xl font-bold text-slate-900">Clinical Sign In</h2>
            <p className="text-slate-500 mt-2">Enter your registered Doctor credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Doctor Unique ID"
              type="text"
              placeholder="e.g. dr_sharma"
              value={form.doctorId}
              onChange={e => setForm(p => ({ ...p, doctorId: e.target.value }))}
              required
            />
            <Input
              label="Registered Email"
              type="email"
              placeholder="doctor@hospital.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <Button type="submit" variant="secondary" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Verifying credentials…' : 'Sign In to Clinical Portal'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Are you a patient?{' '}
              <Link to="/login/patient" className="text-teal-600 font-semibold hover:underline">Patient Login →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
