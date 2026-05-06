import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'

import LandingPage        from '../pages/LandingPage'
import PatientLogin       from '../pages/auth/PatientLogin'
import DoctorLogin        from '../pages/auth/DoctorLogin'
import PatientRegister    from '../pages/auth/PatientRegister'
import PatientDashboard   from '../pages/patient/PatientDashboard'
import SymptomChecker     from '../pages/patient/SymptomChecker'
import FindDoctors        from '../pages/patient/FindDoctors'
import MyHistory          from '../pages/patient/MyHistory'
import OutbreakMonitorView from '../pages/patient/OutbreakMonitorView'
import DoctorDashboard    from '../pages/doctor/DoctorDashboard'
import PatientQueue       from '../pages/doctor/PatientQueue'
import DoctorPatientReviewView from '../pages/doctor/DoctorPatientReviewView'
import MisuseMonitor      from '../pages/doctor/MisuseMonitor'
import DigitalTwinView    from '../pages/patient/DigitalTwinView'
import ProfileSettingsView from '../pages/patient/ProfileSettingsView'

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <LandingPage />
  if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />
  return <Navigate to="/patient/dashboard" replace />
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"               element={<RootRedirect />} />
        <Route path="/login/patient"  element={<PatientLogin />} />
        <Route path="/login/doctor"   element={<DoctorLogin />} />
        <Route path="/register"       element={<PatientRegister />} />

        {/* Patient routes */}
        <Route path="/patient/dashboard" element={<ProtectedRoute requiredRole="PATIENT"><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/symptoms"  element={<ProtectedRoute requiredRole="PATIENT"><SymptomChecker /></ProtectedRoute>} />
        <Route path="/patient/outbreak"  element={<ProtectedRoute requiredRole="PATIENT"><OutbreakMonitorView /></ProtectedRoute>} />
        <Route path="/patient/doctors"   element={<ProtectedRoute requiredRole="PATIENT"><FindDoctors /></ProtectedRoute>} />
        <Route path="/patient/history"   element={<ProtectedRoute requiredRole="PATIENT"><MyHistory /></ProtectedRoute>} />
        <Route path="/patient/twin"      element={<ProtectedRoute requiredRole="PATIENT"><DigitalTwinView /></ProtectedRoute>} />
        <Route path="/patient/settings"  element={<ProtectedRoute requiredRole="PATIENT"><ProfileSettingsView /></ProtectedRoute>} />

        {/* Doctor routes */}
        <Route path="/doctor/dashboard"         element={<ProtectedRoute requiredRole="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/queue"             element={<ProtectedRoute requiredRole="DOCTOR"><PatientQueue /></ProtectedRoute>} />
        <Route path="/doctor/review/:id"        element={<ProtectedRoute requiredRole="DOCTOR"><DoctorPatientReviewView /></ProtectedRoute>} />
        <Route path="/doctor/misuse"            element={<ProtectedRoute requiredRole="DOCTOR"><MisuseMonitor /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
