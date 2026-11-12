import React, { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Search, 
  Filter, 
  User, 
  Calendar, 
  Camera, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  X, 
  Trash2,
  ImageOff,
  Building2
} from 'lucide-react';

export function NurseDashboard({ onStartImaging }) {
  const { patients, deletePatient, removePatientFundusImage } = usePatients();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const nurseHospital = currentUser?.currentOrganization || 'Khandala Sub-District Civil Hospital';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('All'); // 'All' | 'Pending Imaging' | 'Imaged'
  const [selectedPatientForModal, setSelectedPatientForModal] = useState(null);

  const filteredPatients = patients.filter((p) => {
    // Strict Hospital Isolation: Nurse only receives appointments booked for this specific hospital
    const matchHospital = (p.hospitalName || '').toLowerCase().trim() === nurseHospital.toLowerCase().trim();
    if (!matchHospital) return false;

    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mobile.includes(searchTerm);

    if (filterMode === 'Pending Imaging') {
      return matchesSearch && !p.fundusImaging;
    }
    if (filterMode === 'Imaged') {
      return matchesSearch && Boolean(p.fundusImaging);
    }
    return matchesSearch;
  });

  const handleDelete = (patientId, patientName, e) => {
    e && e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove patient "${patientName}" (${patientId})?`)) {
      deletePatient(patientId);
      if (selectedPatientForModal?.id === patientId) {
        setSelectedPatientForModal(null);
      }
    }
  };

  const handleRemoveImage = (patientId, e) => {
    e && e.stopPropagation();
    if (window.confirm('Remove captured retinal fundus image and reset analysis for this patient?')) {
      removePatientFundusImage(patientId);
      if (selectedPatientForModal?.id === patientId) {
        setSelectedPatientForModal(prev => ({ ...prev, fundusImaging: null }));
      }
    }
  };

  return (
    <div className="space-y-6">

      {/* Hospital Isolation Facility Banner */}
      <div className="p-3.5 rounded-2xl bg-[#073B4C] border border-[#0F5E78] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#052631] border border-[#0F5E78] text-[#FFD166] flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#CFE2E8]">Assigned Hospital Chair:</span>
              <strong className="text-white font-semibold">{nurseHospital}</strong>
            </div>
            <p className="text-[11px] text-[#CFE2E8]/70">
              Only receiving appointments scheduled for this hospital facility.
            </p>
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-600/70 bg-emerald-950/70 text-emerald-300 shrink-0 flex items-center gap-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Strict Hospital Isolation ({filteredPatients.length} Active Appointments)</span>
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
            Queue Status:
          </span>
          {['All', 'Pending Imaging', 'Imaged'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterMode === mode
                  ? 'bg-[#FFD166] text-[#073B4C]'
                  : 'bg-[#052631] text-[#CFE2E8] dark:text-[#CFE2E8] hover:text-white border border-[#0F5E78]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

      </div>

      {/* Table of Queue */}
      <div className="rounded-2xl bg-[#073B4C] border border-[#0F5E78] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#0F5E78] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white dark:text-white flex items-center gap-2">
            <span>{t('examChairQueue')}</span>
            <span className="text-xs font-mono text-[#FFD166] dark:text-[#FFD166] px-2 py-0.5 rounded-full bg-[#052631] dark:bg-[#052631] border border-[#0F5E78]">
              {filteredPatients.length} Patients
            </span>
          </h3>
          <span className="text-[11px] text-[#CFE2E8] dark:text-slate-400 hidden sm:inline">Referrals from Community ASHA Workers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#052631]/70 dark:bg-[#00080C]/30 border-b border-[#0F5E78] text-white dark:text-white uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Patient Profile</th>
                <th className="py-3.5 px-4">ASHA Risk Assessment</th>
                <th className="py-3.5 px-4">Appointment Schedule</th>
                <th className="py-3.5 px-4">Fundus Retinal Scan</th>
                <th className="py-3.5 px-4">AI DR % Calculation</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F5E78]/30 dark:divide-[#0F5E78] text-[#CFE2E8]">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p) => {
                  const hasFundus = Boolean(p.fundusImaging);
                  const isHigh = p.ashaRiskAssessment?.riskCategory === 'High';
                  const isMod = p.ashaRiskAssessment?.riskCategory === 'Moderate';

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPatientForModal(p)}
                      className="hover:bg-[#052631] dark:hover:bg-[#052631] cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white dark:text-white text-sm">{p.name}</p>
                          <div className="flex items-center gap-2 text-[11px] text-[#CFE2E8] dark:text-slate-400">
                            <span className="font-mono text-[#FFD166] dark:text-[#FFD166] font-bold">{p.id}</span>
                            <span>•</span>
                            <span>{p.age} Y / {p.gender}</span>
                          </div>
                          <p className="text-[10px] text-[#CFE2E8] dark:text-slate-400">Ref: {p.registeredByAsha}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isHigh ? 'bg-rose-950/60 text-rose-300 border-rose-800' :
                            isMod ? 'bg-amber-950/60 text-amber-300 border-amber-800' :
                            'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                          }`}>
                            {p.ashaRiskAssessment?.riskCategory} ({p.ashaRiskAssessment?.score || 0}%)
                          </span>
                          <p className="text-[10px] text-[#CFE2E8]">HbA1c: {p.vitals.hba1c}%</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {p.appointmentDate ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-xs font-semibold text-white">
                              <Calendar className="w-3.5 h-3.5 text-[#FFD166] dark:text-[#FFD166]" />
                              <span>{p.appointmentDate}</span>
                            </div>
                            <p className="text-[10px] text-[#CFE2E8] truncate max-w-[140px]">{p.hospitalName}</p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#CFE2E8]/70">Walk-in Triage</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {hasFundus ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={p.fundusImaging.imageUrl}
                              alt="Fundus"
                              className="w-9 h-9 rounded-lg object-cover border border-[#0F5E78] shrink-0"
                            />
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Captured
                              </span>
                              <p className="text-[10px] text-[#CFE2E8] truncate max-w-[120px]">
                                {p.fundusImaging.stage.split(' (')[0]}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800 text-[10px] font-bold inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Awaiting Imaging
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {hasFundus ? (
                          <div className="space-y-0.5">
                            <p className="text-sm font-extrabold text-[#FFD166] dark:text-[#FFD166] font-mono">
                              {p.fundusImaging.drPercentage}% DR
                            </p>
                            <p className="text-[10px] text-[#FFD166] dark:text-[#FFD166]">
                              Confidence: {p.fundusImaging.confidence}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#CFE2E8]/70">Pending Scan</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {hasFundus ? (
                            <>
                              <button
                                title="View Dossier"
                                onClick={() => setSelectedPatientForModal(p)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#052631] dark:bg-[#052631] hover:bg-[#0F5E78] dark:hover:bg-[#0F5E78] text-[#FFD166] dark:text-[#FFD166] text-xs font-semibold inline-flex items-center gap-1 transition-all border border-[#0F5E78]"
                              >
                                <span>{t('details')}</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>

                              <button
                                title={t('removeEyeImage')}
                                onClick={(e) => handleRemoveImage(p.id, e)}
                                className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 transition-colors"
                              >
                                <ImageOff className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => onStartImaging(p.id)}
                              className="px-3 py-1.5 rounded-xl bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Capture Fundus</span>
                            </button>
                          )}

                          <button
                            title={t('removePatient')}
                            onClick={(e) => handleDelete(p.id, p.name, e)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 transition-colors"
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
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-white text-sm">{t('noPatientsYet')}</p>
                    <p className="text-[#CFE2E8] text-xs">Patients referred from the ASHA Field Portal will automatically appear here for fundus photography.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Patient Dossier Details Modal */}
      {selectedPatientForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[92vh] rounded-3xl bg-[#073B4C] border border-[#0F5E78] p-6 sm:p-8 overflow-y-auto shadow-2xl space-y-6">
            
            <div className="flex items-start justify-between border-b border-[#0F5E78] pb-4">
              <div>
                <p className="text-xs font-mono text-[#FFD166] dark:text-[#FFD166] font-bold">{selectedPatientForModal.id}</p>
                <h3 className="text-2xl font-bold text-white dark:text-white mt-0.5">{selectedPatientForModal.name}</h3>
                <p className="text-xs text-[#CFE2E8] dark:text-slate-400">
                  {selectedPatientForModal.age} Y / {selectedPatientForModal.gender} • Mobile: {selectedPatientForModal.mobile}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(selectedPatientForModal.id, selectedPatientForModal.name)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('removePatient')}</span>
                </button>

                <button
                  onClick={() => setSelectedPatientForModal(null)}
                  className="w-9 h-9 rounded-full bg-[#052631] dark:bg-[#052631] hover:bg-[#0F5E78] dark:hover:bg-[#0F5E78] text-[#FFD166] dark:text-[#FFD166] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ASHA Survey Summary */}
            <div className="p-4 rounded-2xl bg-[#073B4C] text-white border border-[#0F5E78] space-y-3 text-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-white dark:text-white">
                ASHA Community Survey Vitals
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-[#073B4C]/80 dark:bg-[#00080C] border border-[#0F5E78]/40 shadow-sm">
                  <span className="text-[#CFE2E8] text-[10px]">HbA1c</span>
                  <p className="font-bold text-rose-400 text-sm">{selectedPatientForModal.vitals.hba1c}%</p>
                </div>
                <div className="p-2 rounded-lg bg-[#073B4C]/80 dark:bg-[#00080C] border border-[#0F5E78]/40 shadow-sm">
                  <span className="text-[#CFE2E8] text-[10px]">Blood Pressure</span>
                  <p className="font-bold text-white">{selectedPatientForModal.vitals.bloodPressure}</p>
                </div>
                <div className="p-2 rounded-lg bg-[#073B4C]/80 dark:bg-[#00080C] border border-[#0F5E78]/40 shadow-sm">
                  <span className="text-[#CFE2E8] text-[10px]">Duration</span>
                  <p className="font-bold text-white">{selectedPatientForModal.vitals.bloodSugarYears} Yrs</p>
                </div>
                <div className="p-2 rounded-lg bg-[#073B4C]/80 dark:bg-[#00080C] border border-[#0F5E78]/40 shadow-sm">
                  <span className="text-[#CFE2E8] text-[10px]">AI Field Risk</span>
                  <p className="font-bold text-amber-400">{selectedPatientForModal.ashaRiskAssessment?.riskCategory} ({selectedPatientForModal.ashaRiskAssessment?.score}%)</p>
                </div>
              </div>
            </div>

            {/* Fundus Retinal Status */}
            {selectedPatientForModal.fundusImaging ? (
              <div className="p-5 rounded-2xl bg-[#052631]/50 dark:bg-[#00080C]/30 border border-[#0F5E78] space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase font-bold tracking-wider text-white dark:text-white">
                    Retinal Fundus Image & AI Analysis
                  </p>
                  <button
                    onClick={() => handleRemoveImage(selectedPatientForModal.id)}
                    className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 text-[11px] font-bold flex items-center gap-1"
                  >
                    <ImageOff className="w-3.5 h-3.5" />
                    <span>{t('removeEyeImage')}</span>
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src={selectedPatientForModal.fundusImaging.imageUrl}
                    alt="Retina"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-[#0F5E78] dark:border-[#0F5E78] shadow-md"
                  />
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-white text-sm">{selectedPatientForModal.fundusImaging.stage}</p>
                    <p className="text-[#CFE2E8]">Calculated DR %: <strong className="text-[#FFD166] font-mono text-sm">{selectedPatientForModal.fundusImaging.drPercentage}%</strong></p>
                    <p className="text-[#CFE2E8]">CSME Risk: {selectedPatientForModal.fundusImaging.csmeRisk}</p>
                    <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Forwarded to Doctor Portal
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-950/60 border border-amber-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-300">Fundus Retinal Scan Required</p>
                  <p className="text-[11px] text-[#CFE2E8] mt-0.5">Proceed to capture retinal photograph using fundus camera.</p>
                </div>
                <button
                  onClick={() => {
                    const id = selectedPatientForModal.id;
                    setSelectedPatientForModal(null);
                    onStartImaging(id);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Imaging</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
