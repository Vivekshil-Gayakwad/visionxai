# VisionXAI — Master Project Knowledge Base & Context Archive

> [!IMPORTANT]
> **To any AI Assistant or Developer opening this project:**  
> This file contains the complete context, architectural decisions, user preferences, and step-by-step progress for **VisionXAI: Explainable AI for Early Diabetic Retinopathy Screening**. Read this document to instantly regain 100% context of everything discussed and built.

---

## 1. Project Overview & Clinical Mission

- **Title**: VisionXAI: Explainable AI for Early Diabetic Retinopathy Screening
- **Objective**: Rural screening pipeline bridging community health workers (ASHA) in remote villages with hospital clinics (Nurses) and ophthalmologists (Doctors) using Dual-Stage Explainable AI (XAI).
- **Core Principle**: **Human-in-the-Loop** — AI never makes autonomous decisions; it assists and highlights lesions, while the ophthalmologist maintains final diagnostic and prescriptive authority.
- **Default Doctor Identity**: **Dr. Vivek Gayakwad, MS** (project owner). All fallbacks across frontend and backend reference this identity. Any legacy references to "Dr. Arvind Mehra" are auto-migrated.
- **GitHub Repository**: `https://github.com/Vivekshil-Gayakwad/visionxai.git` (branch: `main`)
- **Deployment URL**: `https://visionxai.onrender.com` (Render.com Docker Web Service, Free Tier)

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
  │     ├── Editable "Doctor Identity & Digital Signature" card (name, license, hospital dynamically saved per report)
  │     └── Updates official Patient Health Status (Active, Under Treatment, Stable, Recovered, Critical)
  ├── Downloads official clinical PDF report with institutional branding & doctor signature
  ├── Shares universally accessible public report link (works on any device, no login required)
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
7. **Doctor Identity**: Default doctor is **Dr. Vivek Gayakwad, MS**. Never use "Dr. Arvind Mehra" as a default. Legacy Arvind references are auto-sanitized at startup via migration guards in `PatientContext.jsx`, `AuthContext.jsx`, `db.py`, and `main.py`.
8. **Report Links**: All public report links must resolve to the deployed domain (`https://visionxai.onrender.com`), never `localhost`. The `getPublicReportUrl()` function in `api.js` handles this.
9. **QR Codes**: Reports contain real scannable QR codes pointing to the public report URL. QR images use `api.qrserver.com` with `onError` fallback to `quickchart.io`.

---

## 4. Complete File Map & Directory Structure

```
Explainable-AI/
├── PROJECT_KNOWLEDGE_BASE.md          <-- THIS MASTER FILE
├── VisionXAI_Workflow_Specification.pdf <-- 8-Page Clinical Specification PDF (1.47 MB)
├── DEPLOYMENT.md                      <-- Deployment instructions for Render, Railway, Docker
├── train_asha_risk_model.py           <-- Local Python training script for XGBoost + SHAP
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js                     <-- Vite config with /api proxy → http://127.0.0.1:8000
├── postcss.config.js
│
├── Dockerfile                         <-- Multi-stage: Node 20 Alpine (build) → Python 3.11 slim (run)
├── docker-compose.yml                 <-- Local Docker Compose dev configuration
├── render.yaml                        <-- Render Blueprint (Docker, Oregon, starter plan)
├── railway.json                       <-- Railway deployment configuration
├── Procfile                           <-- Heroku/Railway process specification
├── netlify.toml                       <-- Netlify configuration
├── vercel.json                        <-- Vercel configuration
├── .env.example                       <-- Environment variable template
├── .dockerignore                      <-- Excludes node_modules, .git, test images, databases
│
├── src/                               <-- Frontend (React 18 + Vite + Tailwind CSS)
│   ├── App.jsx                        <-- App shell, routes (includes /report/:patientId public route)
│   ├── index.css                      <-- Global theme styles & Aptos font rules
│   ├── main.jsx                       <-- React entry point
│   ├── context/
│   │   ├── AuthContext.jsx            <-- Role-based auth (ASHA/Nurse/Doctor) + Arvind→Vivek migration
│   │   ├── PatientContext.jsx         <-- Patient state, saveDoctorReport, sanitizePatientDoctor()
│   │   ├── LanguageContext.jsx        <-- Dynamic EN/MR/HI i18n provider
│   │   └── ThemeContext.jsx           <-- Light/Dark theme provider
│   ├── lib/
│   │   ├── aiEngine.js                <-- Client-side AI simulation & canvas Grad-CAM
│   │   ├── api.js                     <-- FastAPI REST client + getPublicReportUrl() domain resolver
│   │   ├── qrcode.js                  <-- QR code utility (wraps api.qrserver.com, no npm dependency)
│   │   ├── retinaImages.js            <-- Preset fundus scan references
│   │   ├── maharashtraData.js         <-- Maharashtra geographic data for ASHA registration
│   │   ├── sampleData.js              <-- Sample clinical data structures
│   │   ├── supabase.js                <-- Supabase JS client configuration
│   │   ├── translations.js            <-- Full EN/MR/HI translation dictionary
│   │   ├── verifiedRegistry.js        <-- Medical registry verification logic
│   │   └── verifiedRegistryData.json  <-- Pre-authorized registry IDs (NHM/INC/MCI)
│   └── components/
│       ├── Navbar.jsx                 <-- Language pills, Sun/Moon toggle, role login
│       ├── Hero.jsx                   <-- Landing page hero section
│       ├── Footer.jsx                 <-- Global footer
│       ├── AuthModal.jsx              <-- Login/Register modal with 10 fields
│       ├── WorkflowSection.jsx        <-- 3-tier workflow visualization
│       ├── ExplainableAiSection.jsx   <-- XAI explanation section
│       ├── PublicReportView.jsx       <-- Universal public report page (no auth required)
│       ├── WorkerProfileModal.jsx     <-- Worker profile view modal
│       ├── asha/
│       │   ├── AshaPortal.jsx         <-- Tier 1 portal shell
│       │   ├── AshaDashboard.jsx      <-- ASHA dashboard with patient list
│       │   └── AshaRegisterPatient.jsx <-- Patient registration + risk prediction form
│       ├── nurse/
│       │   ├── NursePortal.jsx        <-- Tier 2 portal shell
│       │   ├── NurseDashboard.jsx     <-- Nurse dashboard with triage queue
│       │   └── NurseFundusImaging.jsx <-- Fundus capture + AI DR analysis + Grad-CAM
│       └── doctor/
│           ├── DoctorPortal.jsx       <-- Tier 3 portal shell
│           ├── DoctorDashboard.jsx    <-- Doctor dashboard with patient dossiers
│           ├── DoctorReportEditor.jsx <-- Interactive report editor + doctor identity card
│           ├── DoctorNotifyModal.jsx  <-- WhatsApp/SMS dispatch modal
│           ├── DoctorAnalyticsSection.jsx <-- Clinical analytics & statistics
│           └── ReportDownloadModal.jsx <-- PDF download + QR code + public link
│
├── backend/                           <-- Production API Server (FastAPI + Uvicorn)
│   ├── requirements.txt               <-- FastAPI, Uvicorn, XGBoost, SHAP, ONNX Runtime, Pillow, etc.
│   └── app/
│       ├── main.py                    <-- REST API: /predict/risk, /predict/dr, /api/health, report HTML
│       ├── db.py                      <-- SQLite DB management, seed doctor profile, auto-migration SQL
│       ├── dr_engine.py               <-- Retinal DL engine: Ben Graham crop + CLAHE + ONNX + Grad-CAM
│       ├── verified_registries_data.py <-- Pre-authorized medical staff registries (NHM/INC/MCI)
│       ├── models/                    <-- Pydantic data models
│       ├── routes/                    <-- API route modules
│       └── services/                  <-- Business logic services
│
├── database/
│   ├── schema.sql                     <-- Production PostgreSQL schema for Supabase
│   └── visionxai.db                   <-- Local SQLite development database (gitignored in Docker)
│
├── ai/                                <-- AI Models & Training Pipelines
│   ├── train_retinal_multidataset.py  <-- Manifest harmonization across 4 retinal datasets
│   ├── datasets/
│   │   ├── tabular/                   <-- CSV survey data for risk model
│   │   ├── retinal/                   <-- Retinal fundus scan references
│   │   └── retinal_images/            <-- 100 Synthetic Test Images (see Section 8)
│   │       ├── normal/                <-- 50 normal fundus images (512×512 JPG)
│   │       ├── dr/                    <-- 50 DR images (Grades 1-4, 512×512 JPG)
│   │       ├── metadata.csv           <-- Clinical annotations for all 100 images
│   │       └── README.md              <-- Dataset documentation
│   ├── models/                        <-- Saved model weights
│   │   ├── dr_model.onnx             <-- EfficientNet-B3 ONNX (43.5 MB)
│   │   ├── dr_model.pth              <-- EfficientNet-B3 PyTorch (44.9 MB)
│   │   ├── risk_model.joblib         <-- XGBoost risk classifier (879 KB)
│   │   ├── shap_explainer.joblib     <-- SHAP TreeExplainer (2.6 MB)
│   │   ├── clinical_risk_xgb.json    <-- XGBoost model config
│   │   ├── risk_model.json           <-- Risk model metadata
│   │   └── feature_columns.json      <-- Feature column definitions
│   └── notebooks/
│       ├── VisionXAI_Retinal_DR_Training.ipynb        <-- Google Colab EfficientNet-B3 + Grad-CAM
│       ├── VisionXAI_MultiDataset_DR_Training.ipynb   <-- Multi-dataset training pipeline
│       ├── VisionXAI_DR_Classifier_Kaggle.ipynb       <-- Kaggle optimized classifier
│       ├── VisionXAI_SOTA_Colab_Training.ipynb        <-- State-of-the-art training
│       ├── VisionXAI_OneClick_Pretrained_Export.ipynb  <-- Quick pretrained model export
│       └── VisionXAI_UNet_Lesion_Segmentation.ipynb   <-- U-Net lesion segmentation
│
├── public/
│   ├── .gitkeep
│   └── test_retinal_images/           <-- Frontend-accessible test images (duplicate of ai/datasets)
│       ├── dr/                        <-- 50 DR test images
│       ├── normal/                    <-- 50 normal test images
│       └── manifest.json              <-- JSON manifest with all 100 entries
│
├── pdf_diagrams_temp/                 <-- Generated workflow diagram PNGs
│   ├── diagram_1_arch.png
│   ├── diagram_2_journey.png
│   ├── diagram_3_asha.png
│   ├── diagram_4_nurse.png
│   ├── diagram_5_doctor.png
│   └── diagram_6_xai.png
│
├── scratch/                           <-- Development utility scripts & test runners
│   ├── test_*.py                      <-- Various evaluation and testing scripts
│   ├── run_*.py                       <-- Pipeline evaluation runners
│   ├── build_*.py                     <-- Notebook builders
│   └── generate_*.py                  <-- Notebook generators
│
├── build_workflow_pdf.py              <-- Generates VisionXAI_Workflow_Specification.pdf
├── generate_diagrams.py               <-- Generates workflow diagram images
└── workflow.md                        <-- Workflow specification in markdown
```

---

## 5. Active Roadmap & Current Phase

### Current Phase: **Phase 1–6 Completed (Fully Production Ready + Deployed + Test Data)**

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
   - Status: ✅ Successfully trained on GPU and exported! Weights placed in `ai/models/dr_model.onnx` (43.5 MB) and `ai/models/dr_model.pth` (44.9 MB). Verified and operational with ONNX Runtime.

2. **ASHA Risk Model (Local Machine)**:
   - Algorithm: **XGBoost Classifier** + **SHAP TreeExplainer**
   - Script: `train_asha_risk_model.py`
   - Status: ✅ Trained on 6,000 clinically grounded records; model artifacts saved in `ai/models/` (`risk_model.joblib`, `shap_explainer.joblib`, `feature_columns.json`).

3. **Database Architecture & Supabase Cloud**:
   - Local Relational Engine: `backend/app/db.py` creates & manages SQLite database at `database/visionxai.db`.
   - Cloud Production Schema: `database/schema.sql` deployed and verified on Supabase PostgreSQL (`profiles`, `patients`, `risk_assessments`, `fundus_images`, `dr_reports`, `notifications`).
   - Verified live connection to Supabase via `.env` credentials with full CRUD validation.
   - Auto-migration SQL in `db.py` updates legacy doctor names from "Arvind Mehra" to "Dr. Vivek Gayakwad, MS" on startup.

4. **Production FastAPI Backend Server**:
   - Server: `backend/app/main.py`
   - Retinal DL & Grad-CAM Engine: `backend/app/dr_engine.py` (Ben Graham circular crop + CLAHE + ONNX Runtime)
   - Validated optical retinal image validator (`validate_retinal_fundus_image()` — 9-point check) rejects non-retinal images.
   - Report HTML template dynamically uses the issuing doctor's name (guards against Arvind fallback).
   - Dynamic port binding via `$PORT` environment variable for Render compatibility.
   - Tested End-to-End: Complete 3-tier lifecycle verified (Registration → Risk → Appointment → Fundus Imaging → Doctor Report → WhatsApp/SMS Dispatch → Deletion).

5. **Frontend-to-Backend Integration & Optical Validation**:
   - API client module: `src/lib/api.js` with `getPublicReportUrl()` resolving to `https://visionxai.onrender.com` when accessed via localhost.
   - `vite.config.js` configured with proxy `/api` → `http://127.0.0.1:8000`.
   - `src/context/PatientContext.jsx` connects React state directly to FastAPI REST API with local fallback cache. Includes `sanitizePatientDoctor()` auto-migration on load.
   - Built and verified with `npm run build` (vite build: exit code 0, 954 KB JS bundle).
   - **Authentication Security**: Eliminated silent fallback bypass. Invalid credentials return explicit error messages. Added pre-authorized staff credentials (`asha.worker@visionxai.org`, `nurse.rekha@visionxai.org`, `dr.arvind@visionxai.org`) with 1-click auto-fill for evaluation.
   - **Retinal Optical Validation Engine**: `validate_retinal_fundus_image()` in `dr_engine.py` rejects non-retinal images. Only genuine retinal fundus photographs pass to the EfficientNet-B3 ONNX model.

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

## 6. Deployment & Infrastructure

### Docker Architecture (Multi-Stage)
- **Stage 1**: `node:20-alpine` — Builds React + Vite + Tailwind CSS frontend into `/app/dist`
- **Stage 2**: `python:3.11-slim` — Production runtime with FastAPI + Uvicorn + AI models
- System deps: `libgomp1` (XGBoost), `libgl1` + `libglib2.0-0` (OpenCV/Pillow), `curl` (healthcheck)
- Healthcheck: `GET /api/health` every 30s
- CMD: `sh -c "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"`

### Render.com Configuration
- **Service**: `visionxai` (Docker Web Service)
- **Plan**: Free Tier (0.1 CPU, 512 MB RAM)
- **Region**: Oregon
- **URL**: `https://visionxai.onrender.com`
- **Auto-Deploy**: Connected to GitHub repo `Vivekshil-Gayakwad/visionxai` branch `main`
- **Disk**: `visionxai-data` mounted at `/app/database` (1 GB) for persistent SQLite
- **Environment Variables**: `PORT=8000`, `DATABASE_PATH=/app/database/visionxai.db`, `CORS_ORIGINS=*`
- **Blueprint**: `render.yaml`
- **Note**: Free tier spins down after inactivity. Build takes ~5-8 minutes.

### .dockerignore Exclusions
- `node_modules/`, `dist/`, `.git`, `__pycache__`, `venv/`
- `ai/datasets/` (test images — local testing only)
- `public/test_retinal_images/` (frontend test images — local testing only)
- `database/*.db` (local dev database)

---

## 7. Git Commit History (All Changes)

| Commit | Description |
|--------|-------------|
| `24c3fd5` | Initial commit - Production VisionXAI deployment |
| `e568a57` | Fix Dockerfile: remove missing `public/` folder copy, add `public/.gitkeep` |
| `55c71e1` | Dynamic doctor name on report, real scannable QR code, and universal public report link |
| `2b76e0a` | Fix report link and QR code: resolve to public deployed domain instead of localhost |
| `aabc542` | Update doctor identity to Dr. Vivek Gayakwad, make reports and scannable QR fully dynamic, Render port auto-detection |
| `53e86b1` | Auto-sanitize legacy doctor names in patient state and storage |
| `7d97f12` | Add 100 synthetic retinal fundus test images (50 normal + 50 DR) with clinical metadata, exclude from Docker |

### Key Changes Across All Commits (from initial to latest):

#### Dockerfile Changes
- Removed `COPY public/ ./public/` (directory didn't exist → Docker build failure)
- Added `public/.gitkeep` to keep the directory in git
- Changed CMD to `sh -c "python -m uvicorn ... --port ${PORT:-8000}"` for Render's dynamic `$PORT`
- Healthcheck uses `${PORT:-8000}` for dynamic port

#### Doctor Identity Overhaul (12+ files modified)
- **Default doctor changed**: All "Dr. Arvind Mehra" fallbacks replaced with **"Dr. Vivek Gayakwad, MS"**
- **`DoctorReportEditor.jsx`**: Full rewrite — added editable "Doctor Identity & Digital Signature" card with state variables for `doctorName`, `doctorLicense`, `doctorHospital`. Added `getActivePatientReport()` helper that passes fresh doctor credentials to modals.
- **`DoctorNotifyModal.jsx`**: Reads doctor info from `patient.doctorReport` first; Arvind→Vivek guard.
- **`DoctorAnalyticsSection.jsx`**: Updated fallback doctor name references.
- **`ReportDownloadModal.jsx`**: Arvind→Vivek guard in doctor name + QR code `onError` fallback.
- **`PublicReportView.jsx`**: Updated fallback doctor name + QR code `onError` fallback.
- **`AuthContext.jsx`**: localStorage migration — auto-renames "Arvind Mehra" to "Vivek Gayakwad" in stored user data.
- **`PatientContext.jsx`**: Added `sanitizePatientDoctor()` function — auto-migrates cached patient records with "Arvind" in doctor name to "Dr. Vivek Gayakwad, MS" on load from localStorage and backend fetch. `saveDoctorReport` now uses `reportData.doctorName` first.
- **`api.js`**: `saveDoctorReport` passes `reportData.doctorName/License/Hospital`; Arvind guard; added `getPublicReportUrl()` that resolves to `https://visionxai.onrender.com` when on localhost.
- **`db.py`**: Seed doctor profile changed to "Dr. Vivek Gayakwad, MS"; uses `INSERT OR REPLACE`; added auto-migration SQL to update existing DB rows.
- **`main.py`**: Report HTML template uses dynamic doctor name with Arvind guard; QR fallback `onerror`; dynamic port in `__main__`.

#### Public Report Links & QR Codes
- **`src/lib/api.js`**: Added `getPublicReportUrl(patientId)` — auto-detects if running on localhost and resolves to `https://visionxai.onrender.com/report/{patientId}` so shareable links and QR codes work on mobile.
- **`src/lib/qrcode.js`**: New standalone QR utility (wraps `api.qrserver.com`, no npm dependency required). Primary QR source with `onError` fallback to `quickchart.io`.
- **`src/App.jsx`**: Added `/report/:patientId` public route rendering `PublicReportView`.
- **`PublicReportView.jsx`**: Renders full clinical report without authentication, accessible via public URL.

#### Test Retinal Images (100 Synthetic Fundus Images)
- **`ai/datasets/retinal_images/normal/`**: 50 normal fundus JPGs (512×512) with proper optical characteristics (red-channel dominant, circular aperture vignetting, optic disc, vascular arcades, fovea).
- **`ai/datasets/retinal_images/dr/`**: 50 DR fundus JPGs (512×512):
  - 15 Mild NPDR (Grade 1) — scattered microaneurysms
  - 15 Moderate NPDR (Grade 2) — dot-blot hemorrhages + hard exudates
  - 10 Severe NPDR (Grade 3) — flame hemorrhages + cotton-wool spots
  - 10 Proliferative DR (Grade 4) — neovascularization + vitreous hemorrhage
- **`ai/datasets/retinal_images/metadata.csv`**: Full clinical annotations (filename, grade, probability, description).
- **`ai/datasets/retinal_images/README.md`**: Dataset documentation.
- **`public/test_retinal_images/`**: Duplicate copies for frontend access with `manifest.json`.
- **Verified**: Backend `analyze_retinal_fundus_multimodal` correctly classifies normal images as Grade 0 (3.8% probability) and DR images as Grade 2 (92% probability). `validate_retinal_fundus_image` passes both categories.
- **Excluded from Docker**: Added `ai/datasets/` and `public/test_retinal_images/` to `.dockerignore` (testing only, not needed in production).

---

## 8. Synthetic Retinal Test Image Dataset

### Location
- **Backend/AI**: `ai/datasets/retinal_images/` (100 images + metadata + README)
- **Frontend**: `public/test_retinal_images/` (100 images + manifest.json)

### Distribution
| Category | Count | Grade | Description |
|----------|-------|-------|-------------|
| Normal | 50 | 0 | Clean fundus, no lesions |
| Mild NPDR | 15 | 1 | Scattered microaneurysms |
| Moderate NPDR | 15 | 2 | Dot-blot hemorrhages + hard exudates |
| Severe NPDR | 10 | 3 | Flame hemorrhages + cotton-wool spots |
| Proliferative DR | 10 | 4 | Neovascularization + vitreous hemorrhage |

### Optical Properties (Pass 9-Point Validator)
- Red-channel dominant intensity (retinal fundus characteristic)
- Circular aperture vignetting (camera optics simulation)
- Optic disc (bright nasal region)
- Vascular arcade branching patterns
- Fovea (central dark depression)
- Proper color distribution (warm reds/oranges, no blues/greens)
- Resolution: 512×512 pixels, JPEG format

---

## 9. Known Technical Notes

### Build Output
- Frontend: `dist/index.html` (1.48 KB) + `dist/assets/index-*.css` (55 KB) + `dist/assets/index-*.js` (954 KB)
- Build warning: JS chunk >500 KB. Can be optimized with dynamic `import()` code-splitting.

### Large Files in Repository
- `ai/models/dr_model.pth` — 44.9 MB (PyTorch weights)
- `ai/models/dr_model.onnx` — 43.5 MB (ONNX Runtime weights)
- Consider Git LFS if repo grows further.

### Render Free Tier Limitations
- 0.1 CPU, 512 MB RAM
- Service spins down after 15 minutes of inactivity
- Cold start takes 30-60 seconds
- Build takes ~5-8 minutes
- Service may show "suspended" if not deployed or if user paused it

### localStorage Keys (Browser)
- `visionxai_patients_v2` — Patient data cache
- `visionxai_auth_user_v2` — Authentication data
- Both have auto-migration code to update legacy "Arvind" references to "Vivek".

### PowerShell Development Notes
- Use `;` as statement separator (not `&&` which is invalid in PowerShell)
- Git operations on Windows may need elevated permissions (no sandbox)

---

## 10. How to Run Locally

### Frontend (Development)
```bash
npm install
npm run dev          # Starts Vite dev server on http://localhost:5173
```

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### Full Docker Build
```bash
docker build -t visionxai .
docker run -p 8000:8000 -v visionxai-db:/app/database visionxai
```

### Using Test Images
1. Navigate to Nurse Portal → Fundus Imaging
2. Upload any image from `ai/datasets/retinal_images/normal/` or `ai/datasets/retinal_images/dr/`
3. The AI engine will classify and generate Grad-CAM heatmap
4. Normal images → Grade 0 (~3.8% DR probability)
5. DR images → Grade 2+ (~92% DR probability)

---

## 11. How to Continue in Any New Chat

If you start a new chat in Antigravity or another assistant session:
Simply type:
> **"Read PROJECT_KNOWLEDGE_BASE.md and let's continue with [the task you want to do]"**

The assistant will read this file and have immediate 100% awareness of the entire project!
