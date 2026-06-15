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

  const inputCls = `w-full rounded-md border border-border bg-bg text-text
    px-3 py-2 text-sm font-mono placeholder:text-text-muted
    focus:outline-none focus:ring-2 focus:ring-accent`

  const labelCls = `text-xs font-mono text-text-muted uppercase tracking-wide`

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-surface border border-border rounded-lg shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-display font-bold text-text">
            {isEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelCls}>Title *</label>
            <input name="title" value={form.title} onChange={handle}
              placeholder="what needs to be done?" className={`${inputCls} mt-1`} />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea name="description" value={form.description} onChange={handle}
              rows={2} placeholder="optional details..." className={`${inputCls} mt-1 resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Priority</label>
              <select name="priority" value={form.priority} onChange={handle} className={`${inputCls} mt-1`}>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select name="category" value={form.category} onChange={handle} className={`${inputCls} mt-1`}>
                <option value="work">work</option>
                <option value="personal">personal</option>
                <option value="study">study</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Deadline</label>
            <input type="date" name="deadline" value={form.deadline} onChange={handle}
              min={new Date().toISOString().split('T')[0]} className={`${inputCls} mt-1`} />
          </div>

          {error && <p className="text-red-400 text-sm font-mono">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-accent text-bg font-display font-semibold py-2.5 rounded-lg
              hover:opacity-90 transition-opacity disabled:opacity-60">
            {loading ? (isEdit ? 'saving...' : 'adding...') : (isEdit ? 'Save Changes' : 'Add Task')}
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}