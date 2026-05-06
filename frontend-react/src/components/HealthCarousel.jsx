import { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Activity, Heart, Shield } from 'lucide-react'

export default function HealthCarousel({ userName = 'John' }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Using only one main interactive visualization slide for the demo, 
  // but keeping the array structure to support the carousel format.
  const slides = [
    { id: 1, type: 'visualization' },
    { id: 2, type: 'standard', title: 'Agentic AI Medical Board', desc: 'Our multi-agent system cross-references your symptoms across pediatric, cardiology, and general AI specialists.' },
  ]

  const scrollPrev = useCallback(() => { if (emblaApi) emblaApi.scrollPrev() }, [emblaApi])
  const scrollNext = useCallback(() => { if (emblaApi) emblaApi.scrollNext() }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    
    // Auto play
    const autoplay = setInterval(() => {
      emblaApi.scrollNext()
    }, 8000)
    
    return () => clearInterval(autoplay)
  }, [emblaApi, onSelect])

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-slate-900 group h-[380px] xl:h-[420px] border border-slate-700/50">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide) => (
            <div className="relative flex-[0_0_100%] min-w-0 h-full" key={slide.id}>
              
              {slide.type === 'visualization' ? (
                // --- High-Fidelity Visualization Hub Slide ---
                <div className="relative w-full h-full bg-[#0a1128] overflow-hidden flex items-center justify-center">
                  
                  {/* Subtle Grid Background */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                  
                  {/* Glowing 3D Digital Twin Simulation (CSS Mockup) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Outer Glow */}
                    <div className="absolute w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]" />
                    <div className="absolute w-[300px] h-[300px] bg-teal-400/20 rounded-full blur-[60px] animate-pulse" />
                    
                    {/* Core "3D" Entity */}
                    <div className="relative w-[280px] h-[280px] rounded-full border border-teal-500/30 flex items-center justify-center">
                       {/* Rotating Data Rings */}
                       <div className="absolute inset-[-20px] border border-blue-400/20 rounded-full animate-[spin_10s_linear_infinite] border-t-blue-400/60" />
                       <div className="absolute inset-[-40px] border border-teal-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse] border-b-teal-400/50" />
                       
                       {/* Central Core */}
                       <div className="w-[180px] h-[180px] rounded-full bg-gradient-to-tr from-blue-900/40 to-teal-800/40 backdrop-blur-md border border-white/10 shadow-[0_0_40px_rgba(45,212,191,0.2)] flex items-center justify-center">
                          <Activity className="w-16 h-16 text-teal-300 animate-pulse drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
                       </div>
                    </div>
                  </div>

                  {/* Glassmorphism Biometric Overlays */}
                  <div className="absolute top-10 left-10 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl hidden md:flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-blue-200/70 font-semibold mb-0.5">Cardiovascular</p>
                      <p className="text-xl font-bold text-white tracking-tight">Optimal <span className="text-sm font-medium text-blue-300">Sync</span></p>
                    </div>
                  </div>

                  <div className="absolute bottom-12 right-12 p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl hidden md:flex items-center gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-teal-200/70 font-semibold mb-0.5 text-right">Neural Status</p>
                      <p className="text-xl font-bold text-white tracking-tight text-right">Stable <span className="text-sm font-medium text-teal-300">Alpha</span></p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-teal-300" />
                    </div>
                  </div>

                  {/* Elegant Typography Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 bg-gradient-to-t from-[#0a1128] via-[#0a1128]/80 to-transparent pointer-events-none">
                    <div className="max-w-2xl">
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white leading-tight mb-3 tracking-tight font-sans">
                        Your Health, <span className="font-bold">Visualized.</span>
                      </h2>
                      <p className="text-blue-100/80 text-base md:text-lg font-medium tracking-wide">
                        Welcome, {userName}. Tap to interact with your live Digital Twin simulation.
                      </p>
                    </div>
                  </div>

                </div>
              ) : (
                // --- Standard Slide Fallback ---
                <div className="relative w-full h-full bg-slate-800 overflow-hidden flex flex-col justify-center px-12">
                   <div className="absolute inset-0 bg-gradient-to-br from-teal-900 to-slate-900" />
                   <div className="relative z-10 max-w-xl">
                     <h2 className="text-3xl md:text-4xl font-black text-white mb-4">{slide.title}</h2>
                     <p className="text-slate-300 text-lg">{slide.desc}</p>
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Minimalist White Arrow Navigation */}
      <button 
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 hover:bg-white/15 backdrop-blur-xl flex items-center justify-center text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10 z-20"
        onClick={scrollPrev}
      >
        <ChevronLeft className="w-6 h-6 stroke-[1.5]" />
      </button>
      <button 
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 hover:bg-white/15 backdrop-blur-xl flex items-center justify-center text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10 z-20"
        onClick={scrollNext}
      >
        <ChevronRight className="w-6 h-6 stroke-[1.5]" />
      </button>

      {/* Glowing Teal Spherical Dot Navigation */}
      <div className="absolute bottom-6 right-8 flex items-center gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`transition-all duration-500 rounded-full border ${
              index === selectedIndex 
                ? 'w-3 h-3 bg-teal-400 border-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.8)] scale-110' 
                : 'w-2 h-2 bg-white/20 border-transparent hover:bg-white/40'
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  )
}
