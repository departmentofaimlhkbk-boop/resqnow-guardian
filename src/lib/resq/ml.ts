/**
 * ResQNow accident-detection inference layer.
 *
 * IMPORTANT — this project does not ship a trained model. Nothing here is a
 * machine-learning model. `ruleBasedInference` is explicitly deterministic
 * heuristics, kept separate from `MLInferenceProvider`, which is the seam where
 * a real Python/ONNX model service is plugged in later.
 */

export type SensorSample = {
  /** m/s^2 */
  accelX: number;
  accelY: number;
  accelZ: number;
  /** rad/s */
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  /** km/h */
  speedKmh: number;
  latitude?: number | null;
  longitude?: number | null;
  timestamp: number;
};

export type CrashFeatures = {
  peakAcceleration: number;
  accelerationJerk: number;
  peakRotation: number;
  deltaSpeedKmh: number;
  decelerationG: number;
  sampleCount: number;
  durationMs: number;
};

export type Severity = "low" | "medium" | "high" | "critical";

export type InferenceResult = {
  accidentProbability: number;
  severity: Severity;
  /** "rule-based" until a trained model is wired in */
  engine: string;
  features: CrashFeatures;
};

const G = 9.80665;

/** Stage 1 — preprocessing. Drops malformed samples and sorts by time. */
export function preprocess(samples: SensorSample[]): SensorSample[] {
  return samples
    .filter((s) => Number.isFinite(s.accelX) && Number.isFinite(s.accelY) && Number.isFinite(s.accelZ))
    .sort((a, b) => a.timestamp - b.timestamp);
}

/** Stage 2 — feature extraction. */
export function extractFeatures(samples: SensorSample[]): CrashFeatures {
  if (samples.length === 0) {
    return {
      peakAcceleration: 0,
      accelerationJerk: 0,
      peakRotation: 0,
      deltaSpeedKmh: 0,
      decelerationG: 0,
      sampleCount: 0,
      durationMs: 0,
    };
  }

  const magnitudes = samples.map((s) => Math.hypot(s.accelX, s.accelY, s.accelZ));
  const rotations = samples.map((s) => Math.hypot(s.gyroX, s.gyroY, s.gyroZ));

  let jerk = 0;
  for (let i = 1; i < magnitudes.length; i += 1) {
    const dt = Math.max(1, samples[i]!.timestamp - samples[i - 1]!.timestamp) / 1000;
    jerk = Math.max(jerk, Math.abs(magnitudes[i]! - magnitudes[i - 1]!) / dt);
  }

  const first = samples[0]!;
  const last = samples[samples.length - 1]!;
  const durationMs = Math.max(1, last.timestamp - first.timestamp);
  const deltaSpeedKmh = first.speedKmh - last.speedKmh;
  const decelerationG = (deltaSpeedKmh / 3.6 / (durationMs / 1000)) / G;

  return {
    peakAcceleration: Math.max(...magnitudes),
    accelerationJerk: jerk,
    peakRotation: Math.max(...rotations),
    deltaSpeedKmh,
    decelerationG,
    sampleCount: samples.length,
    durationMs,
  };
}

/** Stage 3a — deterministic heuristics. NOT machine learning. */
export function ruleBasedInference(features: CrashFeatures): InferenceResult {
  const impact = Math.min(1, features.peakAcceleration / (6 * G));
  const rotation = Math.min(1, features.peakRotation / 12);
  const braking = Math.min(1, Math.max(0, features.decelerationG) / 3);

  const accidentProbability = Math.round(Math.min(0.99, impact * 0.55 + braking * 0.3 + rotation * 0.15) * 1000) / 1000;

  const severity: Severity =
    accidentProbability >= 0.9 ? "critical" : accidentProbability >= 0.7 ? "high" : accidentProbability >= 0.4 ? "medium" : "low";

  return { accidentProbability, severity, engine: "rule-based", features };
}

/**
 * Stage 3b — real ML inference seam.
 *
 * Register a provider (an HTTP call to a Python model service, an ONNX runtime
 * session, etc.) with `registerInferenceProvider`. Until one is registered,
 * `runInference` transparently falls back to the rule-based engine and reports
 * `engine: "rule-based"` so the UI never claims an ML prediction happened.
 */
export type MLInferenceProvider = (features: CrashFeatures) => Promise<InferenceResult>;

let provider: MLInferenceProvider | null = null;

export function registerInferenceProvider(next: MLInferenceProvider | null) {
  provider = next;
}

export function hasInferenceProvider() {
  return provider !== null;
}

export async function runInference(samples: SensorSample[]): Promise<InferenceResult> {
  const features = extractFeatures(preprocess(samples));
  if (provider) {
    try {
      return await provider(features);
    } catch {
      // A failing model service must never block an emergency.
      return ruleBasedInference(features);
    }
  }
  return ruleBasedInference(features);
}

/**
 * Synthetic sensor window used by the "Simulate Accident" control and the
 * manual SOS button, so the pipeline runs end-to-end with real code paths.
 */
export function syntheticImpactWindow(now = Date.now(), speedKmh = 62): SensorSample[] {
  const samples: SensorSample[] = [];
  for (let i = 0; i < 12; i += 1) {
    const crashing = i >= 5 && i <= 7;
    samples.push({
      accelX: crashing ? 34 + i : 0.4,
      accelY: crashing ? 21 : 0.2,
      accelZ: crashing ? 28 : G,
      gyroX: crashing ? 6.2 : 0.05,
      gyroY: crashing ? 4.8 : 0.03,
      gyroZ: crashing ? 3.1 : 0.02,
      speedKmh: i < 5 ? speedKmh : Math.max(0, speedKmh - (i - 4) * 9),
      timestamp: now + i * 100,
    });
  }
  return samples;
}
