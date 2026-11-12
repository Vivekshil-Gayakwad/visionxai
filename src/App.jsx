import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AshaPortal } from './components/asha/AshaPortal';
import { NursePortal } from './components/nurse/NursePortal';
import { DoctorPortal } from './components/doctor/DoctorPortal';
import { PublicReportView } from './components/PublicReportView';
import { AuthModal } from './components/AuthModal';
import { WorkerProfileModal } from './components/WorkerProfileModal';
import { Footer } from './components/Footer';

function MainLayout() {
  const [activeSection, setActiveSection] = useState('home');

  // Detect direct report link from WhatsApp / URL (e.g. ?report=VX-2026-XXXX or #/report/VX-2026-XXXX or /report/VX-2026-XXXX)
  const extractReportId = () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const q = searchParams.get('report');
      if (q) return q;
      if (window.location.hash.includes('report/')) {
        const parts = window.location.hash.split('report/');
        if (parts[1]) return parts[1].split('?')[0].split('/')[0];
      }
      if (window.location.pathname.includes('/report/')) {
        const parts = window.location.pathname.split('/report/');
        if (parts[1]) return parts[1].split('?')[0].split('/')[0];
      }
    } catch {}
    return null;
  };

  const [reportPatientId, setReportPatientId] = useState(extractReportId);

  useEffect(() => {
    const handleUrlChange = () => {
      setReportPatientId(extractReportId());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const { 
    currentUser,
    authModalOpen, 
    closeAuthModal, 
    authModalInitialTab, 
    selectedRoleForAuth,
    profileModalOpen,
    closeProfileModal
  } = useAuth();

  const handleLoginSuccess = (role) => {
    if (role === 'asha') setActiveSection('asha-portal');
    else if (role === 'nurse') setActiveSection('nurse-portal');
    else if (role === 'doctor') setActiveSection('doctor-portal');
  };

  const isPortalActive = ['asha-portal', 'nurse-portal', 'doctor-portal'].includes(activeSection);
  const isHeroSection = ['home', 'workflow', 'xai'].includes(activeSection);

  // Map navbar section to Hero slide index
  const sectionToSlide = { home: 0, workflow: 1, xai: 2 };
  const heroInitialSlide = sectionToSlide[activeSection] ?? 0;

  // When Hero arrows change slides, sync navbar highlight
  const handleHeroSlideChange = (sectionId) => {
    setActiveSection(sectionId);
  };

  // Enforce rule: When logged into any portal, only that portal is active.
  // Public sections (home, 3-tier workflow, XAI) are shown ONLY when signed out.
  useEffect(() => {
    if (currentUser) {
      const designated = `${currentUser.role}-portal`;
      if (activeSection !== designated) {
        setActiveSection(designated);
      }
    } else if (isPortalActive) {
      setActiveSection('home');
    }
  }, [currentUser]);

  // If opening via direct WhatsApp report link, render dedicated Medical Report View
  if (reportPatientId) {
    return (
      <PublicReportView
        patientId={reportPatientId}
        onBack={() => {
          try {
            const url = new URL(window.location);
            url.searchParams.delete('report');
            if (url.pathname.includes('/report/')) {
              url.pathname = '/';
            }
            if (url.hash.includes('report/')) {
              url.hash = '';
            }
            window.history.pushState({}, '', url.pathname + url.search + url.hash);
          } catch {}
          setReportPatientId(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0d7192] dark:bg-[#082733] text-white flex flex-col relative transition-colors duration-200 font-sans">
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Main Navbar */}
        <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />

        {/* Section View Routing - Strictly isolated */}
        <main className="flex-1">
          {isHeroSection && (
            <Hero 
              setActiveSection={setActiveSection} 
              initialSlide={heroInitialSlide}
              onSlideChange={handleHeroSlideChange}
            />
          )}

          {activeSection === 'asha-portal' && (
            <AshaPortal onBackToHome={() => setActiveSection('home')} />
          )}

          {activeSection === 'nurse-portal' && (
            <NursePortal onBackToHome={() => setActiveSection('home')} />
          )}

          {activeSection === 'doctor-portal' && (
            <DoctorPortal onBackToHome={() => setActiveSection('home')} />
          )}
        </main>

        {/* Footer shown on all public pages including home */}
        {!isPortalActive && (
          <Footer setActiveSection={setActiveSection} />
        )}
      </div>

      {/* Auth Modal */}
      {authModalOpen && (
        <AuthModal
          initialTab={authModalInitialTab}
          initialRole={selectedRoleForAuth}
          onClose={closeAuthModal}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Worker Profile Modal - Accessible across all 3 portals */}
      {profileModalOpen && (
        <WorkerProfileModal onClose={closeProfileModal} />
      )}

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <PatientProvider>
            <MainLayout />
          </PatientProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
