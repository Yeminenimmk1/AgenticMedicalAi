import { Users, MapPin, Star, ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { useNavigate } from 'react-router-dom'

export default function SimplifiedDoctorSearchCard() {
  const navigate = useNavigate()
  
  const topDoctors = [
    { id: 1, name: 'Dr. A. Sharma', specialty: 'Cardiologist', rating: '4.9' },
    { id: 2, name: 'Dr. R. Singh', specialty: 'Pediatrician', rating: '4.8' },
  ]

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(15,118,110,0.06)] border border-slate-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Featured Specialists</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Top Rated Nearby</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {topDoctors.map(doc => (
          <div key={doc.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-4 hover:border-slate-200 transition-colors">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm flex-shrink-0">
              {doc.name[4]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{doc.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                  {doc.specialty}
                </span>
                <div className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs text-slate-500 font-medium">{doc.rating}</span>
                </div>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-200 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 text-center">
        <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-900" onClick={() => navigate('/patient/doctors')}>
          View all doctors in your area
        </Button>
      </div>
    </div>
  )
}
