import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { NurseDashboard } from './NurseDashboard';
import { NurseFundusImaging } from './NurseFundusImaging';
import { 
  Building2, 
  Camera, 
  LayoutDashboard, 
  BadgeCheck,
  User
} from 'lucide-react';

export function NursePortal({ onBackToHome }) {
  const { currentUser, openProfileModal } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('imaging');
  const [selectedPatientIdForImaging, setSelectedPatientIdForImaging] = useState(null);

  const handleStartImagingForPatient = (patientId) => {
    setSelectedPatientIdForImaging(patientId);
    setActiveTab('imaging');
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 relative">
      
      {/* Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#073B4C] text-white border border-[#0F5E78] shadow-sm relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#052631] flex items-center justify-center text-[#FFD166] dark:text-[#FFD166] border border-[#0F5E78]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#052631] text-[#FFD166] dark:text-[#FFD166] border border-[#0F5E78]">
                  {t('tier2')}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {t('nursePortal')}
                </h1>
              </div>
              <p className="text-xs text-[#CFE2E8] font-medium">
                {t('nurseSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Nurse Badge */}
        <div className="p-3 rounded-2xl bg-[#052631] text-white border border-[#0F5E78] text-xs shrink-0 flex items-center justify-between gap-3 shadow-sm">
          <div>
            <p className="font-bold text-white flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-[#FFD166] dark:text-[#FFD166]" />
              <span>{currentUser?.name || t('nurseTitle')}</span>
            </p>
            <p className="text-[11px] text-[#CFE2E8] font-mono">ID: {currentUser?.licenseId || 'RN-9024'} • {currentUser?.state || 'Maharashtra'}</p>
          </div>
          <button
            onClick={openProfileModal}
            className="ml-1 px-3 py-1.5 rounded-xl bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
            title="View Profile"
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div>

      </div>

      {/* Sub Navigation */}
      <div className="flex items-center gap-2 border-b border-[#0F5E78]/30 dark:border-[#0F5E78] pb-3 relative z-10">
        <button
          onClick={() => setActiveTab('imaging')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'imaging'
              ? 'glow-btn-purple text-[#073B4C] shadow-sm'
              : 'bg-[#052631] border border-[#0F5E78] text-white hover:bg-[#073B4C]'
          }`}
        >
          <Camera className={`w-4 h-4 ${activeTab === 'imaging' ? 'text-[#073B4C]' : 'text-[#FFD166] dark:text-[#FFD166]'}`} />
          <span>{t('imagingSuite')}</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'dashboard'
              ? 'glow-btn-purple text-[#073B4C] shadow-sm'
              : 'bg-[#052631] border border-[#0F5E78] text-white hover:bg-[#073B4C]'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-[#073B4C]' : 'text-[#FFD166] dark:text-[#FFD166]'}`} />
          <span>{t('examChairQueue')}</span>
        </button>
      </div>

      {/* Portal Views */}
      <div className="relative z-10">
        {activeTab === 'imaging' ? (
          <NurseFundusImaging 
            selectedPatientId={selectedPatientIdForImaging}
            onSelectPatientId={setSelectedPatientIdForImaging}
            onImagingCompleted={() => setActiveTab('dashboard')}
          />
        ) : (
          <NurseDashboard onStartImaging={handleStartImagingForPatient} />
        )}
      </div>

    </div>
  );
}
