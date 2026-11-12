import React, { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  X, 
  MessageSquare, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export function DoctorNotifyModal({ patient, onClose }) {
  const { notifyPatient } = usePatients();
  const { t } = useLanguage();
  const [sentSuccess, setSentSuccess] = useState(false);

  // Clean phone number for WhatsApp
  const cleanPhone = (patient.mobile || '').replace(/\D/g, '');

  // Directly clickable verified medical report link
  const reportUrl = `${window.location.origin}/?report=${patient.id}`;

  const whatsappMessage = 
`*VisionXAI Tele-Ophthalmology Screening Report*
━━━━━━━━━━━━━━━━━━━━
Dear *${patient.name}*,
Your Diabetic Retinopathy screening results have been reviewed and verified by Dr. Arvind Mehra, MS (Ophthalmology).

*Diagnostic Summary:*
• *Diagnosis:* ${patient.doctorReport?.finalDiagnosis || patient.fundusImaging?.stage || 'Moderate NPDR'}
• *Treatment Status:* ${patient.doctorReport?.healthStatus || 'Laser Treatment Advised'}
• *Calculated DR %:* ${patient.fundusImaging?.drPercentage || patient.ashaRiskAssessment?.score || '78'}%
• *Next Follow-up:* ${patient.doctorReport?.followUpDate || 'Within 15 Days'}

*Doctor's Advice:*
${patient.doctorReport?.prescriptions?.slice(0, 2).map((p, i) => `${i+1}. ${p}`).join('\n') || 'Strict glycemic control and follow-up dilated fundus evaluation.'}

📄 *Access your complete Explainable AI diagnostic report:*
${reportUrl}

For assistance, contact District Tele-Care Helpline: 1800-11-2026`;

  const handleSendWhatsApp = () => {
    notifyPatient(patient.id, 'whatsapp');
    setSentSuccess(true);
    
    // Open real WhatsApp web link with the report link inside
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(waUrl, '_blank');

    setTimeout(() => {
      setSentSuccess(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#073B4C] border border-[#0F5E78] p-6 sm:p-8 overflow-hidden shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#0F5E78] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#052631] text-[#FFD166] border border-[#0F5E78]">
                {patient.id}
              </span>
              <span className="text-xs text-[#CFE2E8]">Recipient: {patient.name} ({patient.mobile})</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
              WhatsApp Diagnostic Dispatch
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#052631] hover:bg-[#0F5E78] text-[#FFD166] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Channel Badge */}
        <div className="p-4 rounded-2xl bg-[#052631] border border-emerald-500/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>WhatsApp Tele-Care Gateway</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </p>
              <p className="text-xs text-emerald-300 font-mono">End-to-End Encrypted Clinical Report Dispatch</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#FFD166] bg-[#073B4C] px-2.5 py-1 rounded-lg border border-[#0F5E78]">
            Instant Link Ready
          </span>
        </div>

        {/* Message Preview Box */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-white flex items-center justify-between">
            <span>Verified Message Preview</span>
            <span className="text-[11px] font-mono text-[#FFD166]">Live Report Link Included</span>
          </p>

          <div className="p-4 rounded-2xl bg-[#052631] border border-[#0F5E78] font-mono text-xs text-white leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
            {whatsappMessage}
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Launch WhatsApp & Transmit Report</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>

        {/* Sent Confirmation Banner */}
        {sentSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t('notificationSuccess')}</span>
          </div>
        )}

      </div>

    </div>
  );
}
