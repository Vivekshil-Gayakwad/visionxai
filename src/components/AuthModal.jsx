import React, { useState, useEffect } from 'react';
import { useAuth, DEFAULT_STAFF_ACCOUNTS } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  VERIFIED_REGISTRIES, 
  STATES_LIST, 
  QUALIFICATIONS_LIST, 
  SPECIALIZATIONS_LIST, 
  ORGANIZATIONS_LIST 
} from '../lib/verifiedRegistry';
import {
  MAHARASHTRA_STATE,
  MAHARASHTRA_DISTRICTS,
  MAHARASHTRA_TALUKAS,
  getHospitalsForTaluka
} from '../lib/maharashtraData';
import { 
  X, 
  Sparkles, 
  Eye, 
  UserCheck, 
  Building2, 
  Stethoscope, 
  Lock, 
  Mail, 
  Phone, 
  FileText, 
  User, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  UploadCloud,
  GraduationCap,
  Award,
  MapPin,
  Briefcase,
  Clock,
  Camera,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Search,
  ExternalLink,
  Info
} from 'lucide-react';

export function AuthModal({ initialTab = 'login', initialRole = 'asha', onClose, onLoginSuccess }) {
  const { login, register, checkLicenseValidity } = useAuth();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState(initialRole); // 'asha' | 'nurse' | 'doctor'

  // Login Form States (supports Email Address OR Mobile Number)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Expanded Registration Form States with Fixed Maharashtra, District, Taluka & 10 Hospital Options
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const state = MAHARASHTRA_STATE; // Fixed and non-changeable as mandated
  const [district, setDistrict] = useState('Satara');
  const [taluka, setTaluka] = useState('Khandala');
  const [currentOrganization, setCurrentOrganization] = useState(() => {
    return getHospitalsForTaluka('Satara', 'Khandala')[0]?.name || 'Khandala Sub-District Civil Hospital';
  });
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [organizationAddress, setOrganizationAddress] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [idCardUrl, setIdCardUrl] = useState('');
  const [idCardFileName, setIdCardFileName] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // District & Taluka Cascading Handlers
  const handleDistrictChange = (newDist) => {
    setDistrict(newDist);
    const talukas = MAHARASHTRA_TALUKAS[newDist] || [];
    const firstTaluka = talukas[0] || '';
    setTaluka(firstTaluka);
    const hospitals = getHospitalsForTaluka(newDist, firstTaluka);
    setCurrentOrganization(hospitals[0]?.name || '');
  };

  const handleTalukaChange = (newTaluka) => {
    setTaluka(newTaluka);
    const hospitals = getHospitalsForTaluka(district, newTaluka);
    setCurrentOrganization(hospitals[0]?.name || '');
  };

  // Live License Verification State: only shown when user explicitly clicks "Verify License"
  const [licenseStatus, setLicenseStatus] = useState({
    state: 'idle', // 'idle' | 'checking' | 'valid' | 'claimed' | 'invalid'
    message: '',
    details: null
  });
  const [showRegistryExplorer, setShowRegistryExplorer] = useState(false);
  const [registrySearch, setRegistrySearch] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const portals = [
    {
      id: 'asha',
      title: t('ashaTitle') || 'ASHA Worker',
      subtitle: t('ashaSubtitle') || 'Community & Rural Survey',
      icon: UserCheck,
      badge: 'Tier 1 Screening',
      color: 'emerald',
      activeBorder: 'border-[#FFD166] ring-1 ring-[#FFD166]',
      activeBg: 'bg-[#052631]',
      badgeClass: 'bg-[#0B6B3A] text-white border-[#0B6B3A]',
      authority: 'National Health Mission (NHM)',
      licenseLabel: 'ASHA Registration / Accreditation ID',
      licensePlaceholder: 'e.g. ASH-MH-102 / ASH-KA-204'
    },
    {
      id: 'nurse',
      title: t('nurseTitle') || 'Ophthalmic Nurse',
      subtitle: t('nurseSubtitle') || 'Fundus Imaging & DR %',
      icon: Building2,
      badge: 'Tier 2 Imaging',
      color: 'cyan',
      activeBorder: 'border-[#FFD166] ring-1 ring-[#FFD166]',
      activeBg: 'bg-[#052631]',
      badgeClass: 'bg-[#073B4C] text-[#FFD166] border-[#0F5E78]',
      authority: 'State Nursing Council & Indian Nursing Council (INC)',
      licenseLabel: 'Nursing Council Registration (RN/RM Number)',
      licensePlaceholder: 'e.g. RN-MH-9024 / RN-MH-4412'
    },
    {
      id: 'doctor',
      title: t('doctorTitle') || 'Ophthalmologist',
      subtitle: t('doctorSubtitle') || 'Vitreo-Retinal Tele-Care',
      icon: Stethoscope,
      badge: 'Tier 3 Specialist',
      color: 'pink',
      activeBorder: 'border-[#FFD166] ring-1 ring-[#FFD166]',
      activeBg: 'bg-[#052631]',
      badgeClass: 'bg-[#EF476F] text-white border-[#EF476F]',
      authority: 'National Medical Commission / MCI / State Council',
      licenseLabel: 'MCI / NMC State Medical Council Registration',
      licensePlaceholder: 'e.g. MCI-REG-44912 / MCI-REG-28314'
    }
  ];

  const currentPortalConfig = portals.find(p => p.id === selectedRole) || portals[0];

  // When selected role changes, reset role-specific error and idle verification
  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setErrorMessage('');
    setSuccessMessage('');
    setLicenseStatus({ state: 'idle', message: '', details: null });
    // Reset role-specific qualification & specialization if changed
    setQualification('');
    setSpecialization('');
  };

  // Verify license ID against official dataset - ONLY runs on button click or sample pick
  const verifyLicense = async (idToVerify, roleToVerify = selectedRole) => {
    const cleanId = (idToVerify || '').trim();
    if (!cleanId) {
      setErrorMessage('Please enter an official Medical Registration / License ID to verify.');
      setLicenseStatus({ state: 'idle', message: '', details: null });
      return;
    }

    setErrorMessage('');
    setLicenseStatus({
      state: 'checking',
      message: 'Verifying registration with state healthcare registry...',
      details: null
    });

    try {
      const res = await checkLicenseValidity(roleToVerify, cleanId);
      if (res.valid) {
        setLicenseStatus({
          state: 'valid',
          message: `Official Registry Match: ${res.details?.fullName || res.details?.designation || 'Accredited Healthcare Staff'} - ${res.details?.authority || 'Accreditation Authority'}`,
          details: res.details
        });

        // Auto-fill available details if fields are still blank
        if (res.details) {
          if (!fullName && res.details.fullName) setFullName(res.details.fullName);
          if (!qualification && res.details.qualification) setQualification(res.details.qualification);
          if (!specialization && res.details.specialization) setSpecialization(res.details.specialization);
          if (!currentOrganization && res.details.currentOrganization) setCurrentOrganization(res.details.currentOrganization);
          if (!organizationAddress && res.details.organizationAddress) setOrganizationAddress(res.details.organizationAddress);
          if (!experienceYears && res.details.experienceYears) setExperienceYears(String(res.details.experienceYears));
        }
      } else {
        setLicenseStatus({
          state: res.already_registered ? 'claimed' : 'invalid',
          message: res.error,
          details: res.details || null
        });
      }
    } catch (err) {
      setLicenseStatus({
        state: 'invalid',
        message: err.message || 'Error connecting to registry database.',
        details: null
      });
    }
  };

  // Handle auto-filling a sample verified registry entry
  const handleSelectSample = (sample) => {
    setLicenseId(sample.licenseId);
    setFullName(sample.fullName);
    setQualification(sample.qualification);
    setSpecialization(sample.specialization);
    setCurrentOrganization(sample.currentOrganization);
    setOrganizationAddress(sample.organizationAddress);
    setExperienceYears(String(sample.experienceYears));
    
    // Provide a sample official document preview for testing convenience
    if (!idCardUrl) {
      const svgCard = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="400" height="240" rx="16" fill="%231e1136"/><rect x="12" y="12" width="376" height="216" rx="10" fill="%232b174d" stroke="%238b5cf6" stroke-width="2"/><circle cx="60" cy="70" r="30" fill="%237c3aed"/><text x="60" y="78" font-family="sans-serif" font-size="24" fill="%23ffffff" text-anchor="middle">ID</text><text x="110" y="55" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23ffffff">${encodeURIComponent(sample.fullName)}</text><text x="110" y="75" font-family="sans-serif" font-size="11" fill="%23a78bfa">${encodeURIComponent(sample.licenseId)}</text><text x="110" y="95" font-family="sans-serif" font-size="10" fill="%23cbd5e1">${encodeURIComponent(sample.authority || 'State Authority')}</text><line x1="30" y1="125" x2="370" y2="125" stroke="%234c1d95" stroke-width="1.5"/><text x="30" y="150" font-family="sans-serif" font-size="11" fill="%2394a3b8">State: ${encodeURIComponent(sample.state || 'Maharashtra')}</text><text x="30" y="170" font-family="sans-serif" font-size="11" font-weight="bold" fill="%23e2e8f0">${encodeURIComponent(sample.currentOrganization.substring(0, 38))}</text><text x="30" y="200" font-family="sans-serif" font-size="10" fill="%2310b981">✓ VERIFIED OFFICIAL CREDENTIAL</text></svg>`;
      setIdCardUrl(svgCard);
      setIdCardFileName(`${sample.licenseId}_Official_Credential.svg`);
    }

    // Verify and immediately display verified status when selected from the list
    verifyLicense(sample.licenseId, selectedRole);
    setShowRegistryExplorer(false);
  };

  // Handle ID Card File Upload
  const handleIdCardFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Professional ID card file must be under 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setIdCardUrl(reader.result);
      setIdCardFileName(file.name);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  // Handle Profile Photo File Upload
  const handleProfilePhotoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage('Profile photograph must be under 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfilePhotoUrl(reader.result);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  // Auto-fill default pre-seeded staff account for current role
  const handleAutoFillStaff = () => {
    setErrorMessage('');
    if (selectedRole === 'asha') {
      setLoginIdentifier('asha.worker@visionxai.org');
      setLoginPassword('Asha2026!');
    } else if (selectedRole === 'nurse') {
      setLoginIdentifier('nurse.rekha@visionxai.org');
      setLoginPassword('Nurse2026!');
    } else {
      setLoginIdentifier('dr.arvind@visionxai.org');
      setLoginPassword('Doctor2026!');
    }
  };

  // Auto-fill with registered Mobile Number for testing dual identifier
  const handleAutoFillMobile = () => {
    setErrorMessage('');
    if (selectedRole === 'asha') {
      setLoginIdentifier('+91 98220 10200');
      setLoginPassword('Asha2026!');
    } else if (selectedRole === 'nurse') {
      setLoginIdentifier('+91 98220 90240');
      setLoginPassword('Nurse2026!');
    } else {
      setLoginIdentifier('+91 98220 44912');
      setLoginPassword('Doctor2026!');
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        // LOGIN FLOW
        if (!loginIdentifier.trim() || !loginPassword.trim()) {
          setErrorMessage('Please enter both your Email / Mobile Number and your password.');
          setLoading(false);
          return;
        }

        const res = await login(loginIdentifier, loginPassword, selectedRole);
        if (res && res.success) {
          onLoginSuccess && onLoginSuccess(selectedRole);
          onClose();
        } else {
          setErrorMessage(res?.error || 'Authentication failed. Please verify your credentials.');
        }
      } else {
        // REGISTRATION FLOW
        if (!fullName.trim()) {
          setErrorMessage('Full Name as per official government/medical documents is mandatory.');
          setLoading(false);
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setErrorMessage('A valid professional or personal email address is mandatory.');
          setLoading(false);
          return;
        }
        const cleanMobile = mobile.replace(/\D/g, '');
        if (cleanMobile.length < 10) {
          setErrorMessage('A valid 10-digit mobile contact number is mandatory.');
          setLoading(false);
          return;
        }
        if (!licenseId.trim()) {
          setErrorMessage('Official Medical Registration / Accreditation Number is mandatory.');
          setLoading(false);
          return;
        }
        if (!state) {
          setErrorMessage('State of medical registration is mandatory.');
          setLoading(false);
          return;
        }
        if (!idCardUrl) {
          setErrorMessage('Uploading your Official Hospital / Medical ID Card is mandatory.');
          setLoading(false);
          return;
        }
        if (!qualification.trim()) {
          setErrorMessage('Professional qualification is mandatory. Please select from the dropdown.');
          setLoading(false);
          return;
        }
        if (!specialization.trim()) {
          setErrorMessage('Medical specialization is mandatory. Please select from the dropdown.');
          setLoading(false);
          return;
        }
        if (!currentOrganization.trim()) {
          setErrorMessage('Current Hospital, Clinic, or PHC Organization is mandatory. Please select from the dropdown.');
          setLoading(false);
          return;
        }
        if (!organizationAddress.trim()) {
          setErrorMessage('Organization / Workplace address is mandatory.');
          setLoading(false);
          return;
        }
        if (regPassword.length < 6) {
          setErrorMessage('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        if (regPassword !== confirmPassword) {
          setErrorMessage('Passwords do not match. Please re-enter.');
          setLoading(false);
          return;
        }

        // Verify with official registry before submitting
        const verification = await checkLicenseValidity(selectedRole, licenseId.trim());
        if (!verification.valid) {
          setErrorMessage(verification.error);
          setLicenseStatus({
            state: verification.already_registered ? 'claimed' : 'invalid',
            message: verification.error,
            details: verification.details || null
          });
          setLoading(false);
          return;
        }

        const registrationPayload = {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          mobile: mobile.trim(),
          role: selectedRole,
          licenseId: licenseId.trim().toUpperCase(),
          state: state,
          district: district,
          taluka: taluka,
          qualification: qualification.trim(),
          specialization: specialization.trim(),
          currentOrganization: currentOrganization.trim(),
          organizationAddress: organizationAddress.trim(),
          experienceYears: parseInt(experienceYears) || 0,
          idCardUrl: idCardUrl,
          profilePhotoUrl: profilePhotoUrl,
          password: regPassword.trim()
        };

        const res = await register(registrationPayload);
        if (res && res.success) {
          setSuccessMessage('Account created and verified successfully! Access granted.');
          setTimeout(() => {
            onLoginSuccess && onLoginSuccess(selectedRole);
            onClose();
          }, 800);
        } else {
          setErrorMessage(res?.error || 'Registration failed. Please check your details.');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter sample registry for active role
  const roleRegistrySamples = (VERIFIED_REGISTRIES[selectedRole] || []).filter(item => {
    if (!registrySearch.trim()) return true;
    const q = registrySearch.toLowerCase();
    return (
      item.licenseId.toLowerCase().includes(q) ||
      item.fullName.toLowerCase().includes(q) ||
      (item.state && item.state.toLowerCase().includes(q)) ||
      item.currentOrganization.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl rounded-3xl overflow-hidden bg-[#073B4C] border border-[#0F5E78] shadow-2xl flex flex-col md:flex-row max-h-[94vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#052631] hover:bg-[#0A485C] border border-[#0F5E78] text-[#FFD166] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT PANEL: Context & Trust Branding */}
        <div className="relative w-full md:w-5/12 bg-[#052631] border-b md:border-b-0 md:border-r border-[#0F5E78] p-6 sm:p-8 flex flex-col justify-between text-white select-none">
          
          {/* Brand Top */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#073B4C] border border-[#0F5E78] flex items-center justify-center text-[#FFD166] shadow-sm">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white block leading-none">
                  Vision<span className="text-[#EF476F]">X</span>AI
                </span>
                <span className="text-[10px] text-[#CFE2E8] font-mono tracking-widest uppercase">
                  Tele-Ophthalmology
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#073B4C] border border-[#0F5E78] text-[11px] font-semibold text-[#FFD166]">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD166]" />
              <span>500 State-Accredited Healthcare IDs</span>
            </div>
          </div>

          {/* Dynamic Active Portal Card */}
          <div className="relative z-10 my-6 p-4 rounded-2xl bg-[#073B4C] border border-[#0F5E78] space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#CFE2E8] font-bold">
                Designated Clinical Portal
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FFD166] text-[#073B4C]">
                {currentPortalConfig.badge}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              {React.createElement(currentPortalConfig.icon, { className: 'w-5 h-5 text-[#FFD166]' })}
              <span>{currentPortalConfig.title}</span>
            </h3>

            <p className="text-xs text-[#CFE2E8] leading-relaxed">
              {currentPortalConfig.subtitle}. Pre-verified state accreditation required for tele-health operations.
            </p>

            <div className="pt-2 border-t border-[#0F5E78] text-[11px] text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0B6B3A] shrink-0" />
              <span className="line-clamp-1 text-[#CFE2E8]">{currentPortalConfig.authority}</span>
            </div>
          </div>

          {/* Portal Segregation Notice */}
          <div className="relative z-10 p-3 rounded-xl bg-[#031D26] border border-[#0F5E78] text-[11px] text-[#CFE2E8] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Info className="w-3.5 h-3.5 text-[#FFD166]" />
              <span>Role Isolation Policy</span>
            </div>
            <p className="text-[10px] leading-relaxed text-[#CFE2E8]">
              Each medical account is strictly bound to its licensed tier. ASHA workers, Nurses, and Doctors cannot cross-authenticate into another tier's clinical records.
            </p>
          </div>

          {/* Footer Standards */}
          <div className="relative z-10 pt-4 border-t border-[#0F5E78] flex items-center justify-between text-[10px] text-[#CFE2E8]">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0B6B3A]" />
              HIPAA & NABH Compliant
            </span>
            <span className="font-mono font-bold text-[#FFD166]">v2.4 Live</span>
          </div>
        </div>

        {/* RIGHT PANEL: Authentication Form */}
        <div className="w-full md:w-7/12 bg-[#073B4C] p-5 sm:p-7 overflow-y-auto flex flex-col justify-between max-h-[85vh] md:max-h-[94vh] text-white">
          
          <div>
            {/* Header: Tab Switcher */}
            <div className="flex items-center justify-between border-b border-[#0F5E78] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'login'
                      ? 'bg-[#FFD166] text-[#073B4C] shadow-sm'
                      : 'text-[#CFE2E8] hover:text-white bg-[#052631] border border-[#0F5E78]'
                  }`}
                >
                  {t('signIn') || 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setErrorMessage(''); setSuccessMessage(''); }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'register'
                      ? 'bg-[#FFD166] text-[#073B4C] shadow-sm'
                      : 'text-[#CFE2E8] hover:text-white bg-[#052631] border border-[#0F5E78]'
                  }`}
                >
                  {t('createAccount') || 'Create Account'}
                </button>
              </div>

              <span className="text-[11px] text-[#FFD166] font-mono hidden sm:inline">
                {activeTab === 'login' ? 'Email / Mobile Sign-In' : 'Official Registry Verification'}
              </span>
            </div>

            {/* Role Portal Selection Tabs */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white">
                  Select Target Clinical Portal
                </p>
                <span className="text-[10px] text-[#FFD166] font-semibold">
                  3 Official Portals
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {portals.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedRole === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleRoleSelect(p.id)}
                      className={`relative p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected 
                          ? 'border-[#FFD166] bg-[#052631] ring-1 ring-[#FFD166] shadow-sm text-white' 
                          : 'border-[#0F5E78] bg-[#073B4C] text-[#CFE2E8] hover:border-[#FFD166] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#073B4C] border border-[#0F5E78] text-[#FFD166]">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded border bg-[#052631] text-[#FFD166] border-[#0F5E78]">
                          {p.badge.split(' ')[0]} {p.badge.split(' ')[1]}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-bold leading-tight text-white">
                          {p.title}
                        </p>
                        <p className="text-[10px] text-[#CFE2E8] line-clamp-1 mt-0.5">
                          {p.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error & Success Feedback Banners */}
            {errorMessage && (
              <div className="mb-3 p-3 rounded-xl bg-[#031D26] border border-[#EF476F] text-[#EF476F] text-xs flex items-start gap-2 shadow-sm animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-[#EF476F] shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-3 p-3 rounded-xl bg-[#031D26] border border-[#0B6B3A] text-emerald-300 text-xs flex items-center gap-2 shadow-sm animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* LOGIN FORM (Email OR Mobile Number)                           */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'login' ? (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {/* Email or Mobile Number Input */}
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Email Address or Registered Mobile Number <span className="text-[#EF476F]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#FFD166]" />
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. dr.arvind@visionxai.org or +91 98220 44912"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#052631] border border-[#0F5E78] text-xs text-white placeholder:text-[#CFE2E8]/50 focus:border-[#FFD166] focus:ring-1 focus:ring-[#FFD166] font-medium outline-none"
                      required
                      autoComplete="username"
                    />
                  </div>
                  <p className="text-[10px] text-[#CFE2E8] mt-1">
                    Sign in with either your official email address or 10-digit mobile number.
                  </p>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Password <span className="text-[#EF476F]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#FFD166]" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your registered password"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#052631] border border-[#0F5E78] text-xs text-white placeholder:text-[#CFE2E8]/50 focus:border-[#FFD166] focus:ring-1 focus:ring-[#FFD166] font-medium outline-none"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {/* Quick Staff Testing Pill */}
                <div className="p-3 rounded-xl bg-[#052631] border border-[#0F5E78] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0B6B3A]" />
                      Pre-Authorized Staff Account:
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#073B4C] text-[#FFD166] border border-[#0F5E78]">
                      {selectedRole.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#CFE2E8] space-y-0.5">
                    <div>
                      <span className="font-semibold text-white">Email:</span>{' '}
                      <span className="font-mono text-[#FFD166]">
                        {selectedRole === 'asha' ? 'asha.worker@visionxai.org' : selectedRole === 'nurse' ? 'nurse.rekha@visionxai.org' : 'dr.arvind@visionxai.org'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-white">Mobile:</span>{' '}
                      <span className="font-mono text-[#FFD166]">
                        {selectedRole === 'asha' ? '+91 98220 10200' : selectedRole === 'nurse' ? '+91 98220 90240' : '+91 98220 44912'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-[#0F5E78]">
                    <button
                      type="button"
                      onClick={handleAutoFillStaff}
                      className="px-2.5 py-1 rounded-lg bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] font-bold text-[10px] transition-colors"
                    >
                      Fill with Email
                    </button>
                    <button
                      type="button"
                      onClick={handleAutoFillMobile}
                      className="px-2.5 py-1 rounded-lg bg-[#073B4C] hover:bg-[#0A485C] text-white font-bold text-[10px] transition-colors border border-[#0F5E78]"
                    >
                      Fill with Mobile Number
                    </button>
                  </div>
                </div>

                {/* Submit Sign In Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-all active:scale-[0.99]"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-[#073B4C]/30 border-t-[#073B4C] rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to {currentPortalConfig.title} Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            ) : (
              /* ------------------------------------------------------------- */
              /* REGISTRATION FORM (Full User-Mandated Professional Fields)     */
              /* ------------------------------------------------------------- */
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* ----------------------------------------------------------- */}
                {/* SECTION 1: OFFICIAL REGISTRATION & STATE REGISTRY CHECK     */}
                {/* ----------------------------------------------------------- */}
                <div className="p-3.5 rounded-2xl bg-[#052631] border border-[#0F5E78] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#FFD166]" />
                      <span className="text-xs font-bold text-white">
                        1. Official Medical Registration / License
                      </span>
                    </div>
                    <span className="text-[10px] text-[#EF476F] font-bold uppercase tracking-wider">Mandatory</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white mb-1">
                      {currentPortalConfig.licenseLabel} <span className="text-[#EF476F]">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <FileText className="absolute left-3 top-2.5 w-4 h-4 text-[#FFD166]" />
                        <input
                          type="text"
                          value={licenseId}
                          onChange={(e) => {
                            setLicenseId(e.target.value.toUpperCase());
                            setLicenseStatus({ state: 'idle', message: '', details: null });
                            setErrorMessage('');
                          }}
                          placeholder={currentPortalConfig.licensePlaceholder}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#073B4C] border border-[#0F5E78] text-xs text-white placeholder:text-[#CFE2E8]/50 font-mono font-semibold focus:border-[#FFD166] focus:ring-1 focus:ring-[#FFD166] outline-none"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => verifyLicense(licenseId, selectedRole)}
                        className="px-3.5 py-2 rounded-xl bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] font-bold text-xs shrink-0 transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Verify License</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-[#CFE2E8] mt-1">
                      Enter your registration number and click <strong>Verify License</strong> to validate against state council records.
                    </p>
                  </div>

                  {/* Live Verification Status Card (Only shown when Verify License is clicked) */}
                  {licenseStatus.state !== 'idle' && (
                    <div className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 animate-in fade-in duration-150 ${
                      licenseStatus.state === 'checking'
                        ? 'bg-[#073B4C] border-[#0F5E78] text-white'
                        : licenseStatus.state === 'valid'
                        ? 'bg-[#031D26] border-[#0B6B3A] text-emerald-300'
                        : licenseStatus.state === 'claimed'
                        ? 'bg-[#031D26] border-[#FFD166] text-[#FFD166]'
                        : 'bg-[#031D26] border-[#EF476F] text-[#EF476F]'
                    }`}>
                      {licenseStatus.state === 'checking' && (
                        <span className="w-4 h-4 border-2 border-[#FFD166]/30 border-t-[#FFD166] rounded-full animate-spin shrink-0 mt-0.5" />
                      )}
                      {licenseStatus.state === 'valid' && (
                        <CheckCircle2 className="w-4 h-4 text-[#0B6B3A] shrink-0 mt-0.5" />
                      )}
                      {(licenseStatus.state === 'claimed' || licenseStatus.state === 'invalid') && (
                        <AlertCircle className="w-4 h-4 text-[#EF476F] shrink-0 mt-0.5" />
                      )}
                      
                      <div className="flex-1">
                        <p className="font-semibold text-[11px] leading-tight">
                          {licenseStatus.state === 'valid' && 'Official Registry Match Confirmed!'}
                          {licenseStatus.state === 'claimed' && 'License Already Registered!'}
                          {licenseStatus.state === 'invalid' && 'Registry Check Failed:'}
                          {licenseStatus.state === 'checking' && 'Querying State Registry...'}
                        </p>
                        <p className="text-[10px] mt-0.5 opacity-90 leading-relaxed">
                          {licenseStatus.message}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Pre-Verified Registry Sample Explorer Drawer (500 records) */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowRegistryExplorer(!showRegistryExplorer)}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#073B4C] hover:bg-[#0A485C] text-[#FFD166] text-[11px] font-semibold transition-colors border border-[#0F5E78]"
                    >
                      <span className="flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-[#FFD166]" />
                        Browse Accredited {currentPortalConfig.title} State IDs ({VERIFIED_REGISTRIES[selectedRole]?.length || 0} Registered)
                      </span>
                      {showRegistryExplorer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showRegistryExplorer && (
                      <div className="mt-2 p-3 rounded-xl bg-[#031D26] border border-[#0F5E78] space-y-2 max-h-56 overflow-y-auto animate-in slide-in-from-top-2 duration-150">
                        <input
                          type="text"
                          value={registrySearch}
                          onChange={(e) => setRegistrySearch(e.target.value)}
                          placeholder="Search accredited IDs by number, name, state or hospital..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#0F5E78] bg-[#073B4C] text-xs text-white placeholder:text-[#CFE2E8]/50 focus:border-[#FFD166] outline-none"
                        />

                        <div className="space-y-1.5">
                          {roleRegistrySamples.slice(0, 30).map((sample) => (
                            <div
                              key={sample.licenseId}
                              className="p-2 rounded-lg border border-[#0F5E78] bg-[#052631] hover:border-[#FFD166] flex items-center justify-between gap-2 text-xs transition-colors"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-[#FFD166] text-[11px]">
                                    {sample.licenseId}
                                  </span>
                                  <span className="font-semibold text-white text-[11px] truncate">
                                    {sample.fullName}
                                  </span>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#073B4C] text-[#CFE2E8] border border-[#0F5E78] font-semibold">
                                    {sample.state || 'Maharashtra'}
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#CFE2E8] truncate">
                                  {sample.currentOrganization}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleSelectSample(sample)}
                                className="px-2.5 py-1 rounded bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] text-[10px] font-bold shrink-0 transition-colors"
                              >
                                Select & Fill
                              </button>
                            </div>
                          ))}
                          {roleRegistrySamples.length > 30 && (
                            <p className="text-center text-[10px] text-[#FFD166] font-semibold pt-1">
                              Showing 30 of {roleRegistrySamples.length} matching accredited IDs. Use search to filter by state or district.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ----------------------------------------------------------- */}
                {/* SECTION 2: PERSONAL & CONTACT INFORMATION                   */}
                {/* ----------------------------------------------------------- */}
                <div className="p-3.5 rounded-2xl bg-[#052631] border border-[#0F5E78] space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#FFD166]" />
                    <span className="text-xs font-bold text-white">
                      2. Personal & Contact Information
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-white mb-1">
                        Full Name (as per official documents) <span className="text-[#EF476F]">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-[#FFD166]" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Dr. Priya Kulkarni / Lata Shinde"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#073B4C] border border-[#0F5E78] text-xs text-white placeholder:text-[#CFE2E8]/50 focus:border-[#FFD166] outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-[11px] font-semibold text-white mb-1">
                        Email Address (Personal / Work) <span className="text-[#EF476F]">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#FFD166]" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="priya.k@hospital.gov.in"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#073B4C] border border-[#0F5E78] text-xs text-white placeholder:text-[#CFE2E8]/50 focus:border-[#FFD166] outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-[11px] font-semibold text-white mb-1">
                        Mobile Contact Number <span className="text-[#EF476F]">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 w-4 h-4 text-[#FFD166]" />
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="+91 98220 28314"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#073B4C] border border-[#0F5E78] text-xs text-white placeholder:text-[#CFE2E8]/50 font-mono focus:border-[#FFD166] outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ----------------------------------------------------------- */}
                {/* SECTION 3: QUALIFICATIONS, STATE & WORKPLACE DROPDOWNS      */}
                {/* ----------------------------------------------------------- */}
                <div className="p-3.5 rounded-2xl bg-[#052631] border border-[#0F5E78] space-y-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#FFD166]" />
                    <span className="text-xs font-bold text-white">
                      3. Professional Credentials, State & Organization Dropdowns
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Fixed State: Maharashtra */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-white">
                          State of Clinical Practice <span className="text-[#EF476F]">*</span>
                        </label>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                          Maharashtra
                        </span>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#FFD166] pointer-events-none" />
                        <input
                          type="text"
                          value="Maharashtra"
                          readOnly
                          disabled
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#073B4C]/70 border border-[#0F5E78] text-xs text-[#CFE2E8] font-bold cursor-not-allowed outline-none select-none"
                        />
                      </div>
                    </div>

                    {/* District Dropdown (All 36 Districts of Maharashtra) */}
                    <div>
                      <label className="block text-[11px] font-semibold text-white mb-1">
                        District (Maharashtra) <span className="text-[#EF476F]">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-[#FFD166] pointer-events-none" />
                        <select
                          value={district}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#073B4C] border border-[#0F5E78] text-xs text-white font-medium focus:border-[#FFD166] outline-none"
                          required
                        >
                          {MAHARASHTRA_DISTRICTS.map((d) => (
                            <option key={d} value={d} className="text-white bg-[#073B4C]">
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Taluka Dropdown (Specific to Selected District) */}
                    <div>
                      <label className="block text-[11px] font-semibold text-white mb-1">
                        Taluka / Block ({district}) <span className="text-[#EF476F]">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-[#FFD166] pointer-events-none" />
                        <select
                          value={taluka}
                          onChange={(e) => handleTalukaChange(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#073B4C] border border-[#0F5E78] text-xs text-white font-medium focus:border-[#FFD166] outline-none"
                          required
                        >
                          {(MAHARASHTRA_TALUKAS[district] || []).map((t) => (
                            <option key={t} value={t} className="text-white bg-[#073B4C]">
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Experience (Years) */}
                    <div>
                      <label className="block text-[11px] font-semibold text-white mb-1">
                        Experience (Years) <span className="text-[#CFE2E8]/60 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-2.5 w-4 h-4 text-[#FFD166]" />
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          placeholder="e.g. 8"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#073B4C] border border-[#0F5E78] text-xs text-white placeholder:text-[#CFE2E8]/50 focus:border-[#FFD166] outline-none"
                        />
                      </div>
                    </div>

                    {/* Current Organization / Hospital (10 Options for Selected Taluka) */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-white">
                          Current Hospital / Healthcare Facility ({taluka} Taluka) <span className="text-[#EF476F]">*</span>
                        </label>
                        <span className="text-[10px] text-[#FFD166] font-mono">10 Taluka Facilities</span>
                      </div>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-[#FFD166] pointer-events-none" />
                        <select
                          value={currentOrganization}
                          onChange={(e) => setCurrentOrganization(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#073B4C] border border-[#0F5E78] text-xs text-white font-medium focus:border-[#FFD166] outline-none"
                          required
                        >
                          <option value="">-- Select Hospital / PHC in {taluka} --</option>
                          {getHospitalsForTaluka(district, taluka).map((h) => (
                            <option key={h.id} value={h.name} className="text-white bg-[#073B4C]">
                              {h.name} — {h.recommendationTag}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Qualification Dropdown */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-white mb-1">
                        Qualification (Degrees / Certifications) <span className="text-[#EF476F]">*</span>
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-[#FFD166] pointer-events-none" />
                        <select
                          value={qualification}
                          onChange={(e) => setQualification(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#073B4C] border border-[#0F5E78] text-xs text-white font-medium focus:border-[#FFD166] outline-none"
                          required
                        >
                          <option value="">-- Select Professional Qualification --</option>
                          {(QUALIFICATIONS_LIST[selectedRole] || []).map((q) => (
                            <option key={q} value={q} className="text-white bg-[#073B4C]">
                              {q}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Specialization Dropdown */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-white mb-1">
                        Specialization / Clinical Domain <span className="text-[#EF476F]">*</span>
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-[#FFD166] pointer-events-none" />
                        <select
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#073B4C] border border-[#0F5E78] text-xs text-white font-medium focus:border-[#FFD166] outline-none"
                          required
                        >
                          <option value="">-- Select Clinical Specialization --</option>
                          {(SPECIALIZATIONS_LIST[selectedRole] || []).map((s) => (
                            <option key={s} value={s} className="text-white bg-[#073B4C]">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Organization Workplace Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-white mb-1">
                        Workplace Address & Block <span className="text-[#EF476F]">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-[#FFD166]" />
                        <input
                          type="text"
                          value={organizationAddress}
                          onChange={(e) => setOrganizationAddress(e.target.value)}
                          placeholder="e.g. Civil Hospital Road, Satara District, Maharashtra 415001"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#073B4C] border border-[#0F5E78] text-xs text-white placeholder:text-[#CFE2E8]/50 focus:border-[#FFD166] outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ----------------------------------------------------------- */}
                {/* SECTION 4: DOCUMENT UPLOAD & PROFILE PHOTOGRAPH             */}
                {/* ----------------------------------------------------------- */}
                <div className="p-3.5 rounded-2xl bg-[#052631] border border-[#0F5E78] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-[#FFD166]" />
                      <span className="text-xs font-bold text-white">
                        4. Identity Documents & Profile Photograph
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Professional ID Card Upload (Mandatory) */}
                    <div>
                      <label className="block text-[11px] font-semibold text-white mb-1">
                        Professional ID Card Upload <span className="text-[#EF476F]">*</span>
                      </label>

                      {idCardUrl ? (
                        <div className="p-2.5 rounded-xl border border-[#0B6B3A] bg-[#031D26] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={idCardUrl}
                              alt="ID Preview"
                              className="w-10 h-8 rounded object-cover border border-[#0F5E78] bg-white"
                            />
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-white truncate">
                                {idCardFileName || 'Official_ID_Card.jpg'}
                              </p>
                              <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-semibold">
                                <CheckCircle2 className="w-3 h-3" /> Document Ready
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => { setIdCardUrl(''); setIdCardFileName(''); }}
                            className="p-1 rounded-lg text-[#EF476F] hover:bg-[#073B4C] transition-colors"
                            title="Remove document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-[#0F5E78] hover:border-[#FFD166] bg-[#073B4C] cursor-pointer transition-colors text-center group">
                          <UploadCloud className="w-5 h-5 text-[#FFD166] group-hover:scale-110 transition-transform mb-1" />
                          <span className="text-[11px] font-bold text-white">
                            Upload Official ID Card
                          </span>
                          <span className="text-[9px] text-[#CFE2E8]">
                            Hospital badge, Medical council card (Max 5MB)
                          </span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleIdCardFile}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Profile Photograph (Optional) */}
                    <div>
                      <label className="block text-[11px] font-semibold text-white mb-1">
                        Profile Photograph <span className="text-[#CFE2E8]/60 font-normal">(Optional)</span>
                      </label>

                      {profilePhotoUrl ? (
                        <div className="p-2 rounded-xl border border-[#0F5E78] bg-[#031D26] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={profilePhotoUrl}
                              alt="Avatar Preview"
                              className="w-9 h-9 rounded-full object-cover border-2 border-[#FFD166]"
                            />
                            <span className="text-[11px] font-medium text-white">
                              Photo Attached
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setProfilePhotoUrl('')}
                            className="p-1 rounded-lg text-[#EF476F] hover:bg-[#073B4C] transition-colors"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-[#0F5E78] hover:border-[#FFD166] bg-[#073B4C] cursor-pointer transition-colors text-center group">
                          <Camera className="w-5 h-5 text-[#FFD166] group-hover:scale-110 transition-transform mb-1" />
                          <span className="text-[11px] font-semibold text-white">
                            Upload Profile Photo
                          </span>
                          <span className="text-[9px] text-[#CFE2E8]">
                            Professional headshot (Max 3MB)
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePhotoFile}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                  </div>
                </div>

                {/* ----------------------------------------------------------- */}
                {/* SECTION 5: ACCOUNT CREDENTIALS & SECURITY                   */}
                {/* ----------------------------------------------------------- */}
                <div className="p-3.5 rounded-2xl bg-[#052631] border border-[#0F5E78] space-y-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#FFD166]" />
                    <span className="text-xs font-bold text-white">
                      5. Account Security Credentials
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-white mb-1">
                        Password <span className="text-[#EF476F]">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#FFD166]" />
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#073B4C] border border-[#0F5E78] text-xs text-white placeholder:text-[#CFE2E8]/50 focus:border-[#FFD166] outline-none"
                          required
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-white mb-1">
                        Confirm Password <span className="text-[#EF476F]">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#FFD166]" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#073B4C] border border-[#0F5E78] text-xs text-white placeholder:text-[#CFE2E8]/50 focus:border-[#FFD166] outline-none"
                          required
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Register Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#FFD166] hover:bg-[#E5BC5C] text-[#073B4C] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-all active:scale-[0.99]"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-[#073B4C]/30 border-t-[#073B4C] rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Submit Registration for {currentPortalConfig.title}</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>

          {/* Bottom Switcher */}
          <div className="pt-3 mt-4 border-t border-[#0F5E78] text-center text-xs text-[#CFE2E8]">
            {activeTab === 'login' ? (
              <p>
                Need to register official credentials?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setErrorMessage(''); setSuccessMessage(''); }}
                  className="font-bold text-[#FFD166] hover:underline ml-1"
                >
                  {t('createAccount') || 'Create Account'}
                </button>
              </p>
            ) : (
              <p>
                Already have registered credentials?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }}
                  className="font-bold text-[#FFD166] hover:underline ml-1"
                >
                  {t('signIn') || 'Sign In'}
                </button>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
