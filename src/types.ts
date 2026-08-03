export interface TubeRotationState {
  rpm: number;
  settleAngle: number; // degrees 0-360
  rotationActive: boolean;
  strappedMode: boolean; // strapped[::2]
  tubeTilt: number; // degrees -15 to +15
  vibrationLevel: number; // mm/s
}

export interface ValvePortMetrics {
  portId: 'port_1' | 'port_2' | 'port_3';
  name: string;
  luxProjected: number; // Lux intensity
  flowRate: number; // L/min
  pressure: number; // PSI
  status: 'optimal' | 'warning' | 'critical' | 'suppressed';
}

export interface ValveHealthState {
  triPorts: ValvePortMetrics[];
  fuelHealthScore: number; // 0 - 100%
  toppleAttribute: {
    enabled: boolean;
    toppleDetected: boolean;
    thresholdDeg: number;
  };
  tubePlateSuppressed: boolean; // fuel_pack_tube_plate_1.suppressed
}

export interface LensPickedEvent {
  id: string;
  timestamp: string;
  lensId: string;
  focalOffsetNm: number;
  triggerSource: 'system_trigger' | 'manual_override' | 'calibration_routine';
  status: 'queued' | 'active' | 'aligned' | 'rejected';
}

export interface PatternDie {
  id: string;
  row: number;
  col: number;
  anchored: boolean; // Star_projected_anchored
  gammaAttributeClip: number; // record_clip
  defectScore: number; // 0 - 100
  isolationZoneRedeemed: boolean; // env_beta_section_izone.redeemed_endorsed
}

export interface PatternMatrixState {
  matrixSize: number; // e.g., 8x8 or 12x12
  dies: PatternDie[];
  starProjectorActive: boolean;
  gammaSetAttribute: number;
  overallYieldPct: number;
}

export interface TelemetryData {
  timestamp: string;
  tube: TubeRotationState;
  valves: ValveHealthState;
  events: LensPickedEvent[];
  pattern: PatternMatrixState;
  systemOs: {
    cpuLoadPct: number;
    memoryMb: number;
    activeListeners: number;
    uptimeSec: number;
  };
}

export interface AiDiagnosticReport {
  summary: string;
  overallHealthStatus: 'Optimal' | 'Caution' | 'Action Required';
  findings: Array<{
    component: string;
    issue: string;
    recommendation: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  suggestedRecipeTweaks: {
    rpmTweak: number;
    luxPort1Tweak: number;
    luxPort2Tweak: number;
    luxPort3Tweak: number;
  };
  language: 'zh-TW' | 'en';
}
