import React from 'react';
import {
  Activity,
  Gauge,
  Flame,
  AlertTriangle,
  Zap,
  Sliders,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TelemetryData, ValvePortMetrics } from '../types';

interface TriPortsValveHealthProps {
  telemetry: TelemetryData;
  setTelemetry: React.Dispatch<React.SetStateAction<TelemetryData>>;
  language: 'zh-TW' | 'en';
}

export const TriPortsValveHealth: React.FC<TriPortsValveHealthProps> = ({
  telemetry,
  setTelemetry,
  language,
}) => {
  const isZh = language === 'zh-TW';
  const { valves } = telemetry;

  // Mock historical chart data for Lux emission trends
  const chartData = [
    { time: '10:00', port1: 820, port2: 900, port3: 410 },
    { time: '10:05', port1: 835, port2: 905, port3: 415 },
    { time: '10:10', port1: 840, port2: 910, port3: 420 },
    { time: '10:15', port1: 825, port2: 895, port3: 418 },
    { time: '10:20', port1: 850, port2: 920, port3: 425 },
    { time: '10:25', port1: 840, port2: 910, port3: 420 },
  ];

  const handleLuxChange = (portId: string, value: number) => {
    setTelemetry((prev) => ({
      ...prev,
      valves: {
        ...prev.valves,
        triPorts: prev.valves.triPorts.map((p) =>
          p.portId === portId ? { ...p, luxProjected: value } : p
        ),
      },
    }));
  };

  const handleFlowChange = (portId: string, value: number) => {
    setTelemetry((prev) => ({
      ...prev,
      valves: {
        ...prev.valves,
        triPorts: prev.valves.triPorts.map((p) =>
          p.portId === portId ? { ...p, flowRate: value } : p
        ),
      },
    }));
  };

  const toggleToppleAttribute = () => {
    setTelemetry((prev) => ({
      ...prev,
      valves: {
        ...prev.valves,
        toppleAttribute: {
          ...prev.valves.toppleAttribute,
          enabled: !prev.valves.toppleAttribute.enabled,
        },
      },
    }));
  };

  const resetValves = () => {
    setTelemetry((prev) => ({
      ...prev,
      valves: {
        ...prev.valves,
        fuelHealthScore: 100,
        triPorts: prev.valves.triPorts.map((p) => ({
          ...p,
          luxProjected: 850,
          flowRate: 50.0,
          status: 'optimal',
        })),
        toppleAttribute: {
          ...prev.valves.toppleAttribute,
          toppleDetected: false,
        },
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Flame className="w-6 h-6 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">
              {isZh
                ? '燃料閥門與三光束強氣診斷 (valve_health_fuel)'
                : 'Fuel Valves & Tri-Ports Lux Diagnostics'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            valve_health_fuel.tri_ports_lux_projected(id_touble_topple.on/off-attribute().strapped[::2])
          </p>
        </div>

        <div className="flex items-center space-x-4 font-mono">
          <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">
              {isZh ? '閥門系統綜合健康度' : 'Overall Health Score'}
            </div>
            <div className="text-xl font-bold text-cyan-400">
              {valves.fuelHealthScore}%
            </div>
          </div>

          <button
            onClick={resetValves}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isZh ? '重設閥門 (Calibrate)' : 'Calibrate Valves'}</span>
          </button>
        </div>
      </div>

      {/* 3 Port Valve Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {valves.triPorts.map((port) => (
          <div
            key={port.portId}
            className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200 text-sm">
                  {port.name}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {port.status.toUpperCase()}
                </span>
              </div>

              {/* Lux Intensity */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>
                      {isZh ? '投射光強 (Lux Projected)' : 'Lux Projected'}
                    </span>
                    <span className="text-cyan-400 font-bold">
                      {port.luxProjected} Lux
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1500}
                    step={10}
                    value={port.luxProjected}
                    onChange={(e) =>
                      handleLuxChange(port.portId, Number(e.target.value))
                    }
                    className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg"
                  />
                </div>

                {/* Gas Flow Rate */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>
                      {isZh ? '氣流速率 (Flow Rate)' : 'Gas Flow Rate'}
                    </span>
                    <span className="text-blue-400 font-bold">
                      {port.flowRate} L/min
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={port.flowRate}
                    onChange={(e) =>
                      handleFlowChange(port.portId, Number(e.target.value))
                    }
                    className="w-full accent-blue-500 bg-slate-800 h-2 rounded-lg"
                  />
                </div>

                {/* Pressure Gauge Metric */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Gauge className="w-4 h-4 text-cyan-400" />
                    <span>{isZh ? '管道壓力 (Pressure)' : 'Line Pressure'}</span>
                  </div>
                  <span className="text-slate-200 font-bold">
                    {port.pressure} PSI
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
              <span>Sensor: OK</span>
              <span className="text-cyan-400">Tri-Lux Beam Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Historical Lux Emission Chart & Special Attributes Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real-time Lux Chart */}
        <div className="lg:col-span-8 bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-slate-100 text-sm">
                {isZh
                  ? '三氣口極紫外光與氣流即時監測 (Real-time Lux Stream)'
                  : 'Tri-Ports Lux Emission Stream'}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Live Sampling Rate: 100 Hz
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPort1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPort2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="port1"
                  stroke="#06b6d4"
                  fillOpacity={1}
                  fill="url(#colorPort1)"
                  name="Port 1 (Lux)"
                />
                <Area
                  type="monotone"
                  dataKey="port2"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorPort2)"
                  name="Port 2 (Lux)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Special Attribute Controls (Topple & Strapped) */}
        <div className="lg:col-span-4 bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              {isZh ? '傾覆感知與綁定屬性' : 'Topple & Strapped Attributes'}
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Topple Sensor Attribute */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">
                  id_touble_topple
                </span>
                <button
                  onClick={toggleToppleAttribute}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                    valves.toppleAttribute.enabled
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {valves.toppleAttribute.enabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                {isZh
                  ? '即時監控氣閥重力極限與防傾倒斷氣保護機制'
                  : 'Auto cutoff valve fuel flow on chamber tilt breach'}
              </p>
              <div className="flex justify-between text-[11px] text-cyan-300 pt-1 border-t border-slate-900">
                <span>Threshold Angle:</span>
                <span>{valves.toppleAttribute.thresholdDeg}°</span>
              </div>
            </div>

            {/* Suppressed Status */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-200 font-semibold">
                <span>fuel_pack_tube_plate_1</span>
                <span
                  className={
                    valves.tubePlateSuppressed
                      ? 'text-rose-400 font-bold'
                      : 'text-emerald-400 font-bold'
                  }
                >
                  {valves.tubePlateSuppressed ? 'SUPPRESSED' : 'NORMAL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isZh
                  ? '第 1 號燃料板噴槍壓制屬性狀態'
                  : 'Plate 1 nozzle fuel pressure suppression state'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
