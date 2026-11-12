import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { lookupVerifiedLicense, VERIFIED_REGISTRIES } from '../lib/verifiedRegistry';
import {
  loginProfessionalApi,
  registerProfessionalApi,
  verifyLicenseApi,
  fetchVerifiedRegistry
} from '../lib/api';

const AuthContext = createContext();

// Pre-authorized staff credentials for quick clinical testing (supports Email OR Mobile login)
export const DEFAULT_STAFF_ACCOUNTS = {
  'asha.worker@visionxai.org': {
    email: 'asha.worker@visionxai.org',
    mobile: '+91 98220 10200',
    password: 'Asha2026!',
    name: 'Sunita Patil',
    licenseId: 'ASH-MH-102',
    role: 'asha',
    roleTitle: 'Accredited Social Health Activist (ASHA Worker)',
    state: 'Maharashtra',
    district: 'Satara',
    taluka: 'Khandala',
    village: 'Shirwal',
    qualification: 'Higher Secondary (12th) + NHM ASHA Modular 1-7 Certified',
    specialization: 'Community Eye & Chronic Disease Screening',
    currentOrganization: 'Khandala Sub-District Civil Hospital',
    organizationAddress: 'Shirwal Rural Sub-Center, Taluka Khandala, Satara, Maharashtra 412801',
    experienceYears: 6
  },
  'nurse.rekha@visionxai.org': {
    email: 'nurse.rekha@visionxai.org',
    mobile: '+91 98220 90240',
    password: 'Nurse2026!',
    name: 'Sister Rekha Sharma, RN',
    licenseId: 'RN-MH-9024',
    role: 'nurse',
    roleTitle: 'Ophthalmic Nurse & Fundus Technician',
    state: 'Maharashtra',
    district: 'Satara',
    taluka: 'Khandala',
    qualification: 'B.Sc. Nursing (RN/RM) + Ophthalmic Photography Certified',
    specialization: 'Digital Retinal Fundus Photography & Patient Dilation',
    currentOrganization: 'Khandala Sub-District Civil Hospital',
    organizationAddress: 'Civil Hospital Road, Khandala, Satara, Maharashtra 412802',
    experienceYears: 8
  },
  'dr.arvind@visionxai.org': {
    email: 'dr.arvind@visionxai.org',
    mobile: '+91 98220 44912',
    password: 'Doctor2026!',
    name: 'Dr. Vivek Gayakwad, MS',
    licenseId: 'MCI-REG-44912',
    role: 'doctor',
    roleTitle: 'Consultant Vitreo-Retinal Surgeon',
    state: 'Maharashtra',
    district: 'Satara',
    taluka: 'Khandala',
    qualification: 'MBBS, MS (Ophthalmology), FVRS (Vitreo-Retina Fellow)',
    specialization: 'Diabetic Retinopathy, Macular Edema & Laser Photocoagulation',
    currentOrganization: 'Khandala Sub-District Civil Hospital',
    organizationAddress: 'Super-Specialty Eye Wing, Khandala Sub-District Hospital, Satara, Maharashtra 412802',
    experienceYears: 14
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('visionxai_auth_user_v2');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && (u.name === 'Dr. Arvind Mehra, MS' || u.name === 'Dr. Arvind Mehra')) {
          u.name = 'Dr. Vivek Gayakwad, MS';
          localStorage.setItem('visionxai_auth_user_v2', JSON.stringify(u));
        }
        return u;
      } catch (e) { return null; }
    }
    return null;
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('visionxai_registered_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {};
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState('login');
  const [selectedRoleForAuth, setSelectedRoleForAuth] = useState('asha');
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('visionxai_auth_user_v2', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('visionxai_auth_user_v2');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('visionxai_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const cleanPhone = (phoneStr) => {
    return (phoneStr || '').replace(/\D/g, '');
  };

  /**
   * Check if a license ID is in the official verified registry for a role.
   */
  const checkLicenseValidity = async (role, licenseId) => {
    const cleanId = (licenseId || '').trim();
    if (!role || !cleanId) {
      return { valid: false, error: 'License number and role are required.' };
    }

    try {
      const res = await verifyLicenseApi(role, cleanId);
      return res;
    } catch (err) {
      // Offline fallback: check local verified registries
      const matched = lookupVerifiedLicense(role, cleanId);
      if (!matched) {
        return {
          valid: false,
          error: `Medical Registration Number '${cleanId}' was not found in the verified ${role.toUpperCase()} registry. Only accredited personnel can register.`,
          already_registered: false
        };
      }

      // Check if already registered locally
      const isClaimed = Object.values(registeredUsers).some(
        u => u.licenseId && u.licenseId.toUpperCase() === cleanId.toUpperCase()
      ) || Object.values(DEFAULT_STAFF_ACCOUNTS).some(
        u => u.licenseId && u.licenseId.toUpperCase() === cleanId.toUpperCase()
      );

      if (isClaimed) {
        return {
          valid: false,
          error: `An account with Medical Registration Number '${cleanId}' already exists. Please log in instead.`,
          already_registered: true,
          details: matched
        };
      }

      return {
        valid: true,
        already_registered: false,
        details: matched
      };
    }
  };

  /**
   * Login handler with:
   * 1. Dual identifier support: Email OR Mobile Number
   * 2. Strict portal role segregation: ASHA cannot access Nurse/Doctor, and vice versa
   * 3. Rejection of unverified/random credentials
   */
  const login = async (emailOrMobile, password, portalRole) => {
    const cleanId = (emailOrMobile || '').trim();
    const cleanPass = (password || '').trim();
    const targetRole = (portalRole || 'asha').toLowerCase();

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Please enter both Email / Mobile number and password.' };
    }

    // Role titles for clear error feedback
    const roleTitles = {
      asha: 'ASHA Health Worker',
      nurse: 'Ophthalmic Nurse',
      doctor: 'Consultant Ophthalmologist'
    };

    // 1. Try Backend API first
    try {
      const res = await loginProfessionalApi(cleanId, cleanPass, targetRole);
      if (res && res.success && res.profile) {
        const userObj = {
          id: res.profile.id,
          email: res.profile.email,
          mobile: res.profile.mobile,
          name: res.profile.full_name,
          licenseId: res.profile.license_id,
          role: res.profile.role,
          roleTitle: roleTitles[res.profile.role] || res.profile.role,
          qualification: res.profile.qualification,
          specialization: res.profile.specialization,
          currentOrganization: res.profile.current_organization,
          organizationAddress: res.profile.organization_address,
          experienceYears: res.profile.experience_years,
          idCardUrl: res.profile.id_card_url,
          profilePhotoUrl: res.profile.profile_photo_url
        };
        setCurrentUser(userObj);
        return { success: true, user: userObj };
      }
    } catch (apiErr) {
      const msg = apiErr.message || '';
      // If server explicitly denied access (e.g. wrong password or role mismatch), surface it directly!
      if (msg.includes('Access Denied') || msg.includes('Incorrect password') || msg.includes('Account not found')) {
        const cleanMsg = msg.replace(/^API \d+:\s*\{?"detail":\s*"?/, '').replace(/"?\}?$/, '');
        return { success: false, error: cleanMsg };
      }
    }

    // 2. Offline / Local fallback validation
    const cleanDigits = cleanPhone(cleanId);
    const cleanLower = cleanId.toLowerCase();

    // Find in default staff accounts
    let matchedUser = Object.values(DEFAULT_STAFF_ACCOUNTS).find(acc => {
      const accDigits = cleanPhone(acc.mobile);
      return (
        acc.email.toLowerCase() === cleanLower ||
        (cleanDigits && accDigits && accDigits === cleanDigits) ||
        acc.licenseId.toUpperCase() === cleanId.toUpperCase()
      );
    });

    // Or in locally registered users
    if (!matchedUser) {
      matchedUser = Object.values(registeredUsers).find(acc => {
        const accDigits = cleanPhone(acc.mobile);
        return (
          acc.email.toLowerCase() === cleanLower ||
          (cleanDigits && accDigits && accDigits === cleanDigits) ||
          acc.licenseId.toUpperCase() === cleanId.toUpperCase()
        );
      });
    }

    if (!matchedUser) {
      return {
        success: false,
        error: 'Account not found for this Email or Mobile Number. Please check your credentials or click Register to create your account.'
      };
    }

    // Strict Role / Portal Segregation Check
    if (matchedUser.role !== targetRole) {
      const userRoleTitle = roleTitles[matchedUser.role] || matchedUser.role.toUpperCase();
      const targetRoleTitle = roleTitles[targetRole] || targetRole.toUpperCase();
      return {
        success: false,
        error: `Access Denied: Your account is officially registered as an ${userRoleTitle}. You cannot log in to the ${targetRoleTitle} Portal. Please select your designated portal.`
      };
    }

    // Password Check
    if (matchedUser.password !== cleanPass) {
      return {
        success: false,
        error: 'Incorrect password. Please re-enter your password.'
      };
    }

    // Login successful
    const userObj = {
      id: matchedUser.id || `usr_${cleanLower.replace(/[^a-z0-9]/g, '_')}`,
      email: matchedUser.email,
      mobile: matchedUser.mobile,
      name: matchedUser.name || matchedUser.fullName,
      licenseId: matchedUser.licenseId,
      role: matchedUser.role,
      roleTitle: roleTitles[matchedUser.role] || matchedUser.role,
      state: matchedUser.state || 'Maharashtra',
      district: matchedUser.district || 'Satara',
      taluka: matchedUser.taluka || 'Khandala',
      qualification: matchedUser.qualification,
      specialization: matchedUser.specialization,
      currentOrganization: matchedUser.currentOrganization,
      organizationAddress: matchedUser.organizationAddress,
      experienceYears: matchedUser.experienceYears,
      idCardUrl: matchedUser.idCardUrl,
      profilePhotoUrl: matchedUser.profilePhotoUrl
    };

    setCurrentUser(userObj);
    return { success: true, user: userObj };
  };

  /**
   * Register handler with full clinical professional fields & verified registry validation:
   * - Full Name (Mandatory)
   * - Email Address (Mandatory)
   * - Mobile Number (Mandatory)
   * - Medical Registration Number (Mandatory, checked against role registry)
   * - Professional ID Card Upload (Mandatory)
   * - Qualification (Mandatory)
   * - Specialization (Mandatory)
   * - Current Organization (Mandatory)
   * - Organization Address (Mandatory)
   * - Experience (Years) (Optional)
   * - Profile Photo (Optional)
   * - Password (Mandatory, min 6 chars)
   */
  const register = async (professionalData) => {
    const {
      fullName,
      email,
      mobile,
      role,
      licenseId,
      state,
      district,
      taluka,
      qualification,
      specialization,
      currentOrganization,
      organizationAddress,
      experienceYears,
      idCardUrl,
      profilePhotoUrl,
      password
    } = professionalData;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();
    const cleanId = (licenseId || '').trim();
    const cleanMobile = (mobile || '').trim();
    const targetRole = (role || 'asha').toLowerCase();
    const targetState = (state || 'Maharashtra').trim();
    const targetDistrict = (district || 'Satara').trim();
    const targetTaluka = (taluka || 'Khandala').trim();

    // 1. Mandatory Fields Validation
    if (!fullName || !fullName.trim()) return { success: false, error: 'Full Name as per official documents is required.' };
    if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'Valid professional or personal email is required.' };
    if (!cleanMobile || cleanPhone(cleanMobile).length < 10) return { success: false, error: 'Valid 10-digit mobile number is required.' };
    if (!cleanId) return { success: false, error: 'Medical Registration / License Number is mandatory.' };
    if (!targetState) return { success: false, error: 'State of medical registration is mandatory.' };
    if (!idCardUrl) return { success: false, error: 'Professional ID Card upload is mandatory for identity verification.' };
    if (!qualification || !qualification.trim()) return { success: false, error: 'Professional qualification is mandatory.' };
    if (!specialization || !specialization.trim()) return { success: false, error: 'Medical specialization is mandatory.' };
    if (!currentOrganization || !currentOrganization.trim()) return { success: false, error: 'Current hospital / organization name is mandatory.' };
    if (!organizationAddress || !organizationAddress.trim()) return { success: false, error: 'Organization workplace address is mandatory.' };
    if (!cleanPass || cleanPass.length < 6) return { success: false, error: 'Password must be at least 6 characters long.' };

    // 2. Pre-Verified Registry Check
    const verification = await checkLicenseValidity(targetRole, cleanId);
    if (!verification.valid) {
      return { success: false, error: verification.error };
    }

    const payload = {
      full_name: fullName.trim(),
      email: cleanEmail,
      mobile: cleanMobile,
      role: targetRole,
      license_id: cleanId,
      state: targetState,
      district: targetDistrict,
      taluka: targetTaluka,
      qualification: qualification.trim(),
      specialization: specialization.trim(),
      current_organization: currentOrganization.trim(),
      organization_address: organizationAddress.trim(),
      experience_years: parseInt(experienceYears) || 0,
      id_card_url: idCardUrl,
      profile_photo_url: profilePhotoUrl || '',
      password: cleanPass
    };

    // 3. Try Backend Registration
    try {
      const res = await registerProfessionalApi(payload);
      if (res && res.success && res.profile) {
        const userObj = {
          id: res.profile.id,
          email: res.profile.email,
          mobile: res.profile.mobile,
          name: res.profile.full_name,
          licenseId: res.profile.license_id,
          role: res.profile.role,
          roleTitle: res.profile.role === 'asha' ? 'ASHA Health Worker' : res.profile.role === 'nurse' ? 'Ophthalmic Nurse' : 'Consultant Ophthalmologist',
          state: res.profile.state || targetState,
          district: targetDistrict,
          taluka: targetTaluka,
          qualification: res.profile.qualification,
          specialization: res.profile.specialization,
          currentOrganization: res.profile.current_organization,
          organizationAddress: res.profile.organization_address,
          experienceYears: res.profile.experience_years,
          idCardUrl: res.profile.id_card_url,
          profilePhotoUrl: res.profile.profile_photo_url
        };

        // Cache in local dictionary
        setRegisteredUsers(prev => ({
          ...prev,
          [cleanEmail]: { ...payload, name: fullName.trim(), licenseId: cleanId, id: res.profile.id, district: targetDistrict, taluka: targetTaluka }
        }));

        setCurrentUser(userObj);
        return { success: true, user: userObj };
      }
    } catch (apiErr) {
      const msg = apiErr.message || '';
      if (msg.includes('already exists') || msg.includes('not found')) {
        const cleanMsg = msg.replace(/^API \d+:\s*\{?"detail":\s*"?/, '').replace(/"?\}?$/, '');
        return { success: false, error: cleanMsg };
      }
    }

    // 4. Offline fallback registration
    const newUser = {
      id: `usr_${Date.now()}`,
      name: fullName.trim(),
      email: cleanEmail,
      mobile: cleanMobile,
      role: targetRole,
      licenseId: cleanId,
      state: targetState,
      district: targetDistrict,
      taluka: targetTaluka,
      qualification: qualification.trim(),
      specialization: specialization.trim(),
      currentOrganization: currentOrganization.trim(),
      organizationAddress: organizationAddress.trim(),
      experienceYears: parseInt(experienceYears) || 0,
      idCardUrl: idCardUrl,
      profilePhotoUrl: profilePhotoUrl || '',
      password: cleanPass
    };

    setRegisteredUsers(prev => ({
      ...prev,
      [cleanEmail]: newUser
    }));

    setCurrentUser({
      ...newUser,
      roleTitle: targetRole === 'asha' ? 'ASHA Health Worker' : targetRole === 'nurse' ? 'Ophthalmic Nurse' : 'Consultant Ophthalmologist'
    });

    return { success: true, user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const openAuthModal = (tab = 'login', role = 'asha') => {
    setAuthModalInitialTab(tab);
    setSelectedRoleForAuth(role);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const openProfileModal = () => setProfileModalOpen(true);
  const closeProfileModal = () => setProfileModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        register,
        checkLicenseValidity,
        logout,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalInitialTab,
        selectedRoleForAuth,
        setSelectedRoleForAuth,
        profileModalOpen,
        openProfileModal,
        closeProfileModal,
        DEFAULT_STAFF_ACCOUNTS,
        VERIFIED_REGISTRIES
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
