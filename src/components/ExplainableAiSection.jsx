import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  BrainCircuit, 
  Sparkles, 
  Eye, 
  ShieldCheck, 
  CheckCircle, 
  Sliders, 
  AlertTriangle,
  Cpu
} from 'lucide-react';
import { RETINA_PRESETS } from '../lib/retinaImages';
import { renderGradCamToCanvas } from '../lib/aiEngine';

export function ExplainableAiSection() {
  const { t } = useLanguage();
  const [selectedCase, setSelectedCase] = useState(RETINA_PRESETS[2]); // Moderate default
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.7);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [activeTab, setActiveTab] = useState('gradcam'); // 'gradcam' | 'shap' | 'comparison'

  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && selectedCase) {
      renderGradCamToCanvas(canvasRef.current, selectedCase.xaiRegions, {
        opacity: heatmapOpacity,
        showBoxes: showBoundingBoxes
      });
    }
  }, [selectedCase, heatmapOpacity, showBoundingBoxes]);

  return (
    <section className="relative py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#073B4C] border border-[#0F5E78] dark:border-[#146E8C] text-xs font-bold text-white shadow-sm">
          <BrainCircuit className="w-3.5 h-3.5 text-[#FFD166]" />
          <span>{t('xai')}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white">
          How Explainable AI Works
        </h2>
        <p className="text-[#CFE2E8] text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
          Standard AI operates as an uninterpretable "black box". VisionXAI uses <strong>Grad-CAM saliency heatmaps</strong> and <strong>SHAP feature attribution</strong> so clinicians understand exactly <em>why</em> a risk is predicted.
        </p>
      </div>

      {/* Feature Navigation Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        <button
          onClick={() => setActiveTab('gradcam')}
          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'gradcam'
              ? 'bg-[#073B4C] text-[#FFD166] shadow-sm border border-[#FFD166]'
              : 'bg-[#073B4C]/70 border border-[#0F5E78] dark:border-[#146E8C] text-[#CFE2E8] hover:text-white hover:bg-[#073B4C]'
          }`}
        >
          <Eye className="w-4 h-4 text-[#FFD166]" />
          <span>Grad-CAM Retinal Heatmaps</span>
        </button>

        <button
          onClick={() => setActiveTab('shap')}
          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'shap'
              ? 'bg-[#073B4C] text-[#FFD166] shadow-sm border border-[#FFD166]'
              : 'bg-[#073B4C]/70 border border-[#0F5E78] dark:border-[#146E8C] text-[#CFE2E8] hover:text-white hover:bg-[#073B4C]'
          }`}
        >
          <Sliders className="w-4 h-4 text-[#FFD166]" />
          <span>SHAP Risk Factor Weights</span>
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'comparison'
              ? 'bg-[#073B4C] text-[#FFD166] shadow-sm border border-[#FFD166]'
              : 'bg-[#073B4C]/70 border border-[#0F5E78] dark:border-[#146E8C] text-[#CFE2E8] hover:text-white hover:bg-[#073B4C]'
          }`}
        >
          <Cpu className="w-4 h-4 text-[#FFD166]" />
          <span>Black-Box vs XAI</span>
        </button>
      </div>

      {/* 1. Interactive Grad-CAM Visualizer */}
      {activeTab === 'gradcam' && (
        <div className="bg-[#073B4C] border border-[#0F5E78] dark:border-[#146E8C] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in text-white">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#0F5E78] pb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Interactive Retinal Grad-CAM Saliency Visualizer</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FFD166] text-[#073B4C] font-bold">
                  Live Activation
                </span>
              </h3>
              <p className="text-xs text-[#CFE2E8] mt-1">
                Visualizing pixel activations mapped directly to microaneurysms and intraretinal hemorrhages.
              </p>
            </div>

            {/* Case Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {RETINA_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedCase(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCase.id === preset.id
                      ? 'bg-[#FFD166] text-[#073B4C] shadow-sm'
                      : 'bg-[#0A485C] text-white hover:bg-[#0E5B74] border border-[#0F5E78]'
                  }`}
                >
                  {preset.stage.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Heatmap Canvas Container */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden border border-[#0F5E78] bg-black shadow-md group">
                
                <img
                  src={selectedCase.image}
                  alt={selectedCase.name}
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                />

                <canvas
                  ref={canvasRef}
                  width={500}
                  height={500}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-150"
                />

                <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-[#073B4C] border border-[#0F5E78] text-[11px] font-mono font-bold text-white flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#FFD166] animate-pulse" />
                  <span>{selectedCase.stage}</span>
                </div>

                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-[#073B4C] border border-[#0F5E78] text-[11px] font-mono font-bold text-[#FFD166] shadow-sm">
                  AI DR Prob: {selectedCase.drProbability}%
                </div>

              </div>

              {/* Controls Bar */}
              <div className="w-full max-w-lg mt-4 p-4 rounded-2xl bg-[#073B4C] text-white border border-[#0F5E78] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-semibold flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#FFD166]" />
                    {t('heatmapOpacity')}:
                  </span>
                  <span className="text-[#FFD166] font-mono font-bold">{Math.round(heatmapOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={heatmapOpacity}
                  onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                  className="w-full accent-[#FFD166] cursor-pointer"
                />

                <div className="flex items-center justify-between pt-1 border-t border-[#0F5E78] text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-white select-none">
                    <input
                      type="checkbox"
                      checked={showBoundingBoxes}
                      onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                      className="rounded accent-[#FFD166] w-4 h-4"
                    />
                    <span>{t('highlightBoxes')}</span>
                  </label>
                  <span className="text-[11px] text-[#FFD166] font-mono">Grad-CAM Activation Map</span>
                </div>
              </div>

            </div>

            {/* Right Diagnostic Breakdown */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="p-4 rounded-2xl bg-[#073B4C] text-white border border-[#0F5E78] space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-[#FFD166] font-bold">Clinical Case Profile</p>
                <h4 className="text-base font-bold text-white">{selectedCase.name}</h4>
                <p className="text-xs text-[#CFE2E8] leading-relaxed">{selectedCase.description}</p>
              </div>

              {/* Detected Lesions */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Detected Retinal Lesions</span>
                  <span className="text-[#FFD166] text-[11px] font-mono">{selectedCase.lesions.length} Targets</span>
                </p>

                {selectedCase.lesions.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedCase.lesions.map((lesion, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#052631] text-white border border-[#0F5E78] flex items-center justify-between text-xs shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FFD166] animate-pulse" />
                          <span className="font-semibold text-white">{lesion.type}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[#CFE2E8] text-[11px] font-mono">({lesion.x}%, {lesion.y}%)</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            lesion.severity === 'Severe' || lesion.severity === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800' : 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800'
                          }`}>
                            {lesion.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#052631] border border-[#0F5E78] text-[#CFE2E8] text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#FFD166]" />
                    <span>No pathologically significant lesions detected.</span>
                  </div>
                )}
              </div>

              {/* Colorbar explanation - Retro Semaphore Solid Segmented Bar */}
              <div className="p-3.5 rounded-2xl bg-[#052631] border border-[#0F5E78] space-y-1.5 text-white">
                <p className="text-xs font-bold text-white">Grad-CAM Intensity Scale:</p>
                <div className="flex h-2.5 rounded-full overflow-hidden border border-[#0F5E78]">
                  <div className="w-1/4 bg-[#073B4C]" title="Low Saliency" />
                  <div className="w-1/4 bg-[#0B6B3A]" title="Mild Activation" />
                  <div className="w-1/4 bg-[#FFD166]" title="Moderate Saliency" />
                  <div className="w-1/4 bg-[#EF476F]" title="High Focus Lesion" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#CFE2E8] font-mono">
                  <span>Normal Retina (0.0)</span>
                  <span>Model Focus / Lesions (1.0)</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 2. SHAP Feature Attribution Tab */}
      {activeTab === 'shap' && (
        <div className="bg-[#073B4C] border border-[#0F5E78] dark:border-[#146E8C] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in text-white">
          <div className="border-b border-[#0F5E78] pb-4">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>SHAP for Community Risk Factors</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FFD166] text-[#073B4C] font-bold">
                Risk Attribution
              </span>
            </h3>
            <p className="text-xs text-[#CFE2E8] mt-1">
              How patient-reported factors and clinical vitals are mathematically decomposed into risk-increasing and protective weights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Risk Factors */}
            <div className="p-5 rounded-2xl bg-[#052631] border border-[#0F5E78] space-y-3">
              <p className="text-xs uppercase tracking-wider text-[#EF476F] font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#EF476F]" />
                Positive Risk Contributors (Elevates Risk)
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#073B4C] border border-[#0F5E78] space-y-1 shadow-sm">
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Hyperglycemia (HbA1c &gt; 8.5%)</span>
                    <span className="text-[#EF476F] font-mono font-bold">+24% Risk</span>
                  </div>
                  <p className="text-[11px] text-[#CFE2E8]">Glycation damage impairs retinal endothelial barrier integrity.</p>
                </div>

                <div className="p-3 rounded-xl bg-[#073B4C] border border-[#0F5E78] space-y-1 shadow-sm">
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Long Duration of Diabetes (&gt; 10 Years)</span>
                    <span className="text-[#EF476F] font-mono font-bold">+18% Risk</span>
                  </div>
                  <p className="text-[11px] text-[#CFE2E8]">Cumulative metabolic insult correlates with capillary drop-out.</p>
                </div>

                <div className="p-3 rounded-xl bg-[#073B4C] border border-[#0F5E78] space-y-1 shadow-sm">
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Hypertension (BP &gt; 140/90)</span>
                    <span className="text-[#EF476F] font-mono font-bold">+14% Risk</span>
                  </div>
                  <p className="text-[11px] text-[#CFE2E8]">Hydrostatic shear stress accelerates microaneurysm outpouching.</p>
                </div>
              </div>
            </div>

            {/* Protective Factors */}
            <div className="p-5 rounded-2xl bg-[#052631] border border-[#0F5E78] space-y-3">
              <p className="text-xs uppercase tracking-wider text-[#FFD166] font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#0B6B3A]" />
                Protective Factors (Mitigates Risk)
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#073B4C] border border-[#0F5E78] space-y-1 shadow-sm">
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Optimal Glycemic Control (HbA1c &lt; 7.0%)</span>
                    <span className="text-[#0B6B3A] font-mono font-bold">-5% Baseline</span>
                  </div>
                  <p className="text-[11px] text-[#CFE2E8]">Demonstrated to reduce progression in clinical trials.</p>
                </div>

                <div className="p-3 rounded-xl bg-[#073B4C] border border-[#0F5E78] space-y-1 shadow-sm">
                  <div className="flex justify-between font-bold">
                    <span className="text-white">Controlled Blood Pressure (&lt; 120/80 mmHg)</span>
                    <span className="text-[#0B6B3A] font-mono font-bold">-4% Baseline</span>
                  </div>
                  <p className="text-[11px] text-[#CFE2E8]">Prevents microvascular dilation and macular edema extravasation.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. Black-Box vs XAI Tab */}
      {activeTab === 'comparison' && (
        <div className="bg-[#073B4C] border border-[#0F5E78] dark:border-[#146E8C] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in text-white">
          <div className="border-b border-[#0F5E78] pb-4">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Why Explainability is Mandatory in Ophthalmic AI
            </h3>
            <p className="text-xs text-[#CFE2E8] mt-1">
              Comparing opaque algorithms against VisionXAI transparent clinical workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[#052631] border border-[#EF476F]/50 space-y-3">
              <div className="flex items-center gap-2 text-[#EF476F] font-bold">
                <AlertTriangle className="w-4 h-4" />
                <h4>Conventional Black-Box AI</h4>
              </div>
              <ul className="space-y-2 text-xs text-[#CFE2E8]">
                <li className="flex items-start gap-2">
                  <span className="text-[#EF476F] font-bold">✕</span>
                  <span>Outputs only a single number (e.g. "85% DR") with zero spatial localization.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF476F] font-bold">✕</span>
                  <span>Cannot differentiate camera artifacts from true retinal hemorrhages.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF476F] font-bold">✕</span>
                  <span>Specialists cannot verify model reasoning before making clinical decisions.</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-[#052631] border border-[#FFD166]/50 space-y-3">
              <div className="flex items-center gap-2 text-[#FFD166] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <h4>VisionXAI Explainable AI System</h4>
              </div>
              <ul className="space-y-2 text-xs text-[#E0ECEF]">
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD166] font-bold">✓</span>
                  <span>Grad-CAM heatmaps highlight microaneurysms and exudate clusters.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD166] font-bold">✓</span>
                  <span>SHAP values explain exact glycemic, hypertensive, and symptom weights.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD166] font-bold">✓</span>
                  <span>Specialists can confirm, override, or refine findings before notifying patients.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

