# VisionXAI: Explainable AI for Early Diabetic Retinopathy Screening

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Python: 3.11](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![React: 18](https://img.shields.io/badge/React-18-cyan.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com/)
[![ONNX Runtime](https://img.shields.io/badge/ONNX_Runtime-1.17+-orange.svg)](https://onnxruntime.ai/)

> **Rural Screening Pipeline Bridging ASHA Workers, Hospital Nurses, and Ophthalmologists via Dual-Stage Human-in-the-Loop Explainable AI.**

---

## 🌟 Overview & Clinical Mission

**Diabetic Retinopathy (DR)** is the leading cause of preventable blindness among working-age adults globally, with over 77 million diabetic individuals in India alone. In rural and semi-urban communities, access to ophthalmologists is severely constrained, leading to late-stage diagnoses when irreversible vision loss has already occurred.

**VisionXAI** solves this challenge through a **3-tier decentralized screening continuum**:
1. **Tier 1 (Community)**: ASHA workers screen rural households for systemic and ocular risk factors using an explainable **XGBoost + TreeSHAP** clinical risk model.
2. **Tier 2 (Primary Care / Hospital)**: Nurses capture retinal fundus images with portable ophthalmic cameras and run an **EfficientNet-B3 deep learning model** producing severity grades (0–4) and **Grad-CAM visual attention heatmaps**.
3. **Tier 3 (Specialist Clinic)**: Ophthalmologists review the longitudinal dossier (ASHA survey + fundus scan + XAI heatmaps), adjust clinical findings, digitally sign reports, generate verifiable QR codes, and dispatch links directly to patients via WhatsApp / SMS.

---

## 🏥 3-Tier Clinical Workflow

```
[ Tier 1: ASHA Field Worker ]
  ├── Community door-to-door diabetic survey
  ├── Demographics: Name, Age, Gender, Mobile Number, Village/District
  ├── Clinical Factors: HbA1c (%), Diabetes Duration (yrs), Systolic BP, Cholesterol, Pregnancy, Tobacco
  ├── Ocular Symptoms: Blurry vision, Floaters/dark spots, Faded colors, Night vision deficit
  ├── AI Risk Engine: XGBoost Classifier + TreeSHAP feature impact analysis
  └── Referral: Flags High/Moderate risk → Auto-books hospital appointment → Syncs to hospital triage queue

[ Tier 2: Nurse / Hospital Worker ]
  ├── Accesses hospital triage queue & verifies patient identity
  ├── Captures/uploads high-resolution retinal fundus photograph
  ├── Strict 9-Point Optical Validator: Rejects non-retinal images (exposure, color spectrum, R/B ratio)
  ├── AI Deep Learning Engine (EfficientNet-B3 ONNX):
  │     ├── Multi-class severity classification (Grades 0–4: No DR, Mild, Moderate, Severe, PDR)
  │     ├── Objective DR progression probability (0–100%)
  │     └── Grad-CAM visual attention heatmap highlighting microaneurysms, hemorrhages, and exudates
  └── Compiles comprehensive clinical imaging record → Forwards to Doctor Portal

[ Tier 3: Doctor / Ophthalmologist ]
  ├── Unified Patient Dossier: Longitudinal survey + Fundus photography + Grad-CAM saliency maps
  ├── Interactive Report Editor:
  │     ├── Confirms or overrides AI severity diagnosis
  │     ├── Dynamic Doctor Identity: Editable name, license number, and hospital affiliation
  │     ├── Prescriptions, clinical observations, and follow-up recall interval
  │     └── Updates official status (Active, Under Treatment, Stable, Recovered, Critical)
  ├── Real-time Scannable QR Code: Points to universally accessible public report URL
  ├── Official PDF Export: Formatted clinical report ready for download and print
  └── Patient Dispatch: Direct wa.me WhatsApp integration and SMS text alert
```

---

## 🧠 Dual-Stage Explainable AI (XAI) Architecture

VisionXAI strictly adheres to a **Human-in-the-Loop** philosophy. AI never makes autonomous diagnosis; it acts as an intelligent assistant providing transparent, verifiable visual and tabular explanations.

### Stage 1: Tabular Clinical Risk Model (Tier 1)
- **Algorithm**: XGBoost Classifier trained on 6,000 clinically grounded epidemiological records.
- **Explainability**: SHAP (SHapley Additive exPlanations) `TreeExplainer` computing real-time feature contributions for each patient factor (HbA1c impact, blood pressure contribution, duration penalty).
- **Output**: Risk Category (Low / Moderate / High) with breakdown charts explaining *why* the patient is at risk.

### Stage 2: Deep Learning Retinal Diagnostic Engine (Tier 2 & 3)
- **Backbone**: `EfficientNet-B3` (pre-trained on ImageNet, fine-tuned on APTOS 2019, IDRiD, Messidor-2, and DRIVE datasets).
- **Inference Runtime**: ONNX Runtime (`dr_model.onnx`, 43.5 MB) for ultra-low latency execution across CPU and GPU architectures.
- **Optical Preprocessing**: Ben Graham's circular crop, automated border removal, and CLAHE (Contrast Limited Adaptive Histogram Equalization).
- **Strict 9-Point Optical Validator**: Rejects non-fundus images (landscapes, documents, selfies, poor lighting) by validating hemoglobin absorption ratios ($R/B > 1.30$, $R/G > 1.08$), circular aperture, and melanin blue suppression.
- **Visual Saliency**: High-resolution Grad-CAM (Gradient-weighted Class Activation Mapping) identifying microaneurysms, hard/soft exudates, and intraretinal microvascular abnormalities (IRMA).

---

## 🔒 Pre-Verified Medical Registries & Role-Based Access

To ensure medical accountability and regulatory compliance, user registration strictly validates credentials against official Indian state and national healthcare councils:

| Role | Accrediting Body | Verification Format | Example Pre-Approved IDs |
| :--- | :--- | :--- | :--- |
| **ASHA Worker** | National Health Mission (NHM) Maharashtra | `ASH-MH-XXX` | `ASH-MH-102`, `ASH-MH-214`, `ASH-MH-305` |
| **Staff Nurse** | Maharashtra Nursing Council / INC | `RN-MH-XXXX` | `RN-MH-9024`, `RN-MH-4412`, `RN-MH-5523` |
| **Ophthalmologist** | National Medical Commission (NMC / MCI) | `MCI-REG-XXXXX` | `MCI-REG-44912`, `MCI-REG-28314`, `MCI-REG-39425` |

- **Strict Portal Segregation**: Role-based routing prevents unauthorized portal access. ASHA workers cannot access Doctor or Nurse portals.
- **Dual-Identifier Login**: Healthcare personnel can sign in using either their registered **Email Address** or **Mobile Number** (flexible phone normalization with/without `+91`).

---

## 👁️ Clinical Retinal Fundus Test Dataset

The project includes **100 real clinical retinal fundus photographs** (1000×1000 px JPEG) sourced from the open-access **Translational Visual Health Laboratory — OCT & Eye Fundus Dataset**:

| Category | Count | Grade | Clinical Description |
| :--- | :--- | :--- | :--- |
| **Normal (No DR)** | 50 | Grade 0 | Healthy retina, clear macula and optic disc, no vascular lesions |
| **NPDR** | 30 | Grade 2 | Non-Proliferative DR: microaneurysms, dot-blot hemorrhages, hard lipid exudates |
| **PDR** | 20 | Grade 4 | Proliferative DR: neovascularization, preretinal hemorrhages, vitreous involvement |

- **Storage Locations**:
  - `ai/datasets/retinal_images/`: Training & evaluation set with `metadata.csv` and `README.md`.
  - `public/test_retinal_images/`: Frontend accessible test gallery with `manifest.json`.
- **Validation**: All 100 images pass the 9-point optical validator and produce validated clinical inference.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, Lucide React, Canvas Confetti |
| **Backend API** | Python 3.11, FastAPI, Uvicorn, Pydantic, Pillow, NumPy |
| **AI / ML** | PyTorch, ONNX Runtime, XGBoost, SHAP, OpenCV |
| **Database** | SQLite (`database/visionxai.db`) with Supabase PostgreSQL cloud sync |
| **Containerization** | Docker (multi-stage build: Node 20 Alpine → Python 3.11 slim) |
| **Deployment** | Render.com Web Service (`https://visionxai.onrender.com`) |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.10 or v3.11)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Vivekshil-Gayakwad/visionxai.git
cd visionxai
```

### 2. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
# -> Runs on http://localhost:5173
```

### 3. Backend Setup
```bash
# In a separate terminal, navigate to backend
cd backend

# Install Python requirements
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn app.main:app --reload --port 8000
# -> API running on http://127.0.0.1:8000
# -> Swagger docs available at http://127.0.0.1:8000/docs
```

---

## 🐳 Docker Production Deployment

VisionXAI includes an all-in-one multi-stage `Dockerfile` that packages the React frontend, FastAPI backend, and AI models into a single production image:

```bash
# Build the Docker image
docker build -t visionxai .

# Run the container
docker run -d -p 8000:8000 -e PORT=8000 --name visionxai-app visionxai

# Access the app at http://localhost:8000
```

### Deploying to Render
1. Push this repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com), create a **New Web Service** connected to your repository.
3. Select **Docker** environment (Render automatically reads `render.yaml` and `Dockerfile`).
4. Set the environment variable: `PORT = 8000`.
5. Deploy!

---

## 📁 Repository Structure

```
Explainable-AI/
├── README.md                          # Master project documentation
├── Dockerfile                         # Multi-stage production container build
├── docker-compose.yml                 # Local multi-service orchestrator
├── render.yaml                        # Render.com Blueprint deployment spec
├── index.html                         # SPA HTML entry point
├── package.json                       # Node dependencies & build scripts
├── vite.config.js                     # Vite bundler configuration & API proxy
├── tailwind.config.js                 # Tailwind design system & color tokens
├── postcss.config.js                  # CSS post-processing
├── .dockerignore                      # Build context exclusion rules
├── .gitignore                         # Version control ignore patterns
├── .env.example                       # Environment variable templates
│
├── src/                               # Frontend source code (React 18)
│   ├── App.jsx                        # Main application router & layout
│   ├── main.jsx                       # React DOM entry point
│   ├── index.css                      # Global styles, Aptos font, healthcare theme
│   ├── components/                    # UI Components
│   │   ├── Navbar.jsx                 # Top bar with i18n & theme switcher
│   │   ├── Hero.jsx                   # Landing hero banner
│   │   ├── Footer.jsx                 # Application footer
│   │   ├── AuthModal.jsx              # Medical staff authentication & registry validation
│   │   ├── PublicReportView.jsx       # Universally accessible patient clinical report
│   │   ├── WorkerProfileModal.jsx     # Staff credentials & profile modal
│   │   ├── WorkflowSection.jsx        # 3-tier clinical continuum visualizer
│   │   ├── ExplainableAiSection.jsx   # XAI explainability showcase
│   │   ├── asha/                      # Tier 1: ASHA field worker interface
│   │   ├── nurse/                     # Tier 2: Hospital nurse fundus capture & AI analysis
│   │   └── doctor/                    # Tier 3: Ophthalmologist review dossier & report editor
│   ├── context/                       # React Context Providers (Auth, Patient, Language, Theme)
│   └── lib/                           # Utilities, API client, QR generator, medical registry data
│
├── backend/                           # Production API Server (FastAPI)
│   ├── requirements.txt               # Python production dependencies
│   └── app/
│       ├── main.py                    # REST API endpoints & public report rendering
│       ├── dr_engine.py               # Retinal DL engine, Ben Graham crop, ONNX & Grad-CAM
│       ├── db.py                      # SQLite database operations & auto-migrations
│       └── verified_registries_data.py# Official Maharashtra NHM, INC, MCI medical registries
│
├── database/                          # Database schema & storage
│   ├── schema.sql                     # Production PostgreSQL schema for Supabase
│   └── visionxai.db                   # Local SQLite database
│
├── ai/                                # AI Models, Training & Notebooks
│   ├── train_asha_risk_model.py       # XGBoost + TreeSHAP clinical risk training script
│   ├── train_retinal_multidataset.py  # Multi-dataset retinal harmonization & training pipeline
│   ├── models/                        # Pre-trained production weights
│   │   ├── dr_model.onnx             # EfficientNet-B3 ONNX model (43.5 MB)
│   │   ├── dr_model.pth              # EfficientNet-B3 PyTorch checkpoint (44.9 MB)
│   │   ├── risk_model.joblib         # XGBoost risk model artifact
│   │   ├── shap_explainer.joblib     # SHAP TreeExplainer artifact
│   │   └── feature_columns.json      # Tabular feature alignment schema
│   ├── datasets/                      # Training & test data
│   │   ├── tabular/                   # Clinical survey training dataset
│   │   └── retinal_images/            # 100 Real clinical retinal fundus test images
│   │       ├── normal/                # 50 Normal fundus scans
│   │       ├── dr/                    # 50 Diabetic Retinopathy scans (NPDR + PDR)
│   │       ├── metadata.csv           # Clinical annotations
│   │       └── README.md              # Dataset documentation
│   └── notebooks/                     # Colab & Kaggle GPU training notebooks
│
└── public/                            # Static assets
    └── test_retinal_images/           # Frontend-accessible test image gallery
        ├── normal/                    # 50 Normal fundus scans
        ├── dr/                        # 50 Diabetic Retinopathy scans
        └── manifest.json              # Image index & clinical metadata
```

---

## 👥 Contributors & Acknowledgements

- **Lead Developer & System Architect**: **Dr. Vivek Gayakwad, MS**
- **Clinical Data Sources**:
  - Translational Visual Health Laboratory (Eye Fundus Dataset)
  - APTOS 2019 Blindness Detection (Aravind Eye Hospital, India)
  - IDRiD (Indian Diabetic Retinopathy Image Dataset, Nanded, India)
  - Messidor-2 Research Consortium

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
