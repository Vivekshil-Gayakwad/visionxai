import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Eye, Sparkles, ShieldCheck } from 'lucide-react';

export function Footer({ setActiveSection }) {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-[#0F5E78] dark:border-[#146E8C]/60 bg-[#052631] dark:bg-[#00080C] pt-12 pb-10 text-white dark:text-[#CFE2E8] text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#073B4C] border border-[#0F5E78] flex items-center justify-center text-[#FFD166] shadow-sm">
                <Eye className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Vision<span className="text-[#EF476F]">X</span>AI
              </span>
            </div>
            <p className="text-xs text-[#CFE2E8] leading-relaxed">
              {t('tagline')}
            </p>
            <div className="flex items-center gap-1.5 text-[#FFD166] text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
              <span>{t('heroBadge')}</span>
            </div>
          </div>

          {/* Col 2: 3-Tier Workflow */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-white">{t('workflow')}</p>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button 
                  onClick={() => setActiveSection('asha-portal')}
                  className="hover:text-[#FFD166] transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF476F]" />
                  <span>{t('tier1')}: {t('ashaTitle')}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('nurse-portal')}
                  className="hover:text-[#FFD166] transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF476F]" />
                  <span>{t('tier2')}: {t('nurseTitle')}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('doctor-portal')}
                  className="hover:text-[#FFD166] transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF476F]" />
                  <span>{t('tier3')}: {t('doctorTitle')}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Explainability Tech */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Explainable AI</p>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button 
                  onClick={() => setActiveSection('xai')} 
                  className="hover:text-[#FFD166] transition-colors"
                >
                  Grad-CAM Retinal Saliency Maps
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('xai')} 
                  className="hover:text-[#FFD166] transition-colors"
                >
                  SHAP Factor Attribution Engine
                </button>
              </li>
              <li>
                <span className="text-[#CFE2E8]/80">WHO & CDC Retinopathy Guidelines</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Clinical Governance */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Clinical Protocol</p>
            <div className="p-3.5 rounded-2xl bg-[#073B4C] border border-[#0F5E78] text-white space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-[11px] text-[#FFD166] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0B6B3A]" />
                <span className="text-white">Diagnostic Support</span>
              </div>
              <p className="text-[10px] text-[#CFE2E8] leading-normal">
                VisionXAI is an Explainable AI clinical decision support system for screening verification.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#0F5E78]/20 dark:border-[#0F5E78]/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#CFE2E8]">
          <p>© 2026 VisionXAI. {t('tagline')}.</p>
          <div className="flex items-center gap-3">
            <span>HIPAA Compliant</span>
            <span>•</span>
            <span>Tele-Health Standard</span>
            <span>•</span>
            <span className="text-[#FFD166] font-mono font-bold">v2.4 Production</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
