import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import TaskCard from './TaskCard'

export default function TaskGroup({ group, onToggle, onDelete, onEdit, onSubtaskChange }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Group Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="flex items-center gap-2 w-full mb-2 group"
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${group.dot}`} />
        <span className={`font-mono text-xs font-semibold uppercase tracking-widest ${group.color}`}>
          {group.label}
        </span>
        <span className="font-mono text-xs text-text-muted ml-1">
          ({group.tasks.length})
        </span>
        <div className="flex-1 h-px bg-border ml-2" />
        <span className="text-text-muted group-hover:text-text transition-colors">
          {collapsed
            ? <ChevronRight size={14} />
            : <ChevronDown size={14} />}
        </span>
      </button>

      {/* Tasks */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 mb-6 overflow-hidden"
          >
            <AnimatePresence mode="popLayout">
              {group.tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onSubtaskChange={onSubtaskChange}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}