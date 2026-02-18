# The Coil - MVP Design

## Overview

A web-based productivity tool that visualizes unresolved tasks as a living spiral. Based on the Uzumaki aesthetic - high-contrast, ink-like, organic horror.

## Tech Stack

- **Framework:** React + Vite
- **Graphics:** p5.js (single canvas instance)
- **Persistence:** localStorage
- **Audio:** Web Audio API (thrum sound on task completion)

## Architecture

```
src/
├── main.jsx              # Vite entry
├── App.jsx               # Root component, loads audio
├── hooks/
│   └── useTaskStore.js   # Task CRUD + localStorage sync
├── components/
│   ├── SpiralCanvas.jsx  # React wrapper for p5 instance
│   └── TaskInput.jsx     # Minimal text entry overlay
├── sketch/
│   └── spiralSketch.js   # All p5 drawing logic
└── utils/
    ├── spiralMath.js     # Logarithmic spiral + distortion algorithms
    ├── noise.js          # Perlin jitter for procrastination effect
    └── audio.js          # Thrum sound loader/player
```

## Spiral Math

**Base formula:** Logarithmic spiral `r = a * e^(b*θ)` where `b` controls tightness.

**Distortion nodes:** Each open task injects a spike at a random angle. Spike amplitude scales with task age (older = larger spike).

**Jitter:** Open segments get Perlin noise applied to vertex positions. Noise offset increments each frame, creating organic "shaking" effect.

**Line rendering:** Variable stroke weight based on segment position - thicker near center (completed tasks), thinner at edges.

## Task Data Model

```js
{
  id: string,          // uuid
  text: string,        // Task description
  createdAt: number,   // timestamp
  completedAt: number, // timestamp | null
  angle: number        // Position on spiral (radians)
}
```

## Todo Functionality

### Core Interactions

1. **Add Task** - Text input at bottom. New task appears as "thorn" node on outer spiral edge. Spiral grows one segment.

2. **View Tasks** - Tasks rendered as clickable nodes. Hover shows text tooltip. Open tasks jitter; completed tasks are static.

3. **Complete Task** - Click node → "strike-through" animation, spiral "snap-back" fills gap, thrum sound plays.

4. **Delete Task** - Right-click removes node, spiral contracts.

### Visual Feedback

- **Open tasks:** Jitter intensity grows with age (1 day = mild, 1 week = aggressive)
- **Completed tasks:** Static, faded, "slashed" appearance
- **Spiral density:** Reflects total task count

## UI Layout

```
┌─────────────────────────────────┐
│                                 │
│         THE SPIRAL              │
│      (full canvas area)         │
│                                 │
│   [task nodes jittering]        │
│                                 │
│                                 │
├─────────────────────────────────┤
│ [text input................] ➕ │
└─────────────────────────────────┘
```

Minimal chrome. Full immersion in the spiral.

## Animation States

| Event | Animation |
|-------|-----------|
| Add task | Spiral grows, new node pulses |
| Complete task | Node slashed, spiral shifts weight inward, thrum sound |
| Delete task | Spiral contracts, gap closes |
| Idle (open tasks) | Perlin jitter on nodes |

## Aesthetic Specs

| Element | Specification |
|---------|---------------|
| Background | Aged parchment (#F4F1EA) |
| Stroke | Variable width, "Inky" Black (#000000) |
| Motion | 1-2% random jitter on open segments |
| Sound | Deep "thrum" for closing loops |

## MVP Scope (4 Weeks)

1. **Week 1:** Basic p5.js logarithmic spiral in React wrapper
2. **Week 2:** Distortion algorithm - inject spikes based on task count
3. **Week 3:** High-contrast "Inky" aesthetic layer
4. **Week 4:** Task completion with smoothing animation + thrum sound
