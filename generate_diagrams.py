import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import pymupdf

OUTPUT_DIR = r"C:\Users\Vivek\OneDrive\Documents\Explainable-AI"
DIAGRAMS_DIR = os.path.join(OUTPUT_DIR, "pdf_diagrams_temp")
os.makedirs(DIAGRAMS_DIR, exist_ok=True)

# Common styling colors
C_PURPLE_DARK = "#3b0764"
C_PURPLE = "#6b21a8"
C_VIOLET = "#7c3aed"
C_LIGHT_BG = "#faf5ff"
C_CARD_BG = "#ffffff"
C_BORDER = "#d8b4fe"
C_TEXT = "#1e1b4b"
C_TEXT_MUTED = "#6b7280"
C_GREEN = "#059669"
C_AMBER = "#d97706"
C_RED = "#dc2626"
C_BLUE = "#2563eb"

def create_box(ax, x, y, w, h, text, title="", color="#7c3aed", bg="#ffffff", border="#d8b4fe", fontsize=9, title_fontsize=10):
    rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.03",
                                  facecolor=bg, edgecolor=border, linewidth=1.5)
    ax.add_patch(rect)
    if title:
        ax.text(x + w/2, y + h - 0.04, title, ha="center", va="top", fontsize=title_fontsize, fontweight="bold", color=color)
        ax.text(x + w/2, y + (h - 0.05)/2, text, ha="center", va="center", fontsize=fontsize, color=C_TEXT, wrap=True)
    else:
        ax.text(x + w/2, y + h/2, text, ha="center", va="center", fontsize=fontsize, color=C_TEXT, wrap=True)

def draw_arrow(ax, x1, y1, x2, y2, label="", color="#7c3aed", rad=0.0):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="-|>", color=color, lw=1.8, shrinkA=3, shrinkB=3,
                                connectionstyle=f"arc3,rad={rad}"))
    if label:
        mx = (x1 + x2)/2
        my = (y1 + y2)/2
        ax.text(mx, my + 0.02, label, ha="center", va="bottom", fontsize=8, fontweight="bold", color=color,
                bbox=dict(boxstyle="round,pad=0.2", facecolor="#ffffff", edgecolor=color, alpha=0.9, lw=0.8))

# -------------------------------------------------------------
# DIAGRAM 1: SYSTEM ARCHITECTURE
# -------------------------------------------------------------
def gen_diagram_1():
    fig, ax = plt.subplots(figsize=(10, 5.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5.5)
    ax.axis("off")
    fig.patch.set_facecolor("#ffffff")

    # Outer container background
    outer = patches.FancyBboxPatch((0.2, 0.2), 9.6, 5.1, boxstyle="round,pad=0.03,rounding_size=0.04",
                                  facecolor="#faf5ff", edgecolor="#c084fc", linewidth=1.5)
    ax.add_patch(outer)
    ax.text(5.0, 5.05, "VisionXAI System Architecture & Data Layer Flow", ha="center", va="top", fontsize=13, fontweight="bold", color=C_PURPLE_DARK)

    # Layer 1: Client & Presentation
    create_box(ax, 0.5, 3.2, 2.6, 1.4, "React 18 + Vite SPA\nTailwind CSS + Aptos Light\nEN / MR / HI i18n", "Frontend App Shell", C_PURPLE, "#ffffff", "#c084fc")
    
    # Layer 2: Authentication
    create_box(ax, 3.7, 3.2, 2.6, 1.4, "Supabase Client\nJWT Auth Session\nLocal Storage Fallback", "Auth Layer", C_BLUE, "#eff6ff", "#93c5fd")

    # Layer 3: State & Contexts
    create_box(ax, 6.9, 3.2, 2.6, 1.4, "AuthContext (RBAC)\nPatientContext (CRUD)\nLanguage & ThemeContext", "Global State", C_VIOLET, "#ffffff", "#c084fc")

    # Layer 4: 3-Tier Portals
    create_box(ax, 0.5, 0.5, 2.6, 2.2, "• Household Survey\n• Demographics & HbA1c\n• Symptoms Checkboxes\n• SHAP Risk Prediction\n• Appointment Booking", "Tier 1: ASHA Worker", C_GREEN, "#f0fdf4", "#86efac")
    create_box(ax, 3.7, 0.5, 2.6, 2.2, "• Triage Queue Filter\n• Retinal Fundus Capture\n• AI DR % Detection\n• Grad-CAM Heatmap\n• Report Packaging", "Tier 2: Nurse Portal", C_BLUE, "#eff6ff", "#93c5fd")
    create_box(ax, 6.9, 0.5, 2.6, 2.2, "• Complete Dossier Audit\n• Editable Diagnosis/Notes\n• Health Status Changes\n• PDF Export Generator\n• WhatsApp/SMS Gateway", "Tier 3: Doctor Portal", C_PURPLE, "#faf5ff", "#c084fc")

    # Connections
    draw_arrow(ax, 3.1, 3.9, 3.7, 3.9, "User Sign-in", C_BLUE)
    draw_arrow(ax, 6.3, 3.9, 6.9, 3.9, "Session State", C_VIOLET)
    
    draw_arrow(ax, 1.8, 3.2, 1.8, 2.7, "Renders", C_PURPLE)
    draw_arrow(ax, 5.0, 3.2, 5.0, 2.7, "Renders", C_PURPLE)
    draw_arrow(ax, 8.2, 3.2, 8.2, 2.7, "Renders", C_PURPLE)

    draw_arrow(ax, 3.1, 1.6, 3.7, 1.6, "Referred Patient", C_GREEN)
    draw_arrow(ax, 6.3, 1.6, 6.9, 1.6, "Imaging & DR %", C_BLUE)

    path = os.path.join(DIAGRAMS_DIR, "diagram_1_arch.png")
    plt.tight_layout()
    plt.savefig(path, bbox_inches="tight", dpi=300)
    plt.close()
    return path

# -------------------------------------------------------------
# DIAGRAM 2: END-TO-END PATIENT JOURNEY
# -------------------------------------------------------------
def gen_diagram_2():
    fig, ax = plt.subplots(figsize=(10, 5.8), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5.8)
    ax.axis("off")
    fig.patch.set_facecolor("#ffffff")

    outer = patches.FancyBboxPatch((0.2, 0.2), 9.6, 5.4, boxstyle="round,pad=0.03,rounding_size=0.04",
                                  facecolor="#faf5ff", edgecolor="#c084fc", linewidth=1.5)
    ax.add_patch(outer)
    ax.text(5.0, 5.35, "VisionXAI: End-to-End Clinical Screening & Referral Pipeline", ha="center", va="top", fontsize=13, fontweight="bold", color=C_PURPLE_DARK)

    steps = [
        ("Step 1: Village Outreach", "ASHA visits home\nCollects risk factors\n& ocular symptoms", C_GREEN, "#f0fdf4", "#86efac", 0.5, 3.3),
        ("Step 2: AI Risk Triage", "ASHA portal predicts\nrisk (Low/Mod/High)\nusing SHAP factors", C_AMBER, "#fffbeb", "#fde68a", 3.7, 3.3),
        ("Step 3: Hospital Booking", "Moderate/High risk\npatients scheduled for\nhospital fundus test", C_RED, "#fef2f2", "#fca5a5", 6.9, 3.3),
        ("Step 4: Retinal Imaging", "Nurse captures retina\nvia fundus camera,\nuploads to portal", C_BLUE, "#eff6ff", "#93c5fd", 0.5, 0.6),
        ("Step 5: Explainable AI", "AI computes DR %\n& Grad-CAM attention\nsaliency heatmap", C_VIOLET, "#faf5ff", "#c084fc", 3.7, 0.6),
        ("Step 6: Specialist Action", "Doctor edits report,\nupdates health status,\nsends WhatsApp/SMS", C_PURPLE, "#f3e8ff", "#d8b4fe", 6.9, 0.6),
    ]

    for title, text, col, bg, border, x, y in steps:
        create_box(ax, x, y, 2.6, 1.4, text, title, col, bg, border, fontsize=8.5, title_fontsize=9.5)

    # Sequence arrows
    draw_arrow(ax, 3.1, 4.0, 3.7, 4.0, "Input Form", C_GREEN)
    draw_arrow(ax, 6.3, 4.0, 6.9, 4.0, "Risk >= Mod", C_AMBER)
    draw_arrow(ax, 8.2, 3.3, 8.2, 2.5, "Referral", C_RED)
    draw_arrow(ax, 8.2, 2.5, 1.8, 2.5, "Patient arrives at hospital", C_BLUE)
    draw_arrow(ax, 1.8, 2.5, 1.8, 2.0, "Triage Queue", C_BLUE)
    draw_arrow(ax, 3.1, 1.3, 3.7, 1.3, "Image Scan", C_BLUE)
    draw_arrow(ax, 6.3, 1.3, 6.9, 1.3, "Diagnosis", C_VIOLET)

    path = os.path.join(DIAGRAMS_DIR, "diagram_2_journey.png")
    plt.tight_layout()
    plt.savefig(path, bbox_inches="tight", dpi=300)
    plt.close()
    return path

# -------------------------------------------------------------
# DIAGRAM 3: TIER 1 ASHA WORKER SHAP RISK ENGINE
# -------------------------------------------------------------
def gen_diagram_3():
    fig, ax = plt.subplots(figsize=(10, 5.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5.5)
    ax.axis("off")
    fig.patch.set_facecolor("#ffffff")

    outer = patches.FancyBboxPatch((0.2, 0.2), 9.6, 5.1, boxstyle="round,pad=0.03,rounding_size=0.04",
                                  facecolor="#f0fdf4", edgecolor="#86efac", linewidth=1.5)
    ax.add_patch(outer)
    ax.text(5.0, 5.05, "Tier 1: ASHA Survey & Weighted SHAP Risk Engine", ha="center", va="top", fontsize=13, fontweight="bold", color="#166534")

    # Inputs Block
    create_box(ax, 0.5, 0.5, 2.8, 4.1,
               "• Full Name, Age, Gender, Mobile\n• HbA1c Level (weight: 25%)\n• Diabetes Duration (weight: 20%)\n• Blood Pressure Systolic (15%)\n• Cholesterol Level (10%)\n• Pregnancy & Tobacco (10%)\n• 5 Fixed Symptom Checkboxes (15%)\n• Custom Textarea Symptoms (5%)",
               "1. Clinical Survey Inputs", C_GREEN, "#ffffff", "#86efac", fontsize=8.5, title_fontsize=10)

    # Engine Block
    create_box(ax, 3.7, 1.8, 2.8, 2.8,
               "Formula:\nScore = Σ (Factor_i × Weight_i)\n\n• Baseline Log-Odds: 10 pts\n• High HbA1c (>8.0): +25 pts\n• Long Diabetes (>10y): +20 pts\n• Floaters/Dark Spots: +12 pts\n• Tobacco + BP (>140): +15 pts\n\nGenerates SHAP Waterfall Contributions",
               "2. Explainable SHAP Scoring", C_VIOLET, "#ffffff", "#c084fc", fontsize=8, title_fontsize=9.5)

    # Decision Block
    create_box(ax, 6.9, 3.0, 2.6, 1.6, "Score < 30%\nRegular annual checkup\nNo hospital visit needed", "Low Risk (Green)", C_GREEN, "#dcfce7", "#86efac", fontsize=8.5, title_fontsize=9.5)
    create_box(ax, 6.9, 1.8, 2.6, 1.0, "Score 30 - 60%\nReferred to Hospital", "Moderate Risk", C_AMBER, "#fef3c7", "#fde68a", fontsize=8, title_fontsize=9)
    create_box(ax, 6.9, 0.5, 2.6, 1.1, "Score > 60%\nUrgent DR Screening Needed", "High Risk", C_RED, "#fee2e2", "#fca5a5", fontsize=8, title_fontsize=9)

    draw_arrow(ax, 3.3, 2.6, 3.7, 2.6, "Weights", C_GREEN)
    draw_arrow(ax, 6.5, 3.6, 6.9, 3.8, "<30", C_GREEN)
    draw_arrow(ax, 6.5, 3.0, 6.9, 2.3, "30-60", C_AMBER)
    draw_arrow(ax, 6.5, 2.4, 6.9, 1.1, ">60", C_RED)

    path = os.path.join(DIAGRAMS_DIR, "diagram_3_asha.png")
    plt.tight_layout()
    plt.savefig(path, bbox_inches="tight", dpi=300)
    plt.close()
    return path

# -------------------------------------------------------------
# DIAGRAM 4: TIER 2 NURSE FUNDUS IMAGING & GRAD-CAM
# -------------------------------------------------------------
def gen_diagram_4():
    fig, ax = plt.subplots(figsize=(10, 5.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5.5)
    ax.axis("off")
    fig.patch.set_facecolor("#ffffff")

    outer = patches.FancyBboxPatch((0.2, 0.2), 9.6, 5.1, boxstyle="round,pad=0.03,rounding_size=0.04",
                                  facecolor="#eff6ff", edgecolor="#93c5fd", linewidth=1.5)
    ax.add_patch(outer)
    ax.text(5.0, 5.05, "Tier 2: Nurse Hospital Imaging, AI DR % & Grad-CAM Pipeline", ha="center", va="top", fontsize=13, fontweight="bold", color="#1e40af")

    create_box(ax, 0.5, 1.0, 2.0, 3.5, "1. Patient Arrival\n• Select from queue\n• Review ASHA data\n\n2. Fundus Camera\n• Capture ocular scan\n• Preset / File Upload\n• High-res PNG/JPG", "Ocular Imaging", C_BLUE, "#ffffff", "#93c5fd", fontsize=8.5, title_fontsize=9.5)
    create_box(ax, 2.9, 1.0, 2.0, 3.5, "• Resizing (512x512)\n• Contrast Enhancement\n• CLAHE Filtering\n• Vascular segmentation\n• Optic disc localization", "Image Preprocessing", C_PURPLE, "#faf5ff", "#c084fc", fontsize=8.5, title_fontsize=9.5)
    create_box(ax, 5.3, 1.0, 2.0, 3.5, "• Microaneurysms detection\n• Hemorrhages count\n• Hard/Soft Exudates\n• Neovascularization\n\nCalculates DR % (0-100%)", "AI Feature Extraction", C_VIOLET, "#ffffff", "#c084fc", fontsize=8.5, title_fontsize=9.5)
    create_box(ax, 7.7, 1.0, 2.0, 3.5, "• Gradient-weighted Class\n  Activation Mapping\n• Highlights suspicious\n  retinal lesions\n• Color-mapped overlay\n• Packaged to Doctor", "Grad-CAM Saliency", C_RED, "#fef2f2", "#fca5a5", fontsize=8.5, title_fontsize=9.5)

    draw_arrow(ax, 2.5, 2.7, 2.9, 2.7, "", C_BLUE)
    draw_arrow(ax, 4.9, 2.7, 5.3, 2.7, "", C_PURPLE)
    draw_arrow(ax, 7.3, 2.7, 7.7, 2.7, "", C_VIOLET)

    path = os.path.join(DIAGRAMS_DIR, "diagram_4_nurse.png")
    plt.tight_layout()
    plt.savefig(path, bbox_inches="tight", dpi=300)
    plt.close()
    return path

# -------------------------------------------------------------
# DIAGRAM 5: TIER 3 DOCTOR SPECIALIST AUDIT & NOTIFICATION
# -------------------------------------------------------------
def gen_diagram_5():
    fig, ax = plt.subplots(figsize=(10, 5.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5.5)
    ax.axis("off")
    fig.patch.set_facecolor("#ffffff")

    outer = patches.FancyBboxPatch((0.2, 0.2), 9.6, 5.1, boxstyle="round,pad=0.03,rounding_size=0.04",
                                  facecolor="#faf5ff", edgecolor="#d8b4fe", linewidth=1.5)
    ax.add_patch(outer)
    ax.text(5.0, 5.05, "Tier 3: Doctor Specialist Governance, Editing & Dispatch", ha="center", va="top", fontsize=13, fontweight="bold", color=C_PURPLE_DARK)

    create_box(ax, 0.5, 1.0, 2.6, 3.5, "• Patient Demographics\n• ASHA Risk Factors & SHAP\n• Nurse Fundus Image Scan\n• Calculated DR Severity %\n• Grad-CAM Heatmap Overlay", "1. Comprehensive Dossier", C_PURPLE, "#ffffff", "#c084fc", fontsize=8.5, title_fontsize=9.5)
    create_box(ax, 3.7, 1.0, 2.6, 3.5, "• Edit Clinical Diagnosis\n• Prescribe eye drops / meds\n• Add special doctor notes\n• Set follow-up appointment\n• Update Health Status\n  (Active, Under Care, Stable)", "2. Interactive Report Editor", C_VIOLET, "#ffffff", "#c084fc", fontsize=8.5, title_fontsize=9.5)
    create_box(ax, 6.9, 1.0, 2.6, 3.5, "• Instant WhatsApp Dispatch\n  (Direct wa.me link)\n• SMS Text Alert with link\n• Download Official PDF\n  clinical summary for record", "3. Multi-Channel Dispatch", C_GREEN, "#f0fdf4", "#86efac", fontsize=8.5, title_fontsize=9.5)

    draw_arrow(ax, 3.1, 2.7, 3.7, 2.7, "Specialist Review", C_PURPLE)
    draw_arrow(ax, 6.3, 2.7, 6.9, 2.7, "Approved & Signed", C_VIOLET)

    path = os.path.join(DIAGRAMS_DIR, "diagram_5_doctor.png")
    plt.tight_layout()
    plt.savefig(path, bbox_inches="tight", dpi=300)
    plt.close()
    return path

# -------------------------------------------------------------
# DIAGRAM 6: DUAL-STAGE EXPLAINABLE AI (XAI)
# -------------------------------------------------------------
def gen_diagram_6():
    fig, ax = plt.subplots(figsize=(10, 5.5), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5.5)
    ax.axis("off")
    fig.patch.set_facecolor("#ffffff")

    outer = patches.FancyBboxPatch((0.2, 0.2), 9.6, 5.1, boxstyle="round,pad=0.03,rounding_size=0.04",
                                  facecolor="#ffffff", edgecolor="#c084fc", linewidth=1.5)
    ax.add_patch(outer)
    ax.text(5.0, 5.05, "VisionXAI: Dual-Stage Explainability Paradigm", ha="center", va="top", fontsize=13, fontweight="bold", color=C_PURPLE_DARK)

    create_box(ax, 0.5, 1.2, 4.2, 3.3,
               "• Method: Shapley Additive Explanations (SHAP)\n• Data Modality: Tabular Risk & Clinical Symptoms\n• Output: Bar graph of positive & negative factor weights\n• Clinical Purpose: Transparent screening justification\n  so ASHA worker can explain referral to patient",
               "Stage 1: Tabular Clinical SHAP (ASHA Tier)", C_GREEN, "#f0fdf4", "#86efac", fontsize=8.5, title_fontsize=10)

    create_box(ax, 5.3, 1.2, 4.2, 3.3,
               "• Method: Gradient-weighted Class Activation Mapping\n• Data Modality: 2D Retinal Fundus High-Res Scans\n• Output: Heatmap highlighting microaneurysms & exudates\n• Clinical Purpose: Visual verification for ophthalmologist\n  to confirm AI rationale before finalizing diagnosis",
               "Stage 2: Visual Grad-CAM (Hospital Tier)", C_PURPLE, "#faf5ff", "#c084fc", fontsize=8.5, title_fontsize=10)

    create_box(ax, 2.5, 0.3, 5.0, 0.7, "Human-in-the-Loop Principle: AI assists, specialist verifies and controls final decision", "Core Clinical Safety Philosophy", C_AMBER, "#fffbeb", "#fde68a", fontsize=8, title_fontsize=8.5)

    path = os.path.join(DIAGRAMS_DIR, "diagram_6_xai.png")
    plt.tight_layout()
    plt.savefig(path, bbox_inches="tight", dpi=300)
    plt.close()
    return path

# Generate all diagrams
d1 = gen_diagram_1()
d2 = gen_diagram_2()
d3 = gen_diagram_3()
d4 = gen_diagram_4()
d5 = gen_diagram_5()
d6 = gen_diagram_6()

print("All 6 diagrams generated successfully!")
