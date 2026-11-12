import React, { useState, useEffect, useRef } from 'react';
import { usePatients } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { renderGradCamToCanvas } from '../../lib/aiEngine';
import { 
  FileEdit, 
  Save, 
  Send, 
  Download, 
  CheckCircle2, 
  Eye, 
  Sliders, 
  Plus, 
  Trash2,
  ImageOff,
  Stethoscope,
  Building2
} from 'lucide-react';

export function DoctorReportEditor({ patientId, onSelectPatientId, onOpenNotify, onOpenDownload, onSaveComplete }) {
  const { patients, saveDoctorReport, deletePatient, removePatientFundusImage } = usePatients();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const doctorHospital = currentUser?.currentOrganization || 'Khandala Sub-District Civil Hospital';

  // Strict Hospital Isolation: Doctor only receives reports and patients for their hospital
  const displayPatients = patients.filter((p) => {
    return (p.hospitalName || '').toLowerCase().trim() === doctorHospital.toLowerCase().trim();
  });

  const currentPatient = displayPatients.find(p => p.id === patientId) || displayPatients[0];

  // Editor states
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [healthStatus, setHealthStatus] = useState('Laser Treatment Advised');
  const [followUpDate, setFollowUpDate] = useState('2026-10-15');
  const [prescriptions, setPrescriptions] = useState([
    'Strict Glycemic Control (Target HbA1c < 7.0% in consultation with Diabetologist)',
    'Nepafenac Ophthalmic Suspension 0.1% - 1 drop 3 times daily',
    'Carboxymethylcellulose 0.5% Lubricant Eye Drops - 1 drop 4 times daily'
  ]);
  const [newPrescriptionText, setNewPrescriptionText] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Grad-CAM Canvas
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.7);
  const [showLesionBoxes, setShowLesionBoxes] = useState(true);
  const canvasRef = useRef(null);

  // Sync patient data into editor
  useEffect(() => {
    if (currentPatient) {
      if (currentPatient.doctorReport) {
        setFinalDiagnosis(currentPatient.doctorReport.finalDiagnosis || '');
        setDoctorNotes(currentPatient.doctorReport.doctorNotes || '');
        setHealthStatus(currentPatient.doctorReport.healthStatus || 'Laser Treatment Advised');
        setFollowUpDate(currentPatient.doctorReport.followUpDate || '2026-10-15');
        setPrescriptions(currentPatient.doctorReport.prescriptions || []);
      } else {
        const defaultDiag = currentPatient.fundusImaging?.stage 
          ? `${currentPatient.fundusImaging.stage} - Verified by Retinal Specialist`
          : 'Diabetic Retinopathy Screening Evaluation';
        
        setFinalDiagnosis(defaultDiag);
        setDoctorNotes(
          `Dilated fundus examination and XAI Grad-CAM attention map confirm microvascular lesions. Patient shows ${currentPatient.vitals?.bloodSugarYears || 5} years diabetes history with HbA1c at ${currentPatient.vitals?.hba1c || 8.0}%. Recommended clinical intervention and strict follow-up.`
        );
        setHealthStatus(
          currentPatient.fundusImaging?.drPercentage > 75 ? 'Laser Treatment Advised' :
          currentPatient.fundusImaging?.drPercentage > 45 ? 'Under Close Observation' : 'Stable & Controlled'
        );
      }
    }
  }, [currentPatient]);

  // Render Grad-CAM Canvas
  useEffect(() => {
    if (canvasRef.current && currentPatient?.fundusImaging?.xaiRegions) {
      renderGradCamToCanvas(canvasRef.current, currentPatient.fundusImaging.xaiRegions, {
        opacity: heatmapOpacity,
        showBoxes: showLesionBoxes
      });
    }
  }, [currentPatient, heatmapOpacity, showLesionBoxes]);

  // Add prescription
  const handleAddPrescription = () => {
    if (newPrescriptionText.trim()) {
      setPrescriptions(prev => [...prev, newPrescriptionText.trim()]);
      setNewPrescriptionText('');
    }
  };

  // Remove prescription
  const handleRemovePrescription = (index) => {
    setPrescriptions(prev => prev.filter((_, i) => i !== index));
  };

  // Save Report
  const handleSave = (e) => {
    e.preventDefault();
    if (!currentPatient) return;

    saveDoctorReport(
      currentPatient.id,
      {
        finalDiagnosis,
        doctorNotes,
        healthStatus,
        followUpDate,
        prescriptions
      },
      currentUser
    );

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onSaveComplete && onSaveComplete();
    }, 1200);
  };

  const handleRemoveEyeImage = () => {
    if (currentPatient && window.confirm('Remove retinal eye image for this patient?')) {
      removePatientFundusImage(currentPatient.id);
    }
  };

  const handleDeletePatient = () => {
    if (currentPatient && window.confirm(`Remove patient record "${currentPatient.name}"?`)) {
      deletePatient(currentPatient.id);
    }
  };

  if (!displayPatients || displayPatients.length === 0 || !currentPatient) {
    return (
      <div className="bg-[#073B4C] text-white rounded-3xl border border-[#0F5E78] p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#052631] border border-[#0F5E78] text-[#FFD166] mx-auto flex items-center justify-center">
          <Stethoscope className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">No Active Cases for {doctorHospital}</h3>
          <p className="text-xs text-[#CFE2E8] leading-relaxed">
            Strict hospital isolation active. Diagnostic reports for patients booked to <strong>{doctorHospital}</strong> will appear in your clinical review queue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* 1. Patient Selector Bar */}
      <div className="p-5 rounded-3xl bg-[#073B4C] border border-[#0F5E78] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="shape-half-circle shape-half-circle-tr w-24 h-24 pointer-events-none opacity-30 dark:opacity-20" />
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#FFD166] dark:text-[#FFD166]">
            {t('activeClinicalCase')}
          </span>
          <h2 className="text-xl font-bold text-white dark:text-white">
            {t('activeClinicalCase')}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {doctorHospital && (
            <div className="px-3 py-2 rounded-xl text-xs font-bold border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 flex items-center gap-1.5 shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-[#FFD166]" />
              <span className="hidden md:inline">Hospital:</span>
              <span className="truncate max-w-[150px]">{doctorHospital}</span>
            </div>
          )}

          <select
            value={currentPatient.id}
            onChange={(e) => onSelectPatientId(e.target.value)}
            className="w-full sm:w-72 px-3.5 py-2.5 rounded-xl border border-[#0F5E78] bg-[#052631] text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FFD166]"
          >
            {displayPatients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id}) - {p.doctorReport ? '✓ Reviewed' : '⏳ Pending'}
              </option>
            ))}
          </select>

          <button
            title={t('removePatient')}
            onClick={handleDeletePatient}
            className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Longitudinal Data & Retinal Heatmap */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Patient Card & Vitals */}
          <div className="bg-[#073B4C] text-white rounded-3xl border border-[#0F5E78] p-6 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#0F5E78] pb-3">
              <div>
                <p className="text-xs font-mono text-[#FFD166] dark:text-[#FFD166] font-bold">{currentPatient.id}</p>
                <h3 className="text-xl font-bold text-white dark:text-white mt-0.5">{currentPatient.name}</h3>
                <p className="text-xs text-[#CFE2E8]">
                  {currentPatient.age} Y / {currentPatient.gender} • Mobile: {currentPatient.mobile}
                  {currentPatient.village ? ` • Village: ${currentPatient.village}` : ''}
                  {currentPatient.taluka ? `, ${currentPatient.taluka}` : ''}
                  {currentPatient.houseNo ? ` (H.No: ${currentPatient.houseNo})` : ''}
                </p>
                {currentPatient.hospitalName && (
                  <p className="text-[11px] text-[#FFD166] mt-0.5 flex items-center gap-1 font-medium">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span>Assigned Facility: {currentPatient.hospitalName}</span>
                  </p>
                )}
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                currentPatient.ashaRiskAssessment?.riskCategory === 'High' ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800/50' :
                currentPatient.ashaRiskAssessment?.riskCategory === 'Moderate' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/50' :
                'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/50'
              }`}>
                {currentPatient.ashaRiskAssessment?.riskCategory} Risk ({currentPatient.ashaRiskAssessment?.score}%)
              </span>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#073B4C] text-white border border-[#0F5E78]">
                <span className="text-[10px] text-[#CFE2E8]">HbA1c</span>
                <p className="font-bold text-rose-400 text-sm font-mono">{currentPatient.vitals.hba1c}%</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#073B4C] text-white border border-[#0F5E78]">
                <span className="text-[10px] text-[#CFE2E8]">Blood Pressure</span>
                <p className="font-bold text-white dark:text-white text-xs">{currentPatient.vitals.bloodPressure}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#073B4C] text-white border border-[#0F5E78]">
                <span className="text-[10px] text-[#CFE2E8]">Duration</span>
                <p className="font-bold text-white dark:text-white text-xs">{currentPatient.vitals.bloodSugarYears} Years</p>
              </div>
            </div>

            {/* Symptoms */}
            <div className="text-xs space-y-1">
              <span className="text-[#CFE2E8] font-semibold text-[11px]">Field Symptoms:</span>
              <p className="text-white">
                {currentPatient.vitals.symptoms?.join(', ') || 'None reported'}
              </p>
              {currentPatient.vitals.customSymptoms && (
                <p className="text-[11px] text-[#FFD166] dark:text-[#FFD166] italic mt-1">"{currentPatient.vitals.customSymptoms}"</p>
              )}
            </div>

          </div>

          {/* Retinal Fundus & Heatmap */}
          <div className="bg-[#073B4C] text-white rounded-3xl border border-[#0F5E78] p-6 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#0F5E78]/30 dark:border-[#0F5E78] pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#FFD166] dark:text-[#FFD166]" />
                <span>Retina Scan & Grad-CAM Saliency Map</span>
              </span>
              
              {currentPatient.fundusImaging && (
                <button
                  type="button"
                  onClick={handleRemoveEyeImage}
                  className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-[11px] font-bold flex items-center gap-1"
                >
                  <ImageOff className="w-3.5 h-3.5" />
                  <span>{t('removeEyeImage')}</span>
                </button>
              )}
            </div>

            {currentPatient.fundusImaging ? (
              <div className="space-y-4">
                
                <div className="relative w-full aspect-square max-w-md mx-auto rounded-2xl overflow-hidden border-2 border-[#0F5E78] bg-black shadow-lg">
                  <img
                    src={currentPatient.fundusImaging.imageUrl}
                    alt="Fundus"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {currentPatient.fundusImaging.xaiRegions?.length > 0 && (
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={500}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                  )}

                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-[#073B4C] text-white text-[10px] font-mono font-bold shadow-sm border border-[#0F5E78]">
                    {currentPatient.fundusImaging.xaiRegions?.length > 0 
                      ? `Grad-CAM Overlay (${Math.round(heatmapOpacity * 100)}%)` 
                      : `ETDRS Grade ${currentPatient.fundusImaging.drGrade ?? '—'} (${currentPatient.fundusImaging.stage || currentPatient.fundusImaging.drSeverity || 'Imaged'})`}
                  </div>
                </div>

                {/* Opacity slider - only if xaiRegions exist */}
                {currentPatient.fundusImaging.xaiRegions?.length > 0 && (
                  <div className="flex items-center justify-between text-xs text-[#CFE2E8] bg-[#073B4C] text-white border border-[#0F5E78] p-3 rounded-xl border border-[#0F5E78]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Sliders className="w-3.5 h-3.5 text-[#FFD166] dark:text-[#FFD166]" /> {t('heatmapOpacity')}:
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={heatmapOpacity}
                      onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                      className="w-40 accent-[#FFD166] cursor-pointer"
                    />
                    <span className="font-mono text-[#FFD166] dark:text-[#FFD166] font-bold">{Math.round(heatmapOpacity * 100)}%</span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-[#052631]/50 dark:bg-[#00080C]/20 border border-[#0F5E78]/60 text-xs">
                  <span className="text-[10px] text-[#FFD166] dark:text-[#FFD166] font-semibold uppercase">AI Lesion Findings:</span>
                  <p className="text-[#CFE2E8] mt-0.5">{currentPatient.fundusImaging.findingsSummary}</p>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-[#CFE2E8] text-xs">
                No fundus scan captured yet for this patient.
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: Doctor's Manual Clinical Report Editor */}
        <div className="lg:col-span-6 space-y-6">
          
          <form onSubmit={handleSave} className="bg-[#073B4C] text-white rounded-3xl border border-[#0F5E78] p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
            <div className="shape-half-circle shape-half-circle-tr w-20 h-20 pointer-events-none opacity-30 dark:opacity-20" />
            
            <div className="border-b border-[#0F5E78] pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-white dark:text-white flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-[#FFD166] dark:text-[#FFD166]" />
                <span>{t('finalDiagnosis')}</span>
              </h3>
              <span className="text-[11px] text-[#FFD166] dark:text-[#FFD166] font-mono">Editable Form</span>
            </div>

            {/* 1. Final Diagnosis */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-[#CFE2E8]">
                {t('finalDiagnosis')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={finalDiagnosis}
                onChange={(e) => setFinalDiagnosis(e.target.value)}
                placeholder="e.g. Severe Non-Proliferative Diabetic Retinopathy (NPDR)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#0F5E78] bg-[#052631] text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FFD166]"
                required
              />
            </div>

            {/* 2. Patient Health Status */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-[#CFE2E8]">
                {t('healthStatus')} <span className="text-rose-500">*</span>
              </label>
              <select
                value={healthStatus}
                onChange={(e) => setHealthStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#0F5E78] bg-[#052631] text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FFD166]"
              >
                <option value="Laser Treatment Advised">{t('laserAdvised')}</option>
                <option value="Anti-VEGF Therapy Recommended">{t('antiVegfAdvised')}</option>
                <option value="Vitrectomy Surgery Scheduled">{t('vitrectomyAdvised')}</option>
                <option value="Under Close Observation">{t('underObservation')}</option>
                <option value="Stable & Controlled">{t('stableControlled')}</option>
              </select>
            </div>

            {/* 3. Doctor's Clinical Findings & Notes */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-[#CFE2E8]">
                {t('clinicalNotes')} <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Enter detailed clinical impressions and fundus observations..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#0F5E78] bg-[#052631] text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#FFD166]"
                required
              />
            </div>

            {/* 4. Prescriptions & Recommendations */}
            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-[#CFE2E8]">
                {t('prescriptions')}
              </label>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {prescriptions.map((rx, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#073B4C] text-white border border-[#0F5E78] flex items-center justify-between text-xs">
                    <span className="text-white">{rx}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePrescription(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Prescription */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newPrescriptionText}
                  onChange={(e) => setNewPrescriptionText(e.target.value)}
                  placeholder={t('addPrescription')}
                  className="flex-1 px-3 py-2 rounded-xl border border-[#0F5E78] bg-[#052631] text-white text-xs placeholder:text-[#CFE2E8]/60 focus:outline-none focus:ring-2 focus:ring-[#FFD166]"
                />
                <button
                  type="button"
                  onClick={handleAddPrescription}
                  className="px-3 py-2 rounded-xl bg-[#052631] dark:bg-[#052631] hover:bg-[#0F5E78] dark:hover:bg-[#0F5E78] text-[#FFD166] dark:text-[#FFD166] text-xs font-bold flex items-center gap-1 border border-[#0F5E78]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('add')}</span>
                </button>
              </div>
            </div>

            {/* 5. Follow-up Date */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-[#CFE2E8]">{t('followUpDate')}</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#0F5E78] bg-[#052631] text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#FFD166]"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-[#073B4C]/20 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{t('saveFinalizeReport')}</span>
              </button>
            </div>

            {isSaved && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t('reportSavedMsg')}</span>
              </div>
            )}

            {/* Direct Dispatch & PDF Actions Bar */}
            <div className="pt-4 border-t border-[#0F5E78] flex items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenNotify(currentPatient)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send WhatsApp Notification</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenDownload(currentPatient)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#052631] dark:bg-[#052631] hover:bg-[#0F5E78] dark:hover:bg-[#0F5E78] border border-[#0F5E78] text-[#FFD166] dark:text-[#FFD166] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('downloadPdfReport')}</span>
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}
