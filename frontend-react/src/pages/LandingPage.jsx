import { Link } from 'react-router-dom'
import { Stethoscope, Activity, Users, Shield, ArrowRight, BarChart3 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import HeroSlider from '../components/HeroSlider'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg">AgenticMed AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login/patient"><Button variant="outline" size="sm">Patient Login</Button></Link>
          <Link to="/login/doctor"><Button variant="secondary" size="sm">Doctor Login</Button></Link>
        </div>
      </nav>

      {/* Hero Slider */}
      <HeroSlider userName="Guest" />

      {/* Feature grid */}
      <section className="max-w-6xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Activity, title: 'AI Symptom Analysis', desc: 'Multi-agent LLM medical board deliberates on every triage to provide accurate, nuanced diagnosis.', color: 'text-teal-600 bg-teal-50' },
            { icon: Shield, title: 'Digital Twin', desc: 'XGBoost and Random Forest models continuously track your diabetes and cardiac risk scores.', color: 'text-blue-600 bg-blue-50' },
            { icon: Users, title: 'Doctor Network', desc: 'Forward your AI report directly to registered physicians for professional verification.', color: 'text-violet-600 bg-violet-50' },
            { icon: BarChart3, title: 'Outbreak Detection', desc: 'Meta Prophet forecasts regional disease spikes up to 7 days in advance using historical data.', color: 'text-amber-600 bg-amber-50' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-slate-900 py-16 text-center">
        <h2 className="text-3xl font-black text-white mb-4">Ready to experience intelligent healthcare?</h2>
        <p className="text-slate-400 mb-8">Join thousands of patients getting AI-powered medical insights.</p>
        <Link to="/register">
          <Button size="lg" className="px-10 bg-teal-500 hover:bg-teal-400">
            Create Free Account <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-8 py-6 text-center text-sm text-slate-400">
        © 2026 AgenticMed AI · Built with Spring Boot, FastAPI, React & XGBoost
      </footer>
    </div>
  )
}
