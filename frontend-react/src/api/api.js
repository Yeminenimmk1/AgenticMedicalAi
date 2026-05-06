import axios from 'axios'

// In dev (localhost), Vite proxy handles /api → localhost:8081
// In production (Vercel), VITE_BACKEND_URL points to Render backend
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''
const PYTHON_ML_URL = import.meta.env.VITE_PYTHON_ML_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: `${BACKEND_URL}/api/v1` })

// ── Auth ──────────────────────────────────────────────────────────
export const patientLogin   = (data) => api.post('/auth/login', data)
export const doctorLogin    = (data) => api.post('/auth/doctor-login', data)
export const registerPatient = (data) => api.post('/auth/register', data)

// ── Patients ─────────────────────────────────────────────────────
export const getPatientProfile = (username) => api.get(`/patients/me?username=${username}`)
export const updateProfile     = (data)     => api.put('/patients/update', data)
export const getDoctors        = ()         => api.get('/patients/doctors')
export const getNearbyDoctors  = (area)     => api.get(`/patients/nearby-doctors?area=${area}`)
export const getPatientHistory = (username) => api.get(`/patients/history?username=${username}`)

// ── Triage ────────────────────────────────────────────────────────
export const submitTriage = (data) => api.post('/triage', data)

// ── Consultations ─────────────────────────────────────────────────
export const sendConsultation    = (data)     => api.post('/consultations/send', data)
export const getIncoming         = (doctor)   => api.get(`/consultations/incoming?doctor=${doctor}`)
export const getPatientConsults  = (username) => api.get(`/consultations/patient?username=${username}`)
export const replyConsultation   = (id, reply)=> api.post(`/consultations/reply?id=${id}&reply=${encodeURIComponent(reply)}`)

// ── Dashboard ─────────────────────────────────────────────────────
export const getDoctorLogs       = ()                => api.get('/dashboard/logs')
export const updateLogStatus     = (id, status)      => api.post(`/dashboard/logs/${id}/status?status=${status}`)
export const getOutbreak         = (disease, tf)     => api.get(`/dashboard/outbreak?disease=${disease}&timeframe=${tf}`)

// ── ML ────────────────────────────────────────────────────────────
export const checkPrescription = (data) =>
  axios.post(`${PYTHON_ML_URL}/api/ml/check-prescription`, data)
