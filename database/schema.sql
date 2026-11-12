-- =============================================================================
-- VisionXAI: Explainable AI for Early Diabetic Retinopathy Screening
-- Production Database Schema for Supabase PostgreSQL
-- =============================================================================

-- Enable UUID extension for auth and IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. OFFICIAL PRE-VERIFIED MEDICAL REGISTRIES (3 Clinical Portals)
CREATE TABLE IF NOT EXISTS public.verified_registries (
    license_id TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('asha', 'nurse', 'doctor')),
    full_name TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Maharashtra',
    district TEXT DEFAULT 'Satara',
    taluka TEXT DEFAULT 'Khandala',
    qualification TEXT NOT NULL,
    specialization TEXT NOT NULL,
    current_organization TEXT NOT NULL,
    organization_address TEXT NOT NULL,
    experience_years INTEGER DEFAULT 0,
    authority TEXT NOT NULL,
    status TEXT DEFAULT 'Active / Verified'
);

-- 2. USERS & PROFILES TABLE (Expanded Clinical Professional Credentials)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('asha', 'nurse', 'doctor')),
    license_id TEXT UNIQUE NOT NULL REFERENCES public.verified_registries(license_id),
    state TEXT NOT NULL DEFAULT 'Maharashtra',
    district TEXT DEFAULT 'Satara',
    taluka TEXT DEFAULT 'Khandala',
    qualification TEXT NOT NULL,
    specialization TEXT NOT NULL,
    current_organization TEXT NOT NULL,
    organization_address TEXT NOT NULL,
    experience_years INTEGER DEFAULT 0,
    id_card_url TEXT,
    profile_photo_url TEXT,
    password_hash TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PATIENT REGISTRY TABLE (Supports both VX-2026-XXXX and UUID format IDs)
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age < 125),
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    mobile TEXT NOT NULL,
    state TEXT DEFAULT 'Maharashtra',
    district TEXT DEFAULT 'Satara',
    taluka TEXT DEFAULT 'Khandala',
    village TEXT DEFAULT 'Rural Community Area',
    house_no TEXT DEFAULT '',
    registered_by TEXT DEFAULT 'ASHA Health Worker',
    status TEXT NOT NULL DEFAULT 'Screened (Low Risk)',
    appointment_date TEXT,
    hospital_name TEXT,
    vitals_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TIER 1: ASHA RISK ASSESSMENTS & SHAP EXPLANATIONS
CREATE TABLE IF NOT EXISTS public.risk_assessments (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('Low', 'Moderate', 'High')),
    risk_score NUMERIC(5, 2) NOT NULL,
    probabilities_json JSONB DEFAULT '{}'::jsonb,
    shap_values_json JSONB DEFAULT '{}'::jsonb,
    recommendation TEXT,
    requires_hospital_visit INTEGER NOT NULL DEFAULT 0,
    assessed_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TIER 2: NURSE FUNDUS IMAGES & GRAD-CAM SALIENCY
CREATE TABLE IF NOT EXISTS public.fundus_images (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    eye_side TEXT NOT NULL DEFAULT 'both' CHECK (eye_side IN ('left', 'right', 'both')),
    dr_percentage NUMERIC(5, 2) NOT NULL,
    dr_grade INTEGER CHECK (dr_grade BETWEEN 0 AND 4),
    dr_severity TEXT NOT NULL,
    findings_json JSONB DEFAULT '[]'::jsonb,
    gradcam_overlay_url TEXT,
    xai_regions_json JSONB DEFAULT '[]'::jsonb,
    uploaded_by TEXT DEFAULT 'Clinic Nurse',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TIER 3: DOCTOR CLINICAL DIAGNOSTIC REPORTS
CREATE TABLE IF NOT EXISTS public.dr_reports (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    clinical_notes TEXT,
    prescriptions TEXT,
    health_status TEXT NOT NULL DEFAULT 'active',
    follow_up_date TEXT,
    doctor_name TEXT DEFAULT 'Consulting Ophthalmologist',
    pdf_report_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. MULTI-CHANNEL PATIENT NOTIFICATIONS (WhatsApp / SMS)
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms')),
    recipient_mobile TEXT NOT NULL,
    message_content TEXT NOT NULL,
    dispatch_status TEXT NOT NULL DEFAULT 'sent',
    sent_by TEXT DEFAULT 'Doctor',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- SEED OFFICIAL PRE-VERIFIED REGISTRIES
-- =============================================================================
INSERT INTO public.verified_registries (license_id, role, full_name, qualification, specialization, current_organization, organization_address, experience_years, authority)
VALUES 
    -- ASHA Workers
    ('ASH-MH-102', 'asha', 'Sunita Patil', 'Higher Secondary (12th) + NHM ASHA Modular 1-7 Certified', 'Community Eye & Chronic Disease Screening', 'Shirwal Primary Health Centre (PHC)', 'Shirwal Rural Sub-Center, Taluka Khandala, Satara, Maharashtra 412801', 6, 'National Health Mission (NHM) Maharashtra'),
    ('ASH-MH-108', 'asha', 'Lata Shinde', 'Secondary (10th) + NHM Rural Maternal & Vision Care Modules', 'Rural Health Survey & Non-Communicable Diseases', 'Koregaon Community Health Center', 'Koregaon Health Block, Satara, Maharashtra 415501', 5, 'National Health Mission (NHM) Maharashtra'),
    ('ASH-MH-214', 'asha', 'Rekha Kamble', 'Higher Secondary (12th) + ASHA Senior Leadership Training', 'Community Diabetic Retinopathy Triage', 'Baramati Rural PHC', 'Baramati Rural Block, Pune District, Maharashtra 413102', 8, 'Public Health Department, Maharashtra'),
    ('ASH-MH-305', 'asha', 'Meena Jadhav', 'Secondary (10th) + NHM NCD Community Screening', 'Rural Population Eye Screening', 'Pandharpur Sub-District Health Center', 'Pandharpur Block, Solapur, Maharashtra 413304', 4, 'National Health Mission (NHM) Maharashtra'),
    ('ASH-MH-412', 'asha', 'Vandana Salunkhe', '12th Science + Community Health Worker Certification', 'Geriatric & Diabetic Community Follow-up', 'Karveer Primary Health Sub-Unit', 'Karveer Taluka, Kolhapur, Maharashtra 416001', 7, 'National Health Mission (NHM) Maharashtra'),
    ('ASH-MH-520', 'asha', 'Anjali More', '12th Arts + NHM Primary Healthcare Module', 'Rural Ophthalmology Outreach', 'Sangamner Rural Health Office', 'Sangamner Block, Ahmednagar, Maharashtra 422605', 5, 'National Health Mission (NHM) Maharashtra'),
    ('ASH-MH-631', 'asha', 'Kavita Pawar', '10th Standard + NHM ASHA Modules 1-5', 'Rural Chronic Illness Surveillance', 'Sinnar Taluka Health Post', 'Sinnar Block, Nashik, Maharashtra 422103', 3, 'National Health Mission (NHM) Maharashtra'),
    ('ASH-MH-742', 'asha', 'Savita Bhosale', '12th Commerce + NHM Ophthalmic Triage Workshop', 'Field Glycemic Tracking & Tele-Consult Coordination', 'Miraj Rural Health Center', 'Miraj Rural Block, Sangli, Maharashtra 416410', 9, 'National Health Mission (NHM) Maharashtra'),

    -- Ophthalmic Nurses
    ('RN-MH-9024', 'nurse', 'Sister Rekha Sharma, RN', 'B.Sc. Nursing (RN/RM) + Ophthalmic Photography Certified', 'Digital Retinal Fundus Photography & Patient Dilation', 'District Tele-Ophthalmology Hospital', 'Civil Hospital Road, Satara Central Hospital, Maharashtra 415001', 8, 'Maharashtra Nursing Council (MNC / INC Reg. 9024)'),
    ('RN-MH-4412', 'nurse', 'Sister Priya Nair, RN', 'B.Sc. Nursing + Fellowship in Ophthalmic Nursing', 'Anterior & Posterior Segment Imaging', 'Sub-District Eye Care Center', 'Karad Sub-District Hospital, Satara, Maharashtra 415110', 6, 'Maharashtra Nursing Council (MNC Reg. 4412)'),
    ('RN-MH-5523', 'nurse', 'Sister Deepa Kulkarni, GNM', 'General Nursing & Midwifery (GNM) + Ophthalmic Tech Diploma', 'Diabetic Retinopathy Screening & Triage', 'Pune District Civil Eye Hospital', 'Aundh Chest & General Hospital Campus, Pune, Maharashtra 411027', 5, 'Maharashtra Nursing Council (MNC Reg. 5523)'),
    ('RN-MH-6634', 'nurse', 'Sister Anita D Souza, RN', 'M.Sc. Nursing (Medical-Surgical) + Ophthalmic Specialization', 'Vitreo-Retina Day Care & Fundus Prep', 'State Tele-Eye Institute', 'Sir J.J. Group of Hospitals, Byculla, Mumbai, Maharashtra 400008', 11, 'Maharashtra Nursing Council (MNC Reg. 6634)'),
    ('RN-MH-7745', 'nurse', 'Sister Manisha Joshi, RN', 'Post-Basic B.Sc. Nursing + Digital Fundus Camera Workshop', 'Non-Mydriatic Fundus Camera Operation', 'Solapur Rural Tele-Care Center', 'District Hospital Campus, Solapur, Maharashtra 413003', 4, 'Maharashtra Nursing Council (MNC Reg. 7745)'),
    ('RN-MH-8856', 'nurse', 'Sister Snehal Sawant, RN', 'B.Sc. Nursing + Certified Ophthalmic Assistant (COA)', 'Community Fundus Imaging & Tele-Reporting', 'Kolhapur Eye Care Wing', 'Chhatrapati Pramila Raje Hospital, Kolhapur, Maharashtra 416002', 7, 'Maharashtra Nursing Council (MNC Reg. 8856)'),

    -- Doctors / Vitreo-Retinal Specialists
    ('MCI-REG-44912', 'doctor', 'Dr. Arvind Mehra, MS', 'MBBS, MS (Ophthalmology), FVRS (Vitreo-Retina Fellow)', 'Diabetic Retinopathy, Macular Edema & Laser Photocoagulation', 'District Tele-Ophthalmology Hospital', 'Super-Specialty Eye Wing, Satara Civil Hospital, Maharashtra 415001', 14, 'Maharashtra Medical Council / MCI (MMC-44912)'),
    ('MCI-REG-28314', 'doctor', 'Dr. Rajeshwari Iyer, DNB', 'MBBS, DNB (Ophthalmology), FICO (UK), FRCS (Edin)', 'Medical Retina, Anti-VEGF Therapy & Optical Coherence Tomography', 'State Apex Eye Institute', 'Sassoon General Hospital Campus, Pune, Maharashtra 411001', 12, 'Maharashtra Medical Council / NMC (MMC-28314)'),
    ('MCI-REG-39425', 'doctor', 'Dr. Sameer Deshpande, MS', 'MBBS, MS (Ophthalmology), Fellowship in Vitreo-Retinal Diseases', 'Proliferative DR, Retinal Detachment & Tele-Ophthalmology', 'Government Medical College & Hospital', 'GMC Campus, Miraj, Sangli District, Maharashtra 416410', 16, 'Maharashtra Medical Council (MMC-39425)'),
    ('MCI-REG-51536', 'doctor', 'Dr. Suniti Rao, MD', 'MBBS, MD (Ophthalmology - AIIMS New Delhi)', 'Comprehensive Ophthalmology, Diabetic Eye Disease Screening', 'Chhatrapati Shivaji Maharaj District Hospital', 'Camp Area, Solapur, Maharashtra 413003', 10, 'National Medical Commission (NMC-51536)'),
    ('MCI-REG-62647', 'doctor', 'Dr. Vikramaditya Kadam, MS', 'MBBS, MS (Ophthalmology), Fellow Vitreo-Retina (Aravind)', 'Diabetic Retinal Surgery, Retinal Vascular Occlusions', 'Chhatrapati Pramila Raje General Hospital', 'CPR Hospital Campus, Kolhapur, Maharashtra 416002', 18, 'Maharashtra Medical Council (MMC-62647)'),
    ('MCI-REG-73758', 'doctor', 'Dr. Neha Agarwal, DNB', 'MBBS, DNB (Ophthalmology), MNAMS', 'Early Retinopathy Detection, Fluorescein Angiography', 'Nashik District Tele-Medicine Hub', 'District Civil Hospital, Trimbak Road, Nashik, Maharashtra 422002', 9, 'Maharashtra Medical Council (MMC-73758)')
ON CONFLICT (license_id) DO NOTHING;

-- Seed Pre-Authorized Clinical Staff Profiles
INSERT INTO public.profiles (id, email, mobile, full_name, role, license_id, qualification, specialization, current_organization, organization_address, experience_years, password_hash)
VALUES
    ('usr_asha_default', 'asha.worker@visionxai.org', '+91 98220 10200', 'Sunita Patil', 'asha', 'ASH-MH-102', 'Higher Secondary (12th) + NHM ASHA Modular 1-7 Certified', 'Community Eye & Chronic Disease Screening', 'Shirwal Primary Health Centre (PHC)', 'Shirwal Rural Sub-Center, Taluka Khandala, Satara, Maharashtra 412801', 6, 'Asha2026!'),
    ('usr_nurse_default', 'nurse.rekha@visionxai.org', '+91 98220 90240', 'Sister Rekha Sharma, RN', 'nurse', 'RN-MH-9024', 'B.Sc. Nursing (RN/RM) + Ophthalmic Photography Certified', 'Digital Retinal Fundus Photography & Patient Dilation', 'District Tele-Ophthalmology Hospital', 'Civil Hospital Road, Satara Central Hospital, Maharashtra 415001', 8, 'Nurse2026!'),
    ('usr_doctor_default', 'dr.arvind@visionxai.org', '+91 98220 44912', 'Dr. Arvind Mehra, MS', 'doctor', 'MCI-REG-44912', 'MBBS, MS (Ophthalmology), FVRS (Vitreo-Retina Fellow)', 'Diabetic Retinopathy, Macular Edema & Laser Photocoagulation', 'District Tele-Ophthalmology Hospital', 'Super-Specialty Eye Wing, Satara Civil Hospital, Maharashtra 415001', 14, 'Doctor2026!')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- INDEXES FOR FAST CLINICAL LOOKUPS
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_patients_mobile ON public.patients(mobile);
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON public.profiles(mobile);
CREATE INDEX IF NOT EXISTS idx_profiles_license ON public.profiles(license_id);
CREATE INDEX IF NOT EXISTS idx_verified_registries_role ON public.verified_registries(role);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.verified_registries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundus_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dr_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read verified registries" ON public.verified_registries FOR SELECT USING (true);
CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Allow all access patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access risk assessments" ON public.risk_assessments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access fundus images" ON public.fundus_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access dr reports" ON public.dr_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
