import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, CheckCircle2, Circle, Clock, AlertTriangle, ChevronDown, ChevronUp, Plus, X, Pencil } from 'lucide-react'
import { addSubtask, toggleSubtask, deleteSubtask } from '../api'

const PRIORITY_STYLES = {
  high:   { bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',   label: 'High' },
  medium: { bar: 'bg-amber-400',  badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', label: 'Medium' },
  low:    { bar: 'bg-emerald-400',badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', label: 'Low' },
}

const CATEGORY_STYLES = {
  work:     'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  personal: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  study:    'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
}

function isOverdue(deadline, completed) {
  if (!deadline || completed) return false
  return new Date(deadline) < new Date()
}

export default function TaskCard({ task, onToggle, onDelete, onEdit, onSubtaskChange }) {
  const [expanded, setExpanded] = useState(false)
  const [newSubtask, setNewSubtask] = useState('')
  const [subtasks, setSubtasks] = useState(task.subtasks || [])
  const [adding, setAdding] = useState(false)

  const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
  const overdue = isOverdue(task.deadline, task.completed)
  const done = subtasks.filter(s => s.completed).length
  const total = subtasks.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return
    setAdding(true)
    try {
      const res = await addSubtask(task.id, newSubtask.trim())
      setSubtasks(prev => [...prev, res.data])
      setNewSubtask('')
      onSubtaskChange?.()
    } finally {
      setAdding(false)
    }
  }

  const handleToggleSubtask = async (subtaskId) => {
    const res = await toggleSubtask(task.id, subtaskId)
    setSubtasks(prev => prev.map(s => s.id === subtaskId ? res.data : s))
    onSubtaskChange?.()
  }

  const handleDeleteSubtask = async (subtaskId) => {
    await deleteSubtask(task.id, subtaskId)
    setSubtasks(prev => prev.filter(s => s.id !== subtaskId))
    onSubtaskChange?.()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`relative rounded-2xl shadow-sm border
        bg-white dark:bg-gray-800
        border-gray-100 dark:border-gray-700
        ${task.completed ? 'opacity-60' : ''}
        ${overdue ? 'border-l-4 border-l-red-500' : ''}
      `}
    >
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${priority.bar}`} />

      {/* Main row */}
      <div className="flex gap-4 p-4">
        <button onClick={() => onToggle(task.id, task.completed)}
          className="mt-0.5 text-gray-400 hover:text-emerald-500 transition-colors shrink-0">
          {task.completed ? <CheckCircle2 size={22} className="text-emerald-500" /> : <Circle size={22} />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-gray-800 dark:text-gray-100 truncate
            ${task.completed ? 'line-through text-gray-400' : ''}`}>
            {task.title}
          </p>

          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-2 items-center">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.badge}`}>{priority.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${CATEGORY_STYLES[task.category]}`}>{task.category}</span>
            {task.deadline && (
              <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-500 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
                {overdue ? <AlertTriangle size={12} /> : <Clock size={12} />}
                {overdue ? 'Overdue: ' : ''}{new Date(task.deadline).toLocaleDateString()}
              </span>
            )}
          </div>

          {total > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Subtasks</span>
                <span>{done}/{total} — {pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4 }}
                  className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-violet-500'}`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button onClick={() => onDelete(task.id)} className="text-gray-300 hover:text-red-500 transition-colors">
            <Trash2 size={18} />
          </button>
          <button onClick={() => onEdit(task)} className="text-gray-300 hover:text-violet-500 transition-colors">
            <Pencil size={18} />
          </button>
          <button onClick={() => setExpanded(e => !e)} className="text-gray-300 hover:text-violet-500 transition-colors">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Subtasks panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100 dark:border-gray-700"
          >
            <div className="p-4 pl-10 space-y-2">
              {subtasks.length === 0 && (
                <p className="text-xs text-gray-400 italic">No subtasks yet. Add one below.</p>
              )}
              {subtasks.map(s => (
                <div key={s.id} className="flex items-center gap-2 group">
                  <button onClick={() => handleToggleSubtask(s.id)}
                    className="text-gray-400 hover:text-emerald-500 transition-colors shrink-0">
                    {s.completed ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} />}
                  </button>
                  <span className={`text-sm flex-1 ${s.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {s.title}
                  </span>
                  <button onClick={() => handleDeleteSubtask(s.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                    <X size={14} />
                  </button>
                </div>
              ))}

              <div className="flex gap-2 mt-3">
                <input
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                  placeholder="Add a subtask..."
                  className="flex-1 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600
                    rounded-lg px-3 py-1.5 text-gray-800 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
                <button onClick={handleAddSubtask} disabled={adding}
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}