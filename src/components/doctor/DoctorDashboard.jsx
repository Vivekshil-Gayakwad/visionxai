import React, { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Search, 
  Filter, 
  User, 
  FileEdit, 
  Send, 
  Download, 
  MessageSquare, 
  Trash2,
  ImageOff,
  Stethoscope,
  Building2
} from 'lucide-react';

export function DoctorDashboard({ onOpenEditor, onOpenNotify, onOpenDownload }) {
  const { patients, deletePatient, removePatientFundusImage } = usePatients();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const doctorHospital = currentUser?.currentOrganization || 'Khandala Sub-District Civil Hospital';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('All'); // 'All' | 'Awaiting Review' | 'Reviewed'

  const filteredPatients = patients.filter((p) => {
    // Strict Hospital Isolation: Only receive diagnostic reports for this doctor's hospital
    const matchHospital = (p.hospitalName || '').toLowerCase().trim() === doctorHospital.toLowerCase().trim();
    if (!matchHospital) return false;

    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.village && p.village.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.mobile.includes(searchTerm);

    if (filterStage === 'Awaiting Review') {
      return matchesSearch && !p.doctorReport;
    }
    if (filterStage === 'Reviewed') {
      return matchesSearch && Boolean(p.doctorReport);
    }
    return matchesSearch;
  });

  const handleDelete = (patientId, patientName, e) => {
    e && e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete patient "${patientName}" (${patientId})?`)) {
      deletePatient(patientId);
    }
  };

  const handleRemoveImage = (patientId, e) => {
    e && e.stopPropagation();
    if (window.confirm('Remove retinal fundus image for this patient?')) {
      removePatientFundusImage(patientId);
    }
  };

  return (
    <div className="space-y-6">

      {/* Hospital Facility Banner */}
      <div className="p-4 rounded-2xl bg-[#073B4C] border border-[#0F5E78] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#052631] border border-[#0F5E78] text-[#FFD166] flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#CFE2E8] text-xs">Assigned Medical Facility:</span>
              <strong className="text-white text-xs font-semibold">{doctorHospital}</strong>
            </div>
            <p className="text-[11px] text-[#CFE2E8]/70">
              Strict isolation active: only receiving diagnostic reports and fundus evaluations for this hospital.
            </p>
          </div>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-emerald-600/70 bg-emerald-950/70 text-emerald-300 shrink-0 flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Strict Hospital Isolation ({filteredPatients.length} Reports)</span>
        </div>
      </div>
      
      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#073B4C] border border-[#0F5E78] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#FFD166] dark:text-[#FFD166]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchPatient')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#0F5E78] bg-[#052631] text-xs sm:text-sm text-white placeholder:text-[#CFE2E8]/60 focus:outline-none focus:ring-2 focus:ring-[#FFD166]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-[#CFE2E8] flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Review Queue:
          </span>
          {['All', 'Awaiting Review', 'Reviewed'].map((stage) => (
            <button
              key={stage}
              onClick={() => setFilterStage(stage)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterStage === stage
                  ? 'bg-[#FFD166] text-[#073B4C]'
                  : 'bg-[#052631] text-[#CFE2E8] dark:text-[#CFE2E8] hover:text-white border border-[#0F5E78]'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>

      </div>

      {/* Patient Table */}
      <div className="rounded-2xl bg-[#073B4C] border border-[#0F5E78] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#0F5E78] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white dark:text-white flex items-center gap-2">
            <span>{t('patientRegistry')}</span>
            <span className="text-xs font-mono text-[#FFD166] dark:text-[#FFD166] px-2 py-0.5 rounded-full bg-[#052631] dark:bg-[#052631] border border-[#0F5E78]">
              {filteredPatients.length} Active Records
            </span>
          </h3>
          <span className="text-[11px] text-[#CFE2E8] dark:text-slate-400 hidden sm:inline">Complete Longitudinal Profile</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#052631]/70 dark:bg-[#00080C]/30 border-b border-[#0F5E78] text-white dark:text-white uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Patient Profile</th>
                <th className="py-3.5 px-4">ASHA Field Vitals</th>
                <th className="py-3.5 px-4">Retina Scan & AI DR %</th>
                <th className="py-3.5 px-4">Specialist Diagnosis & Status</th>
                <th className="py-3.5 px-4">Dispatch Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F5E78]/30 dark:divide-[#0F5E78] text-[#CFE2E8]">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p) => {
                  const hasDoctor = Boolean(p.doctorReport);
                  const hasFundus = Boolean(p.fundusImaging);

                  return (
                    <tr
                      key={p.id}
                      onClick={() => onOpenEditor(p.id)}
                      className="hover:bg-[#052631] dark:hover:bg-[#052631] cursor-pointer transition-colors"
                    >
                      {/* Demographics */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white dark:text-white text-sm">{p.name}</p>
                          <div className="flex items-center gap-2 text-[11px] text-[#CFE2E8] dark:text-slate-400">
                            <span className="font-mono text-[#FFD166] dark:text-[#FFD166] font-bold">{p.id}</span>
                            <span>•</span>
                            <span>{p.age} Y / {p.gender}</span>
                          </div>
                          <p className="text-[10px] text-[#CFE2E8] dark:text-slate-400">
                            {p.village ? `${p.village}` : ''}
                            {p.taluka ? `, ${p.taluka}` : ''}
                            {p.houseNo ? ` (H.No: ${p.houseNo})` : ''}
                            {(p.village || p.taluka) ? ' • ' : ''}
                            {p.mobile}
                          </p>
                        </div>
                      </td>

                      {/* ASHA Vitals */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <p className="font-mono font-bold text-rose-400">{p.vitals.hba1c}% HbA1c</p>
                          <p className="text-[10px] text-[#CFE2E8]">{p.vitals.bloodPressure} • {p.vitals.bloodSugarYears} Yrs</p>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            p.ashaRiskAssessment?.riskCategory === 'High' ? 'bg-rose-950/60 text-rose-300 border-rose-800' :
                            p.ashaRiskAssessment?.riskCategory === 'Moderate' ? 'bg-amber-950/60 text-amber-300 border-amber-800' :
                            'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                          }`}>
                            {p.ashaRiskAssessment?.riskCategory} Risk
                          </span>
                        </div>
                      </td>

                      {/* Fundus Imaging & DR % */}
                      <td className="py-3.5 px-4">
                        {hasFundus ? (
                          <div className="flex items-center gap-2.5">
                            <img
                              src={p.fundusImaging.imageUrl}
                              alt="Fundus"
                              className="w-10 h-10 rounded-xl object-cover border border-[#0F5E78] shrink-0"
                            />
                            <div className="space-y-0.5">
                              <p className="font-extrabold text-[#FFD166] dark:text-[#FFD166] font-mono text-sm">
                                {p.fundusImaging.drGrade !== undefined && p.fundusImaging.drGrade !== null
                                  ? `Grade ${p.fundusImaging.drGrade}`
                                  : `${p.fundusImaging.drPercentage}% DR`}
                              </p>
                              <p className="text-[10px] text-[#CFE2E8] dark:text-slate-400 truncate max-w-[130px]">
                                {(p.fundusImaging.stage || p.fundusImaging.drSeverity || 'Imaged').split(' (')[0]}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No fundus uploaded yet</span>
                        )}
                      </td>

                      {/* Specialist Diagnosis & Health Status */}
                      <td className="py-3.5 px-4">
                        {hasDoctor ? (
                          <div className="space-y-1">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#052631] dark:bg-[#00080C]/70 text-[#FFD166] dark:text-[#FFD166] border border-[#0F5E78] inline-block">
                              {p.doctorReport.healthStatus || 'Laser Advised'}
                            </span>
                            <p className="text-[11px] text-white truncate max-w-[170px] font-medium">
                              {p.doctorReport.finalDiagnosis}
                            </p>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800 text-[10px] font-bold inline-block">
                            Pending Doctor Review
                          </span>
                        )}
                      </td>

                      {/* Dispatch Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 text-[11px]">
                          {p.doctorReport?.notifiedViaWhatsapp ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-bold">
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Sent
                            </span>
                          ) : (
                            <span className="text-[#CFE2E8]/70">WhatsApp: Pending</span>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            title="Edit Clinical Report"
                            onClick={() => onOpenEditor(p.id)}
                            className="p-2 rounded-lg bg-[#052631] dark:bg-[#052631] hover:bg-[#0F5E78] dark:hover:bg-[#0F5E78] border border-[#0F5E78] text-[#FFD166] dark:text-[#FFD166] transition-colors"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title={t('downloadPdfReport')}
                            onClick={() => onOpenDownload(p)}
                            className="p-2 rounded-lg bg-[#052631] dark:bg-[#052631] hover:bg-[#0F5E78] dark:hover:bg-[#0F5E78] border border-[#0F5E78] text-[#FFD166] dark:text-[#FFD166] transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title={t('sendWhatsapp')}
                            onClick={() => onOpenNotify(p)}
                            className="p-2 rounded-lg bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] transition-transform hover:scale-105 shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {hasFundus && (
                            <button
                              title={t('removeEyeImage')}
                              onClick={(e) => handleRemoveImage(p.id, e)}
                              className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 transition-colors"
                            >
                              <ImageOff className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            title={t('removePatient')}
                            onClick={(e) => handleDelete(p.id, p.name, e)}
                            className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-[#CFE2E8] dark:text-slate-400 text-xs space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#052631] dark:bg-[#00080C]/40 border border-[#0F5E78] text-[#FFD166] dark:text-[#FFD166] mx-auto flex items-center justify-center">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-white text-sm">{t('noPatientsYet')}</p>
                    <p className="text-[#CFE2E8] text-xs">When patients are registered by ASHA workers and imaged by nurses, they will appear here for specialist diagnosis.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
