// Task Management System
const STORAGE_KEY = 'coil-tasks';

// Load tasks from localStorage
function loadTasks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Save tasks to localStorage
function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Get all tasks
function getAllTasks() {
    return loadTasks();
}

// Get open (incomplete) tasks
function getOpenTasks() {
    return loadTasks().filter(t => !t.completedAt);
}

// Get completed tasks
function getCompletedTasks() {
    return loadTasks().filter(t => t.completedAt);
}

// Add new task
function addTask(text) {
    const tasks = loadTasks();
    const openCount = tasks.filter(t => !t.completedAt).length;
    
    const task = {
        id: generateId(),
        text: text.trim(),
        createdAt: now(),
        completedAt: null,
        angle: (openCount * 0.8) % (Math.PI * 2), // Distribute around spiral
        intensity: 1.0
    };
    
    tasks.push(task);
    saveTasks(tasks);
    
    // Play sound
    if (window.audioManager) {
        window.audioManager.playScratch();
    }
    
    return task;
}

// Complete a task
function completeTask(id) {
    const tasks = loadTasks();
    const task = tasks.find(t => t.id === id);
    
    if (task && !task.completedAt) {
        task.completedAt = now();
        saveTasks(tasks);
        
        // Play sound
        if (window.audioManager) {
            window.audioManager.playThrum();
        }
        
        return true;
    }
    return false;
}

// Delete a task
function deleteTask(id) {
    const tasks = loadTasks().filter(t => t.id !== id);
    saveTasks(tasks);
}

// Calculate task age in hours
function getTaskAgeHours(task) {
    const age = now() - task.createdAt;
    return age / (1000 * 60 * 60);
}

// Get jitter intensity for a task (increases with age)
function getJitterIntensity(task) {
    if (task.completedAt) return 0;
    const age = getTaskAgeHours(task);
    return Math.min(age * 0.1, 5) * task.intensity; // Max 5x intensity
}

// Export for global access
window.taskManager = {
    loadTasks,
    saveTasks,
    getAllTasks,
    getOpenTasks,
    getCompletedTasks,
    addTask,
    completeTask,
    deleteTask,
    getTaskAgeHours,
    getJitterIntensity
};
