/**
 * VisionXAI: Frontend API Client
 * Connects React frontend to FastAPI backend.
 * Falls back to client-side simulation if backend is unreachable.
 */

// Use relative base URL if VITE_API_URL is unset, allowing same-origin API calls on deployed host
const API_BASE = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : '';

/**
 * Generates a globally accessible public report URL.
 * If running locally on localhost, it automatically resolves to the deployed production domain
 * (or VITE_PUBLIC_URL) so links and QR codes sent to patients' phones can actually be opened!
 */
export function getPublicReportUrl(patientId, customOrigin = null) {
  if (customOrigin && typeof customOrigin === 'string' && customOrigin.trim()) {
    return `${customOrigin.trim().replace(/\/$/, '')}/?report=${patientId}`;
  }

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // When running on a live deployed domain (Render, custom domain, etc.)
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return `${origin}/?report=${patientId}`;
    }
  }

  // When testing on localhost, route to deployed Render URL or VITE_PUBLIC_URL
  const configured = (
    import.meta.env.VITE_PUBLIC_URL ||
    import.meta.env.VITE_API_URL ||
    'https://visionxai.onrender.com'
  ).replace(/\/$/, '');

  if (!configured.includes('localhost') && !configured.includes('127.0.0.1')) {
    return `${configured}/?report=${patientId}`;
  }

  return typeof window !== 'undefined'
    ? `${window.location.origin}/?report=${patientId}`
    : `https://visionxai.onrender.com/?report=${patientId}`;
}

/** Helper: check if backend is available */
let _backendOnline = null;
let _lastCheck = 0;

async function isBackendOnline() {
  const now = Date.now();
  // Cache result for 10 seconds
  if (_backendOnline !== null && now - _lastCheck < 10000) return _backendOnline;
  try {
    const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(3000) });
    _backendOnline = res.ok;
  } catch {
    _backendOnline = false;
  }
  _lastCheck = now;
  return _backendOnline;
}

/** Generic fetch wrapper with error handling */
async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${errorBody}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// PROFESSIONAL AUTHENTICATION & VERIFIED REGISTRY API
// ---------------------------------------------------------------------------

export async function fetchVerifiedRegistry(role = null) {
  const query = role ? `?role=${role}` : '';
  return apiFetch(`/api/auth/registry${query}`);
}

export async function verifyLicenseApi(role, licenseId) {
  return apiFetch('/api/auth/verify-license', {
    method: 'POST',
    body: JSON.stringify({ role, license_id: licenseId }),
  });
}

export async function registerProfessionalApi(profileData) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(profileData),
  });
}

export async function loginProfessionalApi(identifier, password, portalRole) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      identifier,
      password,
      portal_role: portalRole,
    }),
  });
}

export async function fetchUserProfileApi(identifier) {
  return apiFetch(`/api/auth/profile?identifier=${encodeURIComponent(identifier)}`);
}

// ---------------------------------------------------------------------------
// PATIENT CRUD
// ---------------------------------------------------------------------------

/**
 * Fetch all patients from backend
 * @returns {Promise<Array>} List of patient objects
 */
export async function fetchPatients() {
  return apiFetch('/api/patients');
}

/**
 * Register a new patient via ASHA portal.
 * Backend auto-computes AI risk assessment.
 * @param {Object} formData - Patient registration form data
 * @param {Object} ashaUser - The ASHA worker performing registration
 * @returns {Promise<Object>} Created patient with risk assessment
 */
export async function registerPatient(formData, ashaUser) {
  // Build the symptoms array from boolean flags
  const symptoms = [];
  if (formData.symptomBlurryVision) symptoms.push('Blurry or fluctuating vision');
  if (formData.symptomFloaters) symptoms.push('Increased floaters or dark spots');
  if (formData.symptomDarkAreas) symptoms.push('Blank or dark areas in your vision');
  if (formData.symptomFadedColors) symptoms.push('Faded or washed-out colors');
  if (formData.symptomPoorNightVision) symptoms.push('Poor night vision');

  // Parse blood pressure to extract systolic
  let systolicBp = 130;
  const bp = formData.bloodPressure || '';
  if (bp) {
    const match = bp.match(/(\d+)/);
    if (match) systolicBp = parseInt(match[1]);
  } else if (formData.hasHighBp) {
    systolicBp = 145;
  }

  const payload = {
    name: formData.name || 'Patient Record',
    age: parseInt(formData.age) || 45,
    gender: formData.gender || 'Other',
    mobile: formData.mobile || '+91 98000 00000',
    state: formData.state || 'Maharashtra',
    district: formData.district || 'Satara',
    taluka: formData.taluka || 'Khandala',
    village: formData.village || 'Rural Community Area',
    house_no: formData.houseNo || '',
    houseNo: formData.houseNo || '',
    registered_by: ashaUser ? `${ashaUser.name} (${ashaUser.licenseId})` : 'ASHA Health Worker',
    appointment_date: formData.appointmentDate || null,
    hospital_name: formData.hospitalName || null,
    vitals: {
      bloodSugarYears: parseFloat(formData.diabetesYears) || 0,
      hba1c: parseFloat(formData.hba1c) || 6.5,
      bloodPressure: formData.bloodPressure || (formData.hasHighBp ? '145/92 mmHg' : '120/80 mmHg'),
      hasHighBp: Boolean(formData.hasHighBp),
      hasHighCholesterol: Boolean(formData.hasHighCholesterol),
      isPregnant: Boolean(formData.isPregnant),
      usesTobacco: Boolean(formData.usesTobacco),
      symptoms,
      customSymptoms: formData.customSymptoms || '',
      state: formData.state || 'Maharashtra',
      district: formData.district || 'Satara',
      taluka: formData.taluka || 'Khandala',
      houseNo: formData.houseNo || '',
      // Fields the backend risk model needs
      systolic_bp: systolicBp,
      cholesterol: parseFloat(formData.cholesterol) || 195.0,
      diabetes_duration: parseFloat(formData.diabetesYears) || 0,
      pregnancy: Boolean(formData.isPregnant),
      tobacco: Boolean(formData.usesTobacco),
    },
  };

  return apiFetch('/api/patients', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Book hospital appointment for a patient
 */
export async function bookAppointment(patientId, appointmentDate, hospitalName) {
  return apiFetch(`/api/patients/${patientId}/appointment`, {
    method: 'PUT',
    body: JSON.stringify({
      appointment_date: appointmentDate,
      hospital_name: hospitalName,
    }),
  });
}

/**
 * Upload fundus image for multimodal AI analysis & ICDR DR Grading
 * @param {File} file - Retinal fundus image
 * @param {Object} [vitals] - Optional patient clinical factors for multimodal fusion
 */
export async function predictDRImage(file, vitals = null) {
  const formData = new FormData();
  formData.append('file', file);
  if (vitals) {
    formData.append('vitals_json', JSON.stringify(vitals));
  }
  return apiFetch('/api/predict/dr', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Upload fundus image for AI analysis (Nurse tier)
 * @param {string} patientId
 * @param {File|Blob} imageFile - The retinal fundus image
 * @param {string} eyeSide - 'left', 'right', or 'both'
 * @param {string} nurseName - Name of the capturing nurse
 * @returns {Promise<Object>} Updated patient with fundus results
 */
export async function uploadFundus(patientId, imageFile, eyeSide = 'both', nurseName = 'Clinic Nurse') {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('eye_side', eyeSide);
  formData.append('nurse_name', nurseName);

  return apiFetch(`/api/patients/${patientId}/fundus`, {
    method: 'POST',
    body: formData,
  });
}

/**
 * Save fundus scan data directly (from preset or client calculation)
 */
export async function saveFundusData(patientId, fundusData) {
  return apiFetch(`/api/patients/${patientId}/fundus-data`, {
    method: 'POST',
    body: JSON.stringify(fundusData),
  });
}

/**
 * Remove fundus scan from a patient
 */
export async function removeFundus(patientId) {
  return apiFetch(`/api/patients/${patientId}/fundus`, {
    method: 'DELETE',
  });
}

/**
 * Save doctor's clinical report
 */
export async function saveDoctorReport(patientId, reportData, doctorUser) {
  let docName = reportData?.doctorName || doctorUser?.name || doctorUser?.fullName || 'Dr. Vivek Gayakwad, MS';
  if (docName.includes('Arvind')) {
    docName = 'Dr. Vivek Gayakwad, MS';
  }
  const docLic = reportData?.doctorLicense || doctorUser?.licenseId || doctorUser?.license_id || 'MCI-REG-44912';
  const docHosp = reportData?.doctorHospital || doctorUser?.currentOrganization || 'District Tele-Ophthalmology Hospital';

  return apiFetch(`/api/patients/${patientId}/report`, {
    method: 'POST',
    body: JSON.stringify({
      diagnosis: reportData.finalDiagnosis || reportData.diagnosis || '',
      clinical_notes: reportData.doctorNotes || reportData.clinical_notes || '',
      prescriptions: Array.isArray(reportData.prescriptions)
        ? reportData.prescriptions.join('; ')
        : reportData.prescriptions || '',
      health_status: reportData.healthStatus || 'active',
      follow_up_date: reportData.followUpDate || null,
      doctor_name: docLic ? `${docName} (${docLic})` : docName,
      doctor_license: docLic,
      doctor_hospital: docHosp,
    }),
  });
}

/**
 * Dispatch notification (WhatsApp / SMS) to patient
 */
export async function notifyPatient(patientId, channel, mobile, message, sentBy) {
  return apiFetch(`/api/patients/${patientId}/notify`, {
    method: 'POST',
    body: JSON.stringify({
      channel,
      mobile,
      message,
      sent_by: sentBy || 'Doctor',
    }),
  });
}

/**
 * Delete patient record entirely
 */
export async function deletePatientApi(patientId) {
  return apiFetch(`/api/patients/${patientId}`, {
    method: 'DELETE',
  });
}

/**
 * Predict DR Risk from clinical factors (ASHA XGBoost + SHAP backend)
 * @param {Object} vitals - patient vitals object
 * @param {Object} formData - raw form data with symptom flags
 */
export async function predictRiskApi(vitals, formData = {}) {
  const symptoms = [];
  if (formData.symptomBlurryVision || (vitals.symptoms || []).some(s => s.toLowerCase().includes('blurry')))
    symptoms.push('Blurry or fluctuating vision');
  if (formData.symptomFloaters || (vitals.symptoms || []).some(s => s.toLowerCase().includes('floater')))
    symptoms.push('Increased floaters or dark spots');
  if (formData.symptomDarkAreas || (vitals.symptoms || []).some(s => s.toLowerCase().includes('dark') || s.toLowerCase().includes('blank')))
    symptoms.push('Blank or dark areas in your vision');
  if (formData.symptomFadedColors || (vitals.symptoms || []).some(s => s.toLowerCase().includes('color') || s.toLowerCase().includes('faded')))
    symptoms.push('Faded or washed-out colors');
  if (formData.symptomPoorNightVision || (vitals.symptoms || []).some(s => s.toLowerCase().includes('night')))
    symptoms.push('Poor night vision');

  // Systolic BP — parse from vitals.systolic_bp, vitals.bloodPressure, or formData.bloodPressure
  let systolicBp = vitals.systolic_bp || 130;
  if (!vitals.systolic_bp) {
    const bpStr = vitals.bloodPressure || formData.bloodPressure || '';
    const match = bpStr.match(/(\d+)/);
    if (match) systolicBp = parseInt(match[1]);
    else if (vitals.hasHighBp || formData.hasHighBp) systolicBp = 148;
  }

  // Resolve all clinical values — vitals takes priority; formData fields are fallbacks
  // (vitals is used by Nurse portal from patient record; formData is used by ASHA portal from form state)
  const resolvedHba1c     = parseFloat(vitals.hba1c     || formData.hba1c     || 6.5);
  const resolvedDiabYears = parseInt(vitals.bloodSugarYears || vitals.diabetes_duration
                                     || formData.diabetesYears || 0);
  const resolvedCholest   = parseFloat(vitals.cholesterol || formData.cholesterol || 195.0);
  const resolvedPregnant  = Boolean(vitals.isPregnant || vitals.pregnancy
                                    || formData.isPregnant || false);
  const resolvedTobacco   = Boolean(vitals.usesTobacco || vitals.tobacco
                                    || formData.usesTobacco || false);
  const resolvedAge       = parseInt(vitals.age || formData.age || 45);
  const resolvedGender    = vitals.gender || formData.gender || 'Other';
  const resolvedExtra     = vitals.customSymptoms || formData.customSymptoms || '';

  return apiFetch('/api/predict/risk', {
    method: 'POST',
    body: JSON.stringify({
      age:               resolvedAge,
      gender:            resolvedGender,
      hba1c:             resolvedHba1c,
      diabetes_duration: resolvedDiabYears,
      systolic_bp:       systolicBp,
      cholesterol:       resolvedCholest,
      pregnancy:         resolvedPregnant,
      tobacco:           resolvedTobacco,
      symptoms,
      extra_symptoms:    resolvedExtra,
    }),
  });
}

/**
 * Check backend health
 */
export { isBackendOnline };
