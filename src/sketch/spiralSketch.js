import { generateSpiralPoints, injectDistortion, calculateDistortion } from '../utils/spiralMath.js'
import { createNoiseHandler } from '../utils/noise.js'
import { createAnimation, easeOutCubic } from '../utils/animations.js'

export function createSpiralSketch(getTasks, onCompleteTask) {
  const animations = []
  let completingTask = null
  let slashProgress = 0
  
  const onCompleteTaskWithAnimation = (taskId) => {
    const task = getTasks().find(t => t.id === taskId)
    if (task) {
      completingTask = { ...task }
      slashProgress = 0
      
      animations.push(createAnimation(
        400,
        (progress) => { slashProgress = easeOutCubic(progress) },
        () => {
          onCompleteTask(taskId)
          completingTask = null
        }
      ))
    }
  }
  
  return (p) => {
    let centerX, centerY
    let wasMousePressed = false
    let noiseHandler

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight - 60)
      centerX = p.width / 2
      centerY = p.height / 2
      noiseHandler = createNoiseHandler(p)
    }

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight - 60)
      centerX = p.width / 2
      centerY = p.height / 2
    }

    p.draw = () => {
      p.background(244, 241, 234)
      noiseHandler.incrementNoiseOffset(0.02)
      
      const tasks = getTasks()
      const points = generateSpiralPoints(4, 100, 8, 0.12)
      const distortedPoints = injectDistortion(points, tasks, calculateDistortion)
      
      const scale = Math.min(p.width, p.height) / 300
      
      p.stroke(0)
      p.noFill()
      
      const totalPoints = distortedPoints.length
      
      p.beginShape()
      for (let i = 0; i < distortedPoints.length; i++) {
        const point = distortedPoints[i]
        const x = centerX + point.x * scale
        const y = centerY + point.y * scale
        const jitterIntensity = 2
        const jitteredX = noiseHandler.applyJitter(x, jitterIntensity, point.x * 0.01)
        const jitteredY = noiseHandler.applyJitter(y, jitterIntensity, point.y * 0.01)
        
        const progress = i / totalPoints
        const weight = 1 + (1 - progress) * 3
        p.strokeWeight(weight)
        
        p.vertex(jitteredX, jitteredY)
      }
      p.endShape()

      drawTaskNodes(p, tasks, centerX, centerY, scale, onCompleteTaskWithAnimation, wasMousePressed)
      
      for (let i = animations.length - 1; i >= 0; i--) {
        if (!animations[i].update()) {
          animations.splice(i, 1)
        }
      }
      
      if (completingTask) {
        const r = 8 * Math.exp(0.12 * completingTask.angle) * scale
        const x = centerX + r * Math.cos(completingTask.angle)
        const y = centerY + r * Math.sin(completingTask.angle)
        
        p.stroke(200, 0, 0)
        p.strokeWeight(3 * slashProgress)
        const slashLen = 20 * slashProgress
        p.line(x - slashLen, y - slashLen, x + slashLen, y + slashLen)
      }
      
      wasMousePressed = p.mouseIsPressed
    }
  }
}

function drawTaskNodes(p, tasks, centerX, centerY, scale, onCompleteTask, wasMousePressed) {
  const openTasks = tasks.filter(t => !t.completedAt)
  
  for (const task of openTasks) {
    const r = 8 * Math.exp(0.12 * task.angle) * scale
    const x = centerX + r * Math.cos(task.angle)
    const y = centerY + r * Math.sin(task.angle)
    
    const d = p.dist(p.mouseX, p.mouseY, x, y)
    const isHovered = d < 15
    
    p.noStroke()
    for (let i = 0; i < 3; i++) {
      p.fill(0, 0, 0, 30 - i * 10)
      const bleedSize = 12 + i * 4 + p.random(-2, 2)
      p.circle(x + p.random(-1, 1), y + p.random(-1, 1), bleedSize)
    }
    
    p.stroke(0)
    p.strokeWeight(isHovered ? 3 : 2)
    p.fill(isHovered ? 50 : 0)
    
    p.circle(x, y, 12)
    
    if (isHovered) {
      p.fill(0)
      p.noStroke()
      p.textSize(12)
      p.text(task.text, x + 15, y + 4)
      
      if (p.mouseIsPressed && !wasMousePressed) {
        onCompleteTask(task.id)
      }
    }
  }
}
