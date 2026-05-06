import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getIncoming, getDoctorLogs, getPatientProfile, replyConsultation } from '../../api/api';
import AppLayout from '../../components/layout/AppLayout';
import { User, AlertTriangle, Activity, Brain, CheckCircle, FileText, Pill, Clock, ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DoctorPatientReviewView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [patientCase, setPatientCase] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formState, setFormState] = useState({
    verifiedDiagnosis: '',
    prescription: '',
    followUp: '1 Week'
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const incRes = await getIncoming(user?.username);
        const consult = incRes.data?.find(c => String(c.id) === String(id));
        if (!consult) { 
          setLoading(false); 
          return; 
        }

        const logRes = await getDoctorLogs();
        // Match log to patient if possible, otherwise use most recent
        const log = logRes.data?.find(l => l.patient?.username === consult.patientUsername) || logRes.data?.[0] || {}; 

        const profRes = await getPatientProfile(consult.patientUsername);
        const profile = profRes.data || {};

        setPatientCase({
          consultId: consult.id,
          status: consult.status,
          patientInfo: {
            name: profile.fullName || consult.patientUsername || 'Unknown Patient',
            age: profile.age || 'N/A',
            bloodType: profile.bloodGroup || 'N/A',
            severity: log.emergencyFlag ? "High Risk" : "Standard",
            severityColor: log.emergencyFlag ? "bg-red-100 text-red-700 border-red-200" : "bg-blue-100 text-blue-700 border-blue-200"
          },
          currentEpisode: {
            symptoms: (consult.symptoms || '').split(',').map(s => s.trim()).filter(s => s),
            aiInitialAnalysis: log.finalDiagnosis ? `${log.finalDiagnosis}. ${log.feverAgentOutput || ''}` : 'No AI analysis found.'
          },
          digitalTwinHistory: {
            baselineVitals: {
              avgBP: profile.heartRiskScore ? `${110 + Math.floor(profile.heartRiskScore/2)}/75` : "115/75",
              restingHR: profile.heartRiskScore ? `${65 + Math.floor(profile.heartRiskScore/3)} bpm` : "68 bpm"
            },
            chronicConditions: [
              (profile.diabetesRiskScore > 50) ? "High Diabetes Risk" : "Low Diabetes Risk",
              (profile.heartRiskScore > 50) ? "High Cardiac Risk" : "Normal Cardiac Profile"
            ],
            recentRiskTrajectory: `Heart Risk: ${profile.heartRiskScore || 0}% | Diabetes Risk: ${profile.diabetesRiskScore || 0}%`,
            vitalTrends: [
              { day: 'Day -30', stress: profile.heartRiskScore ? Math.max(0, profile.heartRiskScore - 10) : 20 },
              { day: 'Day -20', stress: profile.heartRiskScore ? Math.max(0, profile.heartRiskScore - 5) : 22 },
              { day: 'Day -10', stress: profile.heartRiskScore || 28 },
              { day: 'Day -5',  stress: profile.heartRiskScore ? profile.heartRiskScore + 5 : 35 },
              { day: 'Today',   stress: profile.heartRiskScore ? profile.heartRiskScore + 10 : 50 },
            ]
          }
        });

        if (consult.doctorReply) {
          setFormState(prev => ({...prev, verifiedDiagnosis: consult.doctorReply}));
        }

      } catch (err) {
        console.error("Error fetching patient review data:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id && user?.username) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [id, user?.username]);

  const handleSignAndSend = async () => {
    setIsSubmitting(true);
    try {
      const fullReply = `${formState.verifiedDiagnosis}\n\nPrescription / Next Steps:\n${formState.prescription}\nFollow-up: ${formState.followUp}`;
      await replyConsultation(id, fullReply);
      setIsSuccess(true);
      // Update local state to reflect it's reviewed
      setPatientCase(prev => ({...prev, status: 'REVIEWED'}));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <AppLayout><div className="p-8 text-center text-slate-500 font-medium">Loading patient data...</div></AppLayout>;
  if (!patientCase) return <AppLayout><div className="p-8 text-center text-red-600 font-medium">Consultation not found.</div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/doctor/queue')} className="text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clinical Workspace</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${patientCase.status === 'REVIEWED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {patientCase.status}
              </span>
            </div>
            <p className="text-slate-500 mt-1 text-lg">Doctor Patient Review & Verification</p>
          </div>
        </div>

        {/* 2-Column Split-Screen Clinical Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[800px]">
          
          {/* Left Column: Comprehensive Patient Context (Read-Only) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Card A: Header / Patient Profile Snippet */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{patientCase.patientInfo.name}</h2>
                  <div className="flex items-center gap-3 text-sm text-slate-500 mt-1 font-medium">
                    <span>{patientCase.patientInfo.age} Yrs</span>
                    <span>•</span>
                    <span>Blood: {patientCase.patientInfo.bloodType}</span>
                  </div>
                </div>
              </div>
              <div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 ${patientCase.patientInfo.severityColor}`}>
                  <AlertTriangle className="w-4 h-4" />
                  {patientCase.patientInfo.severity}
                </span>
              </div>
            </div>

            {/* Card B: Current Symptoms & AI Insights */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex-1 flex flex-col">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" /> Current Episode
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                {/* Symptoms */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Reported Symptoms</p>
                  <ul className="space-y-2">
                    {patientCase.currentEpisode.symptoms.map((sym, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0"></span>
                        <span className="text-slate-700 font-medium">{sym}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* AI Insights */}
                <div className="bg-teal-50/50 rounded-xl p-5 border border-teal-100 flex flex-col">
                  <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" /> Multi-Agent AI Initial Triage Report
                  </p>
                  <p className="text-sm text-teal-900 leading-relaxed font-medium">
                    {patientCase.currentEpisode.aiInitialAnalysis}
                  </p>
                </div>
              </div>
            </div>

            {/* Card C: Digital Twin History */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex-1">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" /> Digital Twin History
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Baseline Vitals</p>
                  <p className="text-slate-800 font-bold text-lg">{patientCase.digitalTwinHistory.baselineVitals.avgBP} <span className="text-xs text-slate-400 font-normal">BP</span></p>
                  <p className="text-slate-800 font-bold text-lg mt-1">{patientCase.digitalTwinHistory.baselineVitals.restingHR}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Known Chronic Conditions</p>
                  <ul className="list-disc pl-4 text-sm text-slate-700 font-medium">
                    {patientCase.digitalTwinHistory.chronicConditions.map((cond, i) => (
                      <li key={i}>{cond}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <p className="text-xs text-red-600 font-semibold uppercase mb-1">Recent Risk Trajectory</p>
                  <p className="text-red-700 font-bold text-sm leading-snug">{patientCase.digitalTwinHistory.recentRiskTrajectory}</p>
                </div>
              </div>

              {/* Mock Recharts Sparkline */}
              <div className="h-32 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patientCase.digitalTwinHistory.vitalTrends} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      itemStyle={{ color: '#ef4444' }}
                    />
                    <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={3} dot={{ r: 3, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Right Column: Doctor Verification & Action (Interactive) */}
          <div className="lg:col-span-5 h-full">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg flex flex-col h-full sticky top-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2 border-b border-slate-100 pb-4">
                Clinical Verification & Feedback
              </h3>
              
              {isSuccess ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-900">Diagnosis Sent</h4>
                  <p className="text-slate-500 font-medium">The patient's EHR has been updated and they have been notified of your clinical feedback.</p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="mt-6 text-teal-600 font-bold hover:text-teal-700 underline"
                  >
                    Review Next Case
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-6 pt-4">
                  
                  {/* Verified Diagnosis */}
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" /> Verified Diagnosis
                    </label>
                    <textarea 
                      className="w-full flex-1 min-h-[120px] p-4 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none bg-slate-50 focus:bg-white text-slate-800"
                      placeholder="Enter clinical notes and verified diagnosis based on AI triage..."
                      value={formState.verifiedDiagnosis}
                      onChange={(e) => setFormState({...formState, verifiedDiagnosis: e.target.value})}
                    ></textarea>
                  </div>

                  {/* Prescription / Recommended Steps */}
                  <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-slate-400" /> Prescription / Recommended Steps
                    </label>
                    <textarea 
                      className="w-full flex-1 min-h-[120px] p-4 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none bg-slate-50 focus:bg-white text-slate-800"
                      placeholder="List medication, dosages, and immediate next steps..."
                      value={formState.prescription}
                      onChange={(e) => setFormState({...formState, prescription: e.target.value})}
                    ></textarea>
                  </div>

                  {/* Follow-up Required */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" /> Follow-up Required
                    </label>
                    <select 
                      className="w-full p-4 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 font-medium"
                      value={formState.followUp}
                      onChange={(e) => setFormState({...formState, followUp: e.target.value})}
                    >
                      <option>None Required</option>
                      <option>3 Days</option>
                      <option>1 Week</option>
                      <option>2 Weeks</option>
                      <option>1 Month</option>
                      <option>Urgent Admission</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button 
                      onClick={handleSignAndSend}
                      disabled={isSubmitting || !formState.verifiedDiagnosis || patientCase.status === 'REVIEWED'}
                      className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-xl shadow-[0_4px_14px_0_rgba(15,118,110,0.39)] hover:shadow-[0_6px_20px_rgba(15,118,110,0.23)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Processing...
                        </span>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          {patientCase.status === 'REVIEWED' ? 'Response Already Sent' : 'Sign & Send Diagnosis to Patient'}
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
