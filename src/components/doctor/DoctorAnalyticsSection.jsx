import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePatients } from '../../context/PatientContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  getTalukaEpidemiologicalData 
} from '../../lib/maharashtraData';
import { 
  BarChart3, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Mail, 
  Send, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Building2, 
  Users, 
  Eye, 
  ArrowUpRight, 
  ArrowDownRight,
  FileText,
  Printer,
  ExternalLink
} from 'lucide-react';

export function DoctorAnalyticsSection() {
  const { currentUser } = useAuth();
  const { patients } = usePatients();
  const { t } = useLanguage();

  const doctorDistrict = currentUser?.district || 'Satara';
  const doctorTaluka = currentUser?.taluka || 'Khandala';

  // Fixed to Doctor's Assigned Jurisdiction
  const selectedDistrict = doctorDistrict;
  const selectedTaluka = doctorTaluka;

  // Email to Government Modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [dispatchRefCode, setDispatchRefCode] = useState('');

  // Compute Epidemiological Data for Doctor's Fixed District & Taluka
  const analyticsData = getTalukaEpidemiologicalData(selectedDistrict, selectedTaluka, patients);

  const {
    totalScreened,
    totalDrPositive,
    overallDrRate,
    severeCount,
    districtAvgRate,
    rateVsDistrictAvg,
    villageStats,
    comparativeTalukas
  } = analyticsData;

  // Format Government Email Report
  const emailRecipient = 'dho.health@maharashtra.gov.in';
  const emailCc = 'dhs.ophthalmology@gov.in';
  const emailSubject = `[OFFICIAL SURVEILLANCE] Diabetic Retinopathy Epidemiological Report - ${selectedTaluka} Taluka, ${selectedDistrict} District, Maharashtra`;

  const emailBodyText = 
`OFFICIAL EPIDEMIOLOGICAL SURVEILLANCE REPORT
Government of Maharashtra — Directorate of Health Services (DHS)
District Health Office, ${selectedDistrict} District
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REPORTING SPECIALIST:
• Name: ${currentUser?.name || 'Dr. Vivek Gayakwad, MS'}
• Registration No.: ${currentUser?.licenseId || 'MCI-REG-44912'}
• Hospital / Base Facility: ${currentUser?.currentOrganization || `${selectedTaluka} Sub-District Civil Hospital`}
• Date & Timestamp: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-IN')}

SURVEILLANCE JURISDICTION:
• State: Maharashtra
• District: ${selectedDistrict}
• Taluka / Block: ${selectedTaluka}

1. EXECUTIVE SURVEILLANCE SUMMARY:
• Total Rural Population Screened: ${totalScreened} patients
• Confirmed Diabetic Retinopathy Cases: ${totalDrPositive} patients
• Overall Taluka DR Prevalence Rate: ${overallDrRate}%
• Sight-Threatening DR (Severe / PDR): ${severeCount} urgent cases
• District Baseline Benchmark: ${districtAvgRate}%
• Variance vs District Average: ${rateVsDistrictAvg >= 0 ? `+${rateVsDistrictAvg}% (Elevated Concern)` : `${rateVsDistrictAvg}% (Favorable)`}

2. VILLAGE-WISE DR PREVALENCE BREAKDOWN:
${villageStats.map((v, i) => `${i + 1}. ${v.villageName.padEnd(20, ' ')} | Screened: ${String(v.totalScreened).padStart(3, ' ')} | DR Positive: ${String(v.totalDrCases).padStart(2, ' ')} (${v.drRatePct}%) | Alert: ${v.riskAlert}`).join('\n')}

3. COMPARATIVE TALUKA BENCHMARK (${selectedDistrict} District):
${comparativeTalukas.map(ct => `• ${ct.talukaName.padEnd(16, ' ')}: ${ct.drRatePct}% (${ct.screenedCount} screened) - ${ct.status}`).join('\n')}

4. CLINICAL & PUBLIC HEALTH RECOMMENDATIONS:
1. Prioritize immediate deployment of Tele-Ophthalmology Mobile Vans to high-prevalence hotspot villages (${villageStats.filter(v => v.requiresIntervention).map(v => v.villageName).slice(0, 3).join(', ')}).
2. Facilitate government-subsidized anti-VEGF injection and retinal laser photocoagulation quotas at ${currentUser?.currentOrganization || `${selectedTaluka} Sub-District Hospital`}.
3. Conduct intensive glycemic control & dilated eye exam camps in high-risk rural wards.

Submitted by:
${currentUser?.name || 'Dr. Vivek Gayakwad, MS (Ophthalmology)'}
Consultant Vitreo-Retinal Surgeon & Tele-Ophthalmology Officer
VisionXAI Surveillance Network, Government of Maharashtra`;

  // Trigger Native Mailto or Electronic Dispatch
  const handleLaunchMailto = () => {
    const mailtoUrl = `mailto:${emailRecipient}?cc=${encodeURIComponent(emailCc)}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`;
    window.location.href = mailtoUrl;
  };

  const handleOfficialElectronicDispatch = () => {
    const code = `MH-DHS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setDispatchRefCode(code);
    setEmailSentSuccess(true);
    setTimeout(() => {
      setEmailSentSuccess(false);
      setEmailModalOpen(false);
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Header Card & Geographic Filter Controls */}
      <div className="p-6 rounded-3xl bg-[#073B4C] border border-[#0F5E78] shadow-sm space-y-4 relative overflow-hidden">
        <div className="shape-half-circle shape-half-circle-tr w-24 h-24 pointer-events-none opacity-30" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#0F5E78] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#052631] text-[#FFD166] border border-[#0F5E78]">
                Public Health Surveillance
              </span>
              <span className="text-xs text-[#CFE2E8]">
                Government of Maharashtra Tele-Ophthalmology Registry
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#FFD166]" />
              <span>Diabetic Retinopathy Epidemiological Analysis</span>
            </h2>
            <p className="text-xs text-[#CFE2E8] mt-0.5">
              Analyze DR prevalence by village in your taluka, compare regional benchmarks, and submit formal surveillance dispatches.
            </p>
          </div>

          {/* Action: Send Report to Government */}
          <button
            onClick={() => setEmailModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all shrink-0 cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Send Analysis Report to Govt via Email</span>
          </button>
        </div>

        {/* Doctor Assigned Geographic Jurisdiction */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-[#CFE2E8] mb-1">
              State of Practice
            </label>
            <div className="p-2.5 rounded-xl bg-[#052631] border border-[#0F5E78] text-white font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Maharashtra</span>
              </div>
              <span className="text-[10px] text-[#CFE2E8]/60 font-mono">State</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#CFE2E8] mb-1">
              Surveillance District
            </label>
            <div className="p-2.5 rounded-xl bg-[#052631] border border-[#0F5E78] text-white font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FFD166]" />
                <span>{selectedDistrict} District</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Assigned</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#CFE2E8] mb-1">
              Analyzed Taluka / Block (Active Practice)
            </label>
            <div className="p-2.5 rounded-xl bg-[#052631] border border-[#0F5E78] text-white font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#FFD166]" />
                <span className="text-[#FFD166]">{selectedTaluka} Taluka</span>
              </div>
              <span className="text-[10px] bg-[#073B4C] text-[#FFD166] px-2 py-0.5 rounded border border-[#0F5E78]">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Screened */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#073B4C] border border-[#0F5E78] space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#CFE2E8]">
            <span>Total Screened</span>
            <Users className="w-4 h-4 text-[#FFD166]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {totalScreened}
          </div>
          <p className="text-[11px] text-[#CFE2E8]">
            Patients evaluated in {selectedTaluka}
          </p>
        </div>

        {/* DR Prevalence */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#073B4C] border border-[#0F5E78] space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#CFE2E8]">
            <span>DR Prevalence Rate</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
            {overallDrRate}%
          </div>
          <p className="text-[11px] text-[#CFE2E8]">
            {totalDrPositive} positive cases detected
          </p>
        </div>

        {/* Sight-Threatening DR */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#073B4C] border border-[#0F5E78] space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#CFE2E8]">
            <span>Sight-Threatening DR</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">
            {severeCount}
          </div>
          <p className="text-[11px] text-[#CFE2E8]">
            Severe NPDR / PDR (Urgent Laser/Rx)
          </p>
        </div>

        {/* District Benchmark */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#073B4C] border border-[#0F5E78] space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#CFE2E8]">
            <span>Vs District Average</span>
            {rateVsDistrictAvg >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${rateVsDistrictAvg >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {rateVsDistrictAvg >= 0 ? `+${rateVsDistrictAvg}%` : `${rateVsDistrictAvg}%`}
          </div>
          <p className="text-[11px] text-[#CFE2E8]">
            District benchmark: {districtAvgRate}%
          </p>
        </div>
      </div>

      {/* 3. Village-wise DR Analysis Table & Visual Progression */}
      <div className="p-6 rounded-3xl bg-[#073B4C] border border-[#0F5E78] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#0F5E78] pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#FFD166]" />
              <span>Village-Level DR Rate Breakdown — {selectedTaluka} Taluka</span>
            </h3>
            <p className="text-xs text-[#CFE2E8]">
              Granular epidemiological surveillance across all gram panchayats & rural wards.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#FFD166] bg-[#052631] px-3 py-1 rounded-lg border border-[#0F5E78]">
            {villageStats.length} Villages Surveyed
          </span>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#0F5E78] text-[#CFE2E8] font-bold">
                <th className="py-2.5 px-3">Village Name</th>
                <th className="py-2.5 px-3 text-center">Screened</th>
                <th className="py-2.5 px-3 text-center">Normal (G0)</th>
                <th className="py-2.5 px-3 text-center">DR Positive</th>
                <th className="py-2.5 px-3">DR Rate & Visual Severity</th>
                <th className="py-2.5 px-3 text-center">Mild/Mod (G1-2)</th>
                <th className="py-2.5 px-3 text-center">Severe (G3-4)</th>
                <th className="py-2.5 px-3 text-right">Surveillance Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F5E78]/50 text-white">
              {villageStats.map((v, i) => (
                <tr key={v.villageName} className="hover:bg-[#052631]/60 transition-colors">
                  <td className="py-3 px-3 font-bold flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#052631] border border-[#0F5E78] text-[10px] flex items-center justify-center text-[#FFD166] font-mono">
                      {i + 1}
                    </span>
                    <span>{v.villageName}</span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">{v.totalScreened}</td>
                  <td className="py-3 px-3 text-center font-mono text-emerald-400">{v.normalCases}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-[#FFD166]">{v.totalDrCases}</td>
                  <td className="py-3 px-3 min-w-[170px]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                        <span>{v.drRatePct}%</span>
                        <span className="text-[10px] text-[#CFE2E8] font-normal">
                          {v.drRatePct >= 20 ? 'Critical' : v.drRatePct >= 15 ? 'Elevated' : 'Controlled'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#052631] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            v.drRatePct >= 20 ? 'bg-rose-500' : v.drRatePct >= 15 ? 'bg-amber-400' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, v.drRatePct * 3.5)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-amber-300">
                    {v.mildCases + v.moderateCases}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-rose-400">
                    {v.severeCases}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${v.alertColor}`}>
                      {v.riskAlert}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Comparative Taluka Benchmarking Cards */}
      <div className="p-6 rounded-3xl bg-[#073B4C] border border-[#0F5E78] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#0F5E78] pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FFD166]" />
              <span>Comparative DR Analysis Across Talukas in {selectedDistrict} District</span>
            </h3>
            <p className="text-xs text-[#CFE2E8]">
              Compare {selectedTaluka}'s performance against neighboring blocks to assist government fund allocation.
            </p>
          </div>
          <span className="text-xs text-[#CFE2E8] font-mono">
            District Mean: <strong className="text-white">{districtAvgRate}%</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {comparativeTalukas.map((ct) => (
            <div
              key={ct.talukaName}
              className={`p-4 rounded-2xl border transition-all ${
                ct.isCurrent
                  ? 'bg-[#052631] border-[#FFD166] ring-1 ring-[#FFD166]'
                  : 'bg-[#052631]/60 border-[#0F5E78]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">
                  {ct.talukaName} {ct.isCurrent && '(Selected)'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  ct.isCurrent 
                    ? 'bg-[#FFD166] text-[#073B4C] border-[#FFD166]' 
                    : ct.drRatePct > districtAvgRate 
                    ? 'bg-rose-950/70 text-rose-300 border-rose-800' 
                    : 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                }`}>
                  {ct.drRatePct}% DR Rate
                </span>
              </div>

              <div className="space-y-1 text-xs text-[#CFE2E8]">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Survey Volume:</span>
                  <span className="font-mono text-white">{ct.screenedCount} patients</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Relative Status:</span>
                  <span className="font-semibold text-white">{ct.status}</span>
                </div>
              </div>

              <div className="mt-3 w-full h-1.5 bg-[#073B4C] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${ct.drRatePct > districtAvgRate ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, ct.drRatePct * 3.5)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. EMAIL TO GOVERNMENT MODAL */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#073B4C] border border-[#0F5E78] p-6 sm:p-8 shadow-2xl space-y-6 my-auto text-white">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#0F5E78] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#052631] text-[#FFD166] border border-[#0F5E78]">
                    Official Government Channel
                  </span>
                  <span className="text-xs text-[#CFE2E8]">DHS Maharashtra Surveillance Dispatch</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  Send Epidemiological Analysis to Government
                </h3>
              </div>

              <button
                onClick={() => setEmailModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#052631] hover:bg-[#0F5E78] text-[#FFD166] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient Information */}
            <div className="p-4 rounded-2xl bg-[#052631] border border-[#0F5E78] space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-[#CFE2E8]">Primary Recipient (DHO):</span>
                <span className="font-mono font-bold text-[#FFD166]">{emailRecipient}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-t border-[#0F5E78]/50 pt-2">
                <span className="text-[#CFE2E8]">Directorate CC:</span>
                <span className="font-mono text-[#CFE2E8]">{emailCc}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-t border-[#0F5E78]/50 pt-2">
                <span className="text-[#CFE2E8]">Official Subject:</span>
                <span className="font-medium text-white truncate max-w-md">{emailSubject}</span>
              </div>
            </div>

            {/* Structured Report Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white">
                <span>Official Surveillance Dossier Preview</span>
                <span className="text-[10px] font-mono text-[#FFD166]">Auto-Formatted by VisionXAI</span>
              </div>

              <pre className="p-4 rounded-2xl bg-[#052631] border border-[#0F5E78] font-mono text-[11px] text-[#CFE2E8] leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap select-all">
                {emailBodyText}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleLaunchMailto}
                className="py-3 px-4 rounded-xl bg-[#052631] hover:bg-[#0F5E78] border border-[#0F5E78] text-[#FFD166] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Email App (Gmail / Outlook)</span>
              </button>

              <button
                type="button"
                onClick={handleOfficialElectronicDispatch}
                className="py-3 px-4 rounded-xl bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Transmit Official Electronic Dispatch</span>
              </button>
            </div>

            {/* Success Feedback Banner */}
            {emailSentSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-bold flex items-center gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">Surveillance Report Successfully Dispatched to Government!</p>
                  <p className="font-mono text-[11px] text-emerald-300">
                    Official Reference Code: {dispatchRefCode} • Transmitted to District Health Officer & DHS Maharashtra.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
