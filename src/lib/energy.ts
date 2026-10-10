// Rough energy and step estimates for a hike. These are textbook
// approximations, shown as such in the UI — not medical measurements.

export const DEFAULT_WEIGHT_KG = 70;
export const MIN_WEIGHT_KG = 30;
export const MAX_WEIGHT_KG = 250;

// Gross cost of walking on the flat at hiking pace, per kg and km.
const KCAL_PER_KG_PER_KM = 0.8;
// Climbing work (m·g·h) at ~25% muscular efficiency, in kcal per kg and metre.
const KCAL_PER_KG_PER_M_CLIMBED = 0.0094;
// Average hiking stride, so steps = distance / stride.
const STRIDE_M = 0.75;

export function estimateKcal(weightKg: number, distanceKm: number, elevationGainM: number): number {
  return Math.round(
    weightKg * (KCAL_PER_KG_PER_KM * distanceKm + KCAL_PER_KG_PER_M_CLIMBED * elevationGainM)
  );
}

export function estimateSteps(distanceKm: number): number {
  return Math.round((distanceKm * 1000) / STRIDE_M);
}

export function clampWeight(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_WEIGHT_KG;
  return Math.min(MAX_WEIGHT_KG, Math.max(MIN_WEIGHT_KG, Math.round(value)));
}
