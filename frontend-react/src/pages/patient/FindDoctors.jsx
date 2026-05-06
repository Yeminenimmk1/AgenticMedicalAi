import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import AppLayout from '../../components/layout/AppLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { MapPin, User, Send, CheckCircle, Search } from 'lucide-react'

const DUMMY_DOCTORS = [
  { username: 'dr_sharma', fullName: 'Dr. Ramesh Sharma', villageOrArea: 'Bangalore', specialty: 'Cardiologist' },
  { username: 'dr_gupta', fullName: 'Dr. Sneha Gupta', villageOrArea: 'Hyderabad', specialty: 'Neurologist' },
  { username: 'dr_rao', fullName: 'Dr. Anand Rao', villageOrArea: 'Chennai', specialty: 'General Physician' },
  { username: 'dr_desai', fullName: 'Dr. Priya Desai', villageOrArea: 'Mumbai', specialty: 'Cardiologist' },
  { username: 'dr_singh', fullName: 'Dr. Vikram Singh', villageOrArea: 'Bangalore', specialty: 'General Physician' },
  { username: 'dr_patil', fullName: 'Dr. Anjali Patil', villageOrArea: 'Pune', specialty: 'Neurologist' },
]

export default function FindDoctors() {
  const { user } = useAuth()
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('')
  const [specialty, setSpecialty] = useState('All')
  
  // Filtering state
  const [doctors, setDoctors] = useState(DUMMY_DOCTORS)
  
  // Action state
  const [sending, setSending] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSearch = () => {
    let filtered = DUMMY_DOCTORS
    
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(doc => 
        doc.villageOrArea.toLowerCase().includes(term) || 
        doc.fullName.toLowerCase().includes(term)
      )
    }
    
    if (specialty !== 'All') {
      filtered = filtered.filter(doc => doc.specialty === specialty)
    }
    
    setDoctors(filtered)
  }

  const handleSendAnalysis = async (doctor) => {
    setSending(doctor.username)
    setSuccess(null)
    
    // Simulate network delay
    setTimeout(() => {
      // TODO: POST request to Spring Boot backend to forward patient history and LLM analysis
      console.log(`Forwarding analysis to ${doctor.fullName} (${doctor.username}) for patient ${user?.username}`);
      setSending(null)
      setSuccess(doctor.username)
    }, 1500)
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Find a Doctor</h1>
          <p className="text-slate-500 mt-2 text-lg">Browse registered doctors and forward your AI analysis for professional review.</p>
        </div>

        {/* Search Interface */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Location or Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by City, Zip Code, or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="md:w-1/3">
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Specialty</label>
            <select 
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="All">All Specialties</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Neurologist">Neurologist</option>
              <option value="General Physician">General Physician</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleSearch} size="lg" className="w-full md:w-auto px-8 rounded-xl h-[46px]">
              Search
            </Button>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map(doc => (
            <Card key={doc.username} className="hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="py-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-sm border border-teal-100">
                    {doc.fullName?.[4] || 'D'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1 mb-2">
                      <p className="font-bold text-slate-900 text-base truncate">{doc.fullName}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">{doc.specialty}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{doc.villageOrArea || 'Location not set'}</span>
                    </div>
                    
                    {success === doc.username ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                        <CheckCircle className="w-4 h-4" /> Analysis sent!
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white"
                        onClick={() => handleSendAnalysis(doc)}
                        disabled={sending === doc.username}
                      >
                        {sending === doc.username
                          ? 'Sending securely…'
                          : (<><Send className="w-3.5 h-3.5 mr-2" /> Send My Analysis</>)
                        }
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {doctors.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
            <User className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="font-semibold text-slate-600 text-lg">No doctors found</p>
            <p className="text-slate-400 mt-1">Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
