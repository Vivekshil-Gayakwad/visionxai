import os
import pymupdf

OUTPUT_DIR = r"C:\Users\Vivek\OneDrive\Documents\Explainable-AI"
DIAGRAMS_DIR = os.path.join(OUTPUT_DIR, "pdf_diagrams_temp")
PDF_PATH = os.path.join(OUTPUT_DIR, "VisionXAI_Workflow_Specification.pdf")

doc = pymupdf.open()

# A4 dimensions in points
PAGE_W = 595.28
PAGE_H = 841.89

# Palette
C_PURPLE_DARK = (0.23, 0.03, 0.39)   # #3b0764
C_PURPLE = (0.42, 0.13, 0.66)        # #6b21a8
C_VIOLET = (0.49, 0.23, 0.93)        # #7c3aed
C_BORDER = (0.85, 0.71, 0.99)        # #d8b4fe
C_BG_LIGHT = (0.95, 0.91, 0.99)      # #f1e8fc
C_TEXT_DARK = (0.12, 0.11, 0.29)     # #1e1b4b
C_TEXT_MUTED = (0.42, 0.45, 0.50)    # #6b7280
C_WHITE = (1.0, 1.0, 1.0)
C_CARD_BG = (0.98, 0.97, 1.0)

def draw_header_footer(page, page_num, total_pages, title="VisionXAI: Explainable AI Clinical Workflow"):
    # Top banner bar
    page.draw_rect(pymupdf.Rect(0, 0, PAGE_W, 28), color=None, fill=C_PURPLE_DARK)
    page.insert_text((30, 18), "VisionXAI • Early Diabetic Retinopathy Screening System", fontsize=8.5, color=C_WHITE)
    page.insert_text((PAGE_W - 140, 18), "Clinical Specification", fontsize=8.5, color=C_BORDER)

    # Bottom footer bar
    page.draw_line(pymupdf.Point(30, PAGE_H - 30), pymupdf.Point(PAGE_W - 30, PAGE_H - 30), color=C_BORDER, width=0.8)
    page.insert_text((30, PAGE_H - 18), "Confidential • Medical Decision Support Architecture", fontsize=8, color=C_TEXT_MUTED)
    page_str = f"Page {page_num} of {total_pages}"
    page.insert_text((PAGE_W - 30 - len(page_str)*5, PAGE_H - 18), page_str, fontsize=8, color=C_TEXT_MUTED)

def draw_card(page, rect, bg=C_WHITE, border=C_BORDER, border_width=1.0):
    page.draw_rect(rect, color=border, fill=bg, width=border_width)

def draw_section_title(page, y, number, title, subtitle=""):
    page.draw_rect(pymupdf.Rect(30, y, 36, y + 20), color=None, fill=C_VIOLET)
    page.insert_text((37, y + 15), str(number), fontsize=11, fontname="helv", color=C_WHITE)
    page.insert_text((75, y + 16), title, fontsize=13, fontname="helv", color=C_PURPLE_DARK)
    if subtitle:
        page.insert_text((75, y + 28), subtitle, fontsize=8.5, color=C_TEXT_MUTED)

# ==============================================================================
# PAGE 1: COVER PAGE
# ==============================================================================
page1 = doc.new_page(width=PAGE_W, height=PAGE_H)

# Decorative background accent
page1.draw_rect(pymupdf.Rect(0, 0, PAGE_W, 260), color=None, fill=C_PURPLE_DARK)
page1.draw_circle(pymupdf.Point(PAGE_W - 40, 50), 90, color=None, fill=(0.28, 0.05, 0.48))
page1.draw_circle(pymupdf.Point(PAGE_W - 20, 20), 40, color=None, fill=(0.35, 0.08, 0.58))

# Title & Badges
page1.insert_text((40, 75), "CLINICAL WORKFLOW & ARCHITECTURE SPECIFICATION", fontsize=9, fontname="helv", color=C_BORDER)
page1.insert_text((40, 115), "VisionXAI", fontsize=32, fontname="helv", color=C_WHITE)
page1.insert_text((40, 145), "Explainable AI for Early Diabetic Retinopathy Screening", fontsize=15, fontname="helv", color=C_BORDER)
page1.insert_text((40, 175), "A 3-Tier Multi-Modal Tele-Ophthalmology System for Rural Outreach", fontsize=10.5, fontname="helv", color=(0.9, 0.85, 0.98))

# Pill badges
badges = ["Rural Field Screening", "Dual-Stage XAI", "Fundus Imaging", "Doctor Governance", "Supabase Auth"]
bx = 40
for b in badges:
    bw = len(b) * 5.6 + 14
    page1.draw_rect(pymupdf.Rect(bx, 200, bx + bw, 220), color=C_VIOLET, fill=(0.28, 0.08, 0.48), width=0.8)
    page1.insert_text((bx + 7, 214), b, fontsize=7.5, color=C_WHITE)
    bx += bw + 8

# Overview Card
draw_card(page1, pymupdf.Rect(40, 290, PAGE_W - 40, 480), bg=C_WHITE, border=C_BORDER, border_width=1.2)
page1.insert_text((60, 318), "Executive Summary & System Purpose", fontsize=13, fontname="helv", color=C_PURPLE)

exec_text = (
    "Diabetic Retinopathy (DR) remains a leading cause of preventable blindness worldwide, especially in "
    "rural and underserved populations where specialized ophthalmologists are scarce. VisionXAI bridges this "
    "critical healthcare gap through a seamless 3-Tier Explainable AI Screening Pipeline:\n\n"
    "• Tier 1: ASHA Worker (Community Outreach) — Door-to-door rural survey capturing patient demographics, "
    "clinical risk factors (HbA1c, BP, duration, tobacco), and ocular symptoms. Employs a weighted SHAP risk engine "
    "to classify risk (Low / Moderate / High) and book hospital screening appointments.\n\n"
    "• Tier 2: Nurse / Hospital Worker (Ocular Imaging) — Hospital triage check, high-resolution retinal fundus "
    "capture, AI deep learning DR severity calculation (0-100%), and Grad-CAM visual heatmap attention mapping "
    "to highlight microaneurysms and exudates.\n\n"
    "• Tier 3: Doctor (Ophthalmologist Specialist) — Full longitudinal dossier review, interactive report editor, "
    "status transitions, PDF export, and direct patient notification via WhatsApp and SMS."
)
page1.insert_textbox(pymupdf.Rect(60, 335, PAGE_W - 60, 465), exec_text, fontsize=9.2, color=C_TEXT_DARK, lineheight=1.35)

# Key Metrics Table Card
draw_card(page1, pymupdf.Rect(40, 500, PAGE_W - 40, 680), bg=C_CARD_BG, border=C_BORDER)
page1.insert_text((60, 528), "Key System Highlights & Capabilities", fontsize=12, fontname="helv", color=C_PURPLE)

highlights = [
    ("3-Tier Clinical Workflow", "Strict role-based isolation between ASHA Field, Nurse Clinic, and Specialist Doctor."),
    ("Dual-Stage Explainable AI", "Tabular SHAP factor attributions at Tier 1 + Visual Grad-CAM heatmaps at Tier 2."),
    ("Multi-Language Support", "Real-time reactive language toggle supporting English, Marathi (मराठी), and Hindi (हिंदी)."),
    ("Adaptive Healthcare UI", "Professional Aptos Light typography, light purple white background, and dark mode."),
    ("Omnichannel Patient Dispatch", "Click-to-chat WhatsApp (wa.me) and SMS notification with personalized recommendations."),
    ("Zero Cold-Start Friction", "Client-side persistence via LocalStorage + optional Supabase authentication.")
]

hy = 548
for title, desc in highlights:
    page1.draw_circle(pymupdf.Point(68, hy - 3), 3, color=None, fill=C_VIOLET)
    page1.insert_text((78, hy), title + ":", fontsize=8.5, fontname="helv", color=C_PURPLE_DARK)
    page1.insert_text((220, hy), desc, fontsize=8.2, color=C_TEXT_DARK)
    hy += 20

# Metadata box
page1.draw_rect(pymupdf.Rect(40, 705, PAGE_W - 40, 770), color=C_BORDER, fill=C_BG_LIGHT)
page1.insert_text((60, 728), "Document Version: 1.0.0 (Production Release)", fontsize=8.5, fontname="helv", color=C_PURPLE)
page1.insert_text((60, 744), "Target Users: ASHA Healthcare Facilitators, Hospital Nurses, Consulting Ophthalmologists", fontsize=8, color=C_TEXT_MUTED)
page1.insert_text((60, 758), "Security Standard: HIPAA/DISHA-aligned data segregation with human-in-the-loop validation", fontsize=8, color=C_TEXT_MUTED)

# Footer
page1.insert_text((PAGE_W/2 - 60, PAGE_H - 20), "Page 1 of 8 • Cover", fontsize=8, color=C_TEXT_MUTED)

# ==============================================================================
# PAGE 2: SYSTEM ARCHITECTURE
# ==============================================================================
page2 = doc.new_page(width=PAGE_W, height=PAGE_H)
draw_header_footer(page2, 2, 8)
draw_section_title(page2, 45, "1", "System Architecture & Component Interactions", "Full-stack client, state, and authentication layer design")

# Diagram 1
diag1_path = os.path.join(DIAGRAMS_DIR, "diagram_1_arch.png")
if os.path.exists(diag1_path):
    page2.insert_image(pymupdf.Rect(35, 80, PAGE_W - 35, 340), filename=diag1_path)

# Explanation Cards
draw_card(page2, pymupdf.Rect(35, 355, PAGE_W - 35, 530), bg=C_WHITE, border=C_BORDER)
page2.insert_text((50, 375), "Architecture Layer Breakdown", fontsize=11, fontname="helv", color=C_PURPLE)

arch_desc = (
    "1. Presentation Layer (Vite + React 18): Built as an ultra-responsive Single Page Application (SPA). "
    "Designed with Aptos Light typography, subtle purple accents, and responsive layout cards. Portals are strictly "
    "isolated — entering any portal renders solely that role's interface with no home page distraction.\n\n"
    "2. Authentication Layer (Supabase Auth + Fallback): Supports secure user signup and sign-in for all three "
    "medical roles (ASHA Worker, Nurse, Doctor) requiring License ID, email, phone, and password. In environments "
    "without active cloud connection, a resilient local fallback authentication simulates role sessions immediately.\n\n"
    "3. State & Persistence (Context API + LocalStorage): Global state management is structured across dedicated contexts:\n"
    "   • AuthContext: Manages active user identity, token validation, and role-based permissions.\n"
    "   • PatientContext: Orchestrates patient CRUD operations, risk assessments, fundus images, and clinical reports.\n"
    "   • LanguageContext: Provides dynamic translation tokens across English, Marathi, and Hindi.\n"
    "   • ThemeContext: Governs dark/light appearance tokens with persistent preference storage."
)
page2.insert_textbox(pymupdf.Rect(50, 388, PAGE_W - 50, 520), arch_desc, fontsize=8.5, color=C_TEXT_DARK, lineheight=1.35)

draw_card(page2, pymupdf.Rect(35, 545, PAGE_W - 35, 785), bg=C_CARD_BG, border=C_BORDER)
page2.insert_text((50, 565), "Role-Based Access Control (RBAC) & Data Compartmentalization", fontsize=11, fontname="helv", color=C_PURPLE)

rbac_desc = (
    "A fundamental safety requirement of the VisionXAI architecture is strict role segregation:\n\n"
    "• No Direct Cross-Portal Switching: Users cannot jump directly between ASHA, Nurse, and Doctor portals "
    "from within a session. This prevents accidental cross-role data entry and maintains clean clinical boundaries.\n\n"
    "• Clinical State Lifecycle: Patients transition through explicit states:\n"
    "   'Registered' (ASHA) ➔ 'Scheduled' (Appointment) ➔ 'Imaged' (Nurse) ➔ 'Diagnosed' (Doctor) ➔ 'Notified'.\n\n"
    "• Privacy & Safety Controls: Every patient record includes deletion confirmation, eye image removal options, "
    "and audit trails to ensure compliance with clinical governance standards."
)
page2.insert_textbox(pymupdf.Rect(50, 578, PAGE_W - 50, 775), rbac_desc, fontsize=8.5, color=C_TEXT_DARK, lineheight=1.35)

# ==============================================================================
# PAGE 3: END-TO-END PATIENT JOURNEY
# ==============================================================================
page3 = doc.new_page(width=PAGE_W, height=PAGE_H)
draw_header_footer(page3, 3, 8)
draw_section_title(page3, 45, "2", "End-to-End Clinical Screening & Referral Pipeline", "Step-by-step patient lifecycle from rural field visit to treatment")

diag2_path = os.path.join(DIAGRAMS_DIR, "diagram_2_journey.png")
if os.path.exists(diag2_path):
    page3.insert_image(pymupdf.Rect(35, 80, PAGE_W - 35, 345), filename=diag2_path)

# Detailed Journey Table
draw_card(page3, pymupdf.Rect(35, 360, PAGE_W - 35, 785), bg=C_WHITE, border=C_BORDER)
page3.insert_text((50, 380), "Phase-by-Phase Operational Protocol", fontsize=11, fontname="helv", color=C_PURPLE)

stages = [
    ("Phase 1: Household Survey", "ASHA Worker conducts rural outreach visits. Gathers patient demographics (Name, Age, Gender, Mobile), clinical history (HbA1c, BP, diabetes duration, cholesterol, pregnancy, tobacco use), and ocular symptoms."),
    ("Phase 2: AI Risk Assessment", "ASHA clicks 'Predict Risk'. System evaluates factors using a weighted SHAP algorithm. Returns Low (<30%), Moderate (30-60%), or High (>60%) risk, complete with plain-language factor explanations."),
    ("Phase 3: Referral Scheduling", "If risk is Moderate or High, AI flags mandatory DR hospital screening. ASHA schedules an appointment. Record is stored and automatically propagated to the hospital triage database."),
    ("Phase 4: Hospital Arrival & Imaging", "Patient arrives at hospital clinic. Nurse accesses triage queue, verifies patient identity, and captures high-resolution retinal fundus photograph via specialized camera."),
    ("Phase 5: AI DR % & Grad-CAM Analysis", "Nurse executes AI analysis. Deep learning model calculates Diabetic Retinopathy severity (0-100%) and renders a Grad-CAM heatmap highlighting suspicious lesions. Nurse generates clinical report."),
    ("Phase 6: Specialist Review & Editing", "Ophthalmologist opens Doctor Portal, reviews full longitudinal dossier, edits clinical diagnosis and prescriptions, updates patient health status, and signs off."),
    ("Phase 7: Omnichannel Notification", "Doctor dispatches report directly to patient's mobile device via WhatsApp (wa.me) or SMS, advising immediate follow-up actions and clinical instructions.")
]

sy = 400
for ph_title, ph_desc in stages:
    page3.draw_rect(pymupdf.Rect(50, sy - 10, 160, sy + 6), color=None, fill=C_BG_LIGHT)
    page3.insert_text((54, sy), ph_title, fontsize=8, fontname="helv", color=C_PURPLE_DARK)
    page3.insert_textbox(pymupdf.Rect(170, sy - 10, PAGE_W - 50, sy + 40), ph_desc, fontsize=8, color=C_TEXT_DARK, lineheight=1.25)
    sy += 52

# ==============================================================================
# PAGE 4: TIER 1 ASHA WORKER PORTAL
# ==============================================================================
page4 = doc.new_page(width=PAGE_W, height=PAGE_H)
draw_header_footer(page4, 4, 8)
draw_section_title(page4, 45, "3", "Tier 1: ASHA Field Survey & Explainable Risk Scoring", "Community-based early risk prediction with weighted SHAP factor analysis")

diag3_path = os.path.join(DIAGRAMS_DIR, "diagram_3_asha.png")
if os.path.exists(diag3_path):
    page4.insert_image(pymupdf.Rect(35, 80, PAGE_W - 35, 340), filename=diag3_path)

# Explanation Cards
draw_card(page4, pymupdf.Rect(35, 355, PAGE_W - 35, 560), bg=C_WHITE, border=C_BORDER)
page4.insert_text((50, 375), "Input Parameters & Clinical Risk Weights", fontsize=11, fontname="helv", color=C_PURPLE)

params = [
    ("Glycated Hemoglobin (HbA1c %)", "25%", "Primary biomarker; values above 7.0% increase DR microvascular damage exponentially."),
    ("Diabetes Duration (Years)", "20%", "Long-standing hyperglycemia (>10 years) strongly correlates with vessel leakage."),
    ("Blood Pressure (Systolic mmHg)", "15%", "Hypertension exacerbates retinal capillary pressure and microaneurysm rupture."),
    ("Serum Cholesterol (mg/dL)", "10%", "Elevated serum lipids correlate with hard exudate deposition in macular regions."),
    ("Pregnancy & Tobacco Use", "10%", "Pregnancy accelerates DR progression; nicotine induces retinal hypoxia."),
    ("Fixed Symptoms (Checkboxes)", "15%", "Blurry vision, floaters/spots, blank areas, faded colors, poor night vision."),
    ("Custom Manual Symptoms", "5%", "Free-text input for patient-reported itching, redness, or localized eye pain.")
]

py = 395
page4.draw_rect(pymupdf.Rect(50, py - 12, PAGE_W - 50, py + 4), color=None, fill=C_BG_LIGHT)
page4.insert_text((55, py - 2), "Clinical Factor", fontsize=8, fontname="helv", color=C_PURPLE_DARK)
page4.insert_text((220, py - 2), "Weight", fontsize=8, fontname="helv", color=C_PURPLE_DARK)
page4.insert_text((270, py - 2), "Clinical Significance & Rationale", fontsize=8, fontname="helv", color=C_PURPLE_DARK)
py += 18

for name, wt, desc in params:
    page4.insert_text((55, py), name, fontsize=7.8, fontname="helv", color=C_TEXT_DARK)
    page4.insert_text((225, py), wt, fontsize=7.8, fontname="helv", color=C_VIOLET)
    page4.insert_text((270, py), desc, fontsize=7.5, color=C_TEXT_MUTED)
    py += 19

draw_card(page4, pymupdf.Rect(35, 575, PAGE_W - 35, 785), bg=C_CARD_BG, border=C_BORDER)
page4.insert_text((50, 595), "SHAP Explainability & Triage Recommendation Gate", fontsize=11, fontname="helv", color=C_PURPLE)

triage_desc = (
    "• Transparent Mathematical Formulation: The AI engine calculates composite risk using Shapley values:\n"
    "   Risk Score = Baseline + Σ (Factor_i × Weight_i × Scaling_i)\n"
    "   Each factor produces a visible SHAP contribution bar, showing whether it increased or decreased risk.\n\n"
    "• Triage Decision Logic:\n"
    "   - Low Risk (<30%): ASHA advises ongoing lifestyle management and regular annual review. No hospital trip needed.\n"
    "   - Moderate Risk (30-60%): AI flags early microvascular vulnerability. Recommends hospital fundus screening within 30 days.\n"
    "   - High Risk (>60%): Urgent notification. Immediate hospital appointment booked for comprehensive fundus photography.\n\n"
    "• ASHA Dashboard Capabilities: Includes patient search, age/risk filtering, deletion options, and aggregate screening analytics."
)
page4.insert_textbox(pymupdf.Rect(50, 608, PAGE_W - 50, 775), triage_desc, fontsize=8.5, color=C_TEXT_DARK, lineheight=1.35)

# ==============================================================================
# PAGE 5: TIER 2 NURSE PORTAL
# ==============================================================================
page5 = doc.new_page(width=PAGE_W, height=PAGE_H)
draw_header_footer(page5, 5, 8)
draw_section_title(page5, 45, "4", "Tier 2: Nurse Hospital Imaging & AI Detection Pipeline", "High-resolution fundus image analysis, DR percentage calculation and Grad-CAM saliency")

diag4_path = os.path.join(DIAGRAMS_DIR, "diagram_4_nurse.png")
if os.path.exists(diag4_path):
    page5.insert_image(pymupdf.Rect(35, 80, PAGE_W - 35, 340), filename=diag4_path)

draw_card(page5, pymupdf.Rect(35, 355, PAGE_W - 35, 550), bg=C_WHITE, border=C_BORDER)
page5.insert_text((50, 375), "Retinal Imaging & Deep Learning Pipeline", fontsize=11, fontname="helv", color=C_PURPLE)

nurse_desc = (
    "1. Triage Queue & Patient Selection: When a referred patient arrives at the ophthalmology clinic, the nurse "
    "selects their profile from the triage queue. All prior survey data, risk scores, and symptoms collected by the ASHA "
    "worker are immediately visible.\n\n"
    "2. Fundus Image Capture / Upload: The nurse captures high-resolution retinal images using standard fundus cameras. "
    "The portal supports both real-time file upload and clinical presets for offline simulation.\n\n"
    "3. Computer Vision Preprocessing: Captured scans undergo illumination equalization, contrast-limited adaptive "
    "histogram equalization (CLAHE), and blood vessel enhancement to optimize lesion detection.\n\n"
    "4. AI DR % Severity Engine: The vision model identifies hallmark diabetic microvascular lesions, including "
    "microaneurysms, blot hemorrhages, hard exudates (lipid deposits), and soft exudates (cotton-wool spots). It calculates "
    "an objective Diabetic Retinopathy percentage score (0-100%)."
)
page5.insert_textbox(pymupdf.Rect(50, 388, PAGE_W - 50, 540), nurse_desc, fontsize=8.5, color=C_TEXT_DARK, lineheight=1.35)

draw_card(page5, pymupdf.Rect(35, 565, PAGE_W - 35, 785), bg=C_CARD_BG, border=C_BORDER)
page5.insert_text((50, 585), "Grad-CAM Saliency Maps & Clinical Report Generation", fontsize=11, fontname="helv", color=C_PURPLE)

gradcam_desc = (
    "• Grad-CAM Heatmap Visualization: To prevent blind trust in a black-box percentage, the AI engine produces a "
    "Gradient-weighted Class Activation Map (Grad-CAM). Using HTML5 Canvas rendering, the heatmap is overlaid directly "
    "onto the retinal image:\n"
    "   - Red & Orange Zones: High model activation — areas with severe microaneurysms, hemorrhages, or exudates.\n"
    "   - Yellow & Green Zones: Moderate attention — suspect vascular caliber changes or mild swelling.\n"
    "   - Blue & Transparent Zones: Normal retinal tissue, optic disc, or macula without lesions.\n\n"
    "• Clinical Report Compilation: Nurse clicks 'Generate Report' to bundle patient demographics, ASHA survey factors, "
    "the retinal scan, calculated DR %, and Grad-CAM visualization into a clinical package routed to Tier 3 (Doctor)."
)
page5.insert_textbox(pymupdf.Rect(50, 598, PAGE_W - 50, 775), gradcam_desc, fontsize=8.5, color=C_TEXT_DARK, lineheight=1.35)

# ==============================================================================
# PAGE 6: TIER 3 DOCTOR SPECIALIST PORTAL
# ==============================================================================
page6 = doc.new_page(width=PAGE_W, height=PAGE_H)
draw_header_footer(page6, 6, 8)
draw_section_title(page6, 45, "5", "Tier 3: Doctor Specialist Governance & Patient Communication", "Ophthalmologist verification, interactive report editing, and omnichannel dispatch")

diag5_path = os.path.join(DIAGRAMS_DIR, "diagram_5_doctor.png")
if os.path.exists(diag5_path):
    page6.insert_image(pymupdf.Rect(35, 80, PAGE_W - 35, 340), filename=diag5_path)

draw_card(page6, pymupdf.Rect(35, 355, PAGE_W - 35, 555), bg=C_WHITE, border=C_BORDER)
page6.insert_text((50, 375), "Doctor Portal Capabilities & Clinical Workflow", fontsize=11, fontname="helv", color=C_PURPLE)

doc_desc = (
    "1. Comprehensive Longitudinal Dossier: The Doctor Portal displays the unified patient record aggregating "
    "all data streams across Tier 1 (ASHA survey, SHAP risk), Tier 2 (fundus image, Grad-CAM heatmap, DR %), and past history.\n\n"
    "2. Interactive Report Editor: The ophthalmologist maintains full clinical control and can edit:\n"
    "   • Clinical Diagnosis: Standard ICD-10 DR staging (Mild / Moderate / Severe NPDR or PDR, Macular Edema).\n"
    "   • Clinical Notes: Specialized remarks on laser photocoagulation, anti-VEGF therapy, or glycemic control.\n"
    "   • Prescriptions: Lubricants, anti-hypertensives, or retinal supplements.\n"
    "   • Follow-Up Interval: Scheduling next review (e.g., 3 months, 6 months, 1 year).\n\n"
    "3. Patient Health Status Transition: Doctor updates official health status:\n"
    "   'Active' ➔ 'Under Treatment' ➔ 'Stable' ➔ 'Recovered' ➔ 'Critical'."
)
page6.insert_textbox(pymupdf.Rect(50, 388, PAGE_W - 50, 545), doc_desc, fontsize=8.5, color=C_TEXT_DARK, lineheight=1.35)

draw_card(page6, pymupdf.Rect(35, 570, PAGE_W - 35, 785), bg=C_CARD_BG, border=C_BORDER)
page6.insert_text((50, 590), "Omnichannel Patient Notification & Printable Clinical Report", fontsize=11, fontname="helv", color=C_PURPLE)

notify_desc = (
    "• Direct WhatsApp Dispatch (wa.me Integration): With one click, the doctor initiates a secure WhatsApp message "
    "pre-filled with the patient's mobile number, official diagnosis, severity grade, prescribed care, and hospital contact.\n\n"
    "• Instant SMS Text Dispatch: For patients in rural villages without smartphones, an SMS alert provides the essential "
    "screening result, risk level, and next appointment date.\n\n"
    "• PDF Clinical Report Export: Generates a printable, standardized diagnostic report with institutional branding, "
    "patient identifiers, retinal fundus images, Grad-CAM overlays, and doctor's signature line for physical hospital records."
)
page6.insert_textbox(pymupdf.Rect(50, 603, PAGE_W - 50, 775), notify_desc, fontsize=8.5, color=C_TEXT_DARK, lineheight=1.35)

# ==============================================================================
# PAGE 7: EXPLAINABLE AI DEEP-DIVE
# ==============================================================================
page7 = doc.new_page(width=PAGE_W, height=PAGE_H)
draw_header_footer(page7, 7, 8)
draw_section_title(page7, 45, "6", "Explainable AI (XAI) Framework & Clinical Safety", "Dual-stage explainability paradigm ensuring medical transparency and clinical trust")

diag6_path = os.path.join(DIAGRAMS_DIR, "diagram_6_xai.png")
if os.path.exists(diag6_path):
    page7.insert_image(pymupdf.Rect(35, 80, PAGE_W - 35, 340), filename=diag6_path)

draw_card(page7, pymupdf.Rect(35, 355, PAGE_W - 35, 555), bg=C_WHITE, border=C_BORDER)
page7.insert_text((50, 375), "Why Explainable AI is Critical in Ophthalmology", fontsize=11, fontname="helv", color=C_PURPLE)

xai_desc = (
    "In clinical decision-making, conventional deep learning models act as 'black boxes' — providing an output "
    "without revealing the rationale. In Diabetic Retinopathy screening, opaque predictions create severe risks:\n\n"
    "• Erroneous Classifications: Artifacts such as lens dust, uneven illumination, or eyelashes can trick a CNN into "
    "falsely detecting hemorrhages or exudates, leading to unwarranted patient distress and hospital congestion.\n\n"
    "• Lack of Clinician Trust: Ophthalmologists cannot ethically sign off on diagnoses without knowing which retinal "
    "regions the AI analyzed.\n\n"
    "• Patient Communication: Rural patients are far more likely to comply with referrals when the ASHA worker can point "
    "to specific factors (e.g., 'your high HbA1c of 9.2% and floaters accounted for 45% of your risk')."
)
page7.insert_textbox(pymupdf.Rect(50, 388, PAGE_W - 50, 545), xai_desc, fontsize=8.5, color=C_TEXT_DARK, lineheight=1.35)

draw_card(page7, pymupdf.Rect(35, 570, PAGE_W - 35, 785), bg=C_CARD_BG, border=C_BORDER)
page7.insert_text((50, 590), "Comparison: Tabular SHAP vs Visual Grad-CAM", fontsize=11, fontname="helv", color=C_PURPLE)

comp_table = [
    ("Dimension", "Tier 1: SHAP Engine", "Tier 2: Grad-CAM Engine"),
    ("Target User", "ASHA Rural Health Worker", "Hospital Nurse & Ophthalmologist"),
    ("Data Modality", "Tabular Risk & Symptoms", "2D Retinal Fundus Scans"),
    ("Mathematical Basis", "Shapley game-theoretic attributions", "Backpropagated gradients to final conv layer"),
    ("Visualization", "Feature contribution bar chart", "Pixel-aligned visual heatmap overlay"),
    ("Primary Objective", "Transparent triage justification", "Vascular lesion verification & confirmation"),
    ("Clinical Impact", "Increases screening compliance", "Prevents false-positive laser referrals")
]

cy = 612
page7.draw_rect(pymupdf.Rect(50, cy - 10, PAGE_W - 50, cy + 6), color=None, fill=C_BG_LIGHT)
page7.insert_text((55, cy), "Dimension", fontsize=7.5, fontname="helv", color=C_PURPLE_DARK)
page7.insert_text((180, cy), "Tier 1: SHAP Engine", fontsize=7.5, fontname="helv", color=C_PURPLE_DARK)
page7.insert_text((360, cy), "Tier 2: Grad-CAM Engine", fontsize=7.5, fontname="helv", color=C_PURPLE_DARK)
cy += 18

for dim, t1, t2 in comp_table[1:]:
    page7.insert_text((55, cy), dim, fontsize=7.5, fontname="helv", color=C_TEXT_DARK)
    page7.insert_text((180, cy), t1, fontsize=7.5, color=C_TEXT_MUTED)
    page7.insert_text((360, cy), t2, fontsize=7.5, color=C_VIOLET)
    cy += 18

# ==============================================================================
# PAGE 8: TECHNICAL SPECIFICATIONS & ROADMAP
# ==============================================================================
page8 = doc.new_page(width=PAGE_W, height=PAGE_H)
draw_header_footer(page8, 8, 8)
draw_section_title(page8, 45, "7", "Technical Specifications & Future Backend Roadmap", "Implementation architecture, multi-language engine, and database scaling")

draw_card(page8, pymupdf.Rect(35, 75, PAGE_W - 35, 275), bg=C_WHITE, border=C_BORDER)
page8.insert_text((50, 95), "Multi-Language & Adaptive Theme Specifications", fontsize=11, fontname="helv", color=C_PURPLE)

specs_desc = (
    "• Trilingual Localization Engine: Built using a modular dictionary architecture in `src/lib/translations.js`. "
    "Supports English (en), Marathi (mr - मराठी), and Hindi (hi - हिंदी). Switching languages instantly re-renders all "
    "labels, form placeholders, risk outputs, diagnosis descriptions, and portal headers across the entire platform.\n\n"
    "• Aptos Light Typography: Applied universally across all screens. Avoids harsh gradient text fills, prioritizing "
    "high-contrast solid colors (black, deep purple, and crisp white) for medical clarity.\n\n"
    "• Adaptive Theme Architecture:\n"
    "   - Light Mode: Light purple background (#f1e8fc) paired with frosted white cards and thin purple borders.\n"
    "   - Dark Mode: Preserves deep black-purple tones (#0b0416) with subtle purple glassmorphic borders.\n"
    "   - Corner Accents: Ambient curved light shapes in page corners for a modern, approachable aesthetic."
)
page8.insert_textbox(pymupdf.Rect(50, 108, PAGE_W - 50, 265), specs_desc, fontsize=8.5, color=C_TEXT_DARK, lineheight=1.35)

draw_card(page8, pymupdf.Rect(35, 290, PAGE_W - 35, 550), bg=C_CARD_BG, border=C_BORDER)
page8.insert_text((50, 310), "Future Backend & AI Model Training Roadmap", fontsize=11, fontname="helv", color=C_PURPLE)

backend_desc = (
    "When transitioning from client-side LocalStorage to a production backend infrastructure, the recommended architecture is:\n\n"
    "1. Database Selection:\n"
    "   • PostgreSQL (via Supabase or Managed RDS): Highly recommended. Provides ACID compliance, relational foreign keys "
    "between patients, appointments, and imaging records, and built-in Row-Level Security (RLS) for HIPAA compliance.\n"
    "   • MongoDB: Alternative for document-oriented storage if imaging metadata and flexible symptom trees expand rapidly.\n\n"
    "2. Server Framework: Python FastAPI or Node.js Express/NestJS:\n"
    "   • FastAPI provides native asynchronous endpoints, automatic OpenAPI documentation, and seamless PyTorch/TensorFlow integration.\n\n"
    "3. AI Model Training on Custom Indian Clinic Datasets:\n"
    "   • Datasets: Combine open-source benchmarks (EyePACS, Messidor-2, APTOS 2019) with locally annotated rural clinic scans.\n"
    "   • Architecture: EfficientNet-B4 or Vision Transformer (ViT) pre-trained on ImageNet, fine-tuned with focal loss for DR grading.\n"
    "   • Explainability: Hook PyTorch backward hooks to extract activation maps at the final convolutional layer for Grad-CAM.\n"
    "   • Export: Quantize to ONNX / TensorRT for edge inference on low-power hospital laptops."
)
page8.insert_textbox(pymupdf.Rect(50, 323, PAGE_W - 50, 540), backend_desc, fontsize=8.5, color=C_TEXT_DARK, lineheight=1.35)

# Verification & Certification Box
draw_card(page8, pymupdf.Rect(35, 565, PAGE_W - 35, 785), bg=C_WHITE, border=C_BORDER)
page8.insert_text((50, 585), "Clinical Quality Assurance & Governance Checklist", fontsize=11, fontname="helv", color=C_PURPLE)

checklist = [
    ("Patient Consent & Privacy", "All patient data gathered during rural visits requires informed verbal/written consent."),
    ("Image Quality Assurance", "Nurse portal validates fundus illumination, focus, and field of view before model inference."),
    ("Human-in-the-Loop Supremacy", "AI outputs are purely assistive. Final clinical diagnosis remains the sole responsibility of the ophthalmologist."),
    ("Audit Logging", "Every report modification, status update, and dispatch action generates an immutable audit timestamp."),
    ("Offline Continuity", "Field survey modules retain local caching to ensure uninterrupted operation during rural connectivity drops.")
]

chk_y = 605
for item_title, item_desc in checklist:
    page8.draw_circle(pymupdf.Point(58, chk_y - 2), 3, color=None, fill=C_VIOLET)
    page8.insert_text((68, chk_y), item_title + ":", fontsize=8.2, fontname="helv", color=C_PURPLE_DARK)
    page8.insert_text((215, chk_y), item_desc, fontsize=8, color=C_TEXT_DARK)
    chk_y += 24

page8.draw_rect(pymupdf.Rect(50, 740, PAGE_W - 50, 775), color=C_BORDER, fill=C_BG_LIGHT)
page8.insert_text((PAGE_W/2 - 120, 760), "Approved for Clinical Demonstration & Architectural Review", fontsize=8.5, fontname="helv", color=C_PURPLE)

# Save document
doc.save(PDF_PATH)
doc.close()
print(f"Master PDF successfully generated at: {PDF_PATH}")
