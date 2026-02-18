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

  useEffect(() => {
    if (p5Ref.current) {
      p5Ref.current.updateTasks?.(tasks)
    }
  }, [tasks])

  return <div ref={containerRef} className="spiral-canvas" />
}
