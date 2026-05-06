import { Globe, AlertTriangle } from 'lucide-react'

export default function OutbreakMonitorCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(15,118,110,0.06)] border border-slate-100 flex flex-col h-full relative overflow-hidden">
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Regional Outbreak Monitor</h2>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Local Health Radar</p>
        </div>
      </div>

      {/* Map Visualization (CSS Mockup) */}
      <div className="flex-1 min-h-[140px] bg-slate-100 rounded-xl relative overflow-hidden mb-4 border border-slate-200">
        {/* Subtle Map Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
          backgroundSize: '16px 16px'
        }} />
        
        {/* Hotspots */}
        <div className="absolute top-1/4 left-1/3">
          <span className="relative flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-50"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-amber-500/80 border-2 border-white"></span>
          </span>
        </div>
        <div className="absolute bottom-1/3 right-1/4">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-50"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500/80 border border-white"></span>
          </span>
        </div>
      </div>

      {/* Active Outbreaks List */}
      <div className="space-y-3 relative z-10">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Alerts in Your Area</p>
        
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-slate-700">Influenza B</span>
          </div>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold uppercase rounded">Low</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-slate-700">COVID-19</span>
          </div>
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold uppercase rounded">Medium</span>
        </div>
      </div>
    </div>
  )
}
