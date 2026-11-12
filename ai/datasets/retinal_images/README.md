# VisionXAI Clinical Retinal Test Dataset (100 Cases)

A curated, balanced set of 100 high-resolution (512×512) retinal fundus photographs created specifically for verifying, benchmarking, and demonstrating the **VisionXAI Multimodal Diabetic Retinopathy Engine**, Grad-CAM visual attention mapping, and ETDRS classification.

---

## Dataset Structure

```text
ai/datasets/retinal_images/
├── normal/                  # 50 Normal / Healthy Retinal Images (Grade 0)
│   ├── normal_001.jpg
│   ├── ...
│   └── normal_050.jpg
├── dr/                      # 50 Diabetic Retinopathy (DR) Retinal Images (Grades 1 to 4)
│   ├── dr_001.jpg           # Cases 01–15: Mild NPDR (Grade 1 - Microaneurysms)
│   ├── ...                  # Cases 16–30: Moderate NPDR (Grade 2 - Hemorrhages + Hard Exudates)
│   ├── ...                  # Cases 31–40: Severe NPDR (Grade 3 - 4-Quadrant Bleeds + Cotton Wool Spots)
│   └── dr_050.jpg           # Cases 41–50: Proliferative DR (Grade 4 - Neovascularization)
├── metadata.csv             # Full clinical annotations (Grade, Severity, ICDR Level, Findings)
└── README.md                # Documentation & testing instructions
```

---

## Clinical Breakdown

| Category | Cases | ETDRS Grade | Clinical Severity | Typical Pathological Features |
| :--- | :---: | :---: | :--- | :--- |
| **Normal** | 50 | Grade 0 | No DR | Intact retinal vasculature, healthy optic disc, clear macula, zero lesions. |
| **Mild DR** | 15 | Grade 1 | Mild NPDR | Isolated microaneurysms, early microvascular capillary changes. |
| **Moderate DR** | 15 | Grade 2 | Moderate NPDR | Multiple blot hemorrhages, hard lipid exudates around macula. |
| **Severe DR** | 10 | Grade 3 | Severe NPDR | Dense intraretinal hemorrhages in all 4 quadrants, cotton wool spots. |
| **Proliferative DR** | 10 | Grade 4 | PDR | Neovascularization fronds, pre-retinal hemorrhages, high sight threat. |

---

## How to Test

### 1. In the Web Application (Nurse Portal)
* Log in as **Nurse** (`nurse.rekha@visionxai.org` / `Nurse2026!`).
* Go to **Tier 2: Retinal Fundus Imaging**.
* Click **Upload Retinal Fundus Photograph** and select any file from `ai/datasets/retinal_images/normal/` or `ai/datasets/retinal_images/dr/` (or use the built-in Quick Test Gallery).
* Click **Run Multimodal AI Analysis**.
* Notice how:
  * **Normal images** receive **Grade 0 (No DR)** with low risk score ($<15\%$).
  * **DR images** show detected microaneurysms, hemorrhages, and hard exudates highlighted on the **Grad-CAM attention map**.

### 2. Via FastAPI Backend API
```bash
curl -X POST "http://localhost:8000/api/predict/dr" \
  -H "accept: application/json" \
  -F "file=@ai/datasets/retinal_images/dr/dr_005.jpg"
```

### 3. Via Python Automated Script
```python
import requests

with open("ai/datasets/retinal_images/normal/normal_001.jpg", "rb") as f:
    res = requests.post("http://localhost:8000/api/predict/dr", files={"file": f})
    print(res.json())
```
