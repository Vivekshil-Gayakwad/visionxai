# VisionXAI — Master Project Knowledge Base & Context Archive

> [!IMPORTANT]
> **To any AI Assistant or Developer opening this project:**  
> This file contains the complete context, architectural decisions, user preferences, and step-by-step progress for **VisionXAI: Explainable AI for Early Diabetic Retinopathy Screening**. Read this document to instantly regain 100% context of everything discussed and built.

---

## 1. Project Overview & Clinical Mission

- **Title**: VisionXAI: Explainable AI for Early Diabetic Retinopathy Screening
- **Objective**: Rural screening pipeline bridging community health workers (ASHA) in remote villages with hospital clinics (Nurses) and ophthalmologists (Doctors) using Dual-Stage Explainable AI (XAI).
- **Core Principle**: **Human-in-the-Loop** — AI never makes autonomous decisions; it assists and highlights lesions, while the ophthalmologist maintains final diagnostic and prescriptive authority.

---

## 2. The 3-Tier Clinical Workflow

```
[ Tier 1: ASHA Field Worker ] 
  ├── Visits rural households
  ├── Collects demographics: Name, Age, Gender, Mobile
  ├── Records clinical risk factors: HbA1c (%), Diabetes Duration (yrs), Systolic BP (mmHg), Cholesterol (mg/dL), Pregnancy, Tobacco
  ├── Checks fixed ocular symptoms: Blurry/fluctuating vision, Floaters/dark spots, Blank areas, Faded colors, Poor night vision + Custom text notes
  ├── Executes AI Risk Prediction (XGBoost + SHAP TreeExplainer)
  └── If Moderate or High Risk → AI flags hospital referral → ASHA schedules appointment → Record flows to hospital triage queue

[ Tier 2: Nurse / Hospital Worker ]
  ├── Accesses hospital triage queue & verifies referred patient
  ├── Captures/uploads retinal fundus photograph via specialized camera
  ├── Runs AI Deep Learning Analysis (EfficientNet-B3):
  │     ├── Calculates objective DR severity percentage (0-100%)
  │     └── Generates Grad-CAM visual attention heatmap highlighting microaneurysms, hemorrhages, and exudates
  └── Compiles comprehensive clinical imaging report → Forwards to Doctor Portal

[ Tier 3: Doctor / Ophthalmologist ]
  ├── Reviews unified longitudinal patient dossier (ASHA survey + Fundus scan + Grad-CAM heatmap)
  ├── Uses Interactive Report Editor:
  │     ├── Edits diagnosis (No DR, Mild, Moderate, Severe NPDR, Proliferative DR)
  │     ├── Adds clinical notes, prescriptions, and follow-up intervals
  │     └── Updates official Patient Health Status (Active, Under Treatment, Stable, Recovered, Critical)
  ├── Downloads official clinical PDF report with institutional branding & doctor signature
  └── Dispatches report directly to patient's mobile phone via:
        ├── Direct WhatsApp message (wa.me click-to-chat integration)
        └── SMS text alert
```

---

## 3. Strict User Design & Technical Rules

1. **No "demo" words**: Never use the word "demo" or pre-fill dummy patient records. All tables start empty until the user adds real data.
2. **No direct portal cross-switching**: Users cannot switch directly between ASHA, Nurse, and Doctor portals within a session; they must return to Home to preserve clinical role segregation.
3. **Delete/Remove controls**: Every patient record must have a delete option, and every retinal scan must have a remove option.
4. **Isolated views**: When entering any portal, ONLY that portal's interface must appear — no landing page content.
5. **Theme & Typography**:
   - **Font**: Strictly `Aptos Light`, sans-serif. No gradient text fills — use solid high-contrast colors (black, deep purple `#3b0764`, clean white).
   - **Light Mode**: Background `#f1e8fc` (soft light purple) paired with crisp white/frosted glass cards (`bg-white/90`) and narrow purple borders (`border-purple-200`).
   - **Dark Mode**: Background `#0b0416` (deep black-purple) with dark glassmorphic panels and subtle purple borders. Dark mode must remain completely unchanged.
   - **Corner Accents**: Ambient curved circular shapes in page corners for healthcare aesthetics.
6. **Multi-Language Support (i18n)**:
   - Dynamic real-time switching between **English (en)**, **Marathi (mr - मराठी)**, and **Hindi (hi - हिंदी)** across all buttons, labels, form placeholders, and clinical reports.

---

## 4. Current File Map & Directory Structure

```
Explainable-AI/
├── PROJECT_KNOWLEDGE_BASE.md          <-- THIS MASTER FILE
├── VisionXAI_Workflow_Specification.pdf <-- 8-Page Clinical Specification PDF (1.47 MB)
├── train_asha_risk_model.py           <-- Local Python training script for XGBoost + SHAP
├── index.html
├── package.json
├── tailwind.config.js
│
├── src/                               <-- Frontend (React 18 + Vite + Tailwind CSS)
│   ├── App.jsx                        <-- App shell, routes, light/dark themes
│   ├── index.css                      <-- Global theme styles & Aptos font rules
│   ├── context/
│   │   ├── AuthContext.jsx            <-- Role-based auth (ASHA/Nurse/Doctor)
│   │   ├── PatientContext.jsx         <-- Patient state management & persistence
│   │   ├── LanguageContext.jsx        <-- Dynamic EN/MR/HI i18n provider
│   │   └── ThemeContext.jsx           <-- Light/Dark theme provider
│   ├── lib/
│   │   ├── aiEngine.js                <-- Client-side AI simulation & canvas Grad-CAM
│   │   ├── retinaImages.js            <-- Preset fundus scans
│   │   ├── supabase.js                <-- Supabase JS client configuration
│   │   └── translations.js            <-- Full EN/MR/HI translation dictionary
│   └── components/
│       ├── Navbar.jsx                 <-- Language pills, Sun/Moon toggle, role login
│       ├── Hero.jsx, Footer.jsx
│       ├── WorkflowSection.jsx
│       ├── ExplainableAiSection.jsx
│       ├── asha/                      <-- Tier 1 ASHA Dashboard & Register Patient forms
│       ├── nurse/                     <-- Tier 2 Nurse Triage Queue & Fundus Imaging
│       └── doctor/                    <-- Tier 3 Doctor Dossier, Report Editor, Notify modals
│
├── backend/                           <-- Production API Server
│   ├── requirements.txt               <-- FastAPI, Uvicorn, XGBoost, SHAP, etc.
│   └── app/
│       └── main.py                    <-- REST API with /predict/risk and /predict/dr
│
├── database/
│   └── schema.sql                     <-- Production PostgreSQL schema for Supabase
│
└── ai/                                <-- AI Models & Training Pipelines
    ├── datasets/
    │   ├── tabular/                   <-- CSV survey data
    │   └── retinal/                   <-- Retinal fundus scans
    ├── models/                        <-- Saved model weights (.joblib, .pth, .onnx)
    └── notebooks/
        └── VisionXAI_Retinal_DR_Training.ipynb <-- Google Colab EfficientNet-B3 + Grad-CAM
```

---

## 5. Active Roadmap & Current Phase

### Current Phase: **Phase 1, 2, 3 & 4 Completed (Production Ready: AI Models, Backend, Supabase Cloud & Frontend Verified)**

1. **Retinal DR Multi-Dataset Image Model (Google Colab / Kaggle T4 GPU)**:
   - Datasets:
     1. **APTOS 2019 Blindness Detection** (3,662 images - India, Aravind Eye Hospital)
     2. **IDRiD** (Indian Diabetic Retinopathy Image Dataset - 516 images - Nanded, India)
     3. **Messidor-2** (1,748 images - France, 5-Grade ICDR Standard)
     4. **DRIVE** (Digital Retinal Images for Vessel Extraction - 40 images)
   - Notebook: `ai/notebooks/VisionXAI_MultiDataset_DR_Training.ipynb`
   - Manifest Harmonization Script: `ai/train_retinal_multidataset.py`
   - Model: **EfficientNet-B3** (ImageNet pre-trained + QWK loss + Mixed Precision)
   - Outputs: DR Severity Grade (0-4), Probability % (0-100%), and Grad-CAM saliency maps.
   - Status: Successfully trained on GPU and exported! Weights placed in `ai/models/dr_model.onnx` (44.3 MB) and `ai/models/dr_model.pth` (44.9 MB). Verified and operational with ONNX Runtime.

2. **ASHA Risk Model (Local Machine)**:
   - Algorithm: **XGBoost Classifier** + **SHAP TreeExplainer**
   - Script: `train_asha_risk_model.py`
   - Status: Trained on 6,000 clinically grounded records; model artifacts saved in `ai/models/` (`risk_model.joblib`, `shap_explainer.joblib`, `feature_columns.json`).

3. **Database Architecture & Supabase Cloud**:
   - Local Relational Engine: `backend/app/db.py` creates & manages SQLite database at `database/visionxai.db`.
   - Cloud Production Schema: `database/schema.sql` deployed and verified on Supabase PostgreSQL (`profiles`, `patients`, `risk_assessments`, `fundus_images`, `dr_reports`, `notifications`).
   - Verified live connection to Supabase via `.env` credentials with full CRUD validation.

4. **Production FastAPI Backend Server**:
   - Server: `backend/app/main.py`
   - Retinal DL & Grad-CAM Engine: `backend/app/dr_engine.py` (Ben Graham circular crop + CLAHE + ONNX Runtime)
   - Tested End-to-End: Complete 3-tier lifecycle verified (Registration -> Risk -> Appointment -> Fundus Imaging -> Doctor Report -> WhatsApp/SMS Dispatch -> Deletion).

5. **Frontend-to-Backend Integration & Optical Validation**:
   - API client module created at `src/lib/api.js`.
   - `vite.config.js` configured with proxy `/api` -> `http://127.0.0.1:8000`.
   - `src/context/PatientContext.jsx` connects React state directly to FastAPI REST API with local fallback cache.
   - Built and verified with `npm run build` (vite build: exit code 0).
   - **Authentication Security Fix**: Eliminated silent fallback bypass. Invalid credentials now return explicit error messages. Added pre-authorized staff credentials (`asha.worker@visionxai.org`, `nurse.rekha@visionxai.org`, `dr.arvind@visionxai.org`) with 1-click auto-fill for evaluation.
   - **Retinal Optical Validation Engine**: Implemented `validate_retinal_fundus_image()` in `dr_engine.py` to reject non-retinal images (blue skies, green landscapes, grayscale documents, random objects). Only genuine retinal fundus photographs pass to the EfficientNet-B3 ONNX model for DR prediction and Grad-CAM generation.

6. **Official Pre-Verified Medical Registries & Strict Portal Access Control**:
   - **3 Dedicated Official Registries**:
     1. `asha`: Accredited by National Health Mission (NHM) Maharashtra (e.g., `ASH-MH-102`, `ASH-MH-108`, `ASH-MH-214`, `ASH-MH-305`, `ASH-MH-412`, `ASH-MH-520`, `ASH-MH-631`, `ASH-MH-742`).
     2. `nurse`: Registered with Maharashtra Nursing Council / INC (RN/RM) (e.g., `RN-MH-9024`, `RN-MH-4412`, `RN-MH-5523`, `RN-MH-6634`, `RN-MH-7745`, `RN-MH-8856`).
     3. `doctor`: Registered with National Medical Commission / MCI / MMC (e.g., `MCI-REG-44912`, `MCI-REG-28314`, `MCI-REG-39425`, `MCI-REG-51536`, `MCI-REG-62647`, `MCI-REG-73758`).
   - **Strict Verification on Account Creation**:
     - When registering, the professional's Medical Registration / License Number is checked against the state registry for their role. Non-registry IDs are strictly rejected.
     - Uniqueness constraint: Accounts cannot be created if an ID is already claimed.
   - **Full 10 Medical Professional Fields Collected**:
     - Full Name (Mandatory)
     - Email Address (Mandatory)
     - Mobile Number (Mandatory)
     - Medical Registration Number (Mandatory)
     - Professional ID Card Upload (Mandatory)
     - Qualification (Mandatory)
     - Specialization (Mandatory)
     - Current Organization (Mandatory)
     - Organization Address (Mandatory)
     - Experience in Years (Optional)
     - Profile Photograph (Optional)
     - Password & Confirm Password (Mandatory)
   - **Dual-Identifier Flexible Sign-In**:
     - Healthcare personnel can log in using either their **Email Address OR Mobile Number** along with their password across all 3 portals. Flexible phone normalization matches with/without `+91`, spaces, or hyphens.
   - **Strict Portal Role Segregation**:
     - Accounts registered for ASHA workers cannot access Nurse or Doctor portals, and vice versa. Cross-portal authentication attempts are blocked with clear clinical access-denied warnings (HTTP 403).

---

## 7. How to Continue in Any New Chat

If you start a new chat in Antigravity or another assistant session:
Simply type:
> **"Read PROJECT_KNOWLEDGE_BASE.md and let's continue with [the task you want to do]"**

The assistant will read this file and have immediate 100% awareness of the entire project!
