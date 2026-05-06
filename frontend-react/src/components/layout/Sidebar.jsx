import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Activity, Stethoscope, LogOut, ClipboardList, Users, History, Search, AlertCircle, HeartPulse, Globe, UserCircle, Settings } from 'lucide-react'

const patientLinks = [
  { to: '/patient/dashboard', icon: Activity,     label: 'Dashboard' },
  { to: '/patient/symptoms',  icon: HeartPulse,   label: 'Symptom Checker' },
  { to: '/patient/twin',      icon: UserCircle,   label: 'Digital Twin Portal' },
  { to: '/patient/outbreak',  icon: Globe,        label: 'Outbreak Monitor' },
  { to: '/patient/doctors',   icon: Search,       label: 'Find Doctors' },
  { to: '/patient/history',   icon: History,      label: 'My History' },
]

const doctorLinks = [
  { to: '/doctor/dashboard',  icon: Activity,      label: 'Dashboard' },
  { to: '/doctor/queue',      icon: ClipboardList, label: 'Patient Queue' },
  { to: '/doctor/misuse',     icon: AlertCircle,   label: 'Misuse Monitor' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isDoctor = user?.role === 'DOCTOR'
  const links = isDoctor ? doctorLinks : patientLinks

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 bottom-0 z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center shadow-[0_2px_10px_-3px_rgba(15,118,110,0.4)]">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm leading-tight tracking-tight">AgenticMed AI</p>
            <p className="text-xs text-slate-500 font-medium">{isDoctor ? 'Clinical Portal' : 'Patient Portal'}</p>
          </div>
        </div>
      </div>

      {/* User chip */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-3 border border-slate-100/50">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm ${isDoctor ? 'bg-blue-700' : 'bg-teal-600'}`}>
            {user?.fullName?.[0] || user?.username?.[0] || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 truncate">{user?.fullName || user?.username}</p>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{isDoctor ? 'Doctor' : 'Patient'}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? isDoctor ? 'bg-blue-700 text-white shadow-md' : 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon className={`w-[18px] h-[18px] flex-shrink-0`} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-1">
        {!isDoctor && (
          <NavLink
            to="/patient/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full ${
                isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Settings className="w-4 h-4" /> Profile Settings
          </NavLink>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  )
}
