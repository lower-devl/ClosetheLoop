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
      angle: Math.random() * Math.PI * 2 * 4
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
