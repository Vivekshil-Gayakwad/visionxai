import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  UserCheck, 
  Building2, 
  Stethoscope, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  FileText,
  Send,
  Layers,
  ChevronRight
} from 'lucide-react';

export function WorkflowSection({ setActiveSection }) {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: 1,
      tier: t('tier1'),
      role: t('ashaTitle'),
      title: t('ashaTitle') + " - " + t('ashaSubtitle'),
      icon: UserCheck,
      badgeClass: 'bg-[#EF476F] text-white border-transparent',
      description: 'Door-to-door diabetic eye risk survey, clinical vitals entry & AI risk evaluation.',
      keyActions: [
        'Records HbA1c, Blood Pressure, Diabetes duration & symptoms.',
        'Runs Predictive AI Risk Model (Low / Moderate / High).',
        'Books hospital screening appointments for moderate/high risk patients.'
      ],
      portalAction: 'asha-portal',
      portalBtnText: t('openFieldSurvey')
    },
    {
      step: 2,
      tier: t('tier2'),
      role: t('nurseTitle'),
      title: t('nurseTitle') + " - " + t('nurseSubtitle'),
      icon: Building2,
      badgeClass: 'bg-[#EF476F] text-white border-transparent',
      description: 'Hospital triage verification, digital fundus retinal imaging & Deep Learning DR % calculation.',
      keyActions: [
        'Inspects patient referral dossier from ASHA survey.',
        'Captures retinal photograph via digital fundus camera.',
        'Computes DR % & generates Grad-CAM lesion heatmap overlay.'
      ],
      portalAction: 'nurse-portal',
      portalBtnText: t('openImagingSuite')
    },
    {
      step: 3,
      tier: t('tier3'),
      role: t('doctorTitle'),
      title: t('doctorTitle') + " - " + t('doctorSubtitle'),
      icon: Stethoscope,
      badgeClass: 'bg-[#EF476F] text-white border-transparent',
      description: 'Specialist diagnosis review, manual report customization & direct mobile report dispatch.',
      keyActions: [
        'Reviews ASHA vitals, fundus scan & Grad-CAM explainability maps.',
        'Customizes clinical notes, prescriptions & treatment status.',
        'Dispatches reports via WhatsApp & exports downloadable/printable reports.'
      ],
      portalAction: 'doctor-portal',
      portalBtnText: t('openSpecialistReview')
    }
  ];

  return (
    <section className="relative py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#073B4C] border border-[#0F5E78] dark:border-[#146E8C] text-xs font-bold text-white shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
          <span>{t('careContinuity')}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
          {t('workflow')}
        </h2>
      </div>

      {/* Step Navigation Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto mb-8">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isCurrent = activeStep === idx;
          return (
            <button
              key={s.step}
              onClick={() => setActiveStep(idx)}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                isCurrent
                  ? 'bg-[#073B4C] border-[#FFD166] text-white ring-2 ring-[#FFD166]/50 shadow-md'
                  : 'bg-[#073B4C]/85 border-[#0F5E78] dark:border-[#146E8C] hover:border-[#FFD166] text-white'
              }`}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#FFD166] text-[#073B4C] font-bold shadow-sm">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#FFD166]">{s.tier}</p>
                <p className="text-xs font-bold text-white line-clamp-1">{s.role}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step Card - Deep Midnight Teal (#073B4C) with Golden Yellow (#FFD166) Accents */}
      <div className="bg-[#073B4C] border border-[#0F5E78] dark:border-[#146E8C] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-white">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${steps[activeStep].badgeClass}`}>
                {steps[activeStep].tier}
              </span>
              <span className="text-xs font-semibold text-[#CFE2E8] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD166]" />
                Step {steps[activeStep].step} of 3
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {steps[activeStep].title}
              </h3>
              <p className="text-[#CFE2E8] text-xs sm:text-sm">
                {steps[activeStep].description}
              </p>
            </div>

            {/* Actions List */}
            <div className="space-y-2 pt-1">
              {steps[activeStep].keyActions.map((action, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-[#E0ECEF]">
                  <span className="w-5 h-5 rounded-full bg-[#FFD166] text-[#073B4C] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{action}</span>
                </div>
              ))}
            </div>

            {/* Launch CTA Button */}
            <div className="pt-3 flex items-center gap-2.5">
              <button
                onClick={() => setActiveSection(steps[activeStep].portalAction)}
                className="px-4 py-2.5 rounded-xl bg-[#FFD166] hover:bg-[#FFC338] text-[#073B4C] border border-[#FFD166] text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <span>{steps[activeStep].portalBtnText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveStep((activeStep + 1) % steps.length)}
                className="px-3.5 py-2.5 rounded-xl bg-[#0A485C] hover:bg-[#0E5B74] border border-[#0F5E78] dark:border-[#146E8C] text-white text-xs font-semibold transition-all flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Right Visual Box */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm rounded-2xl bg-[#052631] border border-[#0F5E78] dark:border-[#146E8C] p-4 shadow-md space-y-3">
              
              <div className="flex items-center justify-between border-b border-[#0F5E78] pb-2">
                <span className="text-xs font-bold text-white">Overview</span>
                <span className="text-[10px] font-mono text-[#073B4C] bg-[#FFD166] px-2 py-0.5 rounded font-bold">
                  {steps[activeStep].role}
                </span>
              </div>

              {activeStep === 0 && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#073B4C] border border-[#0F5E78] space-y-0.5">
                    <p className="text-[11px] text-[#FFD166] font-bold">Rural Field Survey</p>
                    <p className="text-[#CFE2E8]">Record HbA1c, Blood Pressure & Vision symptoms</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#073B4C] border border-[#0F5E78] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#FFD166] font-bold uppercase">AI Risk</p>
                      <p className="text-xs font-bold text-white">High Risk &gt;65%</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#EF476F] text-[10px] font-bold text-white">
                      Hospital Referral
                    </span>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-2 text-xs">
                  <div className="relative rounded-xl overflow-hidden border border-[#0F5E78] aspect-video flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80"
                      alt="Fundus Scan"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#073B4C]/90 text-[10px] font-mono text-[#FFD166] font-bold border border-[#0F5E78]">
                      Grad-CAM Heatmap
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-1.5 rounded-lg bg-[#073B4C] border border-[#0F5E78]">
                      <p className="text-[10px] text-[#CFE2E8]">DR Model</p>
                      <p className="text-xs font-bold text-[#FFD166]">86.4% DR</p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-[#073B4C] border border-[#0F5E78]">
                      <p className="text-[10px] text-[#CFE2E8]">Stage</p>
                      <p className="text-xs font-bold text-white">Severe NPDR</p>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#073B4C] border border-[#0F5E78] space-y-1">
                    <span className="text-[11px] font-bold text-[#FFD166]">Specialist Diagnosis</span>
                    <p className="text-[#CFE2E8] text-[11px]">Rx: Nepafenac 0.1% + Laser Photocoagulation</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#073B4C] border border-[#0F5E78] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-[#FFD166]" />
                      <span className="text-[11px] font-bold text-white">WhatsApp Dispatch</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#0B6B3A] text-white rounded">Sent</span>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
