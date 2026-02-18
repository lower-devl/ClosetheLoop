# The Coil MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a spiral-based task manager with Uzumaki horror aesthetic - tasks appear as distortion nodes on a living, jittering spiral.

**Architecture:** Single p5.js canvas wrapped in React. React handles state (useTaskStore hook) and minimal UI chrome. All spiral rendering happens in one sketch file using logarithmic spiral math with Perlin noise jitter.

**Tech Stack:** React, Vite, p5.js, localStorage, Web Audio API

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`

**Step 1: Initialize Vite project**

Run: `npm create vite@latest . -- --template react`
Expected: Vite scaffolds React project

**Step 2: Install dependencies**

Run: `npm install p5 react-p5 uuid`
Expected: Packages installed successfully

**Step 3: Verify setup**

Run: `npm run dev`
Expected: Dev server starts at localhost:5173

**Step 4: Commit**

```bash
git add .
git commit -m "chore: init Vite + React + p5.js project"
```

---

## Task 2: Spiral Math Utilities

**Files:**
- Create: `src/utils/spiralMath.js`
- Create: `src/utils/noise.js`

**Step 1: Write spiral math utilities**

```javascript
// src/utils/spiralMath.js

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
  return ageRatio * 20 // Max 20 pixels distortion
}
```

**Step 2: Write Perlin noise wrapper**

```javascript
// src/utils/noise.js

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
```

**Step 3: Commit**

```bash
git add src/utils/
git commit -m "feat: add spiral math and noise utilities"
```

---

## Task 3: Task Store Hook

**Files:**
- Create: `src/hooks/useTaskStore.js`
- Create: `src/utils/storage.js`

**Step 1: Write localStorage wrapper**

```javascript
// src/utils/storage.js

const STORAGE_KEY = 'the-coil-tasks'

export function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.error('Failed to save tasks:', e)
  }
}
```

**Step 2: Write task store hook**

```javascript
// src/hooks/useTaskStore.js

import { useState, useEffect, useCallback } from 'react'
import { loadTasks, saveTasks } from '../utils/storage.js'

export function useTaskStore() {
  const [tasks, setTasks] = useState(() => loadTasks())

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const addTask = useCallback((text) => {
    const newTask = {
      id: crypto.randomUUID(),
      text,
      createdAt: Date.now(),
      completedAt: null,
      angle: Math.random() * Math.PI * 2 * 4 // Random angle within 4 turns
    }
    setTasks(prev => [...prev, newTask])
    return newTask
  }, [])

  const completeTask = useCallback((id) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, completedAt: Date.now() }
        : task
    ))
  }, [])

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(task => task.id !== id))
  }, [])

  const getOpenTasks = useCallback(() => 
    tasks.filter(t => !t.completedAt), [tasks])

  const getCompletedTasks = useCallback(() => 
    tasks.filter(t => t.completedAt), [tasks])

  return {
    tasks,
    addTask,
    completeTask,
    deleteTask,
    getOpenTasks,
    getCompletedTasks
  }
}
```

**Step 3: Commit**

```bash
git add src/hooks/ src/utils/storage.js
git commit -m "feat: add task store with localStorage persistence"
```

---

## Task 4: Basic Spiral Canvas

**Files:**
- Create: `src/sketch/spiralSketch.js`
- Create: `src/components/SpiralCanvas.jsx`

**Step 1: Write spiral sketch factory**

```javascript
// src/sketch/spiralSketch.js

import { generateSpiralPoints } from '../utils/spiralMath.js'

export function createSpiralSketch(getTasks, onCompleteTask) {
  return (p) => {
    let centerX, centerY

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
      p.background(244, 241, 234) // Aged parchment
      
      const tasks = getTasks()
      const points = generateSpiralPoints(4, 100, 8, 0.12)
      
      // Scale to fit canvas
      const scale = Math.min(p.width, p.height) / 300
      
      p.stroke(0)
      p.strokeWeight(2)
      p.noFill()
      
      p.beginShape()
      for (const point of points) {
        const x = centerX + point.x * scale
        const y = centerY + point.y * scale
        p.vertex(x, y)
      }
      p.endShape()

      // Draw task nodes
      drawTaskNodes(p, tasks, centerX, centerY, scale, onCompleteTask)
    }
  }
}

function drawTaskNodes(p, tasks, centerX, centerY, scale, onCompleteTask) {
  const openTasks = tasks.filter(t => !t.completedAt)
  
  for (const task of openTasks) {
    const r = 8 * Math.exp(0.12 * task.angle) * scale
    const x = centerX + r * Math.cos(task.angle)
    const y = centerY + r * Math.sin(task.angle)
    
    // Check hover
    const d = p.dist(p.mouseX, p.mouseY, x, y)
    const isHovered = d < 15
    
    p.stroke(0)
    p.strokeWeight(isHovered ? 3 : 2)
    p.fill(isHovered ? 50 : 0)
    
    p.circle(x, y, 12)
    
    // Tooltip on hover
    if (isHovered) {
      p.fill(0)
      p.noStroke()
      p.textSize(12)
      p.text(task.text, x + 15, y + 4)
      
      // Click to complete
      if (p.mouseIsPressed) {
        onCompleteTask(task.id)
      }
    }
  }
}
```

**Step 2: Write React wrapper**

```javascript
// src/components/SpiralCanvas.jsx

import { useRef, useEffect } from 'react'
import p5 from 'p5'
import { createSpiralSketch } from '../sketch/spiralSketch.js'

export function SpiralCanvas({ tasks, onCompleteTask }) {
  const containerRef = useRef(null)
  const p5Ref = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const sketch = createSpiralSketch(() => tasks, onCompleteTask)
    p5Ref.current = new p5(sketch, containerRef.current)

    return () => {
      if (p5Ref.current) {
        p5Ref.current.remove()
      }
    }
  }, [])

  // Update sketch when tasks change
  useEffect(() => {
    if (p5Ref.current) {
      p5Ref.current.updateTasks?.(tasks)
    }
  }, [tasks])

  return <div ref={containerRef} className="spiral-canvas" />
}
```

**Step 3: Update App.jsx**

```javascript
// src/App.jsx

import { SpiralCanvas } from './components/SpiralCanvas.jsx'
import { TaskInput } from './components/TaskInput.jsx'
import { useTaskStore } from './hooks/useTaskStore.js'

import './App.css'

export function App() {
  const { tasks, addTask, completeTask } = useTaskStore()

  return (
    <div className="app">
      <SpiralCanvas tasks={tasks} onCompleteTask={completeTask} />
      <TaskInput onSubmit={addTask} />
    </div>
  )
}
```

**Step 4: Create placeholder TaskInput**

```javascript
// src/components/TaskInput.jsx

import { useState } from 'react'

export function TaskInput({ onSubmit }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim()) {
      onSubmit(text.trim())
      setText('')
    }
  }

  return (
    <form className="task-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's haunting you?"
        autoFocus
      />
      <button type="submit">+</button>
    </form>
  )
}
```

**Step 5: Add CSS**

```css
/* src/App.css */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Courier New', monospace;
  background: #F4F1EA;
  overflow: hidden;
}

.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.spiral-canvas {
  flex: 1;
}

.spiral-canvas canvas {
  display: block;
}

.task-input {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #F4F1EA;
  border-top: 2px solid #000;
  display: flex;
  gap: 8px;
}

.task-input input {
  flex: 1;
  padding: 8px 12px;
  font-size: 16px;
  font-family: inherit;
  border: 2px solid #000;
  background: #F4F1EA;
  outline: none;
}

.task-input input:focus {
  background: #FFF;
}

.task-input button {
  padding: 8px 16px;
  font-size: 20px;
  font-weight: bold;
  border: 2px solid #000;
  background: #000;
  color: #F4F1EA;
  cursor: pointer;
}

.task-input button:hover {
  background: #333;
}
```

**Step 6: Test basic functionality**

Run: `npm run dev`
Expected: Spiral renders, can add tasks, can click to complete

**Step 7: Commit**

```bash
git add src/
git commit -m "feat: add basic spiral canvas with task nodes"
```

---

## Task 5: Distortion Algorithm

**Files:**
- Modify: `src/sketch/spiralSketch.js`
- Modify: `src/utils/spiralMath.js`

**Step 1: Add distortion calculation to spiralMath**

```javascript
// Add to src/utils/spiralMath.js

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
```

**Step 2: Update spiralSketch to use distortion**

```javascript
// Update imports in src/sketch/spiralSketch.js
import { generateSpiralPoints, injectDistortion, calculateDistortion } from '../utils/spiralMath.js'

// Update p.draw():
const points = generateSpiralPoints(4, 100, 8, 0.12)
const distortedPoints = injectDistortion(points, tasks, calculateDistortion)

// Use distortedPoints instead of points in vertex loop
```

**Step 3: Test distortion**

Run: `npm run dev`
Add a task, wait 30 seconds, see thorn grow

**Step 4: Commit**

```bash
git add src/
git commit -m "feat: add distortion algorithm for task nodes"
```

---

## Task 6: Perlin Noise Jitter

**Files:**
- Modify: `src/sketch/spiralSketch.js`
- Modify: `src/utils/noise.js`

**Step 1: Update noise.js to use p5 noise**

```javascript
// Update src/utils/noise.js

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
```

**Step 2: Apply jitter to open task segments**

```javascript
// Update src/sketch/spiralSketch.js

// In createSpiralSketch, add:
let noiseHandler

p.setup = () => {
  p.createCanvas(p.windowWidth, p.windowHeight - 60)
  centerX = p.width / 2
  centerY = p.height / 2
  noiseHandler = createNoiseHandler(p)
}

p.draw = () => {
  noiseHandler.incrementNoiseOffset(0.02)
  // ... rest of draw
}

// In vertex loop for open segments:
const jitterIntensity = 2 // pixels
const jitteredX = noiseHandler.applyJitter(x, jitterIntensity, point.x * 0.01)
const jitteredY = noiseHandler.applyJitter(y, jitterIntensity, point.y * 0.01)
p.vertex(jitteredX, jitteredY)
```

**Step 3: Test jitter**

Run: `npm run dev`
Expected: Open task segments wobble organically

**Step 4: Commit**

```bash
git add src/
git commit -m "feat: add Perlin noise jitter for procrastination effect"
```

---

## Task 7: Inky Aesthetic

**Files:**
- Modify: `src/sketch/spiralSketch.js`

**Step 1: Add variable stroke weight**

```javascript
// In p.draw(), before beginShape():

const totalPoints = distortedPoints.length

p.beginShape()
for (let i = 0; i < distortedPoints.length; i++) {
  const point = distortedPoints[i]
  const x = centerX + point.x * scale
  const y = centerY + point.y * scale
  
  // Variable weight: thick at center, thin at edges
  const progress = i / totalPoints
  const weight = 1 + (1 - progress) * 3 // 4 at start, 1 at end
  p.strokeWeight(weight)
  
  p.vertex(x, y)
}
p.endShape()
```

**Step 2: Add ink bleed effect on task nodes**

```javascript
// In drawTaskNodes:

// Before drawing main circle, draw fuzzy "bleed"
p.noStroke()
for (let i = 0; i < 3; i++) {
  p.fill(0, 0, 0, 30 - i * 10)
  const bleedSize = 12 + i * 4 + p.random(-2, 2)
  p.circle(x + p.random(-1, 1), y + p.random(-1, 1), bleedSize)
}

// Then draw sharp main circle
p.stroke(0)
p.strokeWeight(isHovered ? 3 : 2)
p.fill(isHovered ? 50 : 0)
p.circle(x, y, 12)
```

**Step 3: Test inky effect**

Run: `npm run dev`
Expected: Spiral has variable line weight, nodes have soft ink bleed

**Step 4: Commit**

```bash
git add src/
git commit -m "feat: add inky aesthetic with variable stroke and bleed"
```

---

## Task 8: Complete Task Animation

**Files:**
- Modify: `src/sketch/spiralSketch.js`
- Create: `src/utils/animations.js`

**Step 1: Create animation utilities**

```javascript
// src/utils/animations.js

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
```

**Step 2: Add completion animation to sketch**

```javascript
// Add to createSpiralSketch:

const animations = []
let completingTaskId = null
let slashProgress = 0

const onCompleteTaskWithAnimation = (taskId) => {
  completingTaskId = taskId
  slashProgress = 0
  
  animations.push(createAnimation(
    400,
    (progress) => { slashProgress = easeOutCubic(progress) },
    () => {
      onCompleteTask(taskId)
      completingTaskId = null
    }
  ))
}

// In p.draw():
for (let i = animations.length - 1; i >= 0; i--) {
  if (!animations[i].update()) {
    animations.splice(i, 1)
  }
}

// Draw slash animation for completing task
if (completingTaskId) {
  const task = tasks.find(t => t.id === completingTaskId)
  if (task) {
    const r = 8 * Math.exp(0.12 * task.angle) * scale
    const x = centerX + r * Math.cos(task.angle)
    const y = centerY + r * Math.sin(task.angle)
    
    p.stroke(200, 0, 0)
    p.strokeWeight(3 * slashProgress)
    const slashLen = 20 * slashProgress
    p.line(x - slashLen, y - slashLen, x + slashLen, y + slashLen)
  }
}
```

**Step 3: Test animation**

Run: `npm run dev`
Click task, see slash animation, task disappears

**Step 4: Commit**

```bash
git add src/
git commit -m "feat: add task completion slash animation"
```

---

## Task 9: Snap-Back Animation

**Files:**
- Modify: `src/sketch/spiralSketch.js`

**Step 1: Add spiral morph targets**

```javascript
// In createSpiralSketch:

let morphProgress = 1
let targetPoints = []
let currentPoints = []

// After task completion:
morphProgress = 0
targetPoints = generateSpiralPoints(4, 100, 8, 0.12)

// In p.draw():
if (morphProgress < 1) {
  morphProgress += 0.02
  const easedProgress = easeOutCubic(morphProgress)
  
  // Interpolate currentPoints toward targetPoints
  currentPoints = currentPoints.map((point, i) => ({
    x: point.x + (targetPoints[i].x - point.x) * easedProgress,
    y: point.y + (targetPoints[i].y - point.y) * easedProgress
  }))
}
```

**Step 2: Test snap-back**

Run: `npm run dev`
Complete task, see spiral smoothly adjust

**Step 3: Commit**

```bash
git add src/
git commit -m "feat: add spiral snap-back animation"
```

---

## Task 10: Thrum Sound

**Files:**
- Create: `src/utils/audio.js`
- Modify: `src/App.jsx`

**Step 1: Create audio utility**

```javascript
// src/utils/audio.js

let audioContext = null

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

export function playThrum() {
  const ctx = getAudioContext()
  
  // Create oscillator for deep thrum
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  
  osc.type = 'sine'
  osc.frequency.setValueAtTime(80, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5)
  
  gain.gain.setValueAtTime(0.5, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
  
  osc.connect(gain)
  gain.connect(ctx.destination)
  
  osc.start()
  osc.stop(ctx.currentTime + 0.5)
}
```

**Step 2: Integrate with task completion**

```javascript
// In src/App.jsx

import { playThrum } from './utils/audio.js'

export function App() {
  const { tasks, addTask, completeTask } = useTaskStore()

  const handleCompleteTask = (id) => {
    completeTask(id)
    playThrum()
  }

  return (
    <div className="app">
      <SpiralCanvas tasks={tasks} onCompleteTask={handleCompleteTask} />
      <TaskInput onSubmit={addTask} />
    </div>
  )
}
```

**Step 3: Test audio**

Run: `npm run dev`
Complete task, hear deep thrum

**Step 4: Commit**

```bash
git add src/
git commit -m "feat: add thrum sound on task completion"
```

---

## Task 11: Delete Task (Right-Click)

**Files:**
- Modify: `src/sketch/spiralSketch.js`
- Modify: `src/App.jsx`

**Step 1: Add right-click handler**

```javascript
// In createSpiralSketch, add onDeleteTask parameter:

export function createSpiralSketch(getTasks, onCompleteTask, onDeleteTask) {

// In drawTaskNodes, after hover check:

p.canvas.oncontextmenu = (e) => {
  e.preventDefault()
  if (isHovered) {
    onDeleteTask(task.id)
  }
}
```

**Step 2: Pass through from App**

```javascript
// In App.jsx

const { tasks, addTask, completeTask, deleteTask } = useTaskStore()

return (
  <SpiralCanvas 
    tasks={tasks} 
    onCompleteTask={handleCompleteTask}
    onDeleteTask={deleteTask}
  />
)
```

**Step 3: Test delete**

Run: `npm run dev`
Right-click task, it disappears

**Step 4: Commit**

```bash
git add src/
git commit -m "feat: add right-click delete for tasks"
```

---

## Task 12: Final Polish

**Files:**
- Modify: `src/App.css`
- Modify: `index.html`

**Step 1: Update page title**

```html
<!-- index.html -->
<title>The Coil - Close Your Loops</title>
```

**Step 2: Add hover cursor styles**

```css
/* Add to src/App.css */

.spiral-canvas canvas {
  cursor: crosshair;
}

.task-input input {
  cursor: text;
}

.task-input button {
  cursor: pointer;
}
```

**Step 3: Test full flow**

Run: `npm run dev`
- Add tasks
- Watch them jitter
- Click to complete (thrum + slash)
- Right-click to delete
- Refresh (tasks persist)

**Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete MVP - The Coil spiral task manager"
```

---

## Verification Checklist

Run through all features:

- [ ] Spiral renders on page load
- [ ] Can add tasks via input
- [ ] Tasks appear as nodes on spiral
- [ ] Nodes have ink bleed effect
- [ ] Open task segments jitter
- [ ] Older tasks have larger distortion spikes
- [ ] Hover shows task text
- [ ] Click completes task with slash animation
- [ ] Thrum sound plays on completion
- [ ] Spiral snaps back after completion
- [ ] Right-click deletes task
- [ ] Tasks persist across refresh
- [ ] Responsive to window resize
