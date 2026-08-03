import React from 'react';
import {
  Cpu,
  RotateCw,
  Activity,
  Zap,
  Globe,
  Bot,
  Sliders,
  ShieldCheck,
  Radio,
} from 'lucide-react';

interface HeaderProps {
  language: 'zh-TW' | 'en';
  setLanguage: (lang: 'zh-TW' | 'en') => void;
  activeTab: 'visualizer' | 'valves' | 'pattern' | 'queue' | 'recipes';
  setActiveTab: (
    tab: 'visualizer' | 'valves' | 'pattern' | 'queue' | 'recipes'
  ) => void;
  onOpenAiDiagnostics: () => void;
  rotationActive: boolean;
  overallYieldPct: number;
  healthScore: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  activeTab,
  setActiveTab,
  onOpenAiDiagnostics,
  rotationActive,
  overallYieldPct,
  healthScore,
}) => {
  const isZh = language === 'zh-TW';

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-600 to-blue-500 rounded-lg shadow-md shadow-cyan-500/20 text-white">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg tracking-wide text-white">
                  {isZh
                    ? '晶片製造管路旋轉與極紫外光照系統'
                    : 'Wafer Chamber & Pattern Matrix OS'}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-cyan-950 text-cyan-300 border border-cyan-800">
                  <Radio className="w-3 h-3 mr-1 text-cyan-400 animate-ping" />
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">
                Gamma_settle_tube • Tri_ports_lux • Star_projected_anchored
              </p>
            </div>
          </div>

          {/* Machine Quick Stats */}
          <div className="hidden md:flex items-center space-x-6 text-xs font-mono border-x border-slate-800 px-6 py-2">
            <div>
              <div className="text-slate-400">
                {isZh ? '管路旋轉狀態' : 'Tube Rotation'}
              </div>
              <div className="font-semibold flex items-center text-slate-200">
                <RotateCw
                  className={`w-3.5 h-3.5 mr-1 ${
                    rotationActive
                      ? 'animate-spin text-emerald-400'
                      : 'text-rose-400'
                  }`}
                />
                {rotationActive
                  ? isZh
                    ? '運轉中 (Rotate)'
                    : 'Active'
                  : isZh
                  ? '已停止 (Paused)'
                  : 'Idle'}
              </div>
            </div>

            <div>
              <div className="text-slate-400">
                {isZh ? '氣閥健康度' : 'Valve Health'}
              </div>
              <div className="font-semibold text-cyan-400 flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                {healthScore}%
              </div>
            </div>

            <div>
              <div className="text-slate-400">
                {isZh ? '晶圓良率' : 'Wafer Yield'}
              </div>
              <div className="font-semibold text-emerald-400 flex items-center">
                <Zap className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                {overallYieldPct.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {/* AI Diagnostics Trigger */}
            <button
              onClick={onOpenAiDiagnostics}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-500/20 transition-all border border-indigo-400/30 active:scale-95"
            >
              <Bot className="w-4 h-4 text-cyan-200" />
              <span>{isZh ? 'AI 設備診斷分析' : 'AI Diagnostic'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(isZh ? 'en' : 'zh-TW')}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{isZh ? '繁中' : 'EN'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-header Tabs */}
      <div className="bg-slate-950 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex space-x-1 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'visualizer'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isZh ? '腔體與三光束動態 (Visualizer)' : '3D Chamber Tube'}</span>
          </button>

          <button
            onClick={() => setActiveTab('valves')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'valves'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isZh ? '三氣孔 Lux 與閥門 health' : 'Tri-Ports & Fuel Valves'}</span>
          </button>

          <button
            onClick={() => setActiveTab('pattern')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'pattern'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isZh ? '星形投影與晶圓陣列 (Pattern Matrix)' : 'Star Pattern Matrix'}</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'queue'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isZh ? 'Beta 透鏡擷取事件佇列 (Limb Queue)' : 'Beta Lens Queue'}</span>
          </button>

          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'recipes'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isZh ? '製程配方預設 (Recipe Presets)' : 'Recipe Presets'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
