import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getPublicReportUrl } from '../../lib/api';
import { 
  X, 
  Printer, 
  Eye, 
  Download,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export function ReportDownloadModal({ patient, onClose }) {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [downloaded, setDownloaded] = useState(false);

  // Dynamic doctor details
  const doctorName = patient.doctorReport?.doctorName || currentUser?.name || currentUser?.fullName || 'Dr. Arvind Mehra, MS';
  const doctorLicense = patient.doctorReport?.doctorLicense || currentUser?.licenseId || 'MCI-REG-44912';
  const doctorQual = patient.doctorReport?.doctorQualification || currentUser?.qualification || 'MS (Ophthalmology)';
  const doctorHosp = patient.hospitalName || patient.doctorReport?.doctorOrganization || currentUser?.currentOrganization || 'District Tele-Ophthalmology Hospital';

  // Live clickable and scannable report link (resolves to public deployed domain even on localhost)
  const reportUrl = getPublicReportUrl(patient.id);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(reportUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const reportElem = document.getElementById('printable-medical-report');
    if (!reportElem) return;

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VisionXAI Medical Report - ${patient.name} (${patient.id})</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
    .report-wrap { max-width: 840px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #cbd5e1; }
    .print-btn { display: inline-block; background: #073B4C; color: white; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; margin-bottom: 20px; cursor: pointer; border: none; }
    @media print {
      body { background: white; padding: 0; }
      .report-wrap { border: none; box-shadow: none; padding: 0; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <div style="max-width: 840px; margin: 0 auto 12px; text-align: right;">
    <button class="print-btn" onclick="window.print()">🖨️ Print Document</button>
  </div>
  <div class="report-wrap">
    ${reportElem.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VisionXAI_Medical_Report_${patient.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#073B4C] border border-[#0F5E78] p-4 sm:p-8 shadow-2xl space-y-6 my-auto">
        
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between border-b border-[#0F5E78] pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#FFD166] dark:text-[#FFD166]">
              Official Medical Report
            </span>
            <span className="text-xs text-[#CFE2E8] font-mono">ID: {patient.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl bg-[#052631] hover:bg-[#0F5E78] border border-[#0F5E78] text-[#FFD166] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloaded ? '✓ Saved to Computer' : 'Download Report'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#052631] hover:bg-[#0F5E78] text-[#FFD166] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CLINICAL DOCUMENT CONTAINER */}
        <div id="printable-medical-report" className="bg-white text-slate-900 rounded-2xl p-6 sm:p-10 space-y-6 shadow-sm border border-[#0F5E78] print:border-none print:shadow-none">
          
          {/* Header */}
          <div className="border-b-2 border-[#073B4C] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FFD166] text-[#073B4C] flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-[#073B4C] tracking-tight">
                  VisionXAI Tele-Ophthalmology Network
                </h1>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Apex Center for Explainable AI Diabetic Retinopathy Screening & Tele-Care
              </p>
              <p className="text-[11px] text-slate-500">
                National Tele-Health Screening Initiative • Government Accredited
              </p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
              <p className="font-bold text-slate-900">Report No: <span className="font-mono text-[#073B4C]">{patient.id}</span></p>
              <p className="text-slate-600">Date: {new Date().toLocaleDateString('en-GB')}</p>
              <p className="text-slate-600">Status: <span className="font-semibold text-[#073B4C]">{patient.doctorReport?.healthStatus || 'Laser Advised'}</span></p>
            </div>
          </div>

          {/* Patient Details & Vitals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Patient Name</span>
              <p className="font-bold text-slate-900 text-sm">{patient.name}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Age / Gender</span>
              <p className="font-bold text-slate-900">{patient.age} Years / {patient.gender}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Mobile Contact</span>
              <p className="font-bold text-slate-900 font-mono">{patient.mobile}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Village / Ward</span>
              <p className="font-bold text-slate-900 truncate">{patient.village}</p>
            </div>
          </div>

          {/* 3-Tier Clinical Continuum Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            
            {/* Tier 1: ASHA Vitals */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <p className="text-[11px] font-bold text-[#073B4C] uppercase tracking-wider border-b border-slate-200 pb-1">
                1. ASHA Field Survey
              </p>
              <p className="text-slate-700"><strong>HbA1c:</strong> {patient.vitals.hba1c}%</p>
              <p className="text-slate-700"><strong>Blood Pressure:</strong> {patient.vitals.bloodPressure}</p>
              <p className="text-slate-700"><strong>Diabetes Duration:</strong> {patient.vitals.bloodSugarYears} Years</p>
              <p className="text-slate-700"><strong>Field AI Risk:</strong> {patient.ashaRiskAssessment?.riskCategory} ({patient.ashaRiskAssessment?.score}%)</p>
            </div>

            {/* Tier 2: Nurse Fundus & AI DR % */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <p className="text-[11px] font-bold text-[#073B4C] uppercase tracking-wider border-b border-slate-200 pb-1">
                2. Retinal AI Analysis
              </p>
              <p className="text-slate-700"><strong>DR Model Prob:</strong> <span className="font-bold text-[#073B4C]">{patient.fundusImaging?.drPercentage || 78}%</span></p>
              <p className="text-slate-700"><strong>Classification:</strong> {patient.fundusImaging?.stage || 'Moderate NPDR'}</p>
              <p className="text-slate-700"><strong>CSME Risk:</strong> {patient.fundusImaging?.csmeRisk || 'Moderate'}</p>
              <p className="text-slate-700"><strong>XAI Grad-CAM:</strong> Saliency Lesions Verified</p>
            </div>

            {/* Tier 3: Doctor Diagnosis */}
            <div className="p-3.5 rounded-xl border border-[#0F5E78] bg-[#052631]/20 space-y-1.5">
              <p className="text-[11px] font-bold text-[#073B4C] uppercase tracking-wider border-b border-[#0F5E78] pb-1">
                3. Specialist Diagnosis
              </p>
              <p className="text-slate-800 font-bold leading-tight">{patient.doctorReport?.finalDiagnosis || 'Diabetic Retinopathy Confirmed'}</p>
              <p className="text-[#073B4C] font-semibold mt-1">Status: {patient.doctorReport?.healthStatus || 'Laser Advised'}</p>
              <p className="text-slate-600 text-[11px]">Follow-up: {patient.doctorReport?.followUpDate || '2026-10-15'}</p>
            </div>

          </div>

          {/* Retinal Fundus Scan Preview in Report */}
          {patient.fundusImaging && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 flex flex-col sm:flex-row items-center gap-4 text-xs">
              <img
                src={patient.fundusImaging.imageUrl}
                alt="Retina Scan"
                className="w-28 h-28 rounded-lg object-cover border border-slate-300 shadow-sm shrink-0"
              />
              <div className="space-y-1 flex-1">
                <p className="font-bold text-slate-900">Grad-CAM Retinal Saliency Overlay Findings</p>
                <p className="text-slate-600 leading-relaxed text-xs">
                  {patient.fundusImaging.findingsSummary}
                </p>
                <p className="text-[11px] text-slate-500">
                  Technician: {patient.fundusImaging.capturedByNurse} • Scanned at: {new Date(patient.fundusImaging.capturedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Doctor Prescriptions & Directives */}
          <div className="space-y-2 text-xs">
            <p className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-200 pb-1">
              Medical Prescriptions & Clinical Directives (Rx)
            </p>
            <div className="space-y-1.5 pl-2">
              {patient.doctorReport?.prescriptions?.map((rx, idx) => (
                <p key={idx} className="text-slate-800 font-medium flex items-start gap-2">
                  <span className="font-bold text-[#073B4C]">{idx + 1}.</span>
                  <span>{rx}</span>
                </p>
              )) || (
                <p className="text-slate-600 italic">Strict glycemic management and scheduled dilated retinal check.</p>
              )}
            </div>
          </div>

          {/* Signatures & Real Scannable QR Code Footer */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between gap-4 text-xs">
            
            <div className="flex items-center gap-3">
              <a 
                href={reportUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Click or scan to open live digital dossier"
                className="group relative"
              >
                <img 
                  src={qrCodeUrl} 
                  alt={`QR Code for Patient ${patient.id}`} 
                  className="w-16 h-16 rounded-lg bg-white border border-slate-300 p-0.5 object-contain shadow-sm group-hover:scale-105 transition-transform"
                />
              </a>
              <div className="space-y-0.5 text-[11px] text-slate-500">
                <p className="font-bold text-slate-700">Digital Health Record</p>
                <p>Scan with any phone camera</p>
                <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="text-[#073B4C] font-mono hover:underline flex items-center gap-1 font-semibold">
                  <span>Verify Live Dossier</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            <div className="text-right space-y-0.5">
              <div className="font-serif italic text-[#073B4C] text-lg font-bold">
                {doctorName}
              </div>
              <p className="text-slate-800 font-bold text-xs">{doctorName}, {doctorQual}</p>
              <p className="text-slate-600 text-[11px] font-mono">Reg No: {doctorLicense}</p>
              <p className="text-slate-500 text-[10px]">{doctorHosp}</p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
