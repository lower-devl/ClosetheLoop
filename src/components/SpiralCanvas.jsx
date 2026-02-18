import { useRef, useEffect } from 'react'
import p5 from 'p5'
import { createSpiralSketch } from '../sketch/spiralSketch.js'

export function SpiralCanvas({ tasks, onCompleteTask, onDeleteTask }) {
  const containerRef = useRef(null)
  const p5Ref = useRef(null)
  const tasksRef = useRef(tasks)
  const onCompleteTaskRef = useRef(onCompleteTask)
  const onDeleteTaskRef = useRef(onDeleteTask)

  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  useEffect(() => {
    onCompleteTaskRef.current = onCompleteTask
  }, [onCompleteTask])

  useEffect(() => {
    onDeleteTaskRef.current = onDeleteTask
  }, [onDeleteTask])

  useEffect(() => {
    if (!containerRef.current) return

    const sketch = createSpiralSketch(
      () => tasksRef.current,
      (id) => onCompleteTaskRef.current(id),
      (id) => onDeleteTaskRef.current(id)
    )
    p5Ref.current = new p5(sketch, containerRef.current)

    return () => {
      if (p5Ref.current) {
        p5Ref.current.remove()
      }
    }
  }, [])

  return <div ref={containerRef} className="spiral-canvas" />
}
