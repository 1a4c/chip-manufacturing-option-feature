import React, { useState } from 'react';
import {
  Bot,
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Sliders,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { TelemetryData, AiDiagnosticReport } from '../types';

interface AiDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryData;
  setTelemetry: React.Dispatch<React.SetStateAction<TelemetryData>>;
  language: 'zh-TW' | 'en';
}

export const AiDiagnosticsModal: React.FC<AiDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  setTelemetry,
  language,
}) => {
  if (!isOpen) return null;

  const isZh = language === 'zh-TW';
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AiDiagnosticReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [promptOverride, setPromptOverride] = useState('');

  const runGeminiDiagnosis = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telemetry,
          promptOverride: promptOverride.trim() || undefined,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch AI diagnostic report');
      }

      setReport(data);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error executing Gemini AI analysis.');
    } finally {
      setLoading(false);
    }
  };

  // Apply AI Suggested Recipe Tweaks
  const applySuggestedTweaks = () => {
    if (!report?.suggestedRecipeTweaks) return;

    const { rpmTweak, luxPort1Tweak, luxPort2Tweak, luxPort3Tweak } =
      report.suggestedRecipeTweaks;

    setTelemetry((prev) => ({
      ...prev,
      tube: {
        ...prev.tube,
        rpm: Math.max(0, Math.min(3600, prev.tube.rpm + (rpmTweak || 0))),
      },
      valves: {
        ...prev.valves,
        triPorts: prev.valves.triPorts.map((p, idx) => {
          let tweak = 0;
          if (idx === 0) tweak = luxPort1Tweak || 0;
          if (idx === 1) tweak = luxPort2Tweak || 0;
          if (idx === 2) tweak = luxPort3Tweak || 0;
          return {
            ...p,
            luxProjected: Math.max(0, p.luxProjected + tweak),
          };
        }),
      },
    }));

    alert(
      isZh
        ? '已成功套用 AI 建議的最佳化製程參數！'
        : 'Successfully applied AI suggested recipe tweaks!'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                {isZh
                  ? 'Gemini 晶片機台極紫外光與管路 AI 診斷'
                  : 'Gemini Wafer Chamber AI Diagnostic Engineer'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Powered by @google/genai (Gemini 2.5 Flash)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-300 mb-1">
              {isZh
                ? '自訂分析重點（選擇性輸入）'
                : 'Custom Focus Query (Optional)'}
            </label>
            <input
              type="text"
              value={promptOverride}
              onChange={(e) => setPromptOverride(e.target.value)}
              placeholder={
                isZh
                  ? '例如：請分析目前 Gamma Tube 轉速與三氣孔 Lux 投射的匹配性...'
                  : 'e.g., Check if Port 2 Lux emission matches the tube rotation speed...'
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={runGeminiDiagnosis}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  {isZh
                    ? 'AI 正在即時分析機台 telemetry 數據中...'
                    : 'Analyzing Live Telemetry...'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>
                  {isZh
                    ? '執行機台 AI 全機診斷 (Run AI Diagnosis)'
                    : 'Run Machine AI Diagnosis'}
                </span>
              </>
            )}
          </button>

          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-lg text-rose-200 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {report && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              {/* Executive Summary */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">
                    {isZh ? '診斷總結 (Executive Summary)' : 'Executive Summary'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      report.overallHealthStatus === 'Optimal'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : report.overallHealthStatus === 'Caution'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {report.overallHealthStatus}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {report.summary}
                </p>
              </div>

              {/* Findings */}
              {report.findings && report.findings.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-200 block">
                    {isZh ? '診斷發現與工程建議' : 'Key Findings & Engineering Fixes'}
                  </span>
                  {report.findings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-200">
                        <span>{finding.component}</span>
                        <span
                          className={`text-[10px] uppercase font-bold ${
                            finding.severity === 'high'
                              ? 'text-rose-400'
                              : finding.severity === 'medium'
                              ? 'text-amber-400'
                              : 'text-cyan-400'
                          }`}
                        >
                          {finding.severity} Severity
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        <strong>Issue:</strong> {finding.issue}
                      </p>
                      <p className="text-cyan-300 text-[11px]">
                        <strong>Recommendation:</strong> {finding.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggested Tweaks & Apply Button */}
              {report.suggestedRecipeTweaks && (
                <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-200">
                      {isZh
                        ? 'AI 建議製程最佳化參數'
                        : 'Suggested Recipe Adjustments'}
                    </span>
                    <button
                      onClick={applySuggestedTweaks}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition flex items-center space-x-1"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isZh ? '一鍵套用 AI 參數' : 'Apply Tweaks'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-indigo-300 font-mono">
                    <div>
                      RPM Offset: {report.suggestedRecipeTweaks.rpmTweak || 0} RPM
                    </div>
                    <div>
                      Port 1 Lux Offset:{' '}
                      {report.suggestedRecipeTweaks.luxPort1Tweak || 0} Lux
                    </div>
                    <div>
                      Port 2 Lux Offset:{' '}
                      {report.suggestedRecipeTweaks.luxPort2Tweak || 0} Lux
                    </div>
                    <div>
                      Port 3 Lux Offset:{' '}
                      {report.suggestedRecipeTweaks.luxPort3Tweak || 0} Lux
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
