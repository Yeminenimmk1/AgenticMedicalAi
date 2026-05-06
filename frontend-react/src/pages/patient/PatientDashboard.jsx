import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import AppLayout from '../../components/layout/AppLayout'
import EmergencyModal from '../../components/EmergencyModal'

// Grid Modules
import DigitalTwinCard from '../../components/patient/DigitalTwinCard'
import OutbreakMonitorCard from '../../components/patient/OutbreakMonitorCard'
import AiDiagnosisCard from '../../components/patient/AiDiagnosisCard'
import SimplifiedDoctorSearchCard from '../../components/patient/SimplifiedDoctorSearchCard'

export default function PatientDashboard() {
  const { user } = useAuth()
  
  const [showEmergency, setShowEmergency] = useState(false)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <AppLayout>
      <EmergencyModal
        open={showEmergency}
        onClose={() => setShowEmergency(false)}
      />

      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header - We can keep this or remove it since the new slider acts as a hero. 
            The prompt says "place it directly at the top of the Patient Dashboard", 
            so keeping the simple greeting above the slider is fine, or we can move the slider above.
            I will keep the greeting as it maintains consistency, but the Hero Slider is immediately below. */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 tracking-wide uppercase">{greeting}</p>
            <h1 className="text-4xl font-black text-slate-900 mt-1">{user?.fullName || user?.username} 👋</h1>
            <p className="text-slate-500 mt-2 text-lg">Your intelligent healthcare command center.</p>
          </div>
          <button 
            onClick={() => setShowEmergency(true)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors tooltip-trigger"
            title="Test Emergency Modal"
          >
            <AlertTriangle className="w-6 h-6" />
          </button>
        </div>



        {/* Integrated Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* Top Row: Twin and Outbreak (Takes 1 col each on large screens) */}
          <div className="xl:col-span-1">
            <DigitalTwinCard />
          </div>
          
          <div className="xl:col-span-1">
            <OutbreakMonitorCard />
          </div>
          
          {/* Top Row: AI Diagnosis (Takes 2 cols on large screens) */}
          <div className="xl:col-span-2">
            <AiDiagnosisCard 
              result={null} // Pass actual result from state if available
              onForward={(docId) => alert(`Mock forward to ${docId}`)} 
            />
          </div>

          {/* Bottom Row */}
          <div className="xl:col-span-2 xl:col-start-3">
             <SimplifiedDoctorSearchCard />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
