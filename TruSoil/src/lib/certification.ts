import type { ComplianceReport, Grade, SensorReading } from "@/types";

function stdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function pesticideScore(readings: number[]): { score: number; detail: string } {
  if (readings.length === 0) return { score: 50, detail: "Incomplete data — no pesticide readings." };

  if (readings.some((v) => v > 20)) return { score: 0, detail: "VIOLATION: reading > 20 ppm detected. Fails NPOP organic threshold." };

  const mean = avg(readings);
  if (readings.some((v) => v >= 10)) return { score: 30, detail: `Controlled but risky — some readings 10–20 ppm (avg ${mean.toFixed(2)} ppm).` };
  if (mean >= 5) return { score: 60, detail: `Minimal residue — avg ${mean.toFixed(2)} ppm (5–10 ppm range).` };
  if (mean >= 0.1) return { score: 85, detail: `Low residue — avg ${mean.toFixed(2)} ppm (0.1–5 ppm range).` };
  return { score: 100, detail: `Organic standard met — avg ${mean.toFixed(2)} ppm (< 0.1 ppm).` };
}

function pHScore(readings: number[]): { score: number; detail: string } {
  if (readings.length === 0) return { score: 50, detail: "Incomplete pH data." };

  const hasExtreme = readings.some((v) => v < 5.0 || v > 8.0);
  if (hasExtreme) return { score: 30, detail: "Soil degradation risk — extreme pH detected (< 5.0 or > 8.0)." };

  const hasPoor = readings.some((v) => v < 5.5 || v > 7.5);
  if (hasPoor) return { score: 60, detail: "Poor soil health — some readings outside 5.5–7.5 range." };

  const allOptimal = readings.every((v) => v >= 6.0 && v <= 7.0);
  if (allOptimal) return { score: 100, detail: "Optimal pH (6.0–7.0) maintained across all readings." };

  return { score: 85, detail: "Acceptable pH range (5.5–7.5) maintained." };
}

function moistureScore(readings: number[]): { score: number; detail: string } {
  if (readings.length === 0) return { score: 50, detail: "Incomplete soil moisture data." };

  const hasExtreme = readings.some((v) => v < 20 || v > 80);
  if (hasExtreme) return { score: 20, detail: "Extreme drought or waterlogging detected (< 20% or > 80%)." };

  const hasStress = readings.some((v) => v < 30 || v > 75);
  if (hasStress) return { score: 50, detail: "Water stress detected — readings outside 30–75% range." };

  const allOptimal = readings.every((v) => v >= 40 && v <= 60);
  if (allOptimal) return { score: 100, detail: "Optimal soil moisture (40–60%) maintained." };

  return { score: 85, detail: "Acceptable moisture levels maintained (35–70%)." };
}

function temperatureScore(readings: number[]): { score: number; detail: string } {
  if (readings.length === 0) return { score: 50, detail: "Incomplete temperature data." };

  const sd = stdDev(readings);
  if (sd > 10) return { score: 30, detail: `High temperature instability (σ=${sd.toFixed(1)}°C) — potential tampering or severe stress.` };
  if (sd > 5) return { score: 60, detail: `Unusual fluctuation (σ=${sd.toFixed(1)}°C) — monitor closely.` };
  if (sd > 2) return { score: 85, detail: `Minor fluctuation (σ=${sd.toFixed(1)}°C) — within acceptable range.` };
  return { score: 100, detail: `Stable temperature (σ=${sd.toFixed(1)}°C).` };
}

function humidityScore(readings: number[]): { score: number; detail: string } {
  if (readings.length === 0) return { score: 50, detail: "Incomplete humidity data." };

  // Check 5+ consecutive days above 85%
  let consecutiveHigh = 0;
  let maxConsecutiveHigh = 0;
  let consecutiveMoldRisk = 0;
  let maxConsecutiveMoldRisk = 0;

  for (const v of readings) {
    if (v > 85) { consecutiveHigh++; maxConsecutiveHigh = Math.max(maxConsecutiveHigh, consecutiveHigh); } else consecutiveHigh = 0;
    if (v > 75) { consecutiveMoldRisk++; maxConsecutiveMoldRisk = Math.max(maxConsecutiveMoldRisk, consecutiveMoldRisk); } else consecutiveMoldRisk = 0;
  }

  if (maxConsecutiveHigh >= 5) return { score: 40, detail: `High disease risk — humidity > 85% for ${maxConsecutiveHigh}+ consecutive readings.` };
  if (maxConsecutiveMoldRisk >= 3) return { score: 70, detail: `Mold risk — humidity 75–85% for ${maxConsecutiveMoldRisk}+ consecutive readings. Organic fungicide may be needed.` };

  const allOptimal = readings.every((v) => v >= 40 && v <= 75);
  if (allOptimal) return { score: 100, detail: "Optimal humidity (40–75%) maintained." };

  return { score: 85, detail: "Humidity generally within acceptable range." };
}

function continuityScore(
  readings: SensorReading[],
  expectedDataPoints: number
): { score: number; detail: string } {
  if (expectedDataPoints === 0) return { score: 50, detail: "Cannot calculate uptime — no expected data points." };

  const actual = readings.length;
  const uptimePct = (actual / expectedDataPoints) * 100;

  // Detect 24-hour flat-lines (all same value in a 24-reading window)
  const temps = readings.map((r) => r.temperature);
  let hasFlatline = false;
  if (temps.length >= 24) {
    for (let i = 0; i <= temps.length - 24; i++) {
      const window = temps.slice(i, i + 24);
      if (new Set(window).size === 1) { hasFlatline = true; break; }
    }
  }
  if (hasFlatline) return { score: 20, detail: "Suspicious 24-hour flatline detected — possible sensor failure or data manipulation." };

  if (uptimePct >= 100) return { score: 100, detail: "100% data continuity." };
  if (uptimePct >= 95) return { score: 90, detail: `${uptimePct.toFixed(1)}% uptime — minor gaps acceptable.` };
  if (uptimePct >= 90) return { score: 70, detail: `${uptimePct.toFixed(1)}% uptime — concerning, explanation required.` };
  return { score: 40, detail: `${uptimePct.toFixed(1)}% uptime — unreliable, high fraud risk.` };
}

export function calculateComplianceScore(
  sensorData: SensorReading[],
  expectedDataPoints = 30 * 24
): ComplianceReport {
  const temperatures = sensorData.map((r) => r.temperature);
  const humidities = sensorData.map((r) => r.humidity);
  const moistures = sensorData.map((r) => r.soilMoisture);
  const pHValues = sensorData.map((r) => r.pH);
  const pesticides = sensorData.map((r) => r.pesticide);

  const pesticide = pesticideScore(pesticides);
  const pH = pHScore(pHValues);
  const moisture = moistureScore(moistures);
  const temperature = temperatureScore(temperatures);
  const humidity = humidityScore(humidities);
  const continuity = continuityScore(sensorData, expectedDataPoints);

  const complianceScore = Math.round(
    pesticide.score * 0.35 +
    pH.score * 0.20 +
    moisture.score * 0.15 +
    temperature.score * 0.10 +
    humidity.score * 0.10 +
    continuity.score * 0.10
  );

  const flagsForReview: string[] = [];
  if (pesticide.score < 85) flagsForReview.push(`Pesticide concern: ${pesticide.detail}`);
  if (pH.score < 85) flagsForReview.push(`pH concern: ${pH.detail}`);
  if (moisture.score < 85) flagsForReview.push(`Moisture concern: ${moisture.detail}`);
  if (humidity.score < 85) flagsForReview.push(`Humidity concern: ${humidity.detail}`);
  if (continuity.score < 90) flagsForReview.push(`Data continuity: ${continuity.detail}`);

  let grade: Grade;
  let npopCompliant: boolean;
  let certificationRecommendation: "APPROVE" | "CONDITIONAL" | "REJECT";

  if (complianceScore >= 90 && pesticide.score >= 100 && pH.score >= 85) {
    grade = "A+";
    npopCompliant = true;
    certificationRecommendation = "APPROVE";
  } else if (complianceScore >= 75 && pesticide.score >= 85) {
    grade = "A";
    npopCompliant = true;
    certificationRecommendation = "APPROVE";
  } else if (complianceScore >= 60 && pesticide.score >= 60) {
    grade = "B";
    npopCompliant = pesticide.score >= 60;
    certificationRecommendation = "CONDITIONAL";
  } else {
    grade = "C";
    npopCompliant = false;
    certificationRecommendation = "REJECT";
  }

  return {
    complianceScore,
    grade,
    breakDown: {
      pesticide: { score: pesticide.score, weight: 0.35, detail: pesticide.detail },
      pH: { score: pH.score, weight: 0.20, detail: pH.detail },
      moisture: { score: moisture.score, weight: 0.15, detail: moisture.detail },
      temperature: { score: temperature.score, weight: 0.10, detail: temperature.detail },
      humidity: { score: humidity.score, weight: 0.10, detail: humidity.detail },
      continuity: { score: continuity.score, weight: 0.10, detail: continuity.detail },
    },
    npopCompliant,
    flagsForReview,
    certificationRecommendation,
    certificationValidity: "12 months from approval date",
  };
}
