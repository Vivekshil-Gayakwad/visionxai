import React, { useState, useEffect } from 'react';
import { usePatients } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { predictDRImage, predictRiskApi } from '../../lib/api';
import {
  Camera,
  Upload,
  BrainCircuit,
  CheckCircle2,
  Send,
  Trash2,
  ImageOff,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Info
} from 'lucide-react';

// ETDRS Grade color mapping for UI
const GRADE_COLORS = {
  0: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-800 dark:text-emerald-300', badge: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200' },
  1: { bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-300 dark:border-yellow-700', text: 'text-yellow-800 dark:text-yellow-300', badge: 'bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-200' },
  2: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-300 dark:border-orange-700', text: 'text-orange-800 dark:text-orange-300', badge: 'bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200' },
  3: { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-300 dark:border-rose-700', text: 'text-rose-800 dark:text-rose-300', badge: 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200' },
  4: { bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-red-400 dark:border-red-700', text: 'text-red-900 dark:text-red-300', badge: 'bg-red-200 dark:bg-red-900/70 text-red-900 dark:text-red-200' },
};

export function NurseFundusImaging({ selectedPatientId, onSelectPatientId, onImagingCompleted }) {
  const { patients, recordNurseFundusImaging, removePatientFundusImage, deletePatient } = usePatients();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  // Strict Hospital Isolation: Only receive appointments scheduled for this nurse's hospital
  const nurseHospital = currentUser?.currentOrganization || 'Khandala Sub-District Civil Hospital';
  const displayPatients = patients.filter(p => {
    return (p.hospitalName || '').toLowerCase().trim() === nurseHospital.toLowerCase().trim();
  });

  const targetPatient = displayPatients.find(p => p.id === selectedPatientId) || displayPatients[0];

  const [customImageUri, setCustomImageUri] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isReportGenerated, setIsReportGenerated] = useState(false);

  // Load existing imaging data if patient already has a scan
  useEffect(() => {
    if (targetPatient?.fundusImaging) {
      setCustomImageUri(targetPatient.fundusImaging.imageUrl || null);
      setAnalysisResult({
        drGrade: targetPatient.fundusImaging.drGrade ?? targetPatient.fundusImaging.dr_grade ?? null,
        drSeverity: targetPatient.fundusImaging.drSeverity || targetPatient.fundusImaging.dr_severity || 'Unknown',
        icdrLevel: targetPatient.fundusImaging.icdrLevel || targetPatient.fundusImaging.icdr_level || '',
        gradeDescription: targetPatient.fundusImaging.gradeDescription || targetPatient.fundusImaging.grade_description || '',
        drPresenceProbability: targetPatient.fundusImaging.drPresenceProbability ?? targetPatient.fundusImaging.dr_presence_probability ?? null,
        gradeConfidence: targetPatient.fundusImaging.gradeConfidence ?? targetPatient.fundusImaging.grade_confidence ?? null,
        gradeProbabilities: targetPatient.fundusImaging.gradeProbabilities || targetPatient.fundusImaging.grade_probabilities || null,
        urgency: targetPatient.fundusImaging.urgency || '',
        clinicalAction: targetPatient.fundusImaging.clinicalAction || targetPatient.fundusImaging.clinical_action || '',
        findings: targetPatient.fundusImaging.findings || [],
        modelEngine: targetPatient.fundusImaging.modelEngine || targetPatient.fundusImaging.model_engine || '',
        multimodalScore: targetPatient.fundusImaging.multimodalScore ?? null,
        imageScore: targetPatient.fundusImaging.imageScore ?? null,
        clinicalScore: targetPatient.fundusImaging.clinicalScore ?? null,
        imageUrl: targetPatient.fundusImaging.imageUrl,
      });
      setIsReportGenerated(true);
    } else {
      setCustomImageUri(null);
      setAnalysisResult(null);
      setIsReportGenerated(false);
    }
  }, [targetPatient]);

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setValidationError(null);
      setAnalysisResult(null);
      setIsReportGenerated(false);
      const reader = new FileReader();
      reader.onload = (event) => setCustomImageUri(event.target?.result);
      reader.readAsDataURL(file);
    }
  };

  // Main AI Analysis — 100% Backend Multimodal AI Engine
  const handleCalculateDr = async () => {
    if (!uploadedFile) {
      setValidationError('Please upload a retinal fundus photograph to run AI analysis. Use a digital fundus camera image.');
      return;
    }

    setIsCalculating(true);
    setValidationError(null);
    setAnalysisResult(null);

    try {
      // Combine targetPatient demographics with vitals for full multimodal transmission
      const clinicalPayload = targetPatient ? {
        ...(targetPatient.vitals || {}),
        age: targetPatient.age,
        gender: targetPatient.gender,
      } : null;
      const drRes = await predictDRImage(uploadedFile, clinicalPayload);

      if (drRes && drRes.valid === false) {
        setValidationError(drRes.message || 'Image rejected: Does not match retinal fundus optical characteristics.');
        setIsCalculating(false);
        return;
      }

      setAnalysisResult({
        drGrade: drRes.dr_grade ?? 0,
        drSeverity: drRes.dr_severity ?? 'No DR',
        icdrLevel: drRes.icdr_level ?? '',
        gradeDescription: drRes.grade_description ?? '',
        drPresenceProbability: drRes.dr_presence_probability ?? null,
        gradeConfidence: drRes.grade_confidence ?? null,
        gradeProbabilities: drRes.grade_probabilities ?? null,
        urgency: drRes.urgency ?? '',
        clinicalAction: drRes.clinical_action ?? '',
        findings: drRes.findings ?? [],
        modelEngine: drRes.model_engine ?? 'VisionXAI Multimodal AI',
        multimodalScore: drRes.multimodal_score ?? null,
        imageScore: drRes.image_dr_score ?? null,
        clinicalScore: drRes.clinical_risk_score ?? null,
        fusionNote: drRes.fusion_note ?? '',
        imageBiomarkers: drRes.image_biomarkers ?? null,
        inferenceTimeMs: drRes.inference_time_ms ?? null,
        imageUrl: customImageUri,
      });

    } catch (err) {
      const msg = err.message || '';
      let errorDetail = null;
      try {
        const jsonStart = msg.indexOf('{');
        if (jsonStart !== -1) {
          const parsed = JSON.parse(msg.slice(jsonStart));
          if (parsed.detail) errorDetail = parsed.detail;
        }
      } catch (_) {}

      const isNetworkError = msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('net::ERR_CONNECTION');
      const is500Error = msg.includes('500');
      const is400Error = msg.includes('400');

      if (isNetworkError) {
        setValidationError('Backend AI server is unreachable. Please ensure the backend server is running (uvicorn app.main:app --reload).');
      } else if (is500Error) {
        setValidationError(`Backend AI Server Error (HTTP 500): ${errorDetail || 'Internal engine error during multimodal synthesis. Check server logs.'}`);
      } else if (errorDetail) {
        setValidationError(`Image Analysis Error: ${errorDetail}`);
      } else if (is400Error || msg.toLowerCase().includes('retin') ||
          msg.toLowerCase().includes('spectrum') || msg.toLowerCase().includes('valid') ||
          msg.toLowerCase().includes('ratio') || msg.toLowerCase().includes('aperture')) {
        setValidationError('Non-Retinal Image Rejected: This file does not match digital retinal fundus optical characteristics (fails choroidal red-orange spectrum & circular aperture checks). Please upload a genuine digital fundus camera scan.');
      } else {
        setValidationError(`AI analysis error: ${msg || 'Unknown error occurred during processing.'}`);
      }
    } finally {
      setIsCalculating(false);
    }
  };

  // Save and forward to Doctor portal
  const handleGenerateReportAndSync = () => {
    if (!analysisResult || !targetPatient) return;
    recordNurseFundusImaging(
      targetPatient.id,
      null, // no preset id
      customImageUri || analysisResult.imageUrl,
      currentUser,
      analysisResult
    );
    setIsReportGenerated(true);
    setTimeout(() => onImagingCompleted && onImagingCompleted(), 1200);
  };

  const handleRemoveEyeImage = () => {
    if (targetPatient && window.confirm('Are you sure you want to remove this eye image and reset AI calculations?')) {
      removePatientFundusImage(targetPatient.id);
      setCustomImageUri(null);
      setUploadedFile(null);
      setValidationError(null);
      setAnalysisResult(null);
      setIsReportGenerated(false);
    }
  };

  const handleDeletePatient = () => {
    if (targetPatient && window.confirm(`Remove patient record "${targetPatient.name}"?`)) {
      deletePatient(targetPatient.id);
    }
  };

  if (!displayPatients || displayPatients.length === 0) {
    return (
      <div className="bg-[#073B4C] text-white rounded-3xl border border-[#0F5E78] p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#052631] border border-[#0F5E78] text-[#FFD166] mx-auto flex items-center justify-center">
          <Camera className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">No Appointments for {nurseHospital}</h3>
          <p className="text-xs text-[#CFE2E8] leading-relaxed">
            Strict hospital isolation active. Appointments booked by ASHA workers to <strong>{nurseHospital}</strong> will automatically appear in your exam chair queue.
          </p>
        </div>
      </div>
    );
  }

  const gradeColors = GRADE_COLORS[analysisResult?.drGrade ?? 0];

  return (
    <div className="space-y-8">

      {/* 1. Patient Selector Header */}
      <div className="p-6 rounded-3xl bg-[#073B4C] border border-[#0F5E78] shadow-sm space-y-4 relative overflow-hidden">
        <div className="shape-half-circle shape-half-circle-tr w-24 h-24 pointer-events-none opacity-30 dark:opacity-20" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0F5E78] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-[#FFD166] dark:text-[#FFD166]">{t('examChairQueue')}</span>
              <span className="text-[10px] text-[#CFE2E8] font-mono bg-[#052631] px-2 py-0.5 rounded border border-[#0F5E78]">
                {nurseHospital}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white dark:text-white mt-0.5">{t('examChairQueue')}</h2>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={targetPatient?.id || ''}
              onChange={(e) => onSelectPatientId(e.target.value)}
              className="w-full sm:w-72 px-3.5 py-2.5 rounded-xl border border-[#0F5E78] bg-[#052631] text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FFD166]"
            >
              {displayPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id}) - {p.fundusImaging ? '✓ Scanned' : '⏳ Awaiting Scan'}
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

        {/* Patient clinical vitals from ASHA survey */}
        {targetPatient && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#073B4C] text-white border border-[#0F5E78]">
              <span className="text-[10px] text-[#CFE2E8]">Demographics</span>
              <p className="font-bold text-white text-sm truncate">{targetPatient.name}</p>
              <p className="text-[11px] text-[#FFD166]">{targetPatient.age} Y / {targetPatient.gender}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#073B4C] text-white border border-[#0F5E78]">
              <span className="text-[10px] text-[#CFE2E8]">Long-term Glycemia</span>
              <p className="font-bold text-rose-400 text-sm font-mono">{targetPatient.vitals?.hba1c}% HbA1c</p>
              <p className="text-[11px] text-[#CFE2E8]">{targetPatient.vitals?.bloodSugarYears} Yrs Duration</p>
            </div>
            <div className="p-3 rounded-xl bg-[#073B4C] text-white border border-[#0F5E78]">
              <span className="text-[10px] text-[#CFE2E8]">Blood Pressure</span>
              <p className="font-bold text-white text-sm font-mono">{targetPatient.vitals?.bloodPressure}</p>
              <p className="text-[11px] text-[#CFE2E8]">{targetPatient.vitals?.hasHighBp ? 'Hypertensive' : 'Normotensive'}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#073B4C] text-white border border-[#0F5E78]">
              <span className="text-[10px] text-[#CFE2E8]">ASHA Field Risk</span>
              <p className="font-bold text-amber-400 text-sm">{targetPatient.ashaRiskAssessment?.riskCategory} ({targetPatient.ashaRiskAssessment?.score}%)</p>
              <p className="text-[11px] text-[#FFD166] font-mono">Ref: {targetPatient.registeredByAsha?.split(' ')[0]}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#073B4C] text-white border border-[#0F5E78] col-span-2 sm:col-span-1">
              <span className="text-[10px] text-[#CFE2E8]">Symptoms Reported</span>
              <p className="font-bold text-white text-[11px] line-clamp-2">
                {targetPatient.vitals?.symptoms?.join(', ') || 'None recorded'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Imaging Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Image Upload */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#073B4C] text-white rounded-3xl border border-[#0F5E78] p-6 sm:p-7 shadow-sm space-y-5 relative overflow-hidden">
            <div className="shape-half-circle shape-half-circle-tr w-20 h-20 pointer-events-none opacity-30 dark:opacity-20" />

            <div className="flex items-center justify-between border-b border-[#0F5E78] pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#FFD166] dark:text-[#FFD166]" />
                <h3 className="text-base font-bold text-white dark:text-white">Digital Fundus Camera Imaging</h3>
              </div>
              {(customImageUri || analysisResult) && (
                <button
                  type="button"
                  onClick={handleRemoveEyeImage}
                  className="px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ImageOff className="w-3.5 h-3.5" />
                  <span>{t('removeEyeImage')}</span>
                </button>
              )}
            </div>

            {/* Important notice about presets removed */}
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <span>
                <strong>Upload required for AI analysis.</strong> Only genuine retinal fundus photographs from a digital fundus camera will be accepted. Non-retinal images are automatically rejected by the optical validation system.
              </span>
            </div>

            {/* Upload Zone */}
            <div className="pt-1">
              <label className="p-5 rounded-2xl border-2 border-dashed border-[#0F5E78] dark:border-[#0F5E78] hover:border-[#FFD166] bg-[#052631]/30 dark:bg-[#052631]/30 hover:bg-[#052631]/60 dark:hover:bg-[#052631]/60 transition-all flex flex-col items-center justify-center cursor-pointer text-center space-y-2 group">
                <Upload className="w-7 h-7 text-[#FFD166] dark:text-[#FFD166] group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-sm font-bold text-white group-hover:text-[#FFD166] transition-colors">
                  {uploadedFile ? `✓ ${uploadedFile.name}` : t('uploadFundusPhoto')}
                </span>
                <span className="text-[11px] text-[#CFE2E8] dark:text-slate-400">
                  Accepts: Digital fundus camera photo exports (JPG, PNG, TIFF)
                </span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start gap-3 text-xs animate-in fade-in shadow-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-rose-900 dark:text-rose-200">Image Rejected</p>
                  <p className="text-rose-700 dark:text-rose-300 leading-relaxed">{validationError}</p>
                </div>
              </div>
            )}

            {/* Retinal Image Viewport */}
            {customImageUri && (
              <div className="relative w-full aspect-square max-w-lg mx-auto rounded-2xl overflow-hidden border-2 border-[#0F5E78] dark:border-[#0F5E78] bg-black shadow-lg">
                <img
                  src={customImageUri}
                  alt="Uploaded Retinal Fundus"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-[#073B4C] border border-[#0F5E78] text-[11px] font-mono font-bold text-white flex items-center gap-1.5 shadow-sm">
                  <span className={`w-2 h-2 rounded-full ${analysisResult ? 'bg-emerald-500' : 'bg-[#FFD166] dark:bg-[#FFD166] animate-pulse'}`} />
                  <span>{analysisResult ? 'AI Analysis Complete' : 'Awaiting Analysis'}</span>
                </div>
                {analysisResult && (
                  <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-[#073B4C] border border-[#0F5E78] text-xs font-bold text-white shadow-sm text-center">
                    <div className="text-[10px] text-[#CFE2E8]">ETDRS Grade</div>
                    <div>{analysisResult.drGrade} — {analysisResult.drSeverity}</div>
                  </div>
                )}
              </div>
            )}

            {/* Calculate Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCalculateDr}
                disabled={isCalculating || !uploadedFile}
                className="w-full py-3.5 rounded-xl bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-[#073B4C]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalculating ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Running AI Analysis...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-5 h-5 text-[#073B4C]" />
                    <span>{t('calculateDrBtn')}</span>
                  </>
                )}
              </button>
              {!uploadedFile && (
                <p className="text-center text-xs text-[#CFE2E8] dark:text-slate-400 mt-2">
                  Upload a fundus image above to enable analysis
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: AI Analysis Results */}
        <div className="lg:col-span-5 space-y-6">
          {analysisResult ? (
            <div className="bg-[#073B4C] text-white rounded-3xl border border-[#0F5E78] p-6 sm:p-7 shadow-sm space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden">
              <div className="shape-half-circle shape-half-circle-bl w-24 h-24 pointer-events-none opacity-30 dark:opacity-20" />

              <div className="flex items-center justify-between border-b border-[#0F5E78] pb-3">
                <span className="text-xs uppercase font-bold tracking-wider text-white dark:text-white">
                  {analysisResult.multimodalScore != null ? 'Multimodal DR Assessment' : 'Deep Learning DR Assessment'}
                </span>
                {analysisResult.gradeConfidence != null && (
                  <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                    Confidence: {analysisResult.gradeConfidence}%
                  </span>
                )}
              </div>

              {/* Primary: ETDRS DR Grade — the clinical gold standard */}
              <div className={`p-5 rounded-2xl border-2 text-center space-y-2 shadow-sm ${gradeColors.bg} ${gradeColors.border}`}>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#CFE2E8]">
                  ETDRS / ICDR Diabetic Retinopathy Grade
                </p>
                <div className={`text-5xl sm:text-6xl font-black font-mono ${gradeColors.text}`}>
                  {analysisResult.drGrade}
                </div>
                <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${gradeColors.badge}`}>
                  {analysisResult.drSeverity}
                </div>
                {analysisResult.icdrLevel && (
                  <p className="text-[11px] text-[#CFE2E8] dark:text-slate-400 font-mono">
                    {analysisResult.icdrLevel}
                  </p>
                )}
                {analysisResult.gradeDescription && (
                  <p className="text-xs text-[#CFE2E8] leading-relaxed max-w-xs mx-auto">
                    {analysisResult.gradeDescription}
                  </p>
                )}
              </div>

              {/* Multimodal breakdown (if clinical fusion was done) */}
              {analysisResult.multimodalScore != null && (
                <div className="p-3.5 rounded-xl bg-[#052631]/70 dark:bg-[#00080C]/30 border border-[#0F5E78] space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#FFD166] dark:text-[#FFD166]">
                    Multimodal AI Fusion (Image 65% + Clinical 35%)
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-mono font-bold border border-blue-200 dark:border-blue-800/40">
                      🔵 Image DR Probability: {analysisResult.imageScore?.toFixed(1)}%
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono font-bold border border-amber-200 dark:border-amber-800/40">
                      🟡 Clinical Risk: {analysisResult.clinicalScore?.toFixed(1)}%
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#052631] dark:bg-[#00080C]/70 text-[#FFD166] dark:text-[#FFD166] font-mono font-bold border border-[#0F5E78]/40">
                      ⚡ Fused Progression Index: {analysisResult.multimodalScore?.toFixed(1)}%
                    </span>
                  </div>
                  {analysisResult.fusionNote && (
                    <p className="text-[11px] text-[#CFE2E8] leading-relaxed bg-[#073B4C]/60 dark:bg-[#00080C]/60 p-2.5 rounded-lg border border-[#0F5E78]/60">
                      💡 <strong>Clinical Synthesis:</strong> {analysisResult.fusionNote}
                    </p>
                  )}
                </div>
              )}

              {/* Measured Optical Retinal Biomarkers */}
              {analysisResult.imageBiomarkers && (
                <div className="p-3.5 rounded-xl bg-[#052631]/50 dark:bg-[#00080C]/20 border border-[#0F5E78]/60 space-y-2 text-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white dark:text-white">
                    Measured Ophthalmic Biomarkers (Computer Vision)
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-[#073B4C]/70 dark:bg-[#00080C]/70 border border-[#0F5E78]/30">
                      <span className="text-[10px] text-[#CFE2E8] block truncate">Hemorrhage/MA</span>
                      <span className="font-mono font-bold text-rose-400 text-xs">
                        {analysisResult.imageBiomarkers.hemorrhage_density_pct}%
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#073B4C]/70 dark:bg-[#00080C]/70 border border-[#0F5E78]/30">
                      <span className="text-[10px] text-[#CFE2E8] block truncate">Lipid Exudates</span>
                      <span className="font-mono font-bold text-amber-400 text-xs">
                        {analysisResult.imageBiomarkers.exudate_density_pct}%
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#073B4C]/70 dark:bg-[#00080C]/70 border border-[#0F5E78]/30">
                      <span className="text-[10px] text-[#CFE2E8] block truncate">Vascular Shear</span>
                      <span className="font-mono font-bold text-[#FFD166] text-xs">
                        {analysisResult.imageBiomarkers.vascular_irregularity}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* DR Presence Probability */}
              {analysisResult.drPresenceProbability != null && (
                <div className="p-3.5 rounded-xl bg-[#073B4C] text-white border border-[#0F5E78] space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#FFD166] dark:text-[#FFD166] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    DR Presence Probability
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-[#052631] dark:bg-[#00080C] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${analysisResult.drPresenceProbability > 70 ? 'bg-rose-500' : analysisResult.drPresenceProbability > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${analysisResult.drPresenceProbability}%` }}
                      />
                    </div>
                    <span className={`text-sm font-black font-mono ${analysisResult.drPresenceProbability > 70 ? 'text-rose-700 dark:text-rose-400' : analysisResult.drPresenceProbability > 40 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {analysisResult.drPresenceProbability}%
                    </span>
                  </div>
                  <p className="text-[10px] text-[#CFE2E8] dark:text-slate-400">
                    Probability that diabetic retinopathy IS present (Grade ≥ 1)
                  </p>
                </div>
              )}

              {/* Grade Probability Distribution */}
              {analysisResult.gradeProbabilities && (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-white dark:text-white">
                    Grade Probability Distribution
                  </p>
                  <div className="space-y-1">
                    {Object.entries(analysisResult.gradeProbabilities).map(([label, pct], i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="text-[10px] text-[#CFE2E8] w-36 shrink-0 truncate">{label}</span>
                        <div className="flex-1 h-1.5 bg-[#052631] dark:bg-[#00080C] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${i === analysisResult.drGrade ? 'bg-[#FFD166]' : 'bg-[#0F5E78] dark:bg-[#0F5E78]'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`font-mono text-[10px] w-10 text-right ${i === analysisResult.drGrade ? 'font-bold text-[#FFD166]' : 'text-[#CFE2E8]'}`}>
                          {pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical Urgency & Action */}
              {analysisResult.urgency && (
                <div className={`p-4 rounded-2xl border-2 space-y-2 ${analysisResult.drGrade >= 3 ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800' : 'bg-[#073B4C] text-white border border-[#0F5E78]'}`}>
                  <div className="flex items-center gap-2 text-xs font-bold text-white dark:text-white">
                    <ShieldAlert className={`w-4 h-4 ${analysisResult.drGrade >= 3 ? 'text-rose-600 dark:text-rose-400' : 'text-[#FFD166] dark:text-[#FFD166]'}`} />
                    <span>Clinical Urgency: {analysisResult.urgency}</span>
                  </div>
                  <p className="text-xs text-[#CFE2E8] leading-relaxed">
                    {analysisResult.clinicalAction}
                  </p>
                </div>
              )}

              {/* Clinical Findings */}
              {analysisResult.findings && analysisResult.findings.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-white dark:text-white uppercase tracking-wider">
                    Clinical Findings
                  </p>
                  <div className="space-y-1 text-xs">
                    {analysisResult.findings.map((f, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-[#052631]/50 border border-[#0F5E78]/40 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFD166] mt-1.5 shrink-0" />
                        <span className="text-[#CFE2E8]">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Model info & Compute Time */}
              {analysisResult.modelEngine && (
                <div className="flex items-center justify-between text-[10px] text-[#CFE2E8] dark:text-slate-500 font-mono border-t border-[#0F5E78] pt-2">
                  <span>Engine: {analysisResult.modelEngine}</span>
                  {analysisResult.inferenceTimeMs && (
                    <span className="text-[#FFD166] dark:text-[#FFD166] font-bold">
                      ⏱ {analysisResult.inferenceTimeMs}ms compute
                    </span>
                  )}
                </div>
              )}

              {/* Forward to Doctor */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleGenerateReportAndSync}
                  className="w-full py-3.5 rounded-xl bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-[#073B4C]/20 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('forwardToDoctor')}</span>
                </button>
              </div>

              {isReportGenerated && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('dossierSynced')}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#073B4C] text-white rounded-3xl border border-[#0F5E78] p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[380px] shadow-sm relative overflow-hidden">
              <div className="shape-half-circle shape-half-circle-tr w-20 h-20 pointer-events-none opacity-30 dark:opacity-20" />
              <div className="w-16 h-16 rounded-2xl bg-[#052631] dark:bg-[#00080C]/40 border border-[#0F5E78] text-[#FFD166] dark:text-[#FFD166] flex items-center justify-center">
                <BrainCircuit className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-2 max-w-xs">
                <h3 className="text-base font-bold text-white dark:text-white">Awaiting Retinal AI Analysis</h3>
                <p className="text-xs text-[#CFE2E8] leading-relaxed">
                  Upload a <strong>genuine retinal fundus photograph</strong> from a digital fundus camera, then click <strong>"{t('calculateDrBtn')}"</strong>.
                </p>
                <div className="p-3 rounded-xl bg-[#052631] dark:bg-[#00080C]/40 border border-[#0F5E78] text-left space-y-1">
                  <p className="text-[10px] font-bold text-[#FFD166] dark:text-[#FFD166] uppercase tracking-wider">AI will return:</p>
                  <p className="text-[11px] text-[#CFE2E8]">• ETDRS DR Grade (0–4) — clinical gold standard</p>
                  <p className="text-[11px] text-[#CFE2E8]">• DR Presence Probability (%)</p>
                  <p className="text-[11px] text-[#CFE2E8]">• Grade probability distribution</p>
                  <p className="text-[11px] text-[#CFE2E8]">• Clinical urgency &amp; action</p>
                  {targetPatient?.vitals && (
                    <p className="text-[11px] text-[#FFD166] dark:text-[#FFD166] font-semibold">• Multimodal fusion with ASHA clinical risk</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
