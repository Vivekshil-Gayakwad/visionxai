import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Eye, 
  Sparkles, 
  UserCheck, 
  LogOut, 
  Building2, 
  Stethoscope, 
  UserPlus, 
  LogIn,
  Layers,
  BrainCircuit,
  Languages,
  Sun,
  Moon,
  Globe,
  User,
  ShieldCheck
} from 'lucide-react';

export function Navbar({ activeSection, setActiveSection }) {
  const { currentUser, logout, openAuthModal, openProfileModal } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();

  const isPortalSession = Boolean(currentUser);

  // When logged into a portal, strictly hide public home and 3-tier informational tabs
  // Public tabs are shown ONLY when signed out
  const navItems = isPortalSession
    ? []
    : [
        { id: 'home', label: t('home') },
        { id: 'workflow', label: t('workflow'), icon: Layers },
        { id: 'xai', label: t('xai'), icon: BrainCircuit },
      ];

  const languagesList = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'mr', label: 'मराठी', short: 'मरा' },
    { code: 'hi', label: 'हिंदी', short: 'हिं' }
  ];

  const portalNames = {
    asha: t('ashaPortal') || 'ASHA Field Portal',
    nurse: t('nursePortal') || 'Nurse Imaging Suite',
    doctor: t('doctorPortal') || 'Doctor Tele-Care Portal'
  };

  const portalColors = {
    asha: 'bg-[#073B4C] text-[#FFD166] border-[#0F5E78] dark:bg-[#0A485C] dark:text-[#FFD166] dark:border-[#146E8C]',
    nurse: 'bg-[#073B4C] text-[#FFD166] border-[#0F5E78] dark:bg-[#0A485C] dark:text-[#FFD166] dark:border-[#146E8C]',
    doctor: 'bg-[#073B4C] text-[#FFD166] border-[#0F5E78] dark:bg-[#0A485C] dark:text-[#FFD166] dark:border-[#146E8C]'
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#0F5E78] dark:border-[#146E8C]/60 bg-[#052631] dark:bg-[#00080C] transition-colors shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo - In portal session, clicking stays in designated portal */}
          <div 
            onClick={() => {
              if (!isPortalSession) {
                setActiveSection('home');
              }
            }}
            className={`flex items-center gap-3 select-none ${isPortalSession ? 'cursor-default' : 'cursor-pointer group'}`}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#073B4C] border border-[#0F5E78] shadow-sm transition-transform group-hover:scale-105">
              <Eye className="w-5 h-5 text-[#FFD166]" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white">
                  Vision<span className="text-[#EF476F]">X</span>AI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#EF476F] text-white">
                  DR
                </span>
              </div>
              <span className="text-[11px] text-[#CFE2E8] font-medium hidden sm:block">
                {t('brandSubtitle')}
              </span>
            </div>
          </div>

          {/* Navigation Controls: Active Portal Workspace Indicator when logged in, or Public Tabs when signed out */}
          {isPortalSession ? (
            <div className="flex items-center gap-2">
              <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-sm ${portalColors[currentUser.role] || portalColors.doctor}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFD166] animate-pulse" />
                <span>{portalNames[currentUser.role]} Workspace</span>
                <span className="text-[10px] opacity-80 font-mono">({currentUser.state || 'Maharashtra'})</span>
              </div>
            </div>
          ) : (
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navItems.map(item => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive 
                        ? 'bg-[#073B4C] text-[#FFD166] border border-[#FFD166] shadow-sm' 
                        : 'text-[#CFE2E8] hover:text-white hover:bg-[#073B4C] border border-transparent'
                    }`}
                  >
                    {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FFD166]' : 'text-[#CFE2E8]'}`} />}
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Controls: Language Switcher + Dark/Light Toggle + Profile / Sign In */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Switcher Dropdown / Pill */}
            <div className="relative">
              <div className="flex items-center bg-[#073B4C] border border-[#0F5E78] dark:border-[#146E8C] rounded-xl p-0.5 shadow-sm">
                {languagesList.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                      language === lang.code
                        ? 'bg-[#FFD166] text-[#073B4C] shadow-sm'
                        : 'text-[#CFE2E8] hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-[#073B4C] border border-[#0F5E78] dark:border-[#146E8C] flex items-center justify-center text-[#FFD166] hover:bg-[#0A485C] transition-colors shadow-sm"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-[#FFD166]" /> : <Moon className="w-4 h-4 text-[#FFD166]" />}
            </button>

            {/* User Session Controls: Profile Option + Sign Out */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Worker Profile Button - Accessible across all portals */}
                <button
                  onClick={openProfileModal}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#073B4C] hover:bg-[#0A485C] border border-[#0F5E78] dark:border-[#146E8C] text-xs font-bold text-white transition-all shadow-sm"
                  title="View Verified Medical Professional Profile"
                >
                  {currentUser.profilePhotoUrl ? (
                    <img src={currentUser.profilePhotoUrl} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-[#FFD166]" />
                  )}
                  <span className="hidden sm:inline">{currentUser.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FFD166] text-[#073B4C] font-bold">
                    Profile
                  </span>
                </button>

                {/* Sign Out Button - Exits portal session and restores public home */}
                <button
                  onClick={() => { logout(); setActiveSection('home'); }}
                  className="px-3 py-1.5 rounded-xl bg-[#EF476F]/10 hover:bg-[#EF476F]/20 border border-[#EF476F]/40 text-[#EF476F] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  title="Sign out of clinical workspace"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('signOut')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#073B4C] hover:bg-[#0A485C] border border-[#0F5E78] dark:border-[#146E8C] transition-all"
                >
                  {t('signIn')}
                </button>

                <button
                  onClick={() => openAuthModal('register')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#073B4C] bg-[#FFD166] hover:bg-[#FFC338] border border-[#FFD166] transition-all shadow-sm flex items-center gap-1"
                >
                  <span>{t('createAccount')}</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
