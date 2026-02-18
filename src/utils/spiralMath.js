export function logarithmicSpiral(theta, a = 1, b = 0.15) {
  return a * Math.exp(b * theta)
}

export function spiralToCartesian(theta, a = 1, b = 0.15, centerX = 0, centerY = 0) {
  const r = logarithmicSpiral(theta, a, b)
  return {
    x: centerX + r * Math.cos(theta),
    y: centerY + r * Math.sin(theta)
  }
}

export function generateSpiralPoints(turns = 4, pointsPerTurn = 100, a = 1, b = 0.15) {
  const points = []
  const totalPoints = turns * pointsPerTurn
  
  for (let i = 0; i <= totalPoints; i++) {
    const theta = (i / pointsPerTurn) * Math.PI * 2
    points.push(spiralToCartesian(theta, a, b))
  }
  
  return points
}

export function calculateDistortion(taskAge, maxAge = 7 * 24 * 60 * 60 * 1000) {
  const ageRatio = Math.min(taskAge / maxAge, 1)
  return ageRatio * 20
}

export function injectDistortion(points, tasks, distortionFn) {
  const openTasks = tasks.filter(t => !t.completedAt)
  
  return points.map((point, index) => {
    const theta = (index / 100) * Math.PI * 2
    
    for (const task of openTasks) {
      const angleDiff = Math.abs(theta - task.angle)
      if (angleDiff < 0.3) {
        const age = Date.now() - task.createdAt
        const intensity = distortionFn(age)
        const influence = 1 - (angleDiff / 0.3)
        
        return {
          x: point.x + (Math.cos(theta + Math.PI/2) * intensity * influence),
          y: point.y + (Math.sin(theta + Math.PI/2) * intensity * influence)
        }
      }
    }
    
    return point
  })
}
