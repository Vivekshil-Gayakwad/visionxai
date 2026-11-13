# VisionXAI — Real Retinal Fundus Test Images

> **These are REAL clinical retinal fundus photographs, NOT synthetic/generated images.**

## Source

- **Repository**: [Translational Visual Health Laboratory - OCT & Eye Fundus Dataset](https://github.com/Traslational-Visual-Health-Laboratory/OCT-AND-EYE-FUNDUS-DATASET)
- **Resolution**: 1000×1000 pixels (JPEG)
- **Labels**: From `EYE FUNDUS.csv` — DR column maps to clinical diagnosis

## Distribution

| Category | Count | Grade | Description |
|----------|-------|-------|-------------|
| Normal (No DR) | 50 | 0 | Healthy retina, no diabetic retinopathy |
| NPDR | 30 | 2 | Non-Proliferative Diabetic Retinopathy |
| PDR | 20 | 4 | Proliferative Diabetic Retinopathy |
| **Total** | **100** | | |

## Usage

1. Navigate to **Nurse Portal → Fundus Imaging**
2. Upload any image from `normal/` or `dr/` folder
3. The AI engine will classify and generate Grad-CAM heatmap
