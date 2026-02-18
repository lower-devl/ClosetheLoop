import { generateSpiralPoints, injectDistortion, calculateDistortion } from '../utils/spiralMath.js'

export function createSpiralSketch(getTasks, onCompleteTask) {
  return (p) => {
    let centerX, centerY
    let wasMousePressed = false

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight - 60)
      centerX = p.width / 2
      centerY = p.height / 2
    }

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight - 60)
      centerX = p.width / 2
      centerY = p.height / 2
    }

    p.draw = () => {
      p.background(244, 241, 234)
      
      const tasks = getTasks()
      const points = generateSpiralPoints(4, 100, 8, 0.12)
      const distortedPoints = injectDistortion(points, tasks, calculateDistortion)
      
      const scale = Math.min(p.width, p.height) / 300
      
      p.stroke(0)
      p.strokeWeight(2)
      p.noFill()
      
      p.beginShape()
      for (const point of distortedPoints) {
        const x = centerX + point.x * scale
        const y = centerY + point.y * scale
        p.vertex(x, y)
      }
      p.endShape()

      drawTaskNodes(p, tasks, centerX, centerY, scale, onCompleteTask, wasMousePressed)
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
