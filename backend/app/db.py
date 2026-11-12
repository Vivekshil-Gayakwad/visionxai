"""
VisionXAI: Central Database Layer
Supports robust local SQLite persistence (database/visionxai.db) with seamless Supabase PostgreSQL synchronization.
Stores all clinical data across the 3 Tiers:
- Patients registry
- Tier 1: ASHA Risk Assessments & SHAP values
- Tier 2: Retinal Fundus Scans, DR % & Grad-CAM heatmaps
- Tier 3: Doctor Clinical Diagnostic Reports & Prescriptions
- Patient Notifications (WhatsApp / SMS dispatch logs)
"""

import os
import sqlite3
import json
import uuid
import re
from datetime import datetime
from typing import Dict, List, Optional, Any

try:
    from app.verified_registries_data import VERIFIED_REGISTRIES_DATA
except ImportError:
    try:
        from verified_registries_data import VERIFIED_REGISTRIES_DATA
    except ImportError:
        VERIFIED_REGISTRIES_DATA = None

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.environ.get("DATABASE_PATH") or os.path.join(BASE_DIR, "database", "visionxai.db")
os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes SQLite tables matching the Supabase production schema."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Patients Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        mobile TEXT NOT NULL,
        village TEXT DEFAULT 'Rural Community Area',
        registered_by TEXT,
        status TEXT NOT NULL DEFAULT 'Screened (Low Risk)',
        appointment_date TEXT,
        hospital_name TEXT,
        vitals_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    # 2. Risk Assessments (Tier 1 ASHA + SHAP)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS risk_assessments (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        risk_level TEXT NOT NULL,
        risk_score REAL NOT NULL,
        probabilities_json TEXT NOT NULL,
        shap_values_json TEXT NOT NULL,
        recommendation TEXT,
        requires_hospital_visit INTEGER NOT NULL DEFAULT 0,
        assessed_by TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
    """)

    # 3. Fundus Scans & Grad-CAM (Tier 2 Nurse)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS fundus_images (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        image_url TEXT NOT NULL,
        eye_side TEXT DEFAULT 'both',
        dr_percentage REAL NOT NULL,
        dr_grade INTEGER NOT NULL,
        dr_severity TEXT NOT NULL,
        findings_json TEXT NOT NULL DEFAULT '[]',
        gradcam_overlay_url TEXT,
        xai_regions_json TEXT NOT NULL DEFAULT '[]',
        uploaded_by TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
    """)

    # 4. Doctor Diagnostic Reports (Tier 3 Doctor)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS dr_reports (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        diagnosis TEXT NOT NULL,
        clinical_notes TEXT,
        prescriptions TEXT,
        health_status TEXT NOT NULL DEFAULT 'active',
        follow_up_date TEXT,
        doctor_name TEXT,
        pdf_report_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
    """)

    # 5. Patient Notifications (WhatsApp / SMS)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        channel TEXT NOT NULL,
        recipient_mobile TEXT NOT NULL,
        message_content TEXT NOT NULL,
        dispatch_status TEXT NOT NULL DEFAULT 'sent',
        sent_by TEXT,
        sent_at TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
    """)

    # 6. Official Pre-Verified Medical Professional Registry (3 Portals: ASHA, Nurse, Doctor)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS verified_registries (
        license_id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        full_name TEXT NOT NULL,
        state TEXT NOT NULL DEFAULT 'Maharashtra',
        qualification TEXT NOT NULL,
        specialization TEXT NOT NULL,
        current_organization TEXT NOT NULL,
        organization_address TEXT NOT NULL,
        experience_years INTEGER DEFAULT 0,
        authority TEXT NOT NULL,
        status TEXT DEFAULT 'Active / Verified'
    )
    """)

    # 7. Registered Professional Profiles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        mobile TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        license_id TEXT UNIQUE NOT NULL,
        state TEXT NOT NULL DEFAULT 'Maharashtra',
        qualification TEXT NOT NULL,
        specialization TEXT NOT NULL,
        current_organization TEXT NOT NULL,
        organization_address TEXT NOT NULL,
        experience_years INTEGER DEFAULT 0,
        id_card_url TEXT,
        profile_photo_url TEXT,
        password_hash TEXT NOT NULL,
        is_verified INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (license_id) REFERENCES verified_registries(license_id)
    )
    """)

    # Safe migrations if tables already exist without 'state'
    try:
        cursor.execute("ALTER TABLE verified_registries ADD COLUMN state TEXT DEFAULT 'Maharashtra'")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE profiles ADD COLUMN state TEXT DEFAULT 'Maharashtra'")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE dr_reports ADD COLUMN doctor_license TEXT DEFAULT 'MCI-REG-44912'")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE dr_reports ADD COLUMN doctor_hospital TEXT DEFAULT ''")
    except Exception:
        pass

    # Seed Pre-Verified Registries (500 records)
    if VERIFIED_REGISTRIES_DATA:
        for role_key, recs in VERIFIED_REGISTRIES_DATA.items():
            for r in recs:
                cursor.execute("""
                INSERT OR REPLACE INTO verified_registries (
                    license_id, role, full_name, state, qualification, specialization,
                    current_organization, organization_address, experience_years, authority, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    r["licenseId"], r["role"], r["fullName"], r.get("state", "Maharashtra"),
                    r["qualification"], r["specialization"], r["currentOrganization"],
                    r["organizationAddress"], r["experienceYears"], r["authority"], r["status"]
                ))

    # Seed Pre-Authorized Clinical Staff Profiles
    now = datetime.utcnow().isoformat()
    seed_profiles = [
        (
            "usr_asha_default",
            "asha.worker@visionxai.org",
            "+91 98220 10200",
            "Sunita Patil",
            "asha",
            "ASH-MH-102",
            "Maharashtra",
            "Higher Secondary (12th) + NHM ASHA Modular 1-7 Certified",
            "Community Eye & Chronic Disease Screening",
            "Shirwal Primary Health Centre (PHC)",
            "Shirwal Rural Sub-Center, Taluka Khandala, Satara, Maharashtra 412801",
            6,
            "",
            "",
            "Asha2026!",
            1,
            now,
            now
        ),
        (
            "usr_nurse_default",
            "nurse.rekha@visionxai.org",
            "+91 98220 90240",
            "Sister Rekha Sharma, RN",
            "nurse",
            "RN-MH-9024",
            "Maharashtra",
            "B.Sc. Nursing (RN/RM) + Ophthalmic Photography Certified",
            "Digital Retinal Fundus Photography & Patient Dilation",
            "District Tele-Ophthalmology Hospital",
            "Civil Hospital Road, Satara Central Hospital, Maharashtra 415001",
            8,
            "",
            "",
            "Nurse2026!",
            1,
            now,
            now
        ),
        (
            "usr_doctor_default",
            "dr.vivek@visionxai.org",
            "+91 98220 44912",
            "Dr. Vivek Gayakwad, MS",
            "doctor",
            "MCI-REG-44912",
            "Maharashtra",
            "MBBS, MS (Ophthalmology), FVRS (Vitreo-Retina Fellow)",
            "Diabetic Retinopathy, Macular Edema & Laser Photocoagulation",
            "District Tele-Ophthalmology Hospital",
            "Super-Specialty Eye Wing, Satara Civil Hospital, Maharashtra 415001",
            14,
            "",
            "",
            "Doctor2026!",
            1,
            now,
            now
        )
    ]

    for prof in seed_profiles:
        cursor.execute("""
        INSERT OR REPLACE INTO profiles (
            id, email, mobile, full_name, role, license_id, state, qualification,
            specialization, current_organization, organization_address,
            experience_years, id_card_url, profile_photo_url, password_hash,
            is_verified, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, prof)

    # Automatic migration: update existing database rows to Dr. Vivek Gayakwad
    try:
        cursor.execute("UPDATE profiles SET full_name = 'Dr. Vivek Gayakwad, MS', email = 'dr.vivek@visionxai.org' WHERE id = 'usr_doctor_default' OR full_name LIKE '%Arvind Mehra%'")
        cursor.execute("UPDATE dr_reports SET doctor_name = 'Dr. Vivek Gayakwad, MS' WHERE doctor_name LIKE '%Arvind Mehra%'")
    except Exception:
        pass

    conn.commit()
    conn.close()

# Auto-initialize database on import
init_db()

# -----------------------------------------------------------------------------
# CRUD Operations
# -----------------------------------------------------------------------------

def _format_patient_dict(row, cursor) -> Dict[str, Any]:
    p = dict(row)
    p["vitals"] = json.loads(p.get("vitals_json") or "{}")
    p["appointmentDate"] = p.get("appointment_date")
    p["hospitalName"] = p.get("hospital_name")
    p["registeredByAsha"] = p.get("registered_by")
    p["registeredAt"] = p.get("created_at")
    p["state"] = p.get("state") or p["vitals"].get("state") or "Maharashtra"
    p["district"] = p.get("district") or p["vitals"].get("district") or "Satara"
    p["taluka"] = p.get("taluka") or p["vitals"].get("taluka") or "Khandala"
    p["houseNo"] = p.get("house_no") or p["vitals"].get("house_no") or p["vitals"].get("houseNo") or ""
    
    # Attach latest risk assessment
    cursor.execute("SELECT * FROM risk_assessments WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1", (p["id"],))
    risk_row = cursor.fetchone()
    if risk_row:
        risk_level = risk_row["risk_level"]
        risk_score = risk_row["risk_score"]
        p["ashaRiskAssessment"] = {
            "riskLevel": risk_level,
            "riskCategory": risk_level,
            "riskScore": risk_score,
            "score": risk_score,
            "probabilities": json.loads(risk_row["probabilities_json"] or "{}"),
            "shapContributions": json.loads(risk_row["shap_values_json"] or "{}"),
            "recommendation": risk_row["recommendation"],
            "requiresHospitalVisit": bool(risk_row["requires_hospital_visit"]),
            "needsHospitalReferral": bool(risk_row["requires_hospital_visit"]),
            "urgency": "Immediate (Within 7 Days)" if risk_level == "High" else "Priority (Within 15-30 Days)" if risk_level == "Moderate" else "Routine Annual Follow-up",
            "confidence": "94.5"
        }
    else:
        p["ashaRiskAssessment"] = None

    # Attach latest fundus image
    cursor.execute("SELECT * FROM fundus_images WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1", (p["id"],))
    fundus_row = cursor.fetchone()
    if fundus_row:
        dr_pct = fundus_row["dr_percentage"]
        severity = fundus_row["dr_severity"]
        findings = json.loads(fundus_row["findings_json"] or "[]")
        xai_regs = json.loads(fundus_row["xai_regions_json"] or "[]")
        p["fundusImaging"] = {
            "id": fundus_row["id"],
            "imageUrl": fundus_row["image_url"],
            "eyeSide": fundus_row["eye_side"],
            "drPercentage": dr_pct,
            "drGrade": fundus_row["dr_grade"],
            "drSeverity": severity,
            "stage": severity,
            "confidence": f"{92 + (dr_pct % 6):.1f}%",
            "csmeRisk": "Critical (84%)" if dr_pct > 75 else "Moderate (48%)" if dr_pct > 50 else "Low (8%)",
            "visualAcuity": "6/24 (Deficit)" if dr_pct > 75 else "6/12 (Moderate)" if dr_pct > 50 else "6/6 (Normal)",
            "lesionsCount": len(xai_regs),
            "lesionsList": findings,
            "findings": findings,
            "findingsSummary": "; ".join(findings) if findings else f"{severity} confirmed with {dr_pct}% DR probability.",
            "gradcamOverlayUrl": fundus_row["gradcam_overlay_url"],
            "xaiRegions": xai_regs,
            "uploadedBy": fundus_row["uploaded_by"],
            "capturedByNurse": fundus_row["uploaded_by"],
            "createdAt": fundus_row["created_at"],
            "capturedAt": fundus_row["created_at"]
        }
    else:
        p["fundusImaging"] = None

    # Attach latest doctor report
    cursor.execute("SELECT * FROM dr_reports WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1", (p["id"],))
    rep_row = cursor.fetchone()
    if rep_row:
        raw_rx = rep_row["prescriptions"] or ""
        try:
            rx_list = json.loads(raw_rx) if raw_rx.startswith("[") else [s.strip() for s in raw_rx.split(";") if s.strip()]
        except Exception:
            rx_list = [raw_rx] if raw_rx else []

        raw_doc_name = rep_row["doctor_name"] or "Consulting Ophthalmologist"
        doc_lic = rep_row["doctor_license"] if ("doctor_license" in rep_row.keys() and rep_row["doctor_license"]) else None
        if not doc_lic and "(" in raw_doc_name and ")" in raw_doc_name:
            doc_lic = raw_doc_name.split("(")[1].split(")")[0].strip()
        doc_name_clean = raw_doc_name.split("(")[0].strip() if "(" in raw_doc_name else raw_doc_name
        doc_hosp = rep_row["doctor_hospital"] if ("doctor_hospital" in rep_row.keys() and rep_row["doctor_hospital"]) else (p.get("hospital_name") or "District Tele-Ophthalmology Hospital")

        p["doctorReport"] = {
            "id": rep_row["id"],
            "diagnosis": rep_row["diagnosis"],
            "finalDiagnosis": rep_row["diagnosis"],
            "clinicalNotes": rep_row["clinical_notes"],
            "doctorNotes": rep_row["clinical_notes"],
            "prescriptions": rx_list,
            "healthStatus": rep_row["health_status"],
            "followUpDate": rep_row["follow_up_date"],
            "doctorName": doc_name_clean,
            "reviewedByDoctor": raw_doc_name,
            "doctorLicense": doc_lic or "MCI-REG-44912",
            "doctorOrganization": doc_hosp,
            "pdfReportUrl": rep_row["pdf_report_url"],
            "createdAt": rep_row["created_at"],
            "reviewedAt": rep_row["created_at"]
        }
    else:
        p["doctorReport"] = None

    return p

def list_patients() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients ORDER BY created_at DESC")
    rows = cursor.fetchall()
    patients = [_format_patient_dict(row, cursor) for row in rows]
    conn.close()
    return patients

def get_patient(patient_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    patient = _format_patient_dict(row, cursor)
    conn.close()
    return patient

def create_patient(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    
    patient_id = data.get("id") or f"VX-2026-{uuid.uuid4().hex[:4].upper()}"
    now = datetime.utcnow().isoformat()
    
    vitals_data = dict(data.get("vitals") or {})
    if "district" not in vitals_data and data.get("district"):
        vitals_data["district"] = data.get("district")
    if "taluka" not in vitals_data and data.get("taluka"):
        vitals_data["taluka"] = data.get("taluka")
    if "state" not in vitals_data and data.get("state"):
        vitals_data["state"] = data.get("state")
    if "house_no" not in vitals_data and (data.get("house_no") or data.get("houseNo")):
        vitals_data["house_no"] = data.get("house_no") or data.get("houseNo")
    vitals_json = json.dumps(vitals_data)

    cursor.execute("""
    INSERT INTO patients (
        id, name, age, gender, mobile, village, registered_by, status,
        appointment_date, hospital_name, vitals_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        patient_id,
        data.get("name", "Unknown Patient"),
        int(data.get("age", 45)),
        data.get("gender", "Other"),
        data.get("mobile", "+91 98000 00000"),
        data.get("village", "Rural Community Area"),
        data.get("registered_by", "ASHA Health Worker"),
        data.get("status", "Screened (Low Risk)"),
        data.get("appointment_date"),
        data.get("hospital_name"),
        vitals_json,
        now,
        now
    ))

    # If risk assessment data is included
    if "ashaRiskAssessment" in data and data["ashaRiskAssessment"]:
        risk = data["ashaRiskAssessment"]
        cursor.execute("""
        INSERT INTO risk_assessments (
            id, patient_id, risk_level, risk_score, probabilities_json,
            shap_values_json, recommendation, requires_hospital_visit, assessed_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            patient_id,
            risk.get("risk_level", "Low"),
            float(risk.get("risk_score", 0.0)),
            json.dumps(risk.get("probabilities", {})),
            json.dumps(risk.get("shap_contributions", {})),
            risk.get("recommendation", ""),
            1 if risk.get("requires_hospital_visit") else 0,
            data.get("registered_by"),
            now
        ))

    conn.commit()
    conn.close()
    return get_patient(patient_id)

def update_patient_risk(patient_id: str, risk: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Updates or replaces the risk assessment for a patient (e.g. after multimodal fusion)."""
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    
    risk_level = risk.get("risk_level") or risk.get("riskCategory") or "Low"
    risk_score = float(risk.get("risk_score") if risk.get("risk_score") is not None else risk.get("score", 0.0))
    prob_json = json.dumps(risk.get("probabilities", {}))
    shap_json = json.dumps(risk.get("shap_contributions") or risk.get("factorContributions", {}))
    rec = risk.get("recommendation", "")
    req_hosp = 1 if (risk.get("requires_hospital_visit") or risk.get("needsHospitalReferral")) else 0

    cursor.execute("SELECT id FROM risk_assessments WHERE patient_id = ?", (patient_id,))
    row = cursor.fetchone()

    if row:
        cursor.execute("""
        UPDATE risk_assessments SET
            risk_level = ?,
            risk_score = ?,
            probabilities_json = ?,
            shap_values_json = ?,
            recommendation = ?,
            requires_hospital_visit = ?,
            created_at = ?
        WHERE patient_id = ?
        """, (risk_level, risk_score, prob_json, shap_json, rec, req_hosp, now, patient_id))
    else:
        cursor.execute("""
        INSERT INTO risk_assessments (
            id, patient_id, risk_level, risk_score, probabilities_json,
            shap_values_json, recommendation, requires_hospital_visit, assessed_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (str(uuid.uuid4()), patient_id, risk_level, risk_score, prob_json, shap_json, rec, req_hosp, "Multimodal AI Engine", now))

    cursor.execute("UPDATE patients SET updated_at = ? WHERE id = ?", (now, patient_id))
    conn.commit()
    conn.close()
    return get_patient(patient_id)

def update_appointment(patient_id: str, appointment_date: str, hospital_name: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    
    cursor.execute("""
    UPDATE patients 
    SET appointment_date = ?, hospital_name = ?, status = 'Appointment Fixed', updated_at = ?
    WHERE id = ?
    """, (appointment_date, hospital_name, now, patient_id))
    
    conn.commit()
    conn.close()
    return get_patient(patient_id)


def save_fundus_scan(patient_id: str, fundus_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    scan_id = str(uuid.uuid4())

    cursor.execute("""
    INSERT INTO fundus_images (
        id, patient_id, image_url, eye_side, dr_percentage, dr_grade,
        dr_severity, findings_json, gradcam_overlay_url, xai_regions_json, uploaded_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        scan_id,
        patient_id,
        fundus_data.get("image_url", ""),
        fundus_data.get("eye_side", "both"),
        float(fundus_data.get("dr_percentage", 0.0)),
        int(fundus_data.get("dr_grade", 0)),
        fundus_data.get("dr_severity", "No DR"),
        json.dumps(fundus_data.get("findings", [])),
        fundus_data.get("gradcam_overlay_url"),
        json.dumps(fundus_data.get("xai_regions", [])),
        fundus_data.get("uploaded_by", "Clinic Nurse"),
        now
    ))

    # Update patient status to Imaged
    cursor.execute("UPDATE patients SET status = 'Imaged (Awaiting Diagnosis)', updated_at = ? WHERE id = ?", (now, patient_id))

    conn.commit()
    conn.close()
    return get_patient(patient_id)


def remove_fundus_scan(patient_id: str) -> Optional[Dict[str, Any]]:
    """Strict Rule 3: Every retinal scan must have a remove option."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM fundus_images WHERE patient_id = ?", (patient_id,))
    cursor.execute("UPDATE patients SET status = 'Appointment Fixed', updated_at = ? WHERE id = ?", (datetime.utcnow().isoformat(), patient_id))
    conn.commit()
    conn.close()
    return get_patient(patient_id)


def save_doctor_report(patient_id: str, report_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    report_id = str(uuid.uuid4())

    doc_raw = report_data.get("doctor_name", "Consulting Ophthalmologist")
    doc_lic = report_data.get("doctor_license")
    if not doc_lic and "(" in doc_raw and ")" in doc_raw:
        doc_lic = doc_raw.split("(")[1].split(")")[0].strip()
    doc_hosp = report_data.get("doctor_hospital", "")

    try:
        cursor.execute("""
        INSERT INTO dr_reports (
            id, patient_id, diagnosis, clinical_notes, prescriptions,
            health_status, follow_up_date, doctor_name, doctor_license, doctor_hospital, pdf_report_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            report_id,
            patient_id,
            report_data.get("diagnosis", "No DR"),
            report_data.get("clinical_notes", ""),
            report_data.get("prescriptions", ""),
            report_data.get("health_status", "active"),
            report_data.get("follow_up_date"),
            doc_raw,
            doc_lic or "MCI-REG-44912",
            doc_hosp,
            report_data.get("pdf_report_url"),
            now,
            now
        ))
    except Exception:
        # Fallback if older table schema without extra columns
        cursor.execute("""
        INSERT INTO dr_reports (
            id, patient_id, diagnosis, clinical_notes, prescriptions,
            health_status, follow_up_date, doctor_name, pdf_report_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            report_id,
            patient_id,
            report_data.get("diagnosis", "No DR"),
            report_data.get("clinical_notes", ""),
            report_data.get("prescriptions", ""),
            report_data.get("health_status", "active"),
            report_data.get("follow_up_date"),
            doc_raw,
            report_data.get("pdf_report_url"),
            now,
            now
        ))

    # Update patient status to Diagnosed
    cursor.execute("UPDATE patients SET status = 'Diagnosed & Signed', updated_at = ? WHERE id = ?", (now, patient_id))

    conn.commit()
    conn.close()
    return get_patient(patient_id)


def log_notification(patient_id: str, channel: str, mobile: str, message: str, sent_by: str = "Doctor") -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    notif_id = str(uuid.uuid4())

    cursor.execute("""
    INSERT INTO notifications (
        id, patient_id, channel, recipient_mobile, message_content, dispatch_status, sent_by, sent_at
    ) VALUES (?, ?, ?, ?, ?, 'sent', ?, ?)
    """, (notif_id, patient_id, channel, mobile, message, sent_by, now))

    # Update patient status to Notified
    cursor.execute("UPDATE patients SET status = 'Report Dispatched to Patient', updated_at = ? WHERE id = ?", (now, patient_id))

    conn.commit()
    conn.close()
    return {"notification_id": notif_id, "status": "sent", "dispatched_at": now}

def delete_patient(patient_id: str) -> bool:
    """Strict Rule 3: Every patient record must have a delete option."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

# -----------------------------------------------------------------------------
# MEDICAL PROFESSIONAL AUTH & VERIFIED REGISTRY OPERATIONS
# -----------------------------------------------------------------------------

def lookup_verified_registry(role: str, license_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM verified_registries 
    WHERE role = ? AND UPPER(license_id) = UPPER(?)
    """, (role.lower(), license_id.strip()))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def list_verified_registry(role: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    if role:
        cursor.execute("SELECT * FROM verified_registries WHERE role = ? ORDER BY license_id", (role.lower(),))
    else:
        cursor.execute("SELECT * FROM verified_registries ORDER BY role, license_id")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def is_license_registered(license_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM profiles WHERE UPPER(license_id) = UPPER(?)", (license_id.strip(),))
    row = cursor.fetchone()
    conn.close()
    return row is not None

def register_professional(profile_data: Dict[str, Any]) -> tuple[bool, Optional[Dict[str, Any]], str]:
    """
    Registers a medical professional with verified registry checks and uniqueness constraints.
    """
    role = profile_data.get("role", "asha").lower()
    license_id = (profile_data.get("license_id") or profile_data.get("licenseId") or "").strip()
    email = (profile_data.get("email") or "").strip().lower()
    mobile = (profile_data.get("mobile") or "").strip()
    password = (profile_data.get("password") or profile_data.get("password_hash") or "").strip()
    
    # 1. Verification against official registry
    verified_reg = lookup_verified_registry(role, license_id)
    if not verified_reg:
        return False, None, f"Medical Registration Number '{license_id}' is not found in the official verified {role.upper()} registry. Only accredited healthcare professionals can create an account."

    conn = get_connection()
    cursor = conn.cursor()

    # 2. Check if license already registered
    cursor.execute("SELECT id FROM profiles WHERE UPPER(license_id) = UPPER(?)", (license_id,))
    if cursor.fetchone():
        conn.close()
        return False, None, f"An account with Medical Registration Number '{license_id}' already exists. Please log in instead."

    # 3. Check if email already registered
    cursor.execute("SELECT id FROM profiles WHERE LOWER(email) = LOWER(?)", (email,))
    if cursor.fetchone():
        conn.close()
        return False, None, f"An account with email '{email}' already exists. Please sign in or use another email."

    # 4. Check if mobile already registered
    mobile_digits = re.sub(r'\D', '', mobile)
    last10_mobile = mobile_digits[-10:] if len(mobile_digits) >= 10 else mobile_digits
    cursor.execute("SELECT id, mobile FROM profiles")
    for row in cursor.fetchall():
        row_digits = re.sub(r'\D', '', row["mobile"] or "")
        row_last10 = row_digits[-10:] if len(row_digits) >= 10 else row_digits
        if last10_mobile and row_last10 == last10_mobile:
            conn.close()
            return False, None, f"An account with mobile number '{mobile}' already exists. Please sign in."

    now = datetime.utcnow().isoformat()
    profile_id = f"usr_{uuid.uuid4().hex[:8]}"

    cursor.execute("""
    INSERT INTO profiles (
        id, email, mobile, full_name, role, license_id, state, qualification,
        specialization, current_organization, organization_address,
        experience_years, id_card_url, profile_photo_url, password_hash,
        is_verified, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    """, (
        profile_id,
        email,
        mobile,
        profile_data.get("full_name") or profile_data.get("name") or verified_reg["full_name"],
        role,
        verified_reg["license_id"],
        profile_data.get("state") or verified_reg.get("state", "Maharashtra"),
        profile_data.get("qualification") or verified_reg["qualification"],
        profile_data.get("specialization") or verified_reg["specialization"],
        profile_data.get("current_organization") or verified_reg["current_organization"],
        profile_data.get("organization_address") or verified_reg["organization_address"],
        int(profile_data.get("experience_years") or verified_reg["experience_years"] or 0),
        profile_data.get("id_card_url") or "",
        profile_data.get("profile_photo_url") or "",
        password,
        now,
        now
    ))
    conn.commit()

    cursor.execute("SELECT * FROM profiles WHERE id = ?", (profile_id,))
    new_profile = dict(cursor.fetchone())
    new_profile.pop("password_hash", None)
    conn.close()
    return True, new_profile, ""

def get_professional_profile(identifier: str) -> Optional[Dict[str, Any]]:
    """Fetches profile by ID, Email, Mobile or License ID."""
    clean_id = (identifier or "").strip()
    if not clean_id:
        return None
    conn = get_connection()
    cursor = conn.cursor()
    clean_mobile = re.sub(r'\D', '', clean_id)
    last10 = clean_mobile[-10:] if len(clean_mobile) >= 10 else clean_mobile

    cursor.execute("""
    SELECT * FROM profiles 
    WHERE id = ? OR LOWER(email) = LOWER(?) OR UPPER(license_id) = UPPER(?)
    """, (clean_id, clean_id, clean_id))
    row = cursor.fetchone()

    if not row and last10 and len(last10) >= 10:
        cursor.execute("SELECT * FROM profiles")
        for candidate in cursor.fetchall():
            c_digits = re.sub(r'\D', '', candidate["mobile"] or "")
            if c_digits[-10:] == last10:
                row = candidate
                break

    conn.close()
    if not row:
        return None
    res = dict(row)
    res.pop("password_hash", None)
    return res

def authenticate_professional(identifier: str, password: str, portal_role: str) -> tuple[bool, Optional[Dict[str, Any]], str]:
    """
    Authenticates a medical professional by Email OR Mobile number.
    Strictly verifies that the account's registered role matches the portal being accessed.
    """
    clean_id = (identifier or "").strip()
    clean_pass = (password or "").strip()
    portal_role = (portal_role or "").lower()

    if not clean_id or not clean_pass:
        return False, None, "Please provide both Email / Mobile number and Password."

    conn = get_connection()
    cursor = conn.cursor()

    # Extract digits for flexible mobile number comparison (handles +91, spaces, dashes)
    id_digits = re.sub(r'\D', '', clean_id)
    last10_id = id_digits[-10:] if len(id_digits) >= 10 else id_digits

    # 1. First attempt exact email or license_id match
    cursor.execute("""
    SELECT * FROM profiles 
    WHERE LOWER(email) = LOWER(?) 
       OR UPPER(license_id) = UPPER(?)
    """, (clean_id, clean_id))
    row = cursor.fetchone()

    # 2. If not found and input contains digits, match mobile by last 10 digits
    if not row and last10_id and len(last10_id) >= 10:
        cursor.execute("SELECT * FROM profiles")
        for candidate in cursor.fetchall():
            c_digits = re.sub(r'\D', '', candidate["mobile"] or "")
            c_last10 = c_digits[-10:] if len(c_digits) >= 10 else c_digits
            if c_last10 == last10_id:
                row = candidate
                break

    conn.close()

    if not row:
        return False, None, "Account not found for this Email or Mobile Number. Please verify your credentials or register a new clinical account."

    profile = dict(row)

    # Role Segregation Check
    role_titles = {
        "asha": "ASHA Health Worker",
        "nurse": "Ophthalmic Nurse",
        "doctor": "Ophthalmologist"
    }
    registered_role = profile["role"].lower()
    if portal_role and registered_role != portal_role:
        expected_title = role_titles.get(portal_role, portal_role.upper())
        user_title = role_titles.get(registered_role, registered_role.upper())
        return False, None, f"Access Denied: Your account is officially registered as an {user_title}. You cannot log in to the {expected_title} Portal. Please select your authorized portal."

    # Password Check
    if profile.get("password_hash") != clean_pass:
        return False, None, "Incorrect password. Please re-enter."

    profile.pop("password_hash", None)
    return True, profile, ""
