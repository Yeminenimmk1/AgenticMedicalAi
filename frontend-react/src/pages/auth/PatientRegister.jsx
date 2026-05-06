import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { registerPatient } from '../../api/api'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Stethoscope, AlertCircle, CheckCircle } from 'lucide-react'

export default function PatientRegister() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', fullName: '', age: '', gender: '', bloodGroup: '', villageOrArea: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await registerPatient({ ...form, age: parseInt(form.age) || null, role: 'PATIENT' })
      login(res.data)
      navigate('/patient/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-teal-600 items-center justify-center mb-4">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Create Your Account</h1>
          <p className="text-slate-500 mt-2">Join AgenticMed AI for intelligent health management</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="Full Name *" placeholder="Arjun Mehta" value={form.fullName} onChange={set('fullName')} required />
              <Input label="Username *" placeholder="arjun_m" value={form.username} onChange={set('username')} required />
              <Input label="Email Address *" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              <Input label="Password *" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required />
              <Input label="Age" type="number" placeholder="25" value={form.age} onChange={set('age')} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Gender</label>
                <select value={form.gender} onChange={set('gender')} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm">
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Blood Group</label>
                <select value={form.bloodGroup} onChange={set('bloodGroup')} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm">
                  <option value="">Select blood group</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <Input label="City / Area" placeholder="Chennai, Tamil Nadu" value={form.villageOrArea} onChange={set('villageOrArea')} />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account & Continue'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{' '}
            <Link to="/login/patient" className="text-teal-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
