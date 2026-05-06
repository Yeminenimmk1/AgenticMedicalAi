import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/" replace />

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard'} replace />
  }

  return children
}
