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
  const [editTask, setEditTask] = useState(null)
  const [loading, setLoading] = useState(true)
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
    toast.success('Task added')
  }

  const handleUpdate = async (id, data) => {
    const res = await updateTask(id, data)
    setTasks(prev => prev.map(t => t.id === id ? res.data : t))
    await getStats().then(r => setStats(r.data))
    toast.success('Task updated')
  }

  const handleToggle = async (id, current) => {
    const res = await updateTask(id, { completed: !current })
    setTasks(prev => prev.map(t => t.id === id ? res.data : t))
    await getStats().then(r => setStats(r.data))
    toast.success(!current ? 'Marked complete' : 'Marked pending')
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    setTasks(prev => prev.filter(t => t.id !== id))
    await getStats().then(r => setStats(r.data))
    toast.success('Task deleted')
  }

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              </div>
              <span className="font-mono text-xs text-text-muted truncate">~/taskflow</span>
            </div>
            <h1 className="text-lg font-display font-bold text-text tracking-tight">TaskFlow</h1>
            <p className="text-xs text-text-muted font-mono hidden sm:block">// stay organized, stay ahead</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={fetchAll}
              className="p-2 rounded-lg border border-border text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
              title="Refresh">
              <RefreshCw size={16} />
            </button>
            <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 bg-accent text-bg font-display font-semibold text-sm px-3 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
              <Plus size={16} />
              <span className="hidden sm:inline">New Task</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <FilterBar filters={filters} onChange={setFilters} />

          {loading ? (
            <div className="text-center py-16 text-text-muted">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="inline-block">
                <RefreshCw size={24} />
              </motion.div>
              <p className="mt-2 text-sm font-mono">loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-16 text-text-muted">
              <p className="text-4xl mb-3 font-mono">∅</p>
              <p className="font-display font-semibold text-text">No tasks found</p>
              <p className="text-sm mt-1 font-mono">// add a task or adjust filters</p>
            </motion.div>
          ) : (
            <motion.div layout className="space-y-3">
              <p className="text-sm text-text-muted font-mono px-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</p>
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