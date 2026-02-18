let noiseOffset = 0

export function getNoiseOffset() {
  return noiseOffset
}

export function incrementNoiseOffset(amount = 0.01) {
  noiseOffset += amount
}

export function applyJitter(value, intensity = 1, noiseFn) {
  if (!noiseFn) return value
  const noise = noiseFn(value * 0.1 + noiseOffset) * 2 - 1
  return value + noise * intensity
}
