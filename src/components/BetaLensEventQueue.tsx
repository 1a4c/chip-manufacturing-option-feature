import React, { useState } from 'react';
import {
  List,
  Radio,
  PlusCircle,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Filter,
  Download,
  Zap,
} from 'lucide-react';
import { TelemetryData, LensPickedEvent } from '../types';

interface BetaLensEventQueueProps {
  telemetry: TelemetryData;
  setTelemetry: React.Dispatch<React.SetStateAction<TelemetryData>>;
  language: 'zh-TW' | 'en';
}

export const BetaLensEventQueue: React.FC<BetaLensEventQueueProps> = ({
  telemetry,
  setTelemetry,
  language,
}) => {
  const isZh = language === 'zh-TW';
  const { events } = telemetry;
  const [lensInput, setLensInput] = useState('BetaLens-UV-800');
  const [offsetInput, setOffsetInput] = useState('0.05');

  // Trigger new beta lens picked event in queue
  const triggerLensEvent = () => {
    const newEvent: LensPickedEvent = {
      id: `evt_${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      lensId: lensInput || 'BetaLens-UV-900',
      focalOffsetNm: parseFloat(offsetInput) || 0.0,
      triggerSource: 'system_trigger',
      status: 'active',
    };

    setTelemetry((prev) => ({
      ...prev,
      events: [newEvent, ...prev.events],
    }));
  };

  const markEventAligned = (id: string) => {
    setTelemetry((prev) => ({
      ...prev,
      events: prev.events.map((evt) =>
        evt.id === id ? { ...evt, status: 'aligned' } : evt
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-6 h-6 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">
              {isZh
                ? 'Beta 透鏡擷取事件佇列 (limb_queue)'
                : 'Beta Lens Picked Event Queue (limb_queue)'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            fuel_ports_lux[limb_queue(beta_lens_picked_event(listener(),system_trigger()))]
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono">
          <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">
              {isZh ? '佇列中的事件數' : 'Queued Events'}
            </div>
            <div className="text-xl font-bold text-cyan-400 font-mono">
              {events.length}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trigger New Event Panel */}
        <div className="lg:col-span-4 bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              {isZh ? '手動觸發透鏡擷取事件' : 'Trigger Lens Picked Event'}
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-slate-300 mb-1">
                Lens ID (Beta Lens)
              </label>
              <input
                type="text"
                value={lensInput}
                onChange={(e) => setLensInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                placeholder="e.g., BetaLens-UV-805"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">
                Focal Offset (nm)
              </label>
              <input
                type="number"
                step="0.01"
                value={offsetInput}
                onChange={(e) => setOffsetInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={triggerLensEvent}
              className="w-full mt-2 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20"
            >
              <Zap className="w-4 h-4" />
              <span>
                {isZh
                  ? '觸發系統事件 (system_trigger)'
                  : 'Emit system_trigger()'}
              </span>
            </button>
          </div>
        </div>

        {/* Event List Table */}
        <div className="lg:col-span-8 bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-slate-100 text-sm">
                {isZh
                  ? '即時肢體佇列事件紀錄 (Limb Queue Event Log)'
                  : 'Limb Queue Active Events'}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Listener: Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Event ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Lens ID</th>
                  <th className="p-3">Focal Offset</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-800/40">
                    <td className="p-3 text-cyan-300 font-bold">{evt.id}</td>
                    <td className="p-3 text-slate-400">{evt.timestamp}</td>
                    <td className="p-3 text-slate-200">{evt.lensId}</td>
                    <td className="p-3 text-slate-300">
                      {evt.focalOffsetNm > 0 ? '+' : ''}
                      {evt.focalOffsetNm} nm
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evt.status === 'aligned'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse'
                        }`}
                      >
                        {evt.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {evt.status !== 'aligned' && (
                        <button
                          onClick={() => markEventAligned(evt.id)}
                          className="px-2 py-1 rounded bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-semibold transition"
                        >
                          Align
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
