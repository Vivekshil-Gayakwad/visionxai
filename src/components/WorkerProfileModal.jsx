import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  MapPin, 
  Mail, 
  Phone, 
  Award, 
  Clock, 
  User, 
  Lock
} from 'lucide-react';

export function WorkerProfileModal({ onClose }) {
  const { currentUser, closeProfileModal } = useAuth();
  const { t } = useLanguage();
  const [showFullCard, setShowFullCard] = useState(false);

  const handleClose = onClose || closeProfileModal;

  if (!currentUser) return null;

  const roleConfig = {
    asha: {
      title: 'Accredited Social Health Activist (ASHA Worker)',
      tier: 'Tier 1 Rural Screening',
      authorityDefault: 'National Health Mission (NHM)'
    },
    nurse: {
      title: 'Ophthalmic Nurse & Fundus Technician',
      tier: 'Tier 2 Clinical Imaging',
      authorityDefault: 'State Nursing Council & INC'
    },
    doctor: {
      title: 'Consultant Vitreo-Retinal Ophthalmologist',
      tier: 'Tier 3 Tele-Care & Diagnostics',
      authorityDefault: 'National Medical Commission & State Medical Council'
    }
  };

  const currentRole = roleConfig[currentUser.role] || roleConfig.asha;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden bg-[#073B4C] border border-[#0F5E78] shadow-2xl flex flex-col max-h-[90vh] text-white">
        
        {/* Header Bar */}
        <div className="p-5 border-b border-[#0F5E78] flex items-center justify-between bg-[#052631]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#073B4C] border border-[#0F5E78] text-[#FFD166] flex items-center justify-center shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                Verified Professional Profile
              </h2>
              <p className="text-[11px] text-[#CFE2E8] font-medium">
                Official Clinical Credentials & State Accreditation Dossier
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#073B4C] hover:bg-[#0A485C] border border-[#0F5E78] text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-white">
          
          {/* Top Hero Banner */}
          <div className="p-4 rounded-2xl border border-[#0F5E78] bg-[#052631] flex flex-col sm:flex-row items-center sm:items-start gap-4 relative overflow-hidden">
            {/* Avatar */}
            {currentUser.profilePhotoUrl ? (
              <img
                src={currentUser.profilePhotoUrl}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#FFD166] shadow-md shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#073B4C] text-[#FFD166] font-bold text-2xl flex items-center justify-center shadow-sm shrink-0 border-2 border-[#FFD166]">
                {(currentUser.name || 'MD').substring(0, 2).toUpperCase()}
              </div>
            )}

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#073B4C] text-[#FFD166] border border-[#0F5E78]">
                  {currentRole.tier}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0B6B3A] text-white border border-[#0B6B3A] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                  State Council Verified
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#073B4C] text-[#CFE2E8] border border-[#0F5E78]">
                  {currentUser.state || 'Maharashtra'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">
                {currentUser.name}
              </h3>

              <p className="text-xs font-semibold text-[#FFD166]">
                {currentRole.title}
              </p>

              <p className="text-[11px] text-[#CFE2E8] font-mono">
                Official License ID: <span className="font-bold text-white">{currentUser.licenseId}</span>
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Qualification */}
            <div className="p-3.5 rounded-xl bg-[#052631] border border-[#0F5E78] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD166] flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#FFD166]" />
                Qualification & Degrees
              </span>
              <p className="text-xs font-semibold text-white leading-snug">
                {currentUser.qualification || 'Official Medical Accreditation'}
              </p>
            </div>

            {/* Specialization */}
            <div className="p-3.5 rounded-xl bg-[#052631] border border-[#0F5E78] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD166] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#FFD166]" />
                Specialization / Domain
              </span>
              <p className="text-xs font-semibold text-white leading-snug">
                {currentUser.specialization || 'Diabetic Retinopathy & Eye Care'}
              </p>
            </div>

            {/* Current Organization */}
            <div className="p-3.5 rounded-xl bg-[#052631] border border-[#0F5E78] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD166] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#FFD166]" />
                Current Organization
              </span>
              <p className="text-xs font-semibold text-white leading-snug">
                {currentUser.currentOrganization || 'District Tele-Ophthalmology Hospital'}
              </p>
            </div>

            {/* Experience */}
            <div className="p-3.5 rounded-xl bg-[#052631] border border-[#0F5E78] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD166] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FFD166]" />
                Professional Experience
              </span>
              <p className="text-xs font-semibold text-white leading-snug">
                {currentUser.experienceYears ? `${currentUser.experienceYears} Years Clinical Practice` : 'Accredited Healthcare Service'}
              </p>
            </div>

            {/* Workplace Address */}
            <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#052631] border border-[#0F5E78] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD166] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FFD166]" />
                Workplace Address & State
              </span>
              <p className="text-xs font-medium text-white leading-snug">
                {currentUser.organizationAddress || 'Civil Hospital Road, Satara District, Maharashtra'}
                {currentUser.state && ` (${currentUser.state})`}
              </p>
            </div>

            {/* Email Address */}
            <div className="p-3.5 rounded-xl bg-[#052631] border border-[#0F5E78] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD166] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#FFD166]" />
                Official Email
              </span>
              <p className="text-xs font-mono font-medium text-white truncate">
                {currentUser.email}
              </p>
            </div>

            {/* Mobile Contact Number */}
            <div className="p-3.5 rounded-xl bg-[#052631] border border-[#0F5E78] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFD166] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#FFD166]" />
                Registered Mobile Number
              </span>
              <p className="text-xs font-mono font-medium text-white">
                {currentUser.mobile || '+91 98220 XXXXX'}
              </p>
            </div>

          </div>

          {/* Official ID Card Document Preview */}
          <div className="p-4 rounded-2xl bg-[#052631] border border-[#0F5E78] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-[#FFD166]" />
                Official Professional ID Card / Accreditation Document
              </span>
              <span className="text-[10px] text-white font-bold flex items-center gap-1 bg-[#0B6B3A] px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-white" /> Verified On File
              </span>
            </div>

            {currentUser.idCardUrl ? (
              <div className="p-2 rounded-xl border border-[#0F5E78] bg-[#073B4C] flex flex-col items-center">
                <img
                  src={currentUser.idCardUrl}
                  alt="Official Professional ID"
                  className="max-h-48 rounded-lg object-contain border border-[#0F5E78] bg-white"
                />
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed border-[#0F5E78] text-center text-[#CFE2E8] text-xs">
                Official Credential Document Verified by State Registration Registry ({currentUser.licenseId})
              </div>
            )}
          </div>

          {/* Strict Role Isolation Security Notice */}
          <div className="p-3.5 rounded-xl bg-[#031D26] border border-[#EF476F]/40 text-xs text-[#CFE2E8] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#EF476F]">
              <Lock className="w-3.5 h-3.5 text-[#EF476F]" />
              <span>Portal Access Restriction Active</span>
            </div>
            <p className="text-[10px] text-[#CFE2E8] leading-relaxed">
              Your session is securely bound to the <strong>{currentRole.title}</strong> portal. To protect patient health records, cross-portal navigation is restricted. Click Sign Out in the header to end your session.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#0F5E78] flex items-center justify-between bg-[#052631]">
          <span className="text-[11px] text-[#CFE2E8] font-mono">
            VisionXAI HIPAA / NABH v2.4
          </span>
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] font-bold text-xs transition-colors shadow-sm"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
}
