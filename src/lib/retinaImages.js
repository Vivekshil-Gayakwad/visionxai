// High-fidelity Retinal Fundus Image Presets and Canvas Visualizers
// Representing standard clinical Diabetic Retinopathy stages with Ground Truth lesions

export const RETINA_PRESETS = [
  {
    id: 'preset_normal',
    name: 'Retina Scan A - Healthy / Normal',
    stage: 'No DR (Stage 0)',
    riskLevel: 'Low',
    drProbability: 4.2,
    description: 'Clear optical disc, normal vascular arcade, healthy fovea with no detectable microaneurysms or hemorrhages.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    lesions: [],
    xaiRegions: [
      { x: 35, y: 50, radius: 25, intensity: 0.1, label: 'Normal Optic Disc' },
      { x: 65, y: 48, radius: 20, intensity: 0.05, label: 'Healthy Macula' }
    ]
  },
  {
    id: 'preset_mild',
    name: 'Retina Scan B - Mild NPDR',
    stage: 'Mild NPDR (Stage 1)',
    riskLevel: 'Moderate',
    drProbability: 38.6,
    description: 'Isolated microaneurysms detected in temporal macular arcade with minor capillary outpouching.',
    image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
    lesions: [
      { type: 'Microaneurysm', x: 62, y: 44, size: 8, severity: 'Mild' },
      { type: 'Microaneurysm', x: 55, y: 60, size: 6, severity: 'Mild' }
    ],
    xaiRegions: [
      { x: 62, y: 44, radius: 35, intensity: 0.65, label: 'Microaneurysm Focus' },
      { x: 55, y: 60, radius: 30, intensity: 0.5, label: 'Capillary Dilatation' }
    ]
  },
  {
    id: 'preset_moderate',
    name: 'Retina Scan C - Moderate NPDR',
    stage: 'Moderate NPDR (Stage 2)',
    riskLevel: 'Moderate',
    drProbability: 64.8,
    description: 'Multiple microaneurysms, dot-and-blot hemorrhages, and localized hard lipid exudates near macula.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    lesions: [
      { type: 'Dot Hemorrhage', x: 58, y: 40, size: 14, severity: 'Moderate' },
      { type: 'Hard Exudate', x: 68, y: 52, size: 16, severity: 'Moderate' },
      { type: 'Microaneurysm', x: 42, y: 65, size: 10, severity: 'Moderate' }
    ],
    xaiRegions: [
      { x: 58, y: 40, radius: 45, intensity: 0.85, label: 'Intraretinal Hemorrhage' },
      { x: 68, y: 52, radius: 40, intensity: 0.78, label: 'Lipid Exudation Zone' },
      { x: 42, y: 65, radius: 35, intensity: 0.6, label: 'Microvascular Lesion' }
    ]
  },
  {
    id: 'preset_severe',
    name: 'Retina Scan D - Severe NPDR',
    stage: 'Severe NPDR (Stage 3)',
    riskLevel: 'High',
    drProbability: 86.4,
    description: 'Extensive 4-quadrant intraretinal hemorrhages, venous beading, cotton wool spots, and high risk of progression.',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    lesions: [
      { type: 'Blot Hemorrhage', x: 48, y: 32, size: 22, severity: 'Severe' },
      { type: 'Cotton Wool Spot', x: 70, y: 38, size: 20, severity: 'Severe' },
      { type: 'Venous Beading', x: 38, y: 58, size: 18, severity: 'Severe' },
      { type: 'Hard Exudate Cluster', x: 62, y: 64, size: 24, severity: 'Severe' }
    ],
    xaiRegions: [
      { x: 48, y: 32, radius: 55, intensity: 0.95, label: 'Extensive Retinal Bleed' },
      { x: 70, y: 38, radius: 48, intensity: 0.92, label: 'Ischemic Nerve Fiber Layer' },
      { x: 62, y: 64, radius: 50, intensity: 0.88, label: 'Macular Exudate Ring' }
    ]
  },
  {
    id: 'preset_pdr',
    name: 'Retina Scan E - Proliferative DR (PDR)',
    stage: 'Proliferative DR (Stage 4)',
    riskLevel: 'High',
    drProbability: 95.8,
    description: 'Pathological neovascularization of disc (NVD), preretinal vitreous hemorrhage, immediate laser photocoagulation needed.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    lesions: [
      { type: 'Neovascularization (NVD)', x: 36, y: 46, size: 28, severity: 'Critical' },
      { type: 'Vitreous Hemorrhage', x: 54, y: 56, size: 30, severity: 'Critical' },
      { type: 'Fibrovascular Proliferation', x: 72, y: 42, size: 22, severity: 'Critical' }
    ],
    xaiRegions: [
      { x: 36, y: 46, radius: 65, intensity: 0.98, label: 'Active Neovascularization' },
      { x: 54, y: 56, radius: 60, intensity: 0.96, label: 'Vitreoretinal Traction bleed' },
      { x: 72, y: 42, radius: 45, intensity: 0.89, label: 'Proliferative Membrane' }
    ]
  }
];

export const DEFAULT_RETINA_IMAGE = RETINA_PRESETS[2]; // Moderate NPDR default for demonstration
