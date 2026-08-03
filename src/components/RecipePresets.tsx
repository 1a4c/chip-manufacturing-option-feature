import React from 'react';
import { Sliders, CheckCircle, Zap, Shield, Play } from 'lucide-react';
import { TelemetryData } from '../types';

interface RecipePresetsProps {
  telemetry: TelemetryData;
  setTelemetry: React.Dispatch<React.SetStateAction<TelemetryData>>;
  language: 'zh-TW' | 'en';
}

export const RecipePresets: React.FC<RecipePresetsProps> = ({
  telemetry,
  setTelemetry,
  language,
}) => {
  const isZh = language === 'zh-TW';

  const recipes = [
    {
      id: 'euv_standard',
      name: isZh
        ? 'EUV 極紫外光光刻高精細圖案化製程'
        : 'EUV High-Precision Lithography Recipe',
      desc: isZh
        ? '適用於 3nm/2nm 晶片端高解析度星形雷射錨定與高 Lux 強度 (950 Lux)。'
        : 'Optimized for 3nm wafer patterning with high star projected laser locks.',
      rpm: 1800,
      tilt: 0.0,
      strapped: true,
      port1Lux: 950,
      port2Lux: 1100,
      port3Lux: 480,
      suppressed: false,
    },
    {
      id: 'cvd_gas_flow',
      name: isZh
        ? 'CVD 化學氣相沉積燃料與管路旋轉製程'
        : 'CVD Fuel Gas Flow & Chamber Tube Rotation',
      desc: isZh
        ? '勻速旋轉 (1200 RPM) 與多氣孔高壓流速模式，防傾倒機制全程啟用。'
        : 'Smooth steady rotation with high pressure fuel line flow rates.',
      rpm: 1200,
      tilt: 1.5,
      strapped: true,
      port1Lux: 750,
      port2Lux: 820,
      port3Lux: 350,
      suppressed: false,
    },
    {
      id: 'anneal_thermal',
      name: isZh
        ? '高溫熱退火晶圓穩定性壓制模式'
        : 'Thermal Annealing Tube Suppression Mode',
      desc: isZh
        ? '啟用 Plate 1 Suppressed，防止過度受熱並進行 Gamma 屬性輯錄。'
        : 'Enables tube plate suppression to protect sensitive wafer die edges.',
      rpm: 600,
      tilt: -0.5,
      strapped: false,
      port1Lux: 400,
      port2Lux: 500,
      port3Lux: 200,
      suppressed: true,
    },
  ];

  const applyRecipe = (recipe: (typeof recipes)[0]) => {
    setTelemetry((prev) => ({
      ...prev,
      tube: {
        ...prev.tube,
        rpm: recipe.rpm,
        tubeTilt: recipe.tilt,
        strappedMode: recipe.strapped,
        rotationActive: true,
      },
      valves: {
        ...prev.valves,
        tubePlateSuppressed: recipe.suppressed,
        triPorts: prev.valves.triPorts.map((p, idx) => {
          let lux = recipe.port1Lux;
          if (idx === 1) lux = recipe.port2Lux;
          if (idx === 2) lux = recipe.port3Lux;
          return { ...p, luxProjected: lux };
        }),
      },
    }));

    alert(
      isZh
        ? `已成功加載並執行製程配方：${recipe.name}`
        : `Applied recipe: ${recipe.name}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center space-x-2">
          <Sliders className="w-6 h-6 text-cyan-400" />
          <h2 className="text-lg font-bold text-slate-100">
            {isZh
              ? '半導體晶圓製程預設配方庫 (Recipe Presets)'
              : 'Semiconductor Recipe Presets'}
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Pre-validated operational parameter matrices for wafer fabrication.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recipes.map((r) => (
          <div
            key={r.id}
            className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="font-bold text-slate-100 text-sm flex items-center justify-between">
                <span>{r.name}</span>
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                {r.desc}
              </p>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 font-mono text-xs text-slate-300 pt-3">
                <div className="flex justify-between">
                  <span>Tube RPM:</span>
                  <span className="text-cyan-400 font-bold">{r.rpm} RPM</span>
                </div>
                <div className="flex justify-between">
                  <span>Strapped Mode [::2]:</span>
                  <span className="text-slate-200">
                    {r.strapped ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Port 1 / Port 2 Lux:</span>
                  <span className="text-blue-400">
                    {r.port1Lux} / {r.port2Lux} Lux
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Plate Suppressed:</span>
                  <span
                    className={
                      r.suppressed ? 'text-rose-400 font-bold' : 'text-emerald-400'
                    }
                  >
                    {r.suppressed ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => applyRecipe(r)}
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center justify-center space-x-2 text-xs shadow-md shadow-cyan-600/20"
            >
              <Play className="w-4 h-4" />
              <span>
                {isZh ? '載入並執行此製程' : 'Load & Execute Recipe'}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
