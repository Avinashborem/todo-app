import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

const defaultForm = {
  title: '', description: '', priority: 'medium',
  category: 'personal', deadline: ''
}

export default function AddTaskForm({ onAdd, onUpdate, onClose, editTask }) {
  const isEdit = !!editTask
  const [form, setForm] = useState(
    isEdit ? {
      title: editTask.title,
      description: editTask.description || '',
      priority: editTask.priority,
      category: editTask.category,
      deadline: editTask.deadline ? editTask.deadline.split('T')[0] : ''
    } : defaultForm
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    setLoading(true)
    try {
      if (isEdit) {
        await onUpdate(editTask.id, { ...form, deadline: form.deadline || null })
      } else {
        await onAdd({ ...form, deadline: form.deadline || null })
      }
      onClose()
    } catch {
      setError(isEdit ? 'Failed to update task.' : 'Failed to add task. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `w-full rounded-xl border border-gray-200 dark:border-gray-600
    bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100
    px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400`

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            {isEdit ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Title *</label>
            <input name="title" value={form.title} onChange={handle}
              placeholder="What needs to be done?" className={`${inputCls} mt-1`} />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Description</label>
            <textarea name="description" value={form.description} onChange={handle}
              rows={2} placeholder="Optional details..." className={`${inputCls} mt-1 resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Priority</label>
              <select name="priority" value={form.priority} onChange={handle} className={`${inputCls} mt-1`}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Category</label>
              <select name="category" value={form.category} onChange={handle} className={`${inputCls} mt-1`}>
                <option value="work">💼 Work</option>
                <option value="personal">👤 Personal</option>
                <option value="study">📚 Study</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Deadline</label>
            <input type="date" name="deadline" value={form.deadline} onChange={handle}
              min={new Date().toISOString().split('T')[0]} className={`${inputCls} mt-1`} />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60
              text-white font-semibold py-2.5 rounded-xl transition-colors">
            {loading ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save Changes' : 'Add Task')}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}