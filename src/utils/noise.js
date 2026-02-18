export function createNoiseHandler(p) {
  let noiseOffset = 0

  return {
    applyJitter(value, intensity = 1, seed = 0) {
      const noise = p.noise(seed + noiseOffset) * 2 - 1
      return value + noise * intensity
    },
    incrementNoiseOffset(amount = 0.01) {
      noiseOffset += amount
    }
  }
}
