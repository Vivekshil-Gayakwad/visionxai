import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Eye, 
  ArrowRight, 
  BrainCircuit, 
  UserCheck, 
  Building2, 
  Stethoscope, 
  ChevronLeft, 
  ChevronRight,
  Quote,
  Activity,
  Sliders
} from 'lucide-react';

export function Hero({ setActiveSection, initialSlide = 0, onSlideChange }) {
  const { openAuthModal } = useAuth();
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(initialSlide);

  // Sync slide when navbar tab changes (initialSlide prop changes)
  useEffect(() => {
    setCurrentSlide(initialSlide);
  }, [initialSlide]);

  // 3 Horizontal Sections:
  // 1. Home Section: Brief project info & quote in simple boxes
  // 2. 3-Tier Workflow: Real background image, concise workflow boxes with smooth transition
  // 3. How XAI Works: Real background image, concise explainable AI boxes (Grad-CAM, SHAP)
  const slides = [
    {
      id: 'home',
      tabLabel: '1. Home & Overview',
      bgImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=2000&q=80',
      tag: 'VisionXAI • Tele-Ophthalmology Initiative',
      title: 'Explainable AI for Early Diabetic Retinopathy Detection',
      subtitle: 'Preserving sight across rural Maharashtra through community health empowerment and transparent artificial intelligence.',
      quote: 'Preserving vision, empowering community healthcare, and making artificial intelligence explainable, transparent, and clinically actionable for every citizen.',
      quoteAuthor: 'VisionXAI Clinical Mission',
      boxes: [
        {
          title: 'Rural Healthcare Need',
          desc: 'Over 77 million diabetic patients in India face silent vision loss due to a shortage of rural ophthalmologists.',
          icon: Activity
        },
        {
          title: 'Community Screening',
          desc: 'Enabling frontline ASHA workers and hospital nurses to conduct rapid AI-assisted eye triage in remote villages.',
          icon: UserCheck
        },
        {
          title: 'Explainable Decision Support',
          desc: 'Replacing black-box models with visual Grad-CAM saliency maps and SHAP feature attributions that doctors can verify.',
          icon: BrainCircuit
        }
      ],
      primaryBtn: {
        text: 'Explore 3-Tier Workflow',
        action: () => goToSlide(1)
      }
    },
    {
      id: 'workflow',
      tabLabel: '2. 3-Tier Workflow',
      bgImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=2000&q=80',
      tag: 'Continuity of Care • 3-Tier Architecture',
      title: 'The 3-Tier Healthcare Continuum',
      subtitle: 'Seamlessly connecting rural door-to-door community survey, hospital fundus imaging, and specialist vitreo-retinal review.',
      quote: null,
      boxes: [
        {
          tier: 'Tier 1',
          role: 'ASHA Health Worker',
          title: 'Community Risk Survey',
          desc: 'Door-to-door surveys recording HbA1c, blood pressure, diabetes duration, and ocular symptoms. Trained AI scores clinical risk and books hospital appointments based on live seat quotas.',
          icon: UserCheck,
          btnText: 'ASHA Portal',
          portal: 'asha'
        },
        {
          tier: 'Tier 2',
          role: 'Ophthalmic Nurse',
          title: 'Digital Retinal Imaging',
          desc: 'Hospital triage triage with non-mydriatic fundus cameras. Deep learning models evaluate microvascular lesions, determining Diabetic Retinopathy severity (Stages 0-4) with Grad-CAM heatmaps.',
          icon: Building2,
          btnText: 'Nurse Portal',
          portal: 'nurse'
        },
        {
          tier: 'Tier 3',
          role: 'Vitreo-Retinal Specialist',
          title: 'Tele-Care & Surveillance',
          desc: 'Ophthalmologists verify fused vitals and Grad-CAM maps, prescribe treatments, dispatch reports via WhatsApp, and submit village-level epidemiological surveillance to the Government.',
          icon: Stethoscope,
          btnText: 'Doctor Portal',
          portal: 'doctor'
        }
      ],
      primaryBtn: {
        text: 'How Explainable AI Works',
        action: () => goToSlide(2)
      },
      secondaryBtn: {
        text: 'Full Workflow Details',
        action: () => setActiveSection('workflow')
      }
    },
    {
      id: 'xai',
      tabLabel: '3. How XAI Works',
      bgImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=2000&q=80',
      tag: 'Transparent Machine Learning • Decision Trust',
      title: 'How Explainable AI (XAI) Works',
      subtitle: 'Opening the black box: Providing interpretable visual and tabular rationales for every clinical prediction.',
      quote: null,
      boxes: [
        {
          title: 'Grad-CAM Saliency Heatmaps',
          desc: 'Gradient-weighted Class Activation Mapping highlights the exact pixel clusters (microaneurysms, hemorrhages, lipid exudates) that triggered the AI DR stage detection.',
          icon: Eye,
          badge: 'Visual Explainability'
        },
        {
          title: 'TreeSHAP Risk Weights',
          desc: 'SHapley Additive exPlanations quantify the exact mathematical contribution of each patient biomarker (HbA1c level, systolic BP, diabetes duration) to their overall risk score.',
          icon: Sliders,
          badge: 'Biomarker Weights'
        },
        {
          title: 'Multimodal Fusion Synthesis',
          desc: 'Combines Tier 1 systemic risk factors with Tier 2 fundus image features into a unified, medically consistent clinical assessment with actionable referral guidance.',
          icon: BrainCircuit,
          badge: 'Clinical Fusion'
        }
      ],
      primaryBtn: {
        text: 'Try Interactive XAI Visualizer',
        action: () => setActiveSection('xai')
      },
      secondaryBtn: {
        text: 'Back to Home Overview',
        action: () => goToSlide(0)
      }
    }
  ];

  // Map slide index to section id for navbar sync
  const slideToSection = ['home', 'workflow', 'xai'];

  const goToSlide = (idx) => {
    setCurrentSlide(idx);
    if (onSlideChange) onSlideChange(slideToSection[idx]);
  };

  const handlePrev = () => {
    const next = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    goToSlide(next);
  };

  const handleNext = () => {
    const next = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
    goToSlide(next);
  };

  // Keyboard Navigation: Left and Right Arrows
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const active = slides[currentSlide];

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden select-none">
      
      {/* 3 Real Background Images - Vividly Visible with Natural Brightness */}
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            idx === currentSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
          }`}
        >
          <img
            src={s.bgImage}
            alt={s.title}
            className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.08]"
          />
          {/* Subtle Ambient Vignette & Gradient - Preserves Full Image Visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#052631]/85 via-[#052631]/50 to-[#052631]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#052631]/90 via-transparent to-[#052631]/40" />
        </div>
      ))}

      {/* LINELESS NAVIGATION ARROW: LEFT */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous Section"
        title="Previous Section"
        className="absolute left-1 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 p-2 text-[#FFD166] hover:text-white hover:scale-125 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none"
      >
        <ChevronLeft className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] stroke-[2.2]" />
      </button>

      {/* LINELESS NAVIGATION ARROW: RIGHT */}
      <button
        type="button"
        onClick={handleNext}
        aria-label="Next Section"
        title="Next Section"
        className="absolute right-1 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 p-2 text-[#FFD166] hover:text-white hover:scale-125 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none"
      >
        <ChevronRight className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] stroke-[2.2]" />
      </button>

      {/* Slide Content Viewport */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-32 max-w-6xl mx-auto py-8 w-full">
        
        <div key={active.id} className="space-y-5 text-left animate-in fade-in duration-300">
          
          {/* Header Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#073B4C]/85 border border-[#0F5E78] text-xs font-bold text-white shadow-lg backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD166] animate-pulse" />
            <span className="text-[#FFD166] uppercase tracking-wider">{active.tag}</span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              {active.title}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-[#CFE2E8] max-w-3xl leading-relaxed filter drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
              {active.subtitle}
            </p>
          </div>

          {/* Inspirational Quote Box (Shown in Home Section) */}
          {active.quote && (
            <div className="p-4 rounded-2xl bg-[#073B4C]/85 border border-[#0F5E78] backdrop-blur-md shadow-xl flex items-start gap-3 max-w-3xl">
              <Quote className="w-5 h-5 text-[#FFD166] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm text-white italic leading-relaxed">
                  "{active.quote}"
                </p>
                <p className="text-[11px] text-[#FFD166] font-semibold mt-1">
                  — {active.quoteAuthor}
                </p>
              </div>
            </div>
          )}

          {/* Simple Information Boxes with Smooth Transition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 max-w-5xl pt-1">
            {active.boxes.map((box, i) => {
              const BoxIcon = box.icon;
              return (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-[#073B4C]/85 border border-[#0F5E78] hover:border-[#FFD166]/70 transition-all duration-200 backdrop-blur-md shadow-xl space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-[#052631] border border-[#0F5E78] text-[#FFD166] flex items-center justify-center shrink-0">
                        <BoxIcon className="w-4 h-4" />
                      </div>
                      {box.tier && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EF476F] text-white">
                          {box.tier}
                        </span>
                      )}
                      {box.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#052631] text-[#FFD166] border border-[#0F5E78]">
                          {box.badge}
                        </span>
                      )}
                    </div>
                    {box.role && (
                      <p className="text-[11px] font-bold text-[#FFD166] uppercase tracking-wider">
                        {box.role}
                      </p>
                    )}
                    <h3 className="text-sm font-bold text-white">
                      {box.title}
                    </h3>
                    <p className="text-xs text-[#CFE2E8] leading-relaxed">
                      {box.desc}
                    </p>
                  </div>

                  {box.btnText && (
                    <button
                      onClick={() => openAuthModal('login', box.portal)}
                      className="mt-2 w-full py-1.5 rounded-xl bg-[#052631] hover:bg-[#0A485C] border border-[#0F5E78] text-xs font-bold text-[#FFD166] hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{box.btnText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Navigation Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={active.primaryBtn.action}
              className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#FFD166] hover:bg-[#FFC338] text-[#073B4C] shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{active.primaryBtn.text}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {active.secondaryBtn && (
              <button
                onClick={active.secondaryBtn.action}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#073B4C]/85 hover:bg-[#0A485C] border border-[#0F5E78] text-white shadow-md transition-all flex items-center gap-2 backdrop-blur-sm cursor-pointer"
              >
                <span>{active.secondaryBtn.text}</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
