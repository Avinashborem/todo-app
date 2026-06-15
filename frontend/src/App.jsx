import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

import TaskCard from './components/TaskCard'
import AddTaskForm from './components/AddTaskForm'
import FilterBar from './components/FilterBar'
import Dashboard from './components/Dashboard'
import ThemeToggle from './components/ThemeToggle'
import { getTasks, createTask, updateTask, deleteTask, getStats } from './api'

const DEFAULT_FILTERS = { search: '', category: 'all', priority: 'all', completed: undefined }

export default function App() {
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editTask, setEditTask] = useState(null)
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const fetchAll = useCallback(async () => {
    try {
      const params = {
        ...(filters.search && { search: filters.search }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.priority !== 'all' && { priority: filters.priority }),
        ...(filters.completed !== undefined && { completed: filters.completed }),
      }
      const [tasksRes, statsRes] = await Promise.all([getTasks(params), getStats()])
      setTasks(tasksRes.data)
      setStats(statsRes.data)
    } catch {
      toast.error('Cannot reach backend. Make sure FastAPI is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleAdd = async (data) => {
    const res = await createTask(data)
    setTasks(prev => [res.data, ...prev])
    await getStats().then(r => setStats(r.data))
    toast.success('Task added!')
  }

  const handleToggle = async (id, current) => {
    const res = await updateTask(id, { completed: !current })
    setTasks(prev => prev.map(t => t.id === id ? res.data : t))
    await getStats().then(r => setStats(r.data))
    toast.success(!current ? '✅ Marked complete!' : 'Marked pending')
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    setTasks(prev => prev.filter(t => t.id !== id))
    await getStats().then(r => setStats(r.data))
    toast.success('Task deleted')
  }

  const handleUpdate = async (id, data) => {
  const res = await updateTask(id, data)
  setTasks(prev => prev.map(t => t.id === id ? res.data : t))
  await getStats().then(r => setStats(r.data))
  toast.success('Task updated!')
}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              ✅ TaskFlow
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">Stay organized, stay ahead</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAll} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <RefreshCw size={16} />
            </button>
            <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
              <Plus size={16} /> Add Task
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <FilterBar filters={filters} onChange={setFilters} />

          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="inline-block">
                <RefreshCw size={24} />
              </motion.div>
              <p className="mt-2 text-sm">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-16 text-gray-400 dark:text-gray-500">
              <p className="text-4xl mb-3">🎯</p>
              <p className="font-semibold text-gray-600 dark:text-gray-400">No tasks found</p>
              <p className="text-sm mt-1">Add your first task or adjust your filters</p>
            </motion.div>
          ) : (
            <motion.div layout className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</p>
              </div>
              <AnimatePresence mode="popLayout">
                {tasks.map(task => (
                  <TaskCard key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} onEdit={setEditTask} onSubtaskChange={fetchAll} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <div className="space-y-4">
          <Dashboard stats={stats} />
        </div>
      </main>

      <AnimatePresence>
        {showForm && <AddTaskForm onAdd={handleAdd} onClose={() => setShowForm(false)} />}
        {editTask && <AddTaskForm editTask={editTask} onUpdate={handleUpdate} onClose={() => setEditTask(null)} />}
      </AnimatePresence>
    </div>
  )
}