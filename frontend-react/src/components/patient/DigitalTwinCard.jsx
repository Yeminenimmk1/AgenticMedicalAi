import { UserCircle, Heart, Activity, Brain } from 'lucide-react'

export default function DigitalTwinCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(15,118,110,0.06)] border border-slate-100 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
          <UserCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Digital Twin Snapshot</h2>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Live Biometrics</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-5">
        {/* Heart Rate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg text-red-500">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Heart Rate</p>
              <p className="text-xs text-slate-400">Resting avg.</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">72 <span className="text-sm font-medium text-slate-500">bpm</span></p>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Blood Pressure</p>
              <p className="text-xs text-slate-400">Sys/Dia</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">120/80 <span className="text-sm font-medium text-slate-500">mmHg</span></p>
          </div>
        </div>

        {/* Stress Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Stress Level</p>
              <p className="text-xs text-slate-400">Based on HRV</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-md">
              Low
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-teal-500 h-full w-4/5" />
          </div>
          <span className="text-xs font-bold text-teal-700">80% Vitality</span>
        </div>
      </div>
    </div>
  )
}
