const STORAGE_KEY = 'the-coil-tasks'

export function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.error('Failed to save tasks:', e)
  }
}
