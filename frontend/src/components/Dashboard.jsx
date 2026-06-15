import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-bg p-4">
      <p className="text-2xl font-bold font-mono text-text">{value}</p>
      <p className="text-xs text-text-muted font-mono uppercase tracking-wide mt-1">{label}</p>
    </div>
  )
}

function ProgressBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-sm mb-1 font-mono">
        <span className="text-text-muted">{label}</span>
        <span className="text-text-muted">{value}</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}

export default function Dashboard({ stats }) {
  if (!stats) return null

  return (
    <div className="bg-surface rounded-lg border border-border p-5 space-y-5">
      <h2 className="font-display font-bold text-text flex items-center gap-2">
        <TrendingUp size={18} className="text-accent" /> Dashboard
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="total" value={stats.total} />
        <StatCard label="completed" value={stats.completed} />
        <StatCard label="pending" value={stats.pending} />
        <StatCard label="completion" value={`${stats.completion_rate}%`} />
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1.5 font-mono">
          <span className="font-semibold text-text">overall_progress</span>
          <span className="text-accent font-bold">{stats.completion_rate}%</span>
        </div>
        <div className="h-2.5 bg-border rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.completion_rate}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-accent"
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-xs font-mono text-text-muted uppercase tracking-wide">by_category</p>
        <ProgressBar label="work" value={stats.by_category.work} max={stats.total} color="bg-blue-400" />
        <ProgressBar label="personal" value={stats.by_category.personal} max={stats.total} color="bg-purple-400" />
        <ProgressBar label="study" value={stats.by_category.study} max={stats.total} color="bg-teal-400" />
      </div>

      <div className="space-y-2.5">
        <p className="text-xs font-mono text-text-muted uppercase tracking-wide">by_priority</p>
        <ProgressBar label="high" value={stats.by_priority.high} max={stats.total} color="bg-red-400" />
        <ProgressBar label="medium" value={stats.by_priority.medium} max={stats.total} color="bg-amber-400" />
        <ProgressBar label="low" value={stats.by_priority.low} max={stats.total} color="bg-accent" />
      </div>
    </div>
  )
}