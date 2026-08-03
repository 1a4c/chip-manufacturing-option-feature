import React, { useEffect, useRef, useState } from 'react';
import {
  RotateCw,
  Play,
  Pause,
  Sliders,
  Shield,
  Zap,
  Layers,
  Radio,
  Eye,
  Crosshair,
  AlertTriangle,
} from 'lucide-react';
import { TelemetryData } from '../types';

interface ChamberVisualizerProps {
  telemetry: TelemetryData;
  setTelemetry: React.Dispatch<React.SetStateAction<TelemetryData>>;
  language: 'zh-TW' | 'en';
}

export const ChamberVisualizer: React.FC<ChamberVisualizerProps> = ({
  telemetry,
  setTelemetry,
  language,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showBeams, setShowBeams] = useState(true);
  const [showWaferDetails, setShowWaferDetails] = useState(true);

  const isZh = language === 'zh-TW';
  const { tube, valves, pattern } = telemetry;

  // Rotation animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angleRad = (tube.settleAngle * Math.PI) / 180;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Clear dark background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Draw background technical grid
      if (showGrid) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // Update rotation angle if active
      if (tube.rotationActive) {
        // convert RPM to radians per frame (60fps)
        const radPerFrame = (tube.rpm * 2 * Math.PI) / (60 * 60);
        angleRad += radPerFrame;
      }

      ctx.save();
      // Apply Tube Tilt transformation
      ctx.translate(centerX, centerY);
      const tiltRad = (tube.tubeTilt * Math.PI) / 180;
      ctx.rotate(tiltRad);

      // 1. Draw Outer Quartz Tube (Gamma Settle Tube)
      const outerTubeRadius = Math.min(width, height) * 0.35;
      const innerTubeRadius = outerTubeRadius * 0.85;

      // Glass Tube Glow
      const tubeGrad = ctx.createRadialGradient(
        0,
        0,
        innerTubeRadius,
        0,
        0,
        outerTubeRadius
      );
      tubeGrad.addColorStop(0, 'rgba(14, 116, 144, 0.15)');
      tubeGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.25)');
      tubeGrad.addColorStop(1, 'rgba(56, 189, 248, 0.6)');

      ctx.beginPath();
      ctx.arc(0, 0, outerTubeRadius, 0, Math.PI * 2);
      ctx.fillStyle = tubeGrad;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#0284c7';
      ctx.stroke();

      // Tube Ring Rotation Indicators
      ctx.save();
      ctx.rotate(angleRad);

      // Draw rotating teeth/flanges on Gamma Settle Tube
      const teethCount = tube.strappedMode ? 16 : 12;
      for (let i = 0; i < teethCount; i++) {
        // strapped[::2] highlighting
        const isHighlighted = tube.strappedMode && i % 2 === 0;
        const toothAngle = (i * 2 * Math.PI) / teethCount;
        const x1 = Math.cos(toothAngle) * outerTubeRadius;
        const y1 = Math.sin(toothAngle) * outerTubeRadius;
        const x2 = Math.cos(toothAngle) * (outerTubeRadius + 10);
        const y2 = Math.sin(toothAngle) * (outerTubeRadius + 10);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isHighlighted ? '#06b6d4' : '#334155';
        ctx.lineWidth = isHighlighted ? 3 : 1.5;
        ctx.stroke();
      }

      // 2. Draw Internal Wafer Substrate
      const waferRadius = innerTubeRadius * 0.75;

      // Wafer base disc
      ctx.beginPath();
      ctx.arc(0, 0, waferRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#111827';
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Wafer Circuit Traces / Die Grid
      if (showWaferDetails) {
        const dieSize = waferRadius * 0.22;
        const dieCount = 6;
        for (let r = -dieCount / 2; r < dieCount / 2; r++) {
          for (let c = -dieCount / 2; c < dieCount / 2; c++) {
            const dx = r * dieSize;
            const dy = c * dieSize;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < waferRadius * 0.85) {
              ctx.strokeStyle = '#1e3a8a';
              ctx.strokeRect(
                dx - dieSize / 2,
                dy - dieSize / 2,
                dieSize,
                dieSize
              );

              // Center die dot
              ctx.fillStyle = pattern.starProjectorActive
                ? '#38bdf8'
                : '#475569';
              ctx.beginPath();
              ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Star Projected Anchored Laser Overlay (if active)
      if (pattern.starProjectorActive) {
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1;
        // Draw 8-point star projection
        for (let s = 0; s < 8; s++) {
          const starAngle = (s * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(
            Math.cos(starAngle) * waferRadius * 0.9,
            Math.sin(starAngle) * waferRadius * 0.9
          );
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      ctx.restore(); // restore tube rotation

      ctx.restore(); // restore tube tilt

      // 3. Draw Tri-Ports Lux Beams projecting from equipment chassis
      if (showBeams) {
        const portLocations = [
          {
            angle: -Math.PI / 4,
            color: '#06b6d4',
            lux: valves.triPorts[0].luxProjected,
            name: 'Port 1 (Fuel Lux)',
          },
          {
            angle: 0,
            color: '#3b82f6',
            lux: valves.triPorts[1].luxProjected,
            name: 'Port 2 (Tri-Lux)',
          },
          {
            angle: Math.PI / 4,
            color: '#a855f7',
            lux: valves.triPorts[2].luxProjected,
            name: 'Port 3 (Gamma Exhaust)',
          },
        ];

        portLocations.forEach((port) => {
          const px = centerX + Math.cos(port.angle) * (width * 0.42);
          const py = centerY + Math.sin(port.angle) * (height * 0.42);

          // Port nozzle
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = port.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Lux Beam from nozzle to center tube
          const beamWidth = Math.max(2, Math.min(10, port.lux / 120));
          const beamGrad = ctx.createLinearGradient(px, py, centerX, centerY);
          beamGrad.addColorStop(0, port.color);
          beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(centerX, centerY);
          ctx.strokeStyle = beamGrad;
          ctx.lineWidth = beamWidth;
          ctx.stroke();

          // Port Label
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px monospace';
          ctx.fillText(`${port.name} [${port.lux} Lux]`, px - 35, py + 22);
        });
      }

      // 4. On-canvas HUD details
      ctx.fillStyle = '#0284c7';
      ctx.font = '11px monospace';
      ctx.fillText(
        `Gamma_settle_tube_rotate: ${tube.rpm} RPM | Tilt: ${tube.tubeTilt}°`,
        15,
        25
      );
      ctx.fillText(
        `Strapped[::2]: ${tube.strappedMode ? 'ENABLED' : 'DISABLED'} | Plate Suppressed: ${
          valves.tubePlateSuppressed ? 'YES' : 'NO'
        }`,
        15,
        42
      );

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [tube, valves, pattern, showGrid, showBeams, showWaferDetails]);

  // Handle toggle tube rotation
  const toggleRotation = () => {
    setTelemetry((prev) => ({
      ...prev,
      tube: {
        ...prev.tube,
        rotationActive: !prev.tube.rotationActive,
      },
    }));
  };

  // Handle RPM change
  const handleRpmChange = (newRpm: number) => {
    setTelemetry((prev) => ({
      ...prev,
      tube: {
        ...prev.tube,
        rpm: newRpm,
      },
    }));
  };

  // Handle Tilt change
  const handleTiltChange = (newTilt: number) => {
    setTelemetry((prev) => ({
      ...prev,
      tube: {
        ...prev.tube,
        tubeTilt: newTilt,
      },
    }));
  };

  // Handle Strapped Mode toggle
  const toggleStrapped = () => {
    setTelemetry((prev) => ({
      ...prev,
      tube: {
        ...prev.tube,
        strappedMode: !prev.tube.strappedMode,
      },
    }));
  };

  // Handle Tube Plate Suppression toggle
  const togglePlateSuppression = () => {
    setTelemetry((prev) => ({
      ...prev,
      valves: {
        ...prev.valves,
        tubePlateSuppressed: !prev.valves.tubePlateSuppressed,
      },
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main Canvas Visualizer */}
      <div className="lg:col-span-8 bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-slate-100 text-sm">
              {isZh
                ? '管路旋轉與極紫外光照動態 (Chamber Real-time Render)'
                : 'Interactive Tube Chamber Visualizer'}
            </h2>
          </div>

          {/* View Toggles */}
          <div className="flex items-center space-x-2 font-mono text-xs">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2 py-1 rounded border transition ${
                showGrid
                  ? 'bg-cyan-950 border-cyan-800 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setShowBeams(!showBeams)}
              className={`px-2 py-1 rounded border transition ${
                showBeams
                  ? 'bg-cyan-950 border-cyan-800 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              Lux Beams
            </button>
            <button
              onClick={() => setShowWaferDetails(!showWaferDetails)}
              className={`px-2 py-1 rounded border transition ${
                showWaferDetails
                  ? 'bg-cyan-950 border-cyan-800 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              Wafer Dies
            </button>
          </div>
        </div>

        {/* Canvas Element */}
        <div className="relative flex-1 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 min-h-[380px] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={720}
            height={460}
            className="w-full h-full object-contain cursor-crosshair"
          />

          {/* Overlay Status Badge */}
          <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-2.5 text-xs font-mono space-y-1">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-slate-400">Rotation:</span>
              <span
                className={
                  tube.rotationActive ? 'text-emerald-400' : 'text-amber-400'
                }
              >
                {tube.rotationActive ? `${tube.rpm} RPM` : 'PAUSED'}
              </span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-slate-400">Strapped[::2]:</span>
              <span
                className={
                  tube.strappedMode ? 'text-cyan-400' : 'text-slate-500'
                }
              >
                {tube.strappedMode ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-slate-400">Plate Suppression:</span>
              <span
                className={
                  valves.tubePlateSuppressed
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }
              >
                {valves.tubePlateSuppressed ? 'SUPPRESSED' : 'NORMAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Rotation Toolbar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleRotation}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-semibold text-white shadow transition ${
                tube.rotationActive
                  ? 'bg-rose-600 hover:bg-rose-500'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {tube.rotationActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>{isZh ? '暫停旋轉 (Pause)' : 'Pause Rotation'}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>{isZh ? '啟動旋轉 (Start)' : 'Start Rotation'}</span>
                </>
              )}
            </button>

            <button
              onClick={toggleStrapped}
              className={`px-3 py-1.5 rounded-md border font-mono transition ${
                tube.strappedMode
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Strapped Mode [::2]: {tube.strappedMode ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 font-mono">
              <span className="text-slate-400">RPM:</span>
              <input
                type="range"
                min={0}
                max={3000}
                step={50}
                value={tube.rpm}
                onChange={(e) => handleRpmChange(Number(e.target.value))}
                className="w-28 accent-cyan-500"
              />
              <span className="text-cyan-300 w-12 text-right">{tube.rpm}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control & Attributes Side Panel */}
      <div className="lg:col-span-4 space-y-6">
        {/* Tube Control Panel */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-xl">
          <div className="flex items-center space-x-2 mb-4 border-b border-slate-800 pb-2">
            <RotateCw className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              {isZh ? '旋轉管路參數 (Tube Control)' : 'Tube Rotation Attributes'}
            </h3>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Speed Slider */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Gamma Settle Tube RPM</span>
                <span className="text-cyan-400">{tube.rpm} RPM</span>
              </div>
              <input
                type="range"
                min={0}
                max={3600}
                step={50}
                value={tube.rpm}
                onChange={(e) => handleRpmChange(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Tube Tilt */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>{isZh ? '管路傾角 (Tube Tilt)' : 'Tube Tilt Angle'}</span>
                <span className="text-cyan-400">{tube.tubeTilt}°</span>
              </div>
              <input
                type="range"
                min={-15}
                max={15}
                step={0.5}
                value={tube.tubeTilt}
                onChange={(e) => handleTiltChange(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Tube Plate Suppression Toggle */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center space-x-2">
                  <Shield
                    className={`w-4 h-4 ${
                      valves.tubePlateSuppressed
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-slate-200">
                      Plate 1 Suppressed
                    </div>
                    <div className="text-[10px] text-slate-400">
                      fuel_pack_tube_plate_1.suppressed
                    </div>
                  </div>
                </div>
                <button
                  onClick={togglePlateSuppression}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                    valves.tubePlateSuppressed
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {valves.tubePlateSuppressed ? 'SUPPRESSED' : 'NORMAL'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Lux Summary Card */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-xl">
          <div className="flex items-center space-x-2 mb-3 border-b border-slate-800 pb-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-slate-100 text-sm">
              {isZh
                ? '三光束極紫外強度 (Tri-Ports Lux)'
                : 'Tri-Ports Lux Emission'}
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {valves.triPorts.map((port, idx) => (
              <div
                key={port.portId}
                className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-200">{port.name}</div>
                  <div className="text-[10px] text-slate-400">
                    Flow: {port.flowRate} L/m | Pres: {port.pressure} PSI
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-cyan-300 font-bold text-sm">
                    {port.luxProjected} Lux
                  </div>
                  <div className="text-[10px] text-emerald-400">OPTIMAL</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
