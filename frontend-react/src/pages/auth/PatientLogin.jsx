import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { patientLogin } from '../../api/api'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Stethoscope, Mail, Lock, AlertCircle } from 'lucide-react'

export default function PatientLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Backend uses username field — we send email as username for patient login
      const res = await patientLogin({ username: form.email, password: form.password })
      const data = res.data
      if (data.role === 'DOCTOR') {
        setError('This is a Patient login. Please use the Doctor portal.')
        return
      }
      login(data)
      navigate('/patient/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-teal-800 items-center justify-center p-12">
        <div className="text-white max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-8">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-4 leading-tight">Your Health,<br />Intelligently Managed.</h1>
          <p className="text-teal-100 text-lg leading-relaxed">AgenticMed AI uses cutting-edge machine learning to analyze your symptoms and connect you with the right doctors — instantly.</p>
          <div className="mt-10 space-y-4">
            {['AI-powered symptom analysis', 'Real-time Digital Twin risk scoring', 'Direct doctor consultation'].map(f => (
              <div key={f} className="flex items-center gap-3 text-teal-50 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-300" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-semibold text-teal-600 uppercase tracking-wider mb-2">Patient Portal</p>
            <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 mt-2">Sign in to access your health dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="text"
              placeholder="you@example.com"
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

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-teal-600 font-semibold hover:underline">Create account</Link>
            </p>
            <p className="text-sm text-slate-600">
              Are you a Doctor?{' '}
              <Link to="/login/doctor" className="text-blue-700 font-semibold hover:underline">Doctor Login →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
