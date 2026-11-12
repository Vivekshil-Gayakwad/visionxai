# VisionXAI — Complete Clinical Workflow & Architecture Specification

> [!IMPORTANT]
> The **publication-quality 8-Page Master PDF** has been generated and saved directly to your workspace:  
> 📄 **`VisionXAI_Workflow_Specification.pdf`**

---

## 1. System Architecture & Component Interactions

### Key Architecture Layers:
1. **Frontend Presentation Layer**: Built on **React 18 + Vite** with a lightweight Aptos Light typography stack and responsive design. Each medical tier is strictly isolated so entering any portal displays only that specific portal's interface.
2. **Authentication Layer**: Configured with **Supabase Auth** (email, password, role license) alongside a resilient local storage fallback for offline field environments.
3. **State Management**:
   - `AuthContext`: RBAC identity, session token, and active medical role.
   - `PatientContext`: Full CRUD operations, risk assessments, retinal images, and clinical reports.
   - `LanguageContext`: Real-time reactive translations for English, Marathi (मराठी), and Hindi (हिंदी).
   - `ThemeContext`: Persistent light mode (`#f1e8fc` background with frosted white cards) and dark mode (`#0b0416`).
4. **Role Segregation**: Direct cross-portal switching is disabled to prevent accidental cross-role contamination.

---

## 2. End-to-End Clinical Screening & Referral Pipeline

### Chronological 7-Phase Protocol:
| Phase | Role | Core Action | Output / Decision |
|---|---|---|---|
| **Phase 1: Community Survey** | ASHA Worker | Door-to-door rural survey recording demographics, HbA1c, BP, duration, symptoms. | Patient survey dossier |
| **Phase 2: AI Risk Triage** | ASHA Worker | Executes AI weighted SHAP risk calculation. | Low / Moderate / High Risk + Factor bars |
| **Phase 3: Hospital Booking** | ASHA Worker | Schedules hospital DR screening appointment for Moderate/High risk patients. | Scheduled appointment in Hospital Queue |
| **Phase 4: Ocular Imaging** | Clinic Nurse | Verifies referred patient from triage queue; captures/uploads retinal fundus scan. | High-resolution ocular fundus photograph |
| **Phase 5: Explainable AI** | Clinic Nurse | Runs deep learning analysis on retinal image. | Objective DR Severity % (0-100%) + Grad-CAM heatmap |
| **Phase 6: Clinical Governance** | Ophthalmologist | Reviews complete dossier, edits clinical diagnosis, notes, and prescriptions. | Signed, customized clinical diagnostic report |
| **Phase 7: Patient Dispatch** | Ophthalmologist | Sends report summary to patient via WhatsApp (`wa.me`) or SMS; exports PDF. | Direct patient mobile notification |

---

## 3. Tier 1: ASHA Field Survey & SHAP Risk Engine

### Clinical Risk Factors & Relative Weightings:
- **HbA1c Level (25%)**: Primary biomarker for microvascular damage ($>7.0\%$ exponentially increases risk).
- **Diabetes Duration (20%)**: $>10$ years duration strongly correlates with vessel leakage.
- **Systolic Blood Pressure (15%)**: Capitally exacerbates microaneurysm rupture.
- **Serum Cholesterol (10%)**: Elevated lipids lead to macular hard exudates.
- **Pregnancy & Tobacco Use (10%)**: Accelerated progression and chronic retinal hypoxia.
- **Fixed Symptom Checkboxes (15%)**: Blurry vision, floaters/dark spots, blank areas, faded colors, poor night vision.
- **Custom Manual Symptoms (5%)**: Patient-reported localized symptoms (redness, itching, pain).

### Triage Decision Gates:
- **Low Risk ($<30\%$)**: Regular annual review; lifestyle management.
- **Moderate Risk ($30-60\%$)**: Hospital referral recommended within 30 days.
- **High Risk ($>60\%$)**: Immediate hospital appointment booked for specialized fundus imaging.

---

## 4. Tier 2: Nurse Hospital Imaging & Grad-CAM Pipeline

### Detection & Explainability Workflow:
1. **Queue Verification**: Nurse selects referred patient, reviewing all ASHA survey data.
2. **Fundus Scan**: Uploads high-resolution retinal image (or selects simulated preset).
3. **Preprocessing**: Adaptive histogram equalization (CLAHE) and vessel contrast enhancement.
4. **DR % Detection**: Computer vision model identifies microaneurysms, hemorrhages, hard/soft exudates, and neovascularization.
5. **Grad-CAM Saliency Map**:
   - **Red/Orange Zones**: High model attention (active microvascular lesions).
   - **Yellow/Green Zones**: Moderate caliber changes or localized retinal edema.
   - **Blue Zones**: Healthy, unaffected retina tissue.
6. **Report Generation**: Assembles diagnostic imaging package for the ophthalmologist.

---

## 5. Tier 3: Doctor Specialist Audit & Communication

### Clinical Governance Features:
- **Unified Longitudinal Dossier**: Direct inspection of ASHA survey history, fundus photo, and Grad-CAM map.
- **Interactive Report Editor**: Specialist edits diagnosis, clinical observations, medications, and next follow-up date.
- **Patient Health Status**: Transitions patient status across `Active`, `Under Treatment`, `Stable`, `Recovered`, and `Critical`.
- **Omnichannel Communication**:
  - **WhatsApp**: Direct click-to-chat `wa.me` message with diagnosis summary and hospital contact.
  - **SMS**: Concise text alert for patients without smartphones.
  - **PDF Export**: Official printable clinical report with doctor signature.

---

## 6. Dual-Stage Explainable AI (XAI) Framework

| Aspect | Tier 1: Tabular SHAP Engine | Tier 2: Visual Grad-CAM Engine |
|---|---|---|
| **Target User** | ASHA Field Worker | Clinic Nurse & Consulting Ophthalmologist |
| **Input Data** | Demographic, Clinical & Symptom Inputs | 2D Retinal Fundus Scans |
| **Math Engine** | Game-theoretic Shapley feature attributions | Gradient-weighted class activation mapping |
| **Visual Output** | Factor contribution bar chart | Pixel-aligned heatmap overlay on retina |
| **Clinical Purpose** | Transparent referral explanation to patient | Visual confirmation of lesions before treatment |
| **Safety Role** | Eliminates arbitrary referral bias | Prevents false-positive laser referrals |
