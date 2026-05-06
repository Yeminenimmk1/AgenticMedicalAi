import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { 
  Activity, 
  ShieldCheck, 
  Database, 
  TrendingUp, 
  Brain, 
  CheckCircle, 
  AlertCircle,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Line
} from 'recharts';

export default function DigitalTwinView() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showXaiPanel, setShowXaiPanel] = useState(false);

  useEffect(() => {
    // TODO: Fetch from Spring Boot /api/ml/twin-analysis
    setTimeout(() => {
      setAnalyticsData({
        modelMetadata: {
          status: 'Active',
          lastTrained: 'Today, 08:00 AM',
          confidence: '94.2%',
          featuresCount: 42,
          riskLevel: 'Elevated'
        },
        featureImportance: [
          { name: 'Systolic BP', value: 0.88 },
          { name: 'Age', value: 0.75 },
          { name: 'BMI Index', value: 0.62 },
          { name: 'HRV', value: 0.58 },
          { name: 'Glucose Level', value: 0.45 },
          { name: 'Cholesterol', value: 0.38 },
          { name: 'Activity Level', value: 0.25 }
        ].sort((a, b) => b.value - a.value),
        trajectory: [
          { day: 'Day -15', actual: 122, predicted: null, lower: null, upper: null },
          { day: 'Day -10', actual: 120, predicted: null, lower: null, upper: null },
          { day: 'Day -5', actual: 125, predicted: null, lower: null, upper: null },
          { day: 'Today', actual: 124, predicted: 124, lower: 124, upper: 124 },
          { day: 'Day 5', actual: null, predicted: 126, lower: 122, upper: 130 },
          { day: 'Day 10', actual: null, predicted: 128, lower: 123, upper: 133 },
          { day: 'Day 15', actual: null, predicted: 127, lower: 121, upper: 133 },
          { day: 'Day 20', actual: null, predicted: 125, lower: 118, upper: 132 },
          { day: 'Day 25', actual: null, predicted: 123, lower: 115, upper: 131 },
          { day: 'Day 30', actual: null, predicted: 122, lower: 112, upper: 132 }
        ],
        protocols: [
          { id: 1, agent: 'TriageAgent', action: 'Increase blood pressure monitoring to twice daily.', priority: 'High' },
          { id: 2, agent: 'CardioAgent', action: 'Schedule non-invasive stress test within 7 days.', priority: 'Medium' },
          { id: 3, agent: 'DietaryAgent', action: 'Reduce sodium intake to < 2300mg/day to stabilize trajectory.', priority: 'High' },
          { id: 4, agent: 'SystemSupervisor', action: 'Escalate to primary cardiologist if BP exceeds 140/90.', priority: 'Critical' }
        ]
      });
    }, 800);
  }, []);

  if (!analyticsData) {
    return (
      <AppLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center">
            <Activity className="h-10 w-10 text-teal-600 animate-pulse mb-4" />
            <h2 className="text-xl font-semibold text-slate-700">Loading ML Analytics...</h2>
            <p className="text-slate-500 text-sm mt-2">Syncing with XGBoost Digital Twin Model</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { modelMetadata, featureImportance, trajectory, protocols } = analyticsData;

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Digital Twin ML Analytics</h1>
            <p className="text-slate-500 mt-1 text-lg font-medium">Data-driven virtual replica & XGBoost predictive engine.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500"></div>
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Engine: XGBoost v2.4</span>
            </div>
          </div>
        </div>

        {/* Section A: Model Health & Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Model Status" 
            value={modelMetadata.status} 
            subtitle={`Last Trained: ${modelMetadata.lastTrained}`}
            icon={<ShieldCheck className="w-5 h-5 text-teal-600" />}
            tooltip="The current operational state of the predictive engine."
          />
          <MetricCard 
            title="Confidence Score" 
            value={modelMetadata.confidence} 
            subtitle="High Statistical Reliability"
            icon={<TrendingUp className="w-5 h-5 text-teal-600" />}
            tooltip="This percentage shows how certain the AI is about its current health prediction based on historical training data."
          />
          <MetricCard 
            title="Analyzed Features" 
            value={modelMetadata.featuresCount} 
            subtitle="Clinical Parameters Ingested"
            icon={<Database className="w-5 h-5 text-teal-600" />}
            tooltip="The number of unique data points from your health history used to build this virtual replica."
          />
          <MetricCard 
            title="Risk Stratification" 
            value={modelMetadata.riskLevel} 
            subtitle="Requires Clinical Attention"
            icon={<AlertCircle className="w-5 h-5 text-orange-500" />}
            badge
            tooltip="The overall danger level assigned to the patient's current trajectory by the triage agent."
          />
        </div>

        {/* Main Grid: Feature Importance & Trajectory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Section B: ML Feature Importance */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col h-[520px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Brain className="w-5 h-5 text-teal-600" /> XGBoost Feature Importance
              </h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Weighting</span>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={featureImportance}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 1]} hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#0F766E" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* XAI Panel for Feature Importance */}
            <div className="mt-4 pt-4 border-t border-slate-50">
              <button 
                onClick={() => setShowXaiPanel(!showXaiPanel)}
                className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-widest"
              >
                {showXaiPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                How to read this chart
              </button>
              {showXaiPanel && (
                <div className="mt-3 bg-slate-100 p-4 rounded-xl text-sm text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                  "This chart opens the 'black box' of the AI. The longer the bar, the more that specific health factor (like Systolic BP or Age) drove the AI's final prediction. This helps doctors see exactly WHY the AI made its decision."
                </div>
              )}
            </div>
          </div>

          {/* Section C: Predictive Trajectory */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col h-[520px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" /> 30-Day Predictive Trajectory
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 bg-slate-400"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Historical</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 border-t-2 border-dashed border-teal-600"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Predicted</span>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="100%">
                      <stop offset="5%" stopColor="#0F766E" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0F766E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    domain={['dataMin - 10', 'dataMax + 10']}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="none"
                    fill="url(#colorConf)"
                    fillOpacity={0.4}
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stroke="none"
                    fill="url(#colorConf)"
                    fillOpacity={0}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#64748b" 
                    strokeWidth={2} 
                    dot={{ r: 4, fill: '#64748b', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#0F766E" 
                    strokeWidth={3} 
                    strokeDasharray="5 5"
                    fill="none"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-6 text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1 uppercase tracking-widest text-[9px]">Model Interpretation:</span>
              "The dotted line represents your forecasted health trend. The shaded area is the 'Confidence Interval'—a statistical safety net showing the highest and lowest possible outcomes. A wider shaded area means the AI is less certain about the distant future."
            </p>
          </div>
        </div>

        {/* Section D: Agentic Clinical Protocols */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" /> Multi-Agent Clinical Protocols
              </h3>
              <button className="text-xs font-bold text-teal-600 uppercase tracking-widest hover:text-teal-700 transition-colors">
                Export Analysis PDF
              </button>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-4xl font-medium">
              "The recommendations below are not generated by a single program. They are the result of a 'Multi-Agent Deliberation'—where specialized AI models (like a Dietary Agent and a Cardiology Agent) analyze your Digital Twin data independently and collaborate to create a unified treatment plan."
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Agent Responsible</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Intervention Protocol</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {protocols.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 text-[10px] font-black uppercase">
                          {p.agent.substring(0, 2)}
                        </div>
                        <span className="text-sm font-bold text-slate-900">{p.agent}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-slate-600 font-medium max-w-xl leading-relaxed">{p.action}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                        p.priority === 'Critical' ? 'bg-red-100 text-red-600 border border-red-200' :
                        p.priority === 'High' ? 'bg-orange-100 text-orange-600 border border-orange-200' :
                        'bg-blue-100 text-blue-600 border border-blue-200'
                      }`}>
                        {p.priority}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function MetricCard({ title, value, subtitle, icon, badge, tooltip }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 group cursor-help relative">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</span>
          <HelpCircle 
            className="w-3.5 h-3.5 text-slate-300 hover:text-teal-500 transition-colors" 
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
          {showTooltip && (
            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-[10px] text-white rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
              {tooltip}
              <div className="absolute top-full left-2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
            </div>
          )}
        </div>
        {icon}
      </div>
      <div className="flex items-baseline gap-2">
        <p className={`text-2xl font-black tracking-tight ${badge ? 'text-orange-600' : 'text-slate-900'}`}>
          {value}
        </p>
        {badge && (
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-2 font-medium">{subtitle}</p>
    </div>
  );
}
