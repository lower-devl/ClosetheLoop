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
