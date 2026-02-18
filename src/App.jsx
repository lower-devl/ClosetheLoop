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
