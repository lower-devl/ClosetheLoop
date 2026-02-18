# The Coil MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a vanilla JS + p5.js productivity tool where tasks manifest as distortions in a living spiral

**Architecture:** Single-page app with p5.js canvas rendering a logarithmic spiral. Tasks create "thorns" (radial spikes) that jitter with Perlin noise based on task age. localStorage persistence. No build step.

**Tech Stack:** p5.js (CDN), vanilla JavaScript, localStorage, Web Audio API

---

## Task 1: Project Structure & HTML Foundation

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/` (directory)

**Step 1: Create HTML with p5.js CDN**

Create `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Coil</title>
    <link rel="stylesheet" href="css/style.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
</head>
<body>
    <div id="canvas-container"></div>
    <div id="ui">
        <input type="text" id="task-input" placeholder="Seed a new loop..." autocomplete="off">
    </div>
    <script src="js/utils.js"></script>
    <script src="js/audio.js"></script>
    <script src="js/tasks.js"></script>
    <script src="js/sketch.js"></script>
</body>
</html>
```

**Step 2: Create base CSS with parchment aesthetic**

Create `css/style.css`:
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    background-color: #F4F1EA;
    font-family: 'Courier New', monospace;
    overflow: hidden;
    position: relative;
}

#canvas-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
}

#ui {
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
}

#task-input {
    background: transparent;
    border: none;
    border-bottom: 2px solid #000;
    color: #000;
    font-size: 18px;
    padding: 10px;
    width: 300px;
    text-align: center;
    outline: none;
    font-family: 'Courier New', monospace;
}

#task-input::placeholder {
    color: #666;
}

#task-input:focus {
    border-bottom-color: #333;
}
```

**Step 3: Create empty JS files**

Create empty files:
- `js/utils.js`
- `js/audio.js`
- `js/tasks.js`
- `js/sketch.js`

**Step 4: Test basic structure**

Open `index.html` in browser (or serve with `python3 -m http.server 8000`)
Expected: Page loads with parchment background and input field at bottom

**Step 5: Commit**

```bash
git add index.html css/style.css js/
git commit -m "feat: project structure and HTML foundation"
```

---

## Task 2: Perlin Noise Utility

**Files:**
- Create: `js/utils.js`

**Step 1: Implement Perlin noise function**

Create `js/utils.js`:
```javascript
// Perlin noise implementation for jitter effects
class PerlinNoise {
    constructor() {
        this.perm = new Uint8Array(512);
        this.p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) this.p[i] = i;
        
        // Shuffle
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }
        
        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
        }
    }
    
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    lerp(t, a, b) {
        return a + t * (b - a);
    }
    
    grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
    }
    
    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        const A = this.perm[X] + Y;
        const B = this.perm[X + 1] + Y;
        
        return this.lerp(v,
            this.lerp(u, this.grad(this.perm[A], x, y), this.grad(this.perm[B], x - 1, y)),
            this.lerp(u, this.grad(this.perm[A + 1], x, y - 1), this.grad(this.perm[B + 1], x - 1, y - 1))
        );
    }
}

// Global instance
const perlin = new PerlinNoise();

// Utility: Generate UUID
function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Utility: Get timestamp
function now() {
    return Date.now();
}
```

**Step 2: Test Perlin noise**

Add temporary test to `js/utils.js` bottom:
```javascript
// Test
console.log('Perlin noise test:', perlin.noise(1.5, 2.5));
```

Open browser console
Expected: See a float value between -1 and 1

**Step 3: Remove test and commit**

Remove the test code, then:
```bash
git add js/utils.js
git commit -m "feat: add Perlin noise utility and helpers"
```

---

## Task 3: Task Management System

**Files:**
- Create: `js/tasks.js`

**Step 1: Implement task CRUD with localStorage**

Create `js/tasks.js`:
```javascript
// Task Management System
const STORAGE_KEY = 'coil-tasks';

// Load tasks from localStorage
function loadTasks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Save tasks to localStorage
function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Get all tasks
function getAllTasks() {
    return loadTasks();
}

// Get open (incomplete) tasks
function getOpenTasks() {
    return loadTasks().filter(t => !t.completedAt);
}

// Get completed tasks
function getCompletedTasks() {
    return loadTasks().filter(t => t.completedAt);
}

// Add new task
function addTask(text) {
    const tasks = loadTasks();
    const openCount = tasks.filter(t => !t.completedAt).length;
    
    const task = {
        id: generateId(),
        text: text.trim(),
        createdAt: now(),
        completedAt: null,
        angle: (openCount * 0.8) % (Math.PI * 2), // Distribute around spiral
        intensity: 1.0
    };
    
    tasks.push(task);
    saveTasks(tasks);
    
    // Play sound
    if (window.audioManager) {
        window.audioManager.playScratch();
    }
    
    return task;
}

// Complete a task
function completeTask(id) {
    const tasks = loadTasks();
    const task = tasks.find(t => t.id === id);
    
    if (task && !task.completedAt) {
        task.completedAt = now();
        saveTasks(tasks);
        
        // Play sound
        if (window.audioManager) {
            window.audioManager.playThrum();
        }
        
        return true;
    }
    return false;
}

// Delete a task
function deleteTask(id) {
    const tasks = loadTasks().filter(t => t.id !== id);
    saveTasks(tasks);
}

// Calculate task age in hours
function getTaskAgeHours(task) {
    const age = now() - task.createdAt;
    return age / (1000 * 60 * 60);
}

// Get jitter intensity for a task (increases with age)
function getJitterIntensity(task) {
    if (task.completedAt) return 0;
    const age = getTaskAgeHours(task);
    return Math.min(age * 0.1, 5) * task.intensity; // Max 5x intensity
}

// Export for global access
window.taskManager = {
    loadTasks,
    saveTasks,
    getAllTasks,
    getOpenTasks,
    getCompletedTasks,
    addTask,
    completeTask,
    deleteTask,
    getTaskAgeHours,
    getJitterIntensity
};
```

**Step 2: Test task system in browser console**

Open browser, open console:
```javascript
taskManager.addTask('Test task');
console.log(taskManager.getOpenTasks());
taskManager.completeTask(taskManager.getOpenTasks()[0].id);
console.log(taskManager.getCompletedTasks());
```

Expected: Tasks add, complete, and persist in localStorage

**Step 3: Commit**

```bash
git add js/tasks.js
git commit -m "feat: implement task CRUD with localStorage persistence"
```

---

## Task 4: Audio System

**Files:**
- Create: `js/audio.js`

**Step 1: Implement Web Audio API sounds**

Create `js/audio.js`:
```javascript
// Audio System - Procedural sound effects
class AudioManager {
    constructor() {
        this.ctx = null;
        this.initialized = false;
    }
    
    init() {
        if (!this.initialized) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        }
    }
    
    // Sharp scratch sound for adding tasks
    playScratch() {
        this.init();
        if (!this.ctx) return;
        
        const t = this.ctx.currentTime;
        
        // White noise buffer
        const bufferSize = this.ctx.sampleRate * 0.1; // 100ms
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        // Filter for scratch character
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        noise.start(t);
        noise.stop(t + 0.1);
    }
    
    // Deep thrum sound for completing tasks
    playThrum() {
        this.init();
        if (!this.ctx) return;
        
        const t = this.ctx.currentTime;
        
        // Oscillator for thrum
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(t);
        osc.stop(t + 0.3);
    }
}

// Global instance
window.audioManager = new AudioManager();
```

**Step 2: Test audio (requires user interaction)**

Add temporary test button to `index.html` inside `<body>`:
```html
<button onclick="window.audioManager.playScratch()" style="position:fixed;top:10px;left:10px;z-index:100;">Test Scratch</button>
<button onclick="window.audioManager.playThrum()" style="position:fixed;top:40px;left:10px;z-index:100;">Test Thrum</button>
```

Click buttons
Expected: Hear scratch and thrum sounds

**Step 3: Remove test buttons and commit**

Remove test buttons, then:
```bash
git add js/audio.js
git commit -m "feat: add procedural audio system with scratch and thrum sounds"
```

---

## Task 5: Basic Spiral Rendering

**Files:**
- Create: `js/sketch.js`

**Step 1: Implement p5.js spiral**

Create `js/sketch.js`:
```javascript
// p5.js Sketch - The Living Spiral

let canvas;
let centerX, centerY;
let spiralPoints = [];

function setup() {
    const container = document.getElementById('canvas-container');
    canvas = createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent('canvas-container');
    
    centerX = width / 2;
    centerY = height / 2;
    
    // Handle window resize
    window.addEventListener('resize', () => {
        resizeCanvas(container.offsetWidth, container.offsetHeight);
        centerX = width / 2;
        centerY = height / 2;
    });
    
    // Setup input handler
    setupInputHandler();
}

function draw() {
    background(244, 241, 234); // #F4F1EA parchment
    
    // Calculate spiral points
    calculateSpiral();
    
    // Draw the spiral
    drawSpiral();
    
    // Draw task thorns
    drawThorns();
}

function calculateSpiral() {
    spiralPoints = [];
    
    const a = 5; // Starting radius
    const b = 0.15; // Growth rate
    const maxTheta = Math.PI * 8; // 4 full rotations
    const steps = 500;
    
    for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * maxTheta;
        const r = a * Math.exp(b * theta);
        
        const x = centerX + r * Math.cos(theta);
        const y = centerY + r * Math.sin(theta);
        
        spiralPoints.push({ x, y, theta, r });
    }
}

function drawSpiral() {
    stroke(0);
    strokeWeight(2);
    noFill();
    
    beginShape();
    for (let i = 0; i < spiralPoints.length - 1; i++) {
        const p1 = spiralPoints[i];
        const p2 = spiralPoints[i + 1];
        
        // Variable line weight based on velocity
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const velocity = Math.sqrt(dx * dx + dy * dy);
        const weight = map(velocity, 0, 50, 3, 1, true);
        
        strokeWeight(weight);
        line(p1.x, p1.y, p2.x, p2.y);
    }
    endShape();
}

function drawThorns() {
    const tasks = window.taskManager ? window.taskManager.getOpenTasks() : [];
    
    tasks.forEach(task => {
        // Find point on spiral closest to task angle
        const taskPoint = getPointAtAngle(task.angle);
        if (!taskPoint) return;
        
        // Calculate jitter
        const jitterIntensity = window.taskManager.getJitterIntensity(task);
        const jitterX = perlin.noise(frameCount * 0.02, task.angle) * jitterIntensity * 5;
        const jitterY = perlin.noise(task.angle, frameCount * 0.02) * jitterIntensity * 5;
        
        // Draw thorn
        const thornLength = 20 + jitterIntensity * 5;
        const endX = taskPoint.x + Math.cos(task.angle) * thornLength + jitterX;
        const endY = taskPoint.y + Math.sin(task.angle) * thornLength + jitterY;
        
        stroke(0);
        strokeWeight(2);
        line(taskPoint.x, taskPoint.y, endX, endY);
        
        // Draw task dot
        fill(0);
        noStroke();
        ellipse(taskPoint.x, taskPoint.y, 8, 8);
    });
}

function getPointAtAngle(angle) {
    // Normalize angle
    while (angle < 0) angle += Math.PI * 2;
    while (angle > Math.PI * 2) angle -= Math.PI * 2;
    
    // Find closest point
    let closest = null;
    let minDiff = Infinity;
    
    for (let p of spiralPoints) {
        const diff = Math.abs(p.theta - angle);
        if (diff < minDiff) {
            minDiff = diff;
            closest = p;
        }
    }
    
    return closest;
}

function setupInputHandler() {
    const input = document.getElementById('task-input');
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            window.taskManager.addTask(input.value);
            input.value = '';
        }
    });
}
```

**Step 2: Test spiral rendering**

Open browser
Expected: See a black logarithmic spiral on parchment background

**Step 3: Commit**

```bash
git add js/sketch.js
git commit -m "feat: implement basic logarithmic spiral rendering with p5.js"
```

---

## Task 6: Task Interaction (Click to Complete)

**Files:**
- Modify: `js/sketch.js`

**Step 1: Add mouse interaction for completing tasks**

Add to end of `js/sketch.js`:
```javascript
function mousePressed() {
    // Check if clicked on a task thorn
    const tasks = window.taskManager.getOpenTasks();
    
    for (let task of tasks) {
        const taskPoint = getPointAtAngle(task.angle);
        if (!taskPoint) continue;
        
        // Check distance to thorn
        const d = dist(mouseX, mouseY, taskPoint.x, taskPoint.y);
        if (d < 20) {
            // Complete the task
            window.taskManager.completeTask(task.id);
            return;
        }
    }
}

function dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}
```

**Step 2: Add visual feedback for completed tasks**

Modify `drawThorns()` to show completed tasks:
```javascript
function drawThorns() {
    const allTasks = window.taskManager ? window.taskManager.getAllTasks() : [];
    
    allTasks.forEach(task => {
        const taskPoint = getPointAtAngle(task.angle);
        if (!taskPoint) return;
        
        if (task.completedAt) {
            // Draw completed task at center (migrating inward)
            drawCompletedTask(task, taskPoint);
        } else {
            // Draw open task thorn
            drawOpenTask(task, taskPoint);
        }
    });
}

function drawOpenTask(task, point) {
    const jitterIntensity = window.taskManager.getJitterIntensity(task);
    const jitterX = perlin.noise(frameCount * 0.02, task.angle) * jitterIntensity * 5;
    const jitterY = perlin.noise(task.angle, frameCount * 0.02) * jitterIntensity * 5;
    
    const thornLength = 20 + jitterIntensity * 5;
    const endX = point.x + Math.cos(task.angle) * thornLength + jitterX;
    const endY = point.y + Math.sin(task.angle) * thornLength + jitterY;
    
    stroke(0);
    strokeWeight(2);
    line(point.x, point.y, endX, endY);
    
    fill(0);
    noStroke();
    ellipse(point.x, point.y, 8, 8);
}

function drawCompletedTask(task, originalPoint) {
    // Calculate inward migration based on time since completion
    const timeSinceCompletion = (Date.now() - task.completedAt) / 1000;
    const migrationProgress = Math.min(timeSinceCompletion / 2, 1); // 2 seconds to migrate
    
    // Interpolate between original position and center
    const x = lerp(originalPoint.x, centerX, migrationProgress);
    const y = lerp(originalPoint.y, centerY, migrationProgress);
    
    // Draw as part of core
    const coreSize = 4 + migrationProgress * 4;
    fill(0);
    noStroke();
    ellipse(x, y, coreSize, coreSize);
}

function lerp(start, end, t) {
    return start + (end - start) * t;
}
```

**Step 3: Test interactions**

1. Add a task via input field
2. Click on the thorn
3. Expected: Task completes, plays thrum sound, migrates to center

**Step 4: Commit**

```bash
git add js/sketch.js
git commit -m "feat: add click-to-complete interaction and task migration animation"
```

---

## Task 7: Polish & Visual Refinements

**Files:**
- Modify: `js/sketch.js`
- Modify: `css/style.css`

**Step 1: Add parchment texture overlay**

Add to `css/style.css`:
```css
body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.03;
    pointer-events: none;
    z-index: 2;
}
```

**Step 2: Improve spiral smoothness and add ink bleed effect**

Modify `drawSpiral()` in `js/sketch.js`:
```javascript
function drawSpiral() {
    // Draw multiple passes for ink bleed effect
    for (let pass = 0; pass < 3; pass++) {
        const alpha = pass === 0 ? 255 : (pass === 1 ? 100 : 40);
        const offset = pass === 0 ? 0 : (pass === 1 ? 1 : -1);
        
        for (let i = 0; i < spiralPoints.length - 1; i++) {
            const p1 = spiralPoints[i];
            const p2 = spiralPoints[i + 1];
            
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const velocity = Math.sqrt(dx * dx + dy * dy);
            const weight = map(velocity, 0, 50, 3, 1, true);
            
            stroke(0, alpha);
            strokeWeight(weight + pass * 0.5);
            line(p1.x + offset, p1.y + offset, p2.x + offset, p2.y + offset);
        }
    }
}
```

**Step 3: Add task counter display**

Add to `index.html` inside `<body>`:
```html
<div id="task-counter">Open Loops: <span id="open-count">0</span></div>
```

Add to `css/style.css`:
```css
#task-counter {
    position: fixed;
    top: 20px;
    right: 20px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    color: #000;
    z-index: 10;
}
```

Add to `js/sketch.js` in `draw()`:
```javascript
function draw() {
    background(244, 241, 234);
    
    // Update counter
    const openTasks = window.taskManager ? window.taskManager.getOpenTasks().length : 0;
    document.getElementById('open-count').textContent = openTasks;
    
    calculateSpiral();
    drawSpiral();
    drawThorns();
}
```

**Step 4: Test complete flow**

1. Add multiple tasks
2. Verify counter updates
3. Complete some tasks
4. Verify visual feedback (migration, sounds)
5. Refresh page - verify persistence

**Step 5: Commit**

```bash
git add index.html css/style.css js/sketch.js
git commit -m "feat: add parchment texture, ink bleed effect, and task counter"
```

---

## Task 8: Final Integration & Testing

**Files:**
- Modify: All files as needed for integration

**Step 1: Ensure audio initializes on first interaction**

Modify `js/sketch.js` setup:
```javascript
function setup() {
    const container = document.getElementById('canvas-container');
    canvas = createCanvas(container.offsetWidth, container.offsetHeight);
    canvas.parent('canvas-container');
    
    centerX = width / 2;
    centerY = height / 2;
    
    window.addEventListener('resize', () => {
        resizeCanvas(container.offsetWidth, container.offsetHeight);
        centerX = width / 2;
        centerY = height / 2;
    });
    
    setupInputHandler();
    
    // Initialize audio on first click anywhere
    document.addEventListener('click', () => {
        if (window.audioManager) {
            window.audioManager.init();
        }
    }, { once: true });
}
```

**Step 2: Add keyboard shortcut (ESC to clear input)**

Add to `setupInputHandler()`:
```javascript
function setupInputHandler() {
    const input = document.getElementById('task-input');
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            window.taskManager.addTask(input.value);
            input.value = '';
        }
    });
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            input.value = '';
            input.blur();
        }
    });
}
```

**Step 3: Final manual testing checklist**

- [ ] Page loads with spiral visible
- [ ] Can add tasks via input field
- [ ] Tasks appear as thorns on spiral
- [ ] Thorns jitter more as tasks age
- [ ] Can click thorns to complete tasks
- [ ] Completed tasks migrate to center
- [ ] Sounds play on add/complete
- [ ] Tasks persist after refresh
- [ ] Counter shows correct open task count
- [ ] Visual style matches Uzumaki aesthetic

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete The Coil MVP with full integration"
```

---

## Summary

This plan implements the complete Phase 1 MVP:

1. **Week 1** (Tasks 1-2): Project structure, Perlin noise
2. **Week 2** (Tasks 3-4): Task system, audio
3. **Week 3** (Tasks 5-6): Spiral rendering, interactions
4. **Week 4** (Tasks 7-8): Polish, integration

Total estimated time: 4-6 hours of focused implementation.
