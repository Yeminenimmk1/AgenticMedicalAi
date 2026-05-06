import { useState } from 'react'
import { sendConsultation } from '../../api/api'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Stethoscope, MapPin, Star, ArrowRight, CheckCircle2, Search, Users } from 'lucide-react'

export default function DoctorSelectionList({ symptomsText, hasDiagnosis }) {
  const { user } = useAuth()
  
  // Search State
  const [location, setLocation] = useState('')
  const [specialty, setSpecialty] = useState('All Specialties')
  
  // Results State
  const [hasSearched, setHasSearched] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Forwarding State
  const [forwardingTo, setForwardingTo] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (!location.trim()) return

    setLoading(true)
    setHasSearched(true)
    
    // API CALL PLACEHOLDER: Fetching doctors based on search parameters
    // In the future, uncomment and wire up to your Spring Boot REST API:
    // axios.get(`/api/v1/doctors/search?location=${encodeURIComponent(location)}&specialty=${encodeURIComponent(specialty)}`)
    //   .then(r => setDoctors(r.data))
    
    // For now, simulate a brief loading delay and mock results
    setTimeout(() => {
      // Mocking results for the demo based on the aesthetic required
      setDoctors([
        { id: 1, username: 'dr_sharma', fullName: 'A. Sharma', villageOrArea: location, specialty: 'General Physician' },
        { id: 2, username: 'dr_patel', fullName: 'K. Patel', villageOrArea: location, specialty: 'Cardiologist' },
        { id: 3, username: 'dr_singh', fullName: 'R. Singh', villageOrArea: location, specialty: 'Neurologist' },
      ].filter(d => specialty === 'All Specialties' || d.specialty === specialty))
      
      setLoading(false)
    }, 1200)
  }

  const handleForward = async (docUsername) => {
    setForwardingTo(docUsername)
    try {
      // API CALL PLACEHOLDER: Forwarding consultation to specific doctor
      await sendConsultation({
        patientUsername: user.username,
        doctorUsername: docUsername,
        symptoms: symptomsText,
      })
      setSuccessMsg(`Successfully forwarded to Dr. ${docUsername}`)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      alert('Failed to forward. Please try again.')
    } finally {
      setForwardingTo(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(15,118,110,0.08)] border border-slate-100">
      
      {/* Header & Success Message */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            Find Registered Specialists
          </h2>
          <p className="text-sm text-slate-500 mt-1">Locate a doctor to review your AI insights.</p>
        </div>
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" /> {successMsg}
          </div>
        )}
      </div>

      {/* Clean Search Interface */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-end gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="flex-1 w-full">
          <Input 
            label="Location (City or Zip Code)" 
            type="text" 
            placeholder="e.g. New York or 10001" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="bg-white"
          />
        </div>
        
        <div className="flex-1 w-full">
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">Specialty</label>
          <div className="relative">
            <select 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-sm appearance-none cursor-pointer"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              <option value="All Specialties">All Specialties</option>
              <option value="General Physician">General Physician</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Neurologist">Neurologist</option>
              <option value="Endocrinologist">Endocrinologist</option>
              <option value="Pediatrician">Pediatrician</option>
            </select>
            {/* Custom dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full md:w-auto px-8 py-2.5 h-[42px]" disabled={loading || !location.trim()}>
          {loading ? 'Searching…' : <><Search className="w-4 h-4 mr-2" /> Search</>}
        </Button>
      </form>

      {/* Dynamic Results Area */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium">Scanning for specialists near {location}…</p>
        </div>
      ) : !hasSearched ? (
        <div className="py-12 flex flex-col items-center justify-center bg-white border border-slate-200 border-dashed rounded-xl">
          <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-slate-700 font-semibold mb-1">Find Your Specialist</h3>
          <p className="text-slate-500 text-sm">Enter your location above to find registered specialists near you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {doctors.length > 0 ? doctors.map(doc => (
            <div key={doc.id} className="border border-slate-100 hover:border-teal-200 hover:shadow-md transition-all rounded-xl p-5 flex flex-col bg-slate-50/50 hover:bg-white group">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg flex-shrink-0 group-hover:bg-teal-100 group-hover:text-teal-700 transition-colors">
                  {doc.fullName?.[0] || doc.username?.[0] || 'D'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 truncate">Dr. {doc.fullName || doc.username}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {doc.villageOrArea || 'Nearby Clinic'}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                      {doc.specialty || 'Specialist'}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs text-slate-400 ml-0.5 font-medium">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-auto group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all"
                disabled={!hasDiagnosis || forwardingTo === doc.username}
                onClick={() => handleForward(doc.username)}
              >
                {forwardingTo === doc.username ? 'Forwarding…' : (
                  <>Forward Insights <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></>
                )}
              </Button>
            </div>
          )) : (
            <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border border-slate-100 border-dashed">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium mb-1">No specialists found</p>
              <p className="text-slate-500 text-sm">We couldn't find any {specialty !== 'All Specialties' ? specialty : 'doctors'} near '{location}'. Try another area.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
