import { SpiralCanvas } from './components/SpiralCanvas.jsx'
import { TaskInput } from './components/TaskInput.jsx'
import { useTaskStore } from './hooks/useTaskStore.js'
import { playThrum } from './utils/audio.js'

import './App.css'

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
