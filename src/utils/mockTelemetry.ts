import {
  TubeRotationState,
  ValveHealthState,
  LensPickedEvent,
  PatternDie,
  PatternMatrixState,
  TelemetryData,
} from '../types';

export function createInitialTelemetry(): TelemetryData {
  const matrixSize = 8;
  const dies: PatternDie[] = [];

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Create round wafer die bounds
      const distFromCenter = Math.sqrt(
        Math.pow(r - (matrixSize - 1) / 2, 2) + Math.pow(c - (matrixSize - 1) / 2, 2)
      );
      const isWithinWafer = distFromCenter <= matrixSize / 2;

      if (isWithinWafer) {
        const defect = Math.floor(Math.random() * 12); // low default defect
        dies.push({
          id: `die_${r}_${c}`,
          row: r,
          col: c,
          anchored: true,
          gammaAttributeClip: Number((Math.random() * 0.8 + 0.1).toFixed(3)),
          defectScore: defect,
          isolationZoneRedeemed: Math.random() > 0.2,
        });
      }
    }
  }

  const initialTube: TubeRotationState = {
    rpm: 1200,
    settleAngle: 45,
    rotationActive: true,
    strappedMode: true,
    tubeTilt: 0.5,
    vibrationLevel: 0.12,
  };

  const initialValves: ValveHealthState = {
    triPorts: [
      {
        portId: 'port_1',
        name: 'Port 1 (Lux Fuel Inlet)',
        luxProjected: 840,
        flowRate: 45.2,
        pressure: 32.5,
        status: 'optimal',
      },
      {
        portId: 'port_2',
        name: 'Port 2 (Tri-Lux Carrier)',
        luxProjected: 910,
        flowRate: 60.8,
        pressure: 41.0,
        status: 'optimal',
      },
      {
        portId: 'port_3',
        name: 'Port 3 (Gamma Exhaust)',
        luxProjected: 420,
        flowRate: 18.4,
        pressure: 12.2,
        status: 'optimal',
      },
    ],
    fuelHealthScore: 98,
    toppleAttribute: {
      enabled: true,
      toppleDetected: false,
      thresholdDeg: 3.5,
    },
    tubePlateSuppressed: false,
  };

  const initialEvents: LensPickedEvent[] = [
    {
      id: 'evt_101',
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
      lensId: 'BetaLens-UV-701',
      focalOffsetNm: 0.14,
      triggerSource: 'system_trigger',
      status: 'aligned',
    },
    {
      id: 'evt_102',
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
      lensId: 'BetaLens-UV-702',
      focalOffsetNm: -0.08,
      triggerSource: 'system_trigger',
      status: 'aligned',
    },
    {
      id: 'evt_103',
      timestamp: new Date().toLocaleTimeString(),
      lensId: 'BetaLens-UV-703',
      focalOffsetNm: 0.02,
      triggerSource: 'system_trigger',
      status: 'active',
    },
  ];

  const initialPattern: PatternMatrixState = {
    matrixSize,
    dies,
    starProjectorActive: true,
    gammaSetAttribute: 0.94,
    overallYieldPct: 96.8,
  };

  return {
    timestamp: new Date().toISOString(),
    tube: initialTube,
    valves: initialValves,
    events: initialEvents,
    pattern: initialPattern,
    systemOs: {
      cpuLoadPct: 18,
      memoryMb: 1024,
      activeListeners: 14,
      uptimeSec: 3420,
    },
  };
}
