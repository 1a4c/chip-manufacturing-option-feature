import React, { useState } from 'react';
import {
  Grid,
  Zap,
  Star,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { TelemetryData, PatternDie } from '../types';

interface PatternMatrixGridProps {
  telemetry: TelemetryData;
  setTelemetry: React.Dispatch<React.SetStateAction<TelemetryData>>;
  language: 'zh-TW' | 'en';
}

export const PatternMatrixGrid: React.FC<PatternMatrixGridProps> = ({
  telemetry,
  setTelemetry,
  language,
}) => {
  const isZh = language === 'zh-TW';
  const { pattern } = telemetry;
  const [selectedDie, setSelectedDie] = useState<PatternDie | null>(
    pattern.dies[0] || null
  );

  // Toggle Star Projector
  const toggleStarProjector = () => {
    setTelemetry((prev) => ({
      ...prev,
      pattern: {
        ...prev.pattern,
        starProjectorActive: !prev.pattern.starProjectorActive,
      },
    }));
  };

  // Toggle Anchored status for selected die
  const toggleDieAnchored = (dieId: string) => {
    setTelemetry((prev) => ({
      ...prev,
      pattern: {
        ...prev.pattern,
        dies: prev.pattern.dies.map((d) =>
          d.id === dieId ? { ...d, anchored: !d.anchored } : d
        ),
      },
    }));
    if (selectedDie && selectedDie.id === dieId) {
      setSelectedDie((prev) => (prev ? { ...prev, anchored: !prev.anchored } : null));
    }
  };

  // Toggle Redeemed Endorsed for isolation zone
  const toggleIsolationZone = (dieId: string) => {
    setTelemetry((prev) => ({
      ...prev,
      pattern: {
        ...prev.pattern,
        dies: prev.pattern.dies.map((d) =>
          d.id === dieId
            ? { ...d, isolationZoneRedeemed: !d.isolationZoneRedeemed }
            : d
        ),
      },
    }));
    if (selectedDie && selectedDie.id === dieId) {
      setSelectedDie((prev) =>
        prev
          ? { ...prev, isolationZoneRedeemed: !prev.isolationZoneRedeemed }
          : null
      );
    }
  };

  // Adjust gamma attribute record clip
  const handleClipChange = (dieId: string, val: number) => {
    setTelemetry((prev) => ({
      ...prev,
      pattern: {
        ...prev.pattern,
        dies: prev.pattern.dies.map((d) =>
          d.id === dieId ? { ...d, gammaAttributeClip: val } : d
        ),
      },
    }));
    if (selectedDie && selectedDie.id === dieId) {
      setSelectedDie((prev) => (prev ? { ...prev, gammaAttributeClip: val } : null));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Star className="w-6 h-6 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">
              {isZh
                ? '星形光罩錨定與圖案陣列 (Star_projected_anchored)'
                : 'Star Projected Anchored Pattern Matrix'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            pattern_matrice[gamma_set(adjacent_path_gamma_attribute.record_clip(env_beta_section_izone.redeemed_endorsed()))]
          </p>
        </div>

        <div className="flex items-center space-x-4 font-mono">
          <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">
              {isZh ? '圖案良率估算' : 'Overall Yield'}
            </div>
            <div className="text-xl font-bold text-emerald-400">
              {pattern.overallYieldPct.toFixed(1)}%
            </div>
          </div>

          <button
            onClick={toggleStarProjector}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition ${
              pattern.starProjectorActive
                ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Star Laser Projector: {pattern.starProjectorActive ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Wafer Dies Grid Visualizer */}
        <div className="lg:col-span-8 bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Grid className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-slate-100 text-sm">
                {isZh
                  ? '晶圓裸晶陣列檢測 (Wafer Die Matrix)'
                  : 'Wafer Die Matrix Map (8x8)'}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Active Dies: {pattern.dies.length}
            </span>
          </div>

          {/* Interactive Wafer Grid */}
          <div className="flex items-center justify-center py-6 bg-slate-950 rounded-lg border border-slate-800">
            <div className="grid grid-cols-8 gap-2 max-w-md w-full p-4 bg-slate-900/60 rounded-full border border-cyan-900/40 shadow-inner">
              {pattern.dies.map((die) => {
                const isSelected = selectedDie?.id === die.id;
                const isDefective = die.defectScore > 10;

                return (
                  <button
                    key={die.id}
                    onClick={() => setSelectedDie(die)}
                    className={`aspect-square rounded-md p-1 font-mono text-[9px] flex flex-col items-center justify-center transition-all relative ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 bg-cyan-900/50 text-cyan-200'
                        : isDefective
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                        : die.anchored
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        : 'bg-amber-950/40 text-amber-300 border border-amber-800'
                    }`}
                  >
                    <span>
                      D{die.row},{die.col}
                    </span>
                    {die.anchored && (
                      <Star className="w-2.5 h-2.5 text-cyan-400 mt-0.5 fill-cyan-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center space-x-6 text-xs font-mono text-slate-400 pt-2">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></span>
              <span>Anchored Normal</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-rose-950 border border-rose-800"></span>
              <span>Defect Risk</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-cyan-900 border border-cyan-400"></span>
              <span>Selected</span>
            </div>
          </div>
        </div>

        {/* Selected Die Inspector & Gamma Record Clip Panel */}
        <div className="lg:col-span-4 bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <Info className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              {isZh ? '裸晶詳細參數 (Die Inspector)' : 'Die Attribute Inspector'}
            </h3>
          </div>

          {selectedDie ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-cyan-300 text-sm">
                    {selectedDie.id.toUpperCase()}
                  </div>
                  <div className="text-slate-400">
                    Row: {selectedDie.row} | Col: {selectedDie.col}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Defect Score</div>
                  <div
                    className={
                      selectedDie.defectScore > 10
                        ? 'text-rose-400 font-bold'
                        : 'text-emerald-400 font-bold'
                    }
                  >
                    {selectedDie.defectScore}%
                  </div>
                </div>
              </div>

              {/* Star Projected Anchored Toggle */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200">
                    Star Projected Anchored
                  </span>
                  <button
                    onClick={() => toggleDieAnchored(selectedDie.id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                      selectedDie.anchored
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {selectedDie.anchored ? 'ANCHORED' : 'UNANCHORED'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isZh
                    ? '星形投影雷射中心位移鎖定'
                    : 'Laser star beam precision lock state'}
                </p>
              </div>

              {/* Gamma Attribute Record Clip Slider */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-200">
                  <span>adjacent_path_gamma_attribute</span>
                  <span className="text-cyan-400 font-bold">
                    {selectedDie.gammaAttributeClip}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  record_clip parameter
                </div>
                <input
                  type="range"
                  min={0.01}
                  max={1.0}
                  step={0.01}
                  value={selectedDie.gammaAttributeClip}
                  onChange={(e) =>
                    handleClipChange(selectedDie.id, Number(e.target.value))
                  }
                  className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg"
                />
              </div>

              {/* Isolation Zone Redeemed Endorsed Toggle */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200">
                    env_beta_section_izone
                  </span>
                  <button
                    onClick={() => toggleIsolationZone(selectedDie.id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                      selectedDie.isolationZoneRedeemed
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {selectedDie.isolationZoneRedeemed
                      ? 'REDEEMED'
                      : 'PENDING'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isZh
                    ? '環境 Beta 區隔離帶驗證核可狀態'
                    : 'Isolation zone endorsement validation'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              Click any die on the wafer grid to inspect parameters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
