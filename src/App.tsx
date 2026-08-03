import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChamberVisualizer } from './components/ChamberVisualizer';
import { TriPortsValveHealth } from './components/TriPortsValveHealth';
import { PatternMatrixGrid } from './components/PatternMatrixGrid';
import { BetaLensEventQueue } from './components/BetaLensEventQueue';
import { RecipePresets } from './components/RecipePresets';
import { AiDiagnosticsModal } from './components/AiDiagnosticsModal';
import { createInitialTelemetry } from './utils/mockTelemetry';
import { TelemetryData } from './types';

export default function App() {
  const [telemetry, setTelemetry] = useState<TelemetryData>(createInitialTelemetry);
  const [language, setLanguage] = useState<'zh-TW' | 'en'>('zh-TW');
  const [activeTab, setActiveTab] = useState<
    'visualizer' | 'valves' | 'pattern' | 'queue' | 'recipes'
  >('visualizer');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Background subtle telemetry simulation ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        if (!prev.tube.rotationActive) return prev;

        // Add subtle natural vibration fluctuation
        const vibNoise = (Math.random() - 0.5) * 0.02;
        const newVib = Math.max(0.05, Math.min(0.5, prev.tube.vibrationLevel + vibNoise));

        return {
          ...prev,
          tube: {
            ...prev.tube,
            vibrationLevel: Number(newVib.toFixed(3)),
          },
          systemOs: {
            ...prev.systemOs,
            uptimeSec: prev.systemOs.uptimeSec + 1,
            cpuLoadPct: Math.floor(15 + Math.random() * 8),
          },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header Navigation Bar */}
      <Header
        language={language}
        setLanguage={setLanguage}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAiDiagnostics={() => setIsAiModalOpen(true)}
        rotationActive={telemetry.tube.rotationActive}
        overallYieldPct={telemetry.pattern.overallYieldPct}
        healthScore={telemetry.valves.fuelHealthScore}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'visualizer' && (
          <ChamberVisualizer
            telemetry={telemetry}
            setTelemetry={setTelemetry}
            language={language}
          />
        )}

        {activeTab === 'valves' && (
          <TriPortsValveHealth
            telemetry={telemetry}
            setTelemetry={setTelemetry}
            language={language}
          />
        )}

        {activeTab === 'pattern' && (
          <PatternMatrixGrid
            telemetry={telemetry}
            setTelemetry={setTelemetry}
            language={language}
          />
        )}

        {activeTab === 'queue' && (
          <BetaLensEventQueue
            telemetry={telemetry}
            setTelemetry={setTelemetry}
            language={language}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipePresets
            telemetry={telemetry}
            setTelemetry={setTelemetry}
            language={language}
          />
        )}
      </main>

      {/* Gemini AI Diagnostic Modal */}
      <AiDiagnosticsModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        telemetry={telemetry}
        setTelemetry={setTelemetry}
        language={language}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs font-mono text-slate-500">
        Wafer Chamber Lithography & Diagnostics OS •
        Gamma_settle_tube_rotate • Tri_ports_lux_projected • Star_projected_anchored
      </footer>
    </div>
  );
}
