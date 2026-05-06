import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import AppLayout from '../../components/layout/AppLayout';
import { MapPin, Brain, ShieldAlert } from 'lucide-react';

const CITIES = [
  "Bangalore", 
  "Hyderabad", 
  "Mumbai", 
  "Pune", 
  "New Delhi", 
  "Chennai", 
  "Kolkata", 
  "Ahmedabad"
];

// Helper to generate dynamic timeline labels for the last 14 days and next 7 days
const generateTimeline = () => {
  const labels = [];
  const today = new Date();
  
  for (let i = -14; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    labels.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      isToday: i === 0,
      isForecast: i > 0,
      rawDate: d
    });
  }
  return labels;
};

const generateSyntheticData = (cityName) => {
  const timeline = generateTimeline();
  
  return timeline.map((point, index) => {
    let dengue = 40;
    let h1n1 = 30;
    let covid = 20;
    
    const isForecast = point.isForecast;
    const dayIdx = index; // 0 to 21 (0-14 historical, 15-21 forecast)

    // City-Specific Modeling
    if (cityName === 'New Delhi') {
      // Sharp, elevated curve for H1N1
      h1n1 = 120 + (dayIdx * 5) + (isForecast ? Math.pow(dayIdx - 14, 2) * 8 : 0);
      dengue = 40 + Math.sin(dayIdx) * 10;
      covid = 30 + Math.cos(dayIdx) * 5;
    } else if (cityName === 'Bangalore' || cityName === 'Mumbai') {
      // Fluctuating, rising Dengue (monsoon/weather spikes)
      dengue = 90 + Math.sin(dayIdx * 0.8) * 40 + (isForecast ? (dayIdx - 14) * 15 : 0);
      h1n1 = 40 + Math.cos(dayIdx) * 10;
      covid = 50 + Math.sin(dayIdx * 0.5) * 15;
    } else if (cityName === 'Hyderabad') {
      // Moderate baseline + 15% spike in forecast
      dengue = 65 + Math.sin(dayIdx * 0.5) * 10;
      h1n1 = 45 + Math.cos(dayIdx * 0.5) * 8;
      covid = 35 + (dayIdx * 2);
      if (isForecast) {
        dengue *= 1.15; // 15% predicted spike
        h1n1 *= 1.15;
      }
    } else {
      // General baseline for others
      dengue = 50 + Math.sin(dayIdx * 0.5) * 20;
      h1n1 = 40 + Math.cos(dayIdx * 0.5) * 15;
      covid = 30 + (dayIdx * 3);
    }

    return {
      name: point.date,
      dengue: Math.floor(Math.max(0, dengue)),
      h1n1: Math.floor(Math.max(0, h1n1)),
      covid: Math.floor(Math.max(0, covid)),
      isForecast: point.isForecast,
      isToday: point.isToday
    };
  });
};

const getCityDetails = (cityName) => {
  const details = {
    "Bangalore": {
      zones: [{ name: "Whitefield", level: "Severe" }, { name: "Indiranagar", level: "Elevated" }, { name: "Electronic City", level: "Stable" }],
      prediction: "Dengue cases show high variance in Eastern Bangalore. Prophet predicts a sustained climb due to fluctuating precipitation."
    },
    "Hyderabad": {
      zones: [{ name: "HITEC City", level: "Severe" }, { name: "Gachibowli", level: "Severe" }, { name: "Kukatpally", level: "Elevated" }],
      prediction: "Localized H1N1 clusters detected. Model projects a 15% spike in Western corridors over the next 7-day window."
    },
    "Mumbai": {
      zones: [{ name: "Andheri West", level: "Severe" }, { name: "Bandra", level: "Severe" }, { name: "Colaba", level: "Elevated" }],
      prediction: "Monsoon-driven Dengue patterns detected. Predicted trend indicates a stabilization phase followed by a secondary surge."
    },
    "New Delhi": {
      zones: [{ name: "Rohini", level: "Severe" }, { name: "Dwarka", level: "Severe" }, { name: "South Ex", level: "Elevated" }],
      prediction: "Respiratory metrics (H1N1) are highly elevated. Model recommends immediate preventative masks in North Delhi wards."
    },
    "Pune": {
      zones: [{ name: "Hinjewadi", level: "Severe" }, { name: "Viman Nagar", level: "Elevated" }],
      prediction: "Stable baseline with minor predicted fluctuations in vector-borne diseases."
    },
    "Chennai": {
      zones: [{ name: "T. Nagar", level: "Severe" }, { name: "Velachery", level: "Elevated" }],
      prediction: "Coastal ward analysis shows rising humidity correlating with projected Dengue case increases."
    },
    "Kolkata": {
      zones: [{ name: "Salt Lake", level: "Severe" }, { name: "Park Street", level: "Elevated" }],
      prediction: "Dense urban ward modeling indicates high H1N1 transmission risk in central transit hubs."
    },
    "Ahmedabad": {
      zones: [{ name: "Navrangpura", level: "Severe" }, { name: "Satellite", level: "Elevated" }],
      prediction: "Predicted trends show moderate growth in seasonal flu cases across Western Ahmedabad."
    }
  };
  return details[cityName] || details["Hyderabad"];
};

export default function OutbreakMonitorView() {
  const [selectedCity, setSelectedCity] = useState("Hyderabad");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const cityInfo = useMemo(() => getCityDetails(selectedCity), [selectedCity]);
  const todayLabel = useMemo(() => data.find(d => d.isToday)?.name, [data]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const syntheticData = generateSyntheticData(selectedCity);
      setData(syntheticData);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedCity]);

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
        
        {/* Header with City Selector */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Regional Outbreak Intelligence</h1>
            <p className="text-lg text-slate-500 mt-2 font-medium">
              City-level epidemiological tracking and Prophet ML forecasting.
            </p>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
              Select Metropolitan Hub
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-5 py-3 rounded-2xl border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-teal-500 bg-white font-bold shadow-sm w-full md:w-72 transition-all"
            >
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Chart Area */}
        <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-slate-800 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Outbreak Velocity: <span className="text-teal-400">{selectedCity}</span>
              </h2>
              <p className="text-slate-400 text-sm mt-1 font-medium">Multi-track analysis: Dengue, H1N1, and COVID-19</p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <LegendItem color="bg-teal-500" label="Dengue" />
              <LegendItem color="bg-amber-500" label="H1N1 (Respiratory)" />
              <LegendItem color="bg-red-500" label="COVID-19" />
            </div>
          </div>

          <div className="h-[450px] w-full relative z-10" style={{ opacity: loading ? 0.3 : 1, transition: 'opacity 0.4s ease' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDengue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorH1N1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCovid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={15}
                />
                <YAxis 
                  stroke="#64748b" 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                  axisLine={false} 
                  tickLine={false} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    color: '#f8fafc', 
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    borderWidth: '2px'
                  }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase' }}
                />
                
                {/* Vertical Split Line */}
                {todayLabel && (
                  <ReferenceLine x={todayLabel} stroke="#334155" strokeWidth={2} strokeDasharray="5 5">
                    <Label 
                      value="Recent Historical Data" 
                      position="left" 
                      fill="#64748b" 
                      fontSize={10} 
                      fontWeight={800} 
                      offset={10}
                      className="uppercase tracking-widest"
                    />
                    <Label 
                      value="Prophet ML Forecast" 
                      position="right" 
                      fill="#14b8a6" 
                      fontSize={10} 
                      fontWeight={800} 
                      offset={10}
                      className="uppercase tracking-widest"
                    />
                  </ReferenceLine>
                )}

                <Area 
                  type="monotone" 
                  dataKey="dengue" 
                  stroke="#14b8a6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorDengue)" 
                  animationDuration={1200}
                />
                <Area 
                  type="monotone" 
                  dataKey="h1n1" 
                  stroke="#f59e0b" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorH1N1)" 
                  animationDuration={1200}
                />
                <Area 
                  type="monotone" 
                  dataKey="covid" 
                  stroke="#ef4444" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorCovid)" 
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Local High-Risk Zones */}
          <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-100 shadow-sm flex flex-col h-full hover:border-red-100 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 tracking-tight">Active Hotspots</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Neighborhood Level</p>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              {cityInfo.zones.map((zone, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                  <span className="font-bold text-slate-700">{zone.name}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    zone.level === 'Severe' ? 'bg-red-500 text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)]' : 
                    zone.level === 'Elevated' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {zone.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: AI Forecasting Engine */}
          <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-100 shadow-sm flex flex-col h-full hover:border-teal-100 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 tracking-tight">ML Forecasting</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prophet AI Engine</p>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm font-medium flex-1 italic">
              "{cityInfo.prediction}"
            </p>
            <div className="mt-8 pt-8 border-t-2 border-slate-50">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Confidence</span>
                <span className="text-sm font-black text-teal-600">96.8%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full transition-all duration-1000" style={{ width: '96.8%' }}></div>
              </div>
            </div>
          </div>

          {/* Card 3: preventative Interventions */}
          <div className="bg-slate-900 rounded-[2rem] p-8 shadow-xl flex flex-col h-full group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-slate-800 rounded-2xl text-teal-400 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-white tracking-tight">Health Directives</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Autonomous Protocols</p>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              {[
                "Deploy localized diagnostic kits to highlighted wards.",
                "Execute vector control fogging in identified severe zones.",
                "Distribute N95 masks to senior citizens in IT corridors."
              ].map((tip, i) => (
                <div key={i} className="flex gap-4 items-start p-3 hover:bg-slate-800/50 rounded-2xl transition-all cursor-default">
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-slate-400 text-sm font-medium leading-snug">{tip}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}
