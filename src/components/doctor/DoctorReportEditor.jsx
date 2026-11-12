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

  const doctorHospital = currentUser?.currentOrganization || 'District Tele-Ophthalmology Hospital';

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

  // Reviewing Doctor Credentials (Editable for full clinical customization)
  const [doctorName, setDoctorName] = useState(() => currentUser?.name || 'Dr. Vivek Gayakwad, MS');
  const [doctorLicense, setDoctorLicense] = useState(() => currentUser?.licenseId || 'MCI-REG-44912');
  const [doctorHospitalName, setDoctorHospitalName] = useState(() => doctorHospital || 'District Tele-Ophthalmology Hospital');

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
        
        if (currentPatient.doctorReport.doctorName && !currentPatient.doctorReport.doctorName.includes('Arvind')) {
          setDoctorName(currentPatient.doctorReport.doctorName);
        } else if (currentUser?.name && !currentUser.name.includes('Arvind')) {
          setDoctorName(currentUser.name);
        } else {
          setDoctorName('Dr. Vivek Gayakwad, MS');
        }

        if (currentPatient.doctorReport.doctorLicense) {
          setDoctorLicense(currentPatient.doctorReport.doctorLicense);
        } else if (currentUser?.licenseId) {
          setDoctorLicense(currentUser.licenseId);
        }

        if (currentPatient.doctorReport.doctorHospital || currentPatient.hospitalName) {
          setDoctorHospitalName(currentPatient.doctorReport.doctorHospital || currentPatient.hospitalName);
        }
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

        if (currentUser?.name && !currentUser.name.includes('Arvind')) {
          setDoctorName(currentUser.name);
        } else {
          setDoctorName('Dr. Vivek Gayakwad, MS');
        }

        if (currentUser?.licenseId) {
          setDoctorLicense(currentUser.licenseId);
        }
        if (doctorHospital) {
          setDoctorHospitalName(doctorHospital);
        }
      }
    }
  }, [currentPatient, currentUser, doctorHospital]);

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

  // Build active dossier object including current doctor identity
  const getActivePatientReport = () => ({
    ...currentPatient,
    doctorReport: {
      ...(currentPatient?.doctorReport || {}),
      finalDiagnosis,
      doctorNotes,
      healthStatus,
      followUpDate,
      prescriptions,
      doctorName: doctorName.trim() || 'Dr. Vivek Gayakwad, MS',
      doctorLicense: doctorLicense.trim() || 'MCI-REG-44912',
      doctorHospital: doctorHospitalName.trim() || doctorHospital,
      doctorOrganization: doctorHospitalName.trim() || doctorHospital,
      doctorQualification: currentUser?.qualification || 'MS (Ophthalmology)',
      reviewedByDoctor: `${doctorName.trim() || 'Dr. Vivek Gayakwad, MS'} (${doctorLicense.trim() || 'MCI-REG-44912'})`
    }
  });

  // Save Report
  const handleSave = (e) => {
    e.preventDefault();
    if (!currentPatient) return;

    const activeDocName = doctorName.trim() || 'Dr. Vivek Gayakwad, MS';
    const activeDocLicense = doctorLicense.trim() || 'MCI-REG-44912';
    const activeDocHospital = doctorHospitalName.trim() || doctorHospital;

    saveDoctorReport(
      currentPatient.id,
      {
        finalDiagnosis,
        doctorNotes,
        healthStatus,
        followUpDate,
        prescriptions,
        doctorName: activeDocName,
        doctorLicense: activeDocLicense,
        doctorHospital: activeDocHospital
      },
      {
        ...currentUser,
        name: activeDocName,
        fullName: activeDocName,
        licenseId: activeDocLicense,
        currentOrganization: activeDocHospital
      }
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
    if (currentPatient && window.confirm(`Remove patient ${currentPatient.name} from hospital records?`)) {
      deletePatient(currentPatient.id);
    }
  };

  if (!currentPatient) {
    return (
      <div className="p-8 rounded-3xl bg-[#073B4C] border border-[#0F5E78] text-center space-y-4">
        <Building2 className="w-12 h-12 text-[#FFD166] mx-auto opacity-60" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">No Hospital Patients in Queue</h3>
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
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                currentPatient.ashaRiskAssessment?.riskCategory === 'High' ? 'bg-rose-100 text-rose-700' :
                currentPatient.ashaRiskAssessment?.riskCategory === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                {currentPatient.ashaRiskAssessment?.riskCategory || 'Low'} Risk
              </span>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-2xl bg-[#052631] border border-[#0F5E78]">
                <p className="text-[#CFE2E8]">{t('hba1cLevel')}</p>
                <p className="text-base font-bold text-white mt-0.5">{currentPatient.vitals?.hba1c || '7.8'}%</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#052631] border border-[#0F5E78]">
                <p className="text-[#CFE2E8]">{t('bloodPressure')}</p>
                <p className="text-base font-bold text-white mt-0.5">{currentPatient.vitals?.bloodPressure || '135/85'}</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#052631] border border-[#0F5E78]">
                <p className="text-[#CFE2E8]">{t('diabetesDuration')}</p>
                <p className="text-base font-bold text-white mt-0.5">{currentPatient.vitals?.bloodSugarYears || '6'} Yrs</p>
              </div>
            </div>

            {/* ASHA Risk Score & Referral Reason */}
            {currentPatient.ashaRiskAssessment && (
              <div className="p-3.5 rounded-2xl bg-[#052631] border border-[#0F5E78] text-xs space-y-1">
                <div className="flex items-center justify-between text-[#CFE2E8]">
                  <span>Tier 1 ASHA Screening Score:</span>
                  <span className="font-bold text-white">{currentPatient.ashaRiskAssessment.score || 45}%</span>
                </div>
                <p className="text-[#CFE2E8] italic">
                  "{currentPatient.ashaRiskAssessment.recommendation || 'Patient referred for dilated eye exam.'}"
                </p>
              </div>
            )}

          </div>

          {/* Fundus Imaging & Grad-CAM Heatmap Viewer */}
          <div className="bg-[#073B4C] text-white rounded-3xl border border-[#0F5E78] p-6 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#0F5E78] pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#FFD166]" />
                <h3 className="font-bold text-sm text-white">
                  {t('fundusGradCamViewer')}
                </h3>
              </div>

              {currentPatient.fundusImaging && (
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#052631] text-[#FFD166] font-mono font-bold border border-[#0F5E78]">
                    {currentPatient.fundusImaging.stage || 'Moderate NPDR'}
                  </span>
                  <button
                    onClick={handleRemoveEyeImage}
                    title="Remove Fundus Image"
                    className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 transition-colors cursor-pointer"
                  >
                    <ImageOff className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {currentPatient.fundusImaging ? (
              <div className="space-y-4">
                
                {/* Canvas Container */}
                <div className="relative rounded-2xl overflow-hidden border border-[#0F5E78] bg-[#052631] aspect-[4/3] flex items-center justify-center">
                  <img
                    src={currentPatient.fundusImaging.imageUrl}
                    alt="Fundus Base"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  />
                </div>

                {/* Controls Bar */}
                <div className="p-3 rounded-2xl bg-[#052631] border border-[#0F5E78] flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2 flex-1">
                    <Sliders className="w-3.5 h-3.5 text-[#CFE2E8]" />
                    <span className="text-[#CFE2E8] font-medium">{t('heatmapIntensity')}:</span>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={heatmapOpacity}
                      onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                      className="flex-1 accent-[#FFD166] h-1.5 bg-[#073B4C] rounded-lg cursor-pointer"
                    />
                    <span className="font-mono text-[#FFD166] text-[11px] w-8">
                      {Math.round(heatmapOpacity * 100)}%
                    </span>
                  </div>

                  <label className="flex items-center gap-1.5 text-[#CFE2E8] font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLesionBoxes}
                      onChange={(e) => setShowLesionBoxes(e.target.checked)}
                      className="rounded accent-[#FFD166]"
                    />
                    <span>{t('lesionBoxes')}</span>
                  </label>
                </div>

                {/* AI Summary */}
                <div className="text-xs text-[#CFE2E8] space-y-1">
                  <p><strong className="text-white">DR Probability:</strong> {currentPatient.fundusImaging.drPercentage || 68}%</p>
                  <p><strong className="text-white">Optical Lesions:</strong> {currentPatient.fundusImaging.findingsSummary || 'Microaneurysms detected in macula.'}</p>
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#CFE2E8] space-y-2">
                <Eye className="w-8 h-8 text-[#0F5E78] mx-auto opacity-50" />
                <p>No retinal image uploaded by nurse yet.</p>
                <p className="text-[11px] text-[#CFE2E8]/60">You can still record clinical impression and preliminary directives.</p>
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: Diagnostic Report & Prescriptions */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="bg-[#073B4C] text-white rounded-3xl border border-[#0F5E78] p-6 shadow-sm space-y-6">
            
            <div className="flex items-center gap-2 border-b border-[#0F5E78] pb-3">
              <FileEdit className="w-5 h-5 text-[#FFD166]" />
              <div>
                <h3 className="font-bold text-base text-white">
                  {t('clinicalDossierSignoff')}
                </h3>
                <p className="text-xs text-[#CFE2E8]">
                  Final diagnosis and therapeutic plan issued to patient record
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              
              {/* 1. Final Diagnosis */}
              <div className="space-y-1.5 text-xs">
                <label className="block font-semibold text-[#CFE2E8]">
                  {t('finalDiagnosis')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={finalDiagnosis}
                  onChange={(e) => setFinalDiagnosis(e.target.value)}
                  placeholder="e.g. Moderate Non-Proliferative Diabetic Retinopathy (NPDR) with Macular Edema"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#0F5E78] bg-[#052631] text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FFD166]"
                  required
                />
              </div>

              {/* 2. Action / Health Status */}
              <div className="space-y-1.5 text-xs">
                <label className="block font-semibold text-[#CFE2E8]">
                  {t('recommendedAction')} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={healthStatus}
                  onChange={(e) => setHealthStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#0F5E78] bg-[#052631] text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FFD166]"
                >
                  <option value="Laser Treatment Advised">{t('laserTreatmentAdvised')}</option>
                  <option value="Anti-VEGF Therapy Needed">{t('antiVegfTherapy')}</option>
                  <option value="Under Close Observation">{t('underCloseObservation')}</option>
                  <option value="Stable & Controlled">{t('stableControlled')}</option>
                  <option value="Immediate Surgical Referral">{t('surgicalReferral')}</option>
                </select>
              </div>

              {/* 3. Clinical Notes */}
              <div className="space-y-1.5 text-xs">
                <label className="block font-semibold text-[#CFE2E8]">
                  {t('clinicalObservations')} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Enter detailed ophthalmic findings, macular thickness evaluation, and systemic control instructions..."
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
                    <div key={idx} className="p-2.5 rounded-xl bg-[#052631] text-white border border-[#0F5E78] flex items-center justify-between text-xs">
                      <span className="text-white">{rx}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePrescription(idx)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
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
                    className="px-3 py-2 rounded-xl bg-[#052631] hover:bg-[#0F5E78] text-[#FFD166] text-xs font-bold flex items-center gap-1 border border-[#0F5E78] cursor-pointer"
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

              {/* 6. Doctor Identity & Digital Signature Verification */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#052631] border border-[#0F5E78]">
                <div className="flex items-center justify-between border-b border-[#0F5E78] pb-2">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-[#FFD166]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Doctor Identity & Digital Signature
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    Official Signer
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="block font-semibold text-[#CFE2E8]">
                      Consulting Doctor Name & Degree <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      placeholder="e.g. Dr. Vivek Gayakwad, MS (Ophthalmology)"
                      className="w-full px-3 py-2 rounded-xl border border-[#0F5E78] bg-[#073B4C] text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FFD166]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-semibold text-[#CFE2E8]">
                      Medical Registration / License No. <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={doctorLicense}
                      onChange={(e) => setDoctorLicense(e.target.value)}
                      placeholder="e.g. MCI-REG-44912"
                      className="w-full px-3 py-2 rounded-xl border border-[#0F5E78] bg-[#073B4C] text-white text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#FFD166]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-[#073B4C]/20 transition-all cursor-pointer"
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
                  onClick={() => onOpenNotify(getActivePatientReport())}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send WhatsApp Notification</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenDownload(getActivePatientReport())}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#052631] hover:bg-[#0F5E78] border border-[#0F5E78] text-[#FFD166] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('downloadPdfReport')}</span>
                </button>
              </div>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}
