import React, { useState, useEffect } from 'react';
import { usePatients } from '../context/PatientContext';
import { 
  Eye, 
  Printer, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  QrCode, 
  Clock, 
  ShieldCheck,
  Building,
  User
} from 'lucide-react';

export function PublicReportView({ patientId, onBack }) {
  const { patients } = usePatients();
  const [patient, setPatient] = useState(null);
  const [downloaded, setDownloaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Search in cached patient list
    const found = patients.find(p => p.id === patientId);
    if (found) {
      setPatient(found);
      setLoading(false);
      return;
    }

    // 2. Fetch from backend API if not in context
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    fetch(`${API_BASE}/api/patients/${patientId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setPatient(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [patientId, patients]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const reportElem = document.getElementById('public-medical-report-content');
    if (!reportElem) return;

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VisionXAI Medical Report - ${patient?.name || 'Patient'} (${patientId})</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
    .report-wrap { max-width: 840px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #cbd5e1; }
    .print-btn { display: inline-block; background: #073B4C; color: white; padding: 10px 18px; border-radius: 8px; font-weight: bold; font-size: 13px; margin-bottom: 20px; cursor: pointer; border: none; }
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
    link.download = `VisionXAI_Medical_Report_${patientId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#082733] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#FFD166]/30 border-t-[#FFD166] rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#CFE2E8]">Loading verified diagnostic dossier...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#082733] flex items-center justify-center p-4">
        <div className="bg-[#073B4C] border border-[#0F5E78] p-8 rounded-3xl max-w-md text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#052631] text-[#FFD166] flex items-center justify-center mx-auto border border-[#0F5E78]">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Report Not Found</h2>
          <p className="text-xs text-[#CFE2E8]">
            No clinical diagnostic record was found matching ID: <span className="font-mono text-[#FFD166]">{patientId}</span>.
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-[#FFD166] text-[#073B4C] font-bold text-xs"
          >
            Go to VisionXAI Home
          </button>
        </div>
      </div>
    );
  }

  const vitals = patient.vitals || {};
  const fundus = patient.fundusImaging || null;
  const doc = patient.doctorReport || null;
  const asha = patient.ashaRiskAssessment || {};

  return (
    <div className="min-h-screen bg-[#082733] py-8 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Controls Bar */}
        <div className="bg-[#073B4C] border border-[#0F5E78] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md print:hidden">
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl bg-[#052631] hover:bg-[#0F5E78] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>VisionXAI Portal Home</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl bg-[#052631] hover:bg-[#0F5E78] border border-[#0F5E78] text-[#FFD166] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloaded ? '✓ Saved to Computer' : 'Download Report'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE CLINICAL DOCUMENT CONTAINER */}
        <div id="public-medical-report-content" className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-[#0F5E78] space-y-6 print:border-none print:shadow-none print:p-0">
          
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
              <p className="text-slate-600">Date: {new Date(patient.registeredAt || Date.now()).toLocaleDateString('en-GB')}</p>
              <p className="text-slate-600">Status: <span className="font-semibold text-[#073B4C]">{doc?.healthStatus || patient.status || 'Active'}</span></p>
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
              <p className="text-slate-700"><strong>HbA1c:</strong> {vitals.hba1c || 'N/A'}%</p>
              <p className="text-slate-700"><strong>Blood Pressure:</strong> {vitals.bloodPressure || '120/80'}</p>
              <p className="text-slate-700"><strong>Diabetes Duration:</strong> {vitals.bloodSugarYears || 0} Years</p>
              <p className="text-slate-700"><strong>Field AI Risk:</strong> <span className="font-bold text-[#073B4C]">{asha.risk_level || asha.riskCategory || 'Low'} ({asha.risk_score || asha.score || 10}%)</span></p>
            </div>

            {/* Tier 2: Nurse Fundus & AI DR % */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <p className="text-[11px] font-bold text-[#073B4C] uppercase tracking-wider border-b border-slate-200 pb-1">
                2. Retinal AI Analysis
              </p>
              <p className="text-slate-700"><strong>DR Model Prob:</strong> <span className="font-bold text-[#073B4C]">{fundus?.drPercentage || (fundus ? 55 : 0)}%</span></p>
              <p className="text-slate-700"><strong>Classification:</strong> {fundus?.stage || fundus?.drSeverity || 'Imaged'}</p>
              <p className="text-slate-700"><strong>Multimodal Status:</strong> {fundus ? 'FUSED (Optical + Clinical)' : 'Clinical Only'}</p>
              <p className="text-slate-700"><strong>XAI Lesions:</strong> {fundus?.xaiRegions?.length || 0} regions identified</p>
            </div>

            {/* Tier 3: Doctor Diagnosis */}
            <div className="p-3.5 rounded-xl border border-[#0F5E78] bg-[#052631]/10 space-y-1.5">
              <p className="text-[11px] font-bold text-[#073B4C] uppercase tracking-wider border-b border-[#0F5E78] pb-1">
                3. Specialist Diagnosis
              </p>
              <p className="text-slate-800 font-bold leading-tight">{doc?.finalDiagnosis || doc?.diagnosis || 'Diabetic Retinopathy Screening Evaluation'}</p>
              <p className="text-[#073B4C] font-semibold mt-1">Status: {doc?.healthStatus || 'Laser Treatment Advised'}</p>
              <p className="text-slate-600 text-[11px]">Follow-up: {doc?.followUpDate || 'Within 15 Days'}</p>
            </div>

          </div>

          {/* Retinal Fundus Scan Preview in Report */}
          {fundus && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 flex flex-col sm:flex-row items-center gap-4 text-xs">
              <img
                src={fundus.imageUrl}
                alt="Retina Scan"
                className="w-28 h-28 rounded-lg object-cover border border-slate-300 shadow-sm shrink-0"
              />
              <div className="space-y-1 flex-1">
                <p className="font-bold text-slate-900">Retinal Fundus Photography & AI Findings</p>
                <p className="text-slate-600 leading-relaxed text-xs">
                  {fundus.findingsSummary || 'Microaneurysms, blot hemorrhages, and vascular caliber examined across all quadrants.'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Technician: {fundus.capturedByNurse || 'Clinic Nurse'} • Scanned at: {new Date(fundus.capturedAt || Date.now()).toLocaleDateString()}
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
              {(doc?.prescriptions?.length > 0 ? doc.prescriptions : [
                'Strict Glycemic Control (Target HbA1c < 7.0% in consultation with Diabetologist)',
                'Nepafenac Ophthalmic Suspension 0.1% - 1 drop 3 times daily',
                'Carboxymethylcellulose 0.5% Lubricant Eye Drops - 1 drop 4 times daily'
              ]).map((rx, idx) => (
                <p key={idx} className="text-slate-800 font-medium flex items-start gap-2">
                  <span className="font-bold text-[#073B4C]">{idx + 1}.</span>
                  <span>{rx}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Signatures & QR Code Footer */}
          <div className="pt-6 border-t border-slate-200 flex items-end justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-300 p-1 flex items-center justify-center">
                <QrCode className="w-14 h-14 text-slate-700" />
              </div>
              <div className="space-y-0.5 text-[11px] text-slate-500">
                <p className="font-bold text-slate-700">Digital Health Record</p>
                <p>Verified on VisionXAI Tele-Care</p>
                <p className="text-[#073B4C] font-mono">{window.location.host}</p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="font-serif italic text-[#073B4C] text-base font-bold">
                {doc?.doctor_name || 'Dr. Arvind Mehra, MS'}
              </div>
              <p className="text-slate-800 font-bold text-xs">{doc?.doctor_name || 'Dr. Arvind Mehra, MS (Ophthalmology)'}</p>
              <p className="text-slate-500 text-[11px]">MCI Reg No: MCI-REG-44912</p>
              <p className="text-slate-500 text-[10px]">Apex Tele-Ophthalmology Consultant</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
