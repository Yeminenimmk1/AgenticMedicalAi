import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

export default function HeroSlider({ userName = 'John' }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      bgImage: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop",
      badgeText: "AI-Powered Clinical Intelligence",
      heading: "The Future of Healthcare",
      highlightText: "Starts Here.",
      subtext: "AgenticMed AI combines multi-agent LLMs, XGBoost Digital Twins, and Prophet outbreak detection to deliver intelligent, real-time medical triage."
    },
    {
      id: 2,
      bgImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop",
      badgeText: "Real-Time Diagnostics",
      heading: "Precision Medicine",
      highlightText: "At Scale.",
      subtext: "Empowering doctors with instant diagnostic insights and patient history analysis using advanced machine learning models."
    },
    {
      id: 3,
      bgImage: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=2000&auto=format&fit=crop",
      badgeText: "Predictive Analytics",
      heading: "Stay Ahead of",
      highlightText: "Outbreaks.",
      subtext: "Our Prophet-based outbreak detection system analyzes regional symptom data to forecast and mitigate health crises before they spread."
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  return (
    <div className="relative w-full h-[700px] overflow-hidden">
      
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={"absolute inset-0 transition-opacity duration-1000 " + (index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0")}
        >
          {/* Background Image */}
          <img 
            src={slide.bgImage} 
            alt={slide.heading} 
            className="absolute inset-0 object-cover w-full h-full"
          />
          
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent z-10"></div>
          
          {/* Content Container */}
          <div className="relative z-20 w-full h-full max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-10">
            
            {/* Left Side: Text & CTAs */}
            <div className="max-w-2xl text-left pt-16 md:pt-0">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm mb-6 border border-white/30 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-xs font-bold text-teal-300 uppercase tracking-widest">{slide.badgeText}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-[64px] font-black text-white leading-[1.1] mb-6 tracking-tight">
                {slide.heading} <br/>
                <span className="text-teal-400">{slide.highlightText}</span>
              </h1>

              {/* Subtext */}
              <p className="text-lg text-slate-200 mb-8 leading-relaxed font-medium">
                {slide.subtext}
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center">
                  Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button className="px-8 py-3.5 bg-transparent hover:bg-white/10 border border-white text-white font-bold rounded-xl transition-colors flex items-center justify-center shadow-sm">
                  Clinical Portal
                </button>
              </div>
            </div>

            {/* Right Side: The Glassmorphism Card */}
            <div className="hidden lg:block w-[400px] flex-shrink-0">
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl text-white rounded-[24px] p-8">
                <div className="flex items-center gap-4 mb-6">
                  {/* Real Avatar Image */}
                  <div className="w-14 h-14 rounded-full border-2 border-white/50 overflow-hidden shadow-inner">
                     <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" alt="User Profile" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-bold tracking-wide">{userName}</h3>
                </div>
                
                <div>
                  <h2 className="text-[28px] font-bold mb-3">Welcome, {userName}.</h2>
                  <p className="text-slate-200 leading-relaxed font-medium text-[15px]">
                    Explore your AI-driven health insights, personalized Digital Twin, and regional Outbreak data.
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button 
        className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-30"
        onClick={prevSlide}
      >
        <ChevronLeft className="w-10 h-10 stroke-[1.5]" />
      </button>
      <button 
        className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-30"
        onClick={nextSlide}
      >
        <ChevronRight className="w-10 h-10 stroke-[1.5]" />
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`transition-all duration-300 rounded-full h-2 ${
              index === currentSlide 
                ? 'w-8 bg-teal-500' 
                : 'w-2 bg-slate-500 hover:bg-slate-400'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  )
}
