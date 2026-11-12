import React, { useState } from 'react';
import { usePatients } from '../../context/PatientContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Search, 
  Filter, 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  Building2, 
  UserPlus, 
  Sliders,
  Trash2
} from 'lucide-react';

export function AshaDashboard({ selectedPatient, setSelectedPatient, onSwitchToRegister }) {
  const { patients, getAnalytics, bookHospitalAppointment, deletePatient } = usePatients();
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All'); // 'All' | 'High' | 'Moderate' | 'Low'
  const [bookingDate, setBookingDate] = useState('');
  const [bookingHospital, setBookingHospital] = useState('District Tele-Ophthalmology Center');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const analytics = getAnalytics();

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mobile.includes(searchTerm);

    const matchesRisk = 
      riskFilter === 'All' || 
      p.ashaRiskAssessment?.riskCategory === riskFilter;

    return matchesSearch && matchesRisk;
  });

  const handleBookAppointment = (e, patientId) => {
    e.preventDefault();
    if (!bookingDate) return;
    bookHospitalAppointment(patientId, bookingDate, bookingHospital);
    setBookingSuccess(true);
    setTimeout(() => setBookingSuccess(false), 3000);
  };

  const handleDelete = (patientId, patientName, e) => {
    e && e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove patient "${patientName}" (${patientId})?`)) {
      deletePatient(patientId);
      if (selectedPatient?.id === patientId) {
        setSelectedPatient(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="p-4 rounded-2xl bg-[#073B4C] text-white border border-[#0F5E78] shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#CFE2E8] uppercase tracking-wider">{t('totalScreened')}</span>
            <div className="w-7 h-7 rounded-xl bg-[#052631] flex items-center justify-center text-[#FFD166] dark:text-[#FFD166]">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white dark:text-white">{analytics.total}</p>
          <p className="text-[10px] text-[#CFE2E8]">Community Registrations</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#073B4C] text-white border border-rose-300 dark:border-rose-900/50 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">{t('highRiskCount')}</span>
            <div className="w-7 h-7 rounded-xl bg-rose-950 flex items-center justify-center text-rose-300">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400">{analytics.highRisk}</p>
          <p className="text-[10px] text-rose-300">Urgent Referral</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#073B4C] text-white border border-amber-300 dark:border-amber-900/50 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">{t('moderateRiskCount')}</span>
            <div className="w-7 h-7 rounded-xl bg-amber-950 flex items-center justify-center text-amber-300">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400">{analytics.moderateRisk}</p>
          <p className="text-[10px] text-amber-300">Priority Follow-up</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#073B4C] text-white border border-[#0F5E78] shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">{t('appointmentsFixed')}</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400">{analytics.referred}</p>
          <p className="text-[10px] text-emerald-300">Linked to Hospital</p>
        </div>

      </div>

      {/* 2. Search, Filter & Register CTA Bar */}
      <div className="p-3.5 rounded-2xl bg-[#073B4C] border border-[#0F5E78] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#FFD166] dark:text-[#FFD166]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchPatient')}
            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-white placeholder:text-[#CFE2E8]/60"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-[#CFE2E8] flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Risk:
          </span>
          {['All', 'High', 'Moderate', 'Low'].map((r) => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                riskFilter === r
                  ? 'bg-[#FFD166] text-[#073B4C] shadow-sm'
                  : 'bg-[#052631] text-[#CFE2E8] dark:text-[#CFE2E8] hover:text-white border border-[#0F5E78]'
              }`}
            >
              {r === 'All' ? 'All' : r === 'High' ? t('highRisk') : r === 'Moderate' ? t('moderateRisk') : t('lowRisk')}
            </button>
          ))}

          <button
            onClick={onSwitchToRegister}
            className="ml-auto shrink-0 px-3.5 py-1.5 rounded-xl glow-btn-purple text-[#073B4C] text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t('newPatientSurvey')}</span>
          </button>
        </div>

      </div>

      {/* 3. Registered Patients Table */}
      <div className="rounded-2xl bg-[#073B4C] border border-[#0F5E78] overflow-hidden shadow-sm">
        <div className="p-3.5 border-b border-[#0F5E78] flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <span>{t('patientRegistry')}</span>
            <span className="text-xs font-mono text-[#FFD166] dark:text-[#FFD166] px-2 py-0.5 rounded-full bg-[#052631] dark:bg-[#052631] border border-[#0F5E78]">
              {filteredPatients.length}
            </span>
          </h3>
          <span className="text-[10px] text-[#CFE2E8] dark:text-slate-400 hidden sm:inline">{t('village')} Registry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#052631] border-b border-[#0F5E78] text-white dark:text-white uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-3.5">Patient Profile</th>
                <th className="py-3 px-3.5">Vitals & Glycemia</th>
                <th className="py-3 px-3.5">AI Risk Stratification</th>
                <th className="py-3 px-3.5">Referral / Appointment</th>
                <th className="py-3 px-3.5">Workflow Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F5E78]/30 dark:divide-[#0F5E78] text-[#CFE2E8]">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p) => {
                  const riskCat = p.ashaRiskAssessment?.riskCategory || 'Low';
                  const isHigh = riskCat === 'High';
                  const isMod = riskCat === 'Moderate';
                  
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      className="hover:bg-[#052631] dark:hover:bg-[#052631] cursor-pointer transition-colors"
                    >
                      {/* Patient Name & Demographics */}
                      <td className="py-3 px-3.5">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white text-xs sm:text-sm">{p.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-[#CFE2E8]">
                            <span className="font-mono text-[#FFD166] dark:text-[#FFD166] font-bold">{p.id}</span>
                            <span>•</span>
                            <span>{p.age} Y / {p.gender}</span>
                          </div>
                          <p className="text-[10px] text-[#CFE2E8] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#FFD166] dark:text-[#FFD166] shrink-0" />
                            <span className="truncate max-w-[160px]">{p.village}</span>
                          </p>
                        </div>
                      </td>

                      {/* Vitals */}
                      <td className="py-3 px-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[#CFE2E8]">HbA1c:</span>
                            <span className={`font-mono font-bold ${p.vitals.hba1c >= 8.5 ? 'text-rose-400' : p.vitals.hba1c >= 7.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {p.vitals.hba1c}%
                            </span>
                          </div>
                          <div className="text-[10px] text-[#CFE2E8]">
                            BP: <span className="font-medium text-white">{p.vitals.bloodPressure}</span>
                          </div>
                          <div className="text-[10px] text-[#FFD166] dark:text-[#FFD166]">
                            {p.vitals.bloodSugarYears} Yrs Diabetes
                          </div>
                        </div>
                      </td>

                      {/* AI Risk Stratification */}
                      <td className="py-3 px-3.5">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isHigh ? 'bg-rose-950/80 text-rose-300 border-rose-800' :
                            isMod ? 'bg-amber-950/80 text-amber-300 border-amber-800' :
                            'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-rose-600' : isMod ? 'bg-amber-600' : 'bg-emerald-600'}`} />
                            <span>{riskCat === 'High' ? t('highRisk') : riskCat === 'Moderate' ? t('moderateRisk') : t('lowRisk')} ({p.ashaRiskAssessment?.score || 0}%)</span>
                          </span>
                        </div>
                      </td>

                      {/* Referral / Appointment */}
                      <td className="py-3 px-3.5">
                        {p.appointmentDate ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                              <Calendar className="w-3 h-3 text-emerald-400" />
                              <span>{p.appointmentDate}</span>
                            </div>
                            <p className="text-[10px] text-[#CFE2E8] truncate max-w-[140px]">
                              {p.hospitalName || 'District Center'}
                            </p>
                          </div>
                        ) : p.ashaRiskAssessment?.needsHospitalReferral ? (
                          <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 text-[10px] font-bold inline-block">
                            Referral Needed
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#CFE2E8]/70">Routine Check</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.status === 'Doctor Reviewed' ? 'bg-[#052631] text-[#FFD166] border-[#0F5E78]' :
                          p.status.includes('In Hospital') ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800' :
                          p.status.includes('Appointment') ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800' :
                          'bg-[#052631] text-[#CFE2E8] border-[#0F5E78]'
                        }`}>
                          {p.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            title={t('details')}
                            onClick={() => setSelectedPatient(p)}
                            className="px-2 py-1 rounded-lg bg-[#052631] dark:bg-[#052631] hover:bg-[#0F5E78] text-[#FFD166] dark:text-[#FFD166] text-xs font-semibold inline-flex items-center gap-1 transition-all border border-[#0F5E78]"
                          >
                            <span>{t('details')}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>

                          <button
                            title={t('removePatient')}
                            onClick={(e) => handleDelete(p.id, p.name, e)}
                            className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 transition-colors"
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
                  <td colSpan={6} className="py-12 text-center text-[#CFE2E8] dark:text-slate-400 text-xs space-y-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#052631] dark:bg-[#00080C]/50 border border-[#0F5E78] text-[#FFD166] dark:text-[#FFD166] mx-auto flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{t('noPatientsYet')}</p>
                      <p className="text-[#CFE2E8] text-xs mt-0.5">Click "{t('newPatientSurvey')}" to begin registering community individuals.</p>
                    </div>
                    <button
                      onClick={onSwitchToRegister}
                      className="px-3.5 py-1.5 rounded-xl glow-btn-purple text-[#073B4C] text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{t('registerFirstPatient')}</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 4. Full Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[92vh] rounded-3xl bg-[#073B4C] border border-[#0F5E78] p-5 sm:p-7 overflow-y-auto shadow-2xl space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#0F5E78] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#052631] text-[#FFD166] dark:text-[#FFD166] border border-[#0F5E78]">
                    {selectedPatient.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedPatient.ashaRiskAssessment?.riskCategory === 'High' ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800' :
                    selectedPatient.ashaRiskAssessment?.riskCategory === 'Moderate' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' :
                    'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                  }`}>
                    {selectedPatient.ashaRiskAssessment?.riskCategory} Risk
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedPatient.name}
                </h3>
                <p className="text-xs text-[#CFE2E8]">
                  {selectedPatient.age} Y / {selectedPatient.gender} • Registered by: {selectedPatient.registeredByAsha}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(selectedPatient.id, selectedPatient.name)}
                  className="px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('removePatient')}</span>
                </button>

                <button
                  onClick={() => setSelectedPatient(null)}
                  className="w-8 h-8 rounded-full bg-[#052631] dark:bg-[#052631] hover:bg-[#0F5E78] text-[#FFD166] dark:text-[#FFD166] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#052631]/50 dark:bg-[#00080C]/40 border border-[#0F5E78] space-y-0.5">
                <span className="text-[#CFE2E8] flex items-center gap-1 text-[10px]">
                  <Phone className="w-3 h-3 text-[#FFD166] dark:text-[#FFD166]" /> {t('mobileNumber')}:
                </span>
                <p className="font-bold text-white font-mono">{selectedPatient.mobile}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#052631]/50 dark:bg-[#00080C]/40 border border-[#0F5E78] space-y-0.5">
                <span className="text-[#CFE2E8] flex items-center gap-1 text-[10px]">
                  <MapPin className="w-3 h-3 text-[#FFD166] dark:text-[#FFD166]" /> {t('village')}:
                </span>
                <p className="font-bold text-white truncate">{selectedPatient.village}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#052631]/50 dark:bg-[#00080C]/40 border border-[#0F5E78] space-y-0.5">
                <span className="text-[#CFE2E8] flex items-center gap-1 text-[10px]">
                  <Calendar className="w-3 h-3 text-[#FFD166] dark:text-[#FFD166]" /> Survey Date:
                </span>
                <p className="font-bold text-white">
                  {new Date(selectedPatient.registeredAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Vitals & Reported Symptoms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Vitals */}
              <div className="p-3.5 rounded-2xl bg-[#052631] border border-[#0F5E78] space-y-2">
                <p className="text-xs uppercase font-bold tracking-wider text-[#FFD166] dark:text-[#FFD166]">
                  {t('clinicalRiskFactors')}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-[#073B4C]/60 dark:bg-[#00080C]/60 border border-[#0F5E78]/40">
                    <p className="text-[10px] text-[#CFE2E8]">HbA1c Level</p>
                    <p className="font-bold text-rose-400 text-sm">{selectedPatient.vitals.hba1c}%</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#073B4C]/60 dark:bg-[#00080C]/60 border border-[#0F5E78]/40">
                    <p className="text-[10px] text-[#CFE2E8]">Duration</p>
                    <p className="font-bold text-white text-sm">{selectedPatient.vitals.bloodSugarYears} Yrs</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#073B4C]/60 dark:bg-[#00080C]/60 border border-[#0F5E78]/40">
                    <p className="text-[10px] text-[#CFE2E8]">Blood Pressure</p>
                    <p className="font-bold text-white">{selectedPatient.vitals.bloodPressure}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#073B4C]/60 dark:bg-[#00080C]/60 border border-[#0F5E78]/40">
                    <p className="text-[10px] text-[#CFE2E8]">Cholesterol</p>
                    <p className="font-bold text-white">{selectedPatient.vitals.hasHighCholesterol ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Reported Symptoms */}
              <div className="p-3.5 rounded-2xl bg-[#052631] border border-[#0F5E78] space-y-2">
                <p className="text-xs uppercase font-bold tracking-wider text-[#FFD166] dark:text-[#FFD166]">
                  {t('ocularSymptoms')}
                </p>
                {selectedPatient.vitals.symptoms && selectedPatient.vitals.symptoms.length > 0 ? (
                  <div className="space-y-1 text-xs">
                    {selectedPatient.vitals.symptoms.map((s, i) => (
                      <div key={i} className="p-1.5 rounded-lg bg-[#073B4C]/60 dark:bg-[#00080C]/60 border border-[#0F5E78]/40 flex items-center gap-1.5 text-white">
                        <CheckCircle2 className="w-3 h-3 text-[#FFD166] dark:text-[#FFD166] shrink-0" />
                        <span className="text-[11px]">{s}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#CFE2E8]/70 italic">No specific ocular symptoms checked during survey.</p>
                )}

                {selectedPatient.vitals.customSymptoms && (
                  <div className="p-2 rounded-xl bg-[#073B4C]/60 dark:bg-[#00080C]/60 border border-[#0F5E78]/40 text-xs">
                    <p className="text-[10px] text-[#FFD166] dark:text-[#FFD166] font-semibold mb-0.5">Custom Notes:</p>
                    <p className="text-[#CFE2E8] text-[11px]">{selectedPatient.vitals.customSymptoms}</p>
                  </div>
                )}
              </div>

            </div>

            {/* Explainable AI SHAP Breakdown */}
            {selectedPatient.ashaRiskAssessment?.factorContributions && (
              <div className="p-4 rounded-2xl bg-[#052631]/60 dark:bg-[#00080C]/40 border border-[#0F5E78] space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase font-bold tracking-wider text-white dark:text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#FFD166] dark:text-[#FFD166]" />
                    {t('shapContributions')}
                  </p>
                  <span className="text-[10px] text-[#FFD166] dark:text-[#FFD166] font-mono">
                    Confidence: {selectedPatient.ashaRiskAssessment.confidence}%
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {selectedPatient.ashaRiskAssessment.factorContributions.map((fc, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#052631] text-white border border-[#0F5E78] dark:border-[#0F5E78] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 shadow-sm">
                      <div className="space-y-0.5">
                        <p className="font-bold text-white text-xs">{fc.factor}</p>
                        <p className="text-[10px] text-[#CFE2E8]">{fc.explanation}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 ${
                        fc.weight > 15 ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800' :
                        fc.weight > 0 ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                      }`}>
                        {fc.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hospital Referral & Appointment */}
            <div className="p-4 rounded-2xl bg-[#073B4C] text-white border border-[#0F5E78] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#FFD166] dark:text-[#FFD166]" />
                  <span>{t('bookAppointment')}</span>
                </h4>
                {selectedPatient.appointmentDate && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                    Confirmed
                  </span>
                )}
              </div>

              {selectedPatient.appointmentDate ? (
                <div className="p-3 rounded-xl bg-[#052631] border border-emerald-500 text-xs flex items-center justify-between shadow-sm">
                  <div>
                    <p className="font-bold text-emerald-400">Appointment Scheduled</p>
                    <p className="text-[#CFE2E8] text-[11px] mt-0.5">Date: {selectedPatient.appointmentDate} at {selectedPatient.hospitalName}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              ) : (
                <form onSubmit={(e) => handleBookAppointment(e, selectedPatient.id)} className="space-y-2.5">
                  <p className="text-xs text-[#CFE2E8]">
                    The AI model recommends DR screening. Select an appointment date to fix this patient's slot at the hospital:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#CFE2E8] mb-1">{t('appointmentDate')}</label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl glass-input text-white text-xs bg-[#052631]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#CFE2E8] mb-1">{t('hospitalCenter')}</label>
                      <select
                        value={bookingHospital}
                        onChange={(e) => setBookingHospital(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl glass-input text-white text-xs bg-[#052631]"
                      >
                        <option value="District Tele-Ophthalmology Center">District Tele-Ophthalmology Center</option>
                        <option value="Sub-District Eye Hospital, Wani">Sub-District Eye Hospital, Wani</option>
                        <option value="Apex AIIMS Tele-Retina Wing">Apex AIIMS Tele-Retina Wing</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl glow-btn-purple text-[#073B4C] text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t('confirmBooking')}</span>
                  </button>

                  {bookingSuccess && (
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold text-center animate-pulse">
                      {t('appointmentFixedMsg')}
                    </p>
                  )}
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

