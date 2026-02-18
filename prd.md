This PRD (Product Requirements Document) focuses on a web-based, high-concept productivity tool. It prioritizes the Uzumaki aesthetic (high-contrast, ink-like, organic horror) over traditional "clean" UI to create a visceral psychological connection to task management.
PRD: Project "The Coil" (Uzumaki-Inspired Loop Closer)
1. Product Vision

To visualize the mental "drag" of unresolved tasks as a singular, living spiral. By closing loops, users "smooth" their reality, transforming a jagged, anxious vortex into a harmonious, balanced shape.
2. Target Audience

    Procrastinators who feel overwhelmed by traditional linear to-do lists.

    Visual Thinkers who respond to "aesthetic pressure" and kinetic feedback.

    Fans of Junji Ito/Dark Aesthetics looking for a "memento mori" style productivity tool.

3. Core Features & User Flow
3.1 The Singular Spiral (The "Uzumaki" Engine)

    The Living Line: A single, continuous line drawn using a logarithmic spiral formula.

    Distortion Nodes: Every "Open Loop" (task) creates a mathematical kink or thorn in the spiral.

    Procrastination Jitter: The longer a task remains open, the more the line "jitters" (Perlin noise), creating a visual sense of anxiety.

    The Inky Aesthetic: High-contrast monochrome (Black/Off-White) with variable line weights to mimic hand-drawn manga pens.

3.2 "Closing the Loop" (Interactions)

    The Strike-Through: When a task is marked done, the "thorn" is visually slashed or smoothed out.

    The Snap-Back: The spiral physically shifts its weight to fill the gap left by the resolved task, providing a "sigh of relief" animation.

    The Core: Completed tasks migrate to the center of the spiral, thickening the "foundation" of the user's progress.

3.3 Task Input (The "Seed")

    Minimalist text entry. Each entry "seeds" the next segment of the spiral.

    No Due Dates (Initially): Tasks grow "heavier" and "angrier" based on real-time elapsed, not arbitrary deadlines.

4. Technical Requirements
4.1 Frontend & Graphics

    Language: JavaScript (React or Vue wrapper).

    Graphics Engine: p5.js or Three.js (using a LineLoop with custom shaders).

    Shaders: Custom fragment shaders to create "ink-bleed" and "cross-hatch" textures.

4.2 Data & Persistence

    Local-First: Use localStorage or IndexedDB for immediate, low-latency updates.

    Cloud Sync: Simple Firebase or Supabase backend to save the "State of the Spiral" across devices.

5. Aesthetic & UI Specs
Element	Specification	Uzumaki Inspiration
Background	Texture of old, yellowed parchment (#F4F1EA)	Aged manga paper
Stroke	Variable width, "Inky" Black (#000000)	G-Pen nib textures
Motion	1–2% random jitter on "Open" segments	Obsessive, creeping dread
Sound FX	Sharp "scratch" for adding; deep "thrum" for closing	Tactile, physical feedback
6. Success Metrics

    Retention: Does the user feel "compelled" to smooth the spiral daily?

    Closure Rate: Average time from "Loop Opened" to "Loop Closed."

    Visual Satisfaction: Qualitative feedback on the "relief" felt when the spiral snaps back to order.

7. Roadmap: Phase 1 (The MVP)

    Week 1: Implement a basic p5.js Archimedean spiral.

    Week 2: Create the "Distortion" algorithm—injecting spikes into the line based on task count.

    Week 3: Build the high-contrast "Inky" CSS/Shader layer.

    Week 4: Add "Kill the Loop" functionality (smoothing animation).
