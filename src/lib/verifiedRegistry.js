/**
 * VisionXAI: Official Pre-Verified Medical Professional Registries
 * 500 Distinct Pre-Verified License IDs across 3 Clinical Portals:
 * 1. ASHA Field Workers (200 records - National Health Mission / State Health Directorates)
 * 2. Ophthalmic Nurses (150 records - State Nursing Councils / INC)
 * 3. Ophthalmologists (150 records - National Medical Commission / MCI / State Medical Councils)
 */

import registryData from './verifiedRegistryData.json';

export const VERIFIED_REGISTRIES = registryData;

export const STATES_LIST = [
  "Maharashtra",
  "Karnataka",
  "Gujarat",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Rajasthan",
  "Kerala",
  "West Bengal",
  "Delhi",
  "Madhya Pradesh",
  "Andhra Pradesh",
  "Telangana",
  "Bihar",
  "Punjab",
  "Odisha",
  "Assam",
  "Haryana",
  "Chhattisgarh",
  "Jharkhand",
  "Uttarakhand",
  "Himachal Pradesh",
  "Goa"
];

export const QUALIFICATIONS_LIST = {
  asha: [
    "Higher Secondary (12th) + NHM ASHA Modular 1-7 Certified",
    "Secondary (10th) + NHM Rural Maternal & Vision Care Modules",
    "Higher Secondary (12th) + ASHA Senior Leadership Training",
    "Secondary (10th) + NHM NCD Community Screening",
    "12th Science + Community Health Worker Certification",
    "12th Arts + NHM Primary Healthcare Module",
    "10th Standard + NHM ASHA Modules 1-5",
    "12th Commerce + NHM Ophthalmic Triage Workshop",
    "Graduate (BA/B.Sc.) + NHM Master Health Activist",
    "Diploma in Community Health (DCH)"
  ],
  nurse: [
    "B.Sc. Nursing (RN/RM) + Ophthalmic Photography Certified",
    "B.Sc. Nursing + Fellowship in Ophthalmic Nursing",
    "General Nursing & Midwifery (GNM) + Ophthalmic Tech Diploma",
    "M.Sc. Nursing (Medical-Surgical) + Ophthalmic Specialization",
    "Post-Basic B.Sc. Nursing + Digital Fundus Camera Workshop",
    "B.Sc. Nursing + Certified Ophthalmic Assistant (COA)",
    "Diploma in Ophthalmic Nursing & Refraction (DONR)",
    "B.Sc. Nursing (RN/RM) + Diabetic Retinopathy Triage Certified",
    "M.Sc. Nursing + Retinal Imaging Clinical Specialist"
  ],
  doctor: [
    "MBBS, MS (Ophthalmology), FVRS (Vitreo-Retina Fellow)",
    "MBBS, DNB (Ophthalmology), FICO (UK), FRCS (Edin)",
    "MBBS, MS (Ophthalmology), Fellowship in Vitreo-Retinal Diseases",
    "MBBS, MD (Ophthalmology - AIIMS New Delhi)",
    "MBBS, MS (Ophthalmology), Fellow Vitreo-Retina (Aravind Eye)",
    "MBBS, DNB (Ophthalmology), MNAMS",
    "MBBS, MS (Ophthalmology), FICO, FAICO (Retina)",
    "MBBS, DO, DNB (Ophthalmology), Vitreo-Retina Specialist",
    "MBBS, MD (Ophthalmology), Advanced Diabetic Eye Fellow",
    "MBBS, MS (Ophthalmology), Cornea & Medical Retina Specialist"
  ]
};

export const SPECIALIZATIONS_LIST = {
  asha: [
    "Community Eye & Chronic Disease Screening",
    "Rural Health Survey & Non-Communicable Diseases",
    "Community Diabetic Retinopathy Triage",
    "Rural Population Eye Screening",
    "Geriatric & Diabetic Community Follow-up",
    "Rural Ophthalmology Outreach",
    "Rural Chronic Illness Surveillance",
    "Field Glycemic Tracking & Tele-Consult Coordination",
    "Primary Health Care & Vision Triage",
    "Preventive Blindness Rural Campaign"
  ],
  nurse: [
    "Digital Retinal Fundus Photography & Patient Dilation",
    "Anterior & Posterior Segment Imaging",
    "Diabetic Retinopathy Screening & Triage",
    "Vitreo-Retina Day Care & Fundus Prep",
    "Non-Mydriatic Fundus Camera Operation",
    "Community Fundus Imaging & Tele-Reporting",
    "Retinal Angiography & Optical Coherence Tomography (OCT)",
    "Ophthalmic Surgical Assistance & Dilation Triage",
    "Diabetic Eye Care Clinical Protocols"
  ],
  doctor: [
    "Diabetic Retinopathy, Macular Edema & Laser Photocoagulation",
    "Medical Retina, Anti-VEGF Therapy & Optical Coherence Tomography",
    "Proliferative DR, Retinal Detachment & Tele-Ophthalmology",
    "Comprehensive Ophthalmology, Diabetic Eye Disease Screening",
    "Diabetic Retinal Surgery, Retinal Vascular Occlusions",
    "Early Retinopathy Detection, Fluorescein Angiography",
    "Vitreo-Retinal Surgery & Macular Hole Management",
    "Pediatric Retinopathy & Community Ophthalmology",
    "Advanced Ocular Imaging & Tele-Care Oversight"
  ]
};

export const ORGANIZATIONS_LIST = [
  "District Tele-Ophthalmology Hospital",
  "District Civil Hospital & Eye Care Unit",
  "Shirwal Primary Health Centre (PHC)",
  "Koregaon Community Health Center (CHC)",
  "Baramati Rural PHC",
  "Pandharpur Sub-District Health Center",
  "Karveer Primary Health Sub-Unit",
  "Sangamner Rural Health Office",
  "Sinnar Taluka Health Post",
  "Miraj Rural Health Center",
  "Government Medical College & Hospital (GMCH)",
  "Sassoon General Hospital & BJ Medical College",
  "State Apex Eye Institute",
  "All India Institute of Medical Sciences (AIIMS)",
  "Aravind Eye Care System Network",
  "Sankara Nethralaya Tele-Ophthalmology Network",
  "L.V. Prasad Eye Institute (LVPEI) Network",
  "Postgraduate Institute of Medical Education & Research (PGIMER)",
  "Regional Institute of Ophthalmology (RIO)",
  "Chhatrapati Pramila Raje General Hospital",
  "Chhatrapati Shivaji Maharaj District Hospital",
  "Sub-District Eye Care Center",
  "Urban Primary Health Center (UPHC)",
  "Community Eye Health Center"
];

/**
 * Checks if a given License ID exists in the pre-verified dataset for a given role.
 * @param {string} role - 'asha' | 'nurse' | 'doctor'
 * @param {string} licenseId - Registration / License Number
 * @returns {Object|null} The verified registry record or null
 */
export function lookupVerifiedLicense(role, licenseId) {
  if (!role || !licenseId) return null;
  const list = VERIFIED_REGISTRIES[role.toLowerCase()] || [];
  const cleanId = licenseId.trim().toUpperCase();
  return list.find(item => item.licenseId.toUpperCase() === cleanId) || null;
}

/**
 * Returns all verified records for a role (useful for help/reference in UI).
 */
export function getVerifiedRegistryForRole(role) {
  return VERIFIED_REGISTRIES[role.toLowerCase()] || [];
}
