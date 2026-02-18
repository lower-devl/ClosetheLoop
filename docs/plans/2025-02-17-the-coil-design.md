# Design Document: The Coil (Uzumaki-Inspired Loop Closer)

**Date:** 2025-02-17  
**Status:** Approved  
**Approach:** Vanilla JS + p5.js

---

## 1. Overview

A web-based productivity tool that visualizes unresolved tasks as distortions in a living spiral. Completing tasks "smooths" the spiral, creating a visceral psychological connection to task management through the Uzumaki aesthetic.

## 2. Architecture

Single-page application with no build step:

```
index.html      # Single HTML file with canvas container
css/style.css   # Inky aesthetic, parchment texture
js/
  sketch.js     # p5.js spiral rendering & animation
  tasks.js      # Task CRUD + localStorage persistence
  audio.js      # Sound FX (scratch/thrum)
  utils.js      # Perlin noise, math helpers
```

## 3. Core Components

### 3.1 The Spiral Engine (sketch.js)

- **Spiral Formula:** Logarithmic spiral `r = a * e^(b*θ)`
- **Distortion Nodes:** Each task creates a radial spike at its angular position
- **Procrastination Jitter:** Perlin noise displacement based on `task.age * intensity`
- **Variable Line Weight:** Stroke width varies with drawing velocity (faster = thinner)

### 3.2 Task System (tasks.js)

**Task Schema:**
```javascript
{
  id: string,           // UUID
  text: string,         // Task description
  createdAt: timestamp,
  completedAt: timestamp|null,
  angle: number,        // Position on spiral (0-2π)
  intensity: number     // Jitter magnitude (grows with age)
}
```

**Operations:**
- `addTask(text)` - Creates task, assigns next spiral position
- `completeTask(id)` - Marks complete, triggers snap-back animation
- `getOpenTasks()` - Returns active tasks for rendering
- Persistence via `localStorage.setItem('coil-tasks', JSON.stringify(tasks))`

### 3.3 Visual Aesthetic (style.css + sketch.js)

| Element | Specification |
|---------|--------------|
| Background | #F4F1EA parchment with subtle texture overlay |
| Stroke | Variable-width black (#000000), ink-like alpha variation |
| Motion | 1-2% Perlin noise jitter on open task segments |
| Completed | Tasks migrate to center, thicken the spiral core |

### 3.4 Audio System (audio.js)

- **Add Task:** Sharp "scratch" sound (Web Audio API noise burst)
- **Complete Task:** Deep "thrum" sound (oscillator with decay)
- No external audio files - generated procedurally

## 4. Data Flow

```
User Input → tasks.js (update state) → localStorage
                      ↓
               sketch.js (p5 draw loop)
                      ↓
               Canvas render with jitter/animations
```

## 5. Interactions

1. **Add Task:** Type in input field, press Enter → task seeds next spiral segment
2. **Complete Task:** Click on thorn → strike-through animation, snap-back effect
3. **Visual Feedback:** Open tasks jitter more over time; completed tasks smooth into core

## 6. Technical Stack

- **Graphics:** p5.js (CDN)
- **Persistence:** localStorage
- **Audio:** Web Audio API
- **Math:** Custom Perlin noise implementation (no external deps)

## 7. Success Criteria

- Spiral renders smoothly at 60fps with up to 20 tasks
- Tasks persist across page refreshes
- Jitter intensity correlates with task age
- Completing a task triggers satisfying snap-back animation
- Total MVP size < 400 lines of code

## 8. Out of Scope (Future Phases)

- Cloud sync (Firebase/Supabase)
- Due dates
- Task categories/tags
- Mobile-responsive optimizations
- Export/sharing features
