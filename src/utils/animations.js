export function createAnimation(duration, onUpdate, onComplete) {
  const startTime = Date.now()
  let completed = false

  return {
    update() {
      if (completed) return false
      
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      onUpdate(progress)
      
      if (progress >= 1) {
        completed = true
        onComplete?.()
        return false
      }
      return true
    },
    isComplete: () => completed
  }
}

export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
