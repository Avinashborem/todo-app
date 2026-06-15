import { Search } from 'lucide-react'

const CATEGORY_DOTS = { all: 'bg-text-muted', work: 'bg-blue-400', personal: 'bg-purple-400', study: 'bg-teal-400' }
const PRIORITY_DOTS = { all: 'bg-text-muted', high: 'bg-red-400', medium: 'bg-amber-400', low: 'bg-accent' }

export default function FilterBar({ filters, onChange }) {
  const handle = (key, val) => onChange({ ...filters, [key]: val })

  const btnCls = (active) => `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-mono transition-colors border
    ${active
      ? 'bg-accent text-bg border-accent'
      : 'bg-surface text-text-muted border-border hover:border-accent hover:text-text'}`

  return (
    <div className="bg-surface rounded-lg border border-border p-4 space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={filters.search}
          onChange={(e) => handle('search', e.target.value)}
          placeholder="search tasks..."
          className="w-full pl-9 pr-4 py-2 rounded-md text-sm bg-bg
            border border-border text-text placeholder:text-text-muted
            focus:outline-none focus:ring-2 focus:ring-accent font-mono"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-text-muted uppercase tracking-wide mr-1">category:</span>
        {['all','work','personal','study'].map(cat => (
          <button key={cat} onClick={() => handle('category', cat)} className={btnCls(filters.category === cat)}>
            <span className={`w-2 h-2 rounded-full ${CATEGORY_DOTS[cat]}`} /> {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-text-muted uppercase tracking-wide mr-1">priority:</span>
        {['all','high','medium','low'].map(pri => (
          <button key={pri} onClick={() => handle('priority', pri)} className={btnCls(filters.priority === pri)}>
            <span className={`w-2 h-2 rounded-full ${PRIORITY_DOTS[pri]}`} /> {pri}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-text-muted uppercase tracking-wide mr-1">status:</span>
        <button onClick={() => handle('completed', undefined)} className={btnCls(filters.completed === undefined)}>all</button>
        <button onClick={() => handle('completed', false)} className={btnCls(filters.completed === false)}>pending</button>
        <button onClick={() => handle('completed', true)} className={btnCls(filters.completed === true)}>done</button>
      </div>
    </div>
  )
}