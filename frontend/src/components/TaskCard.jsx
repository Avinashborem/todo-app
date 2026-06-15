import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, CheckCircle2, Circle, Clock, AlertTriangle, ChevronDown, ChevronUp, Plus, X, Pencil } from 'lucide-react'
import { addSubtask, toggleSubtask, deleteSubtask } from '../api'

const PRIORITY_DOTS = { high: 'bg-red-400', medium: 'bg-amber-400', low: 'bg-accent' }
const CATEGORY_DOTS = { work: 'bg-blue-400', personal: 'bg-purple-400', study: 'bg-teal-400' }

function isOverdue(deadline, completed) {
  if (!deadline || completed) return false
  return new Date(deadline) < new Date()
}

export default function TaskCard({ task, onToggle, onDelete, onEdit, onSubtaskChange }) {
  const [expanded, setExpanded] = useState(false)
  const [newSubtask, setNewSubtask] = useState('')
  const [subtasks, setSubtasks] = useState(task.subtasks || [])
  const [adding, setAdding] = useState(false)

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
      className={`relative rounded-lg border border-border bg-surface
        ${task.completed ? 'opacity-60' : ''}
        ${overdue ? 'border-l-2 border-l-red-400' : ''}
      `}
    >
      <div className="flex gap-4 p-4">
        <button onClick={() => onToggle(task.id, task.completed)}
          className="mt-0.5 text-text-muted hover:text-accent transition-colors shrink-0">
          {task.completed ? <CheckCircle2 size={20} className="text-accent" /> : <Circle size={20} />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`font-display font-semibold text-text truncate
            ${task.completed ? 'line-through text-text-muted' : ''}`}>
            {task.title}
          </p>

          {task.description && (
            <p className="text-sm text-text-muted mt-0.5 line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-3 mt-2 items-center font-mono text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${PRIORITY_DOTS[task.priority]}`} />
              {task.priority}
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${CATEGORY_DOTS[task.category]}`} />
              {task.category}
            </span>
            {task.deadline && (
              <span className={`flex items-center gap-1 ${overdue ? 'text-red-400 font-semibold' : ''}`}>
                {overdue ? <AlertTriangle size={12} /> : <Clock size={12} />}
                {overdue ? 'overdue: ' : ''}{task.deadline}
              </span>
            )}
          </div>

          {total > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-text-muted mb-1 font-mono">
                <span>subtasks</span>
                <span>{done}/{total} — {pct}%</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4 }}
                  className={`h-full rounded-full ${pct === 100 ? 'bg-accent' : 'bg-text-muted'}`}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(task)} className="text-text-muted hover:text-text transition-colors">
              <Pencil size={16} />
            </button>
            <button onClick={() => onDelete(task.id)} className="text-text-muted hover:text-red-400 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
          <button onClick={() => setExpanded(e => !e)} className="text-text-muted hover:text-text transition-colors mt-2">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-4 pl-10 space-y-2">
              {subtasks.length === 0 && (
                <p className="text-xs text-text-muted font-mono">// no subtasks yet</p>
              )}
              {subtasks.map(s => (
                <div key={s.id} className="flex items-center gap-2 group">
                  <button onClick={() => handleToggleSubtask(s.id)}
                    className="text-text-muted hover:text-accent transition-colors shrink-0">
                    {s.completed ? <CheckCircle2 size={15} className="text-accent" /> : <Circle size={15} />}
                  </button>
                  <span className={`text-sm flex-1 ${s.completed ? 'line-through text-text-muted' : 'text-text'}`}>
                    {s.title}
                  </span>
                  <button onClick={() => handleDeleteSubtask(s.id)}
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition-all">
                    <X size={13} />
                  </button>
                </div>
              ))}

              <div className="flex gap-2 mt-3">
                <input
                  value={newSubtask}
                  onChange={e => setNewSubtask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                  placeholder="add a subtask..."
                  className="flex-1 text-sm bg-bg border border-border rounded-md px-3 py-1.5
                    text-text font-mono placeholder:text-text-muted
                    focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button onClick={handleAddSubtask} disabled={adding}
                  className="bg-accent text-bg rounded-md px-3 py-1.5 transition-opacity hover:opacity-90 disabled:opacity-50">
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}