import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg border border-border text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
      title="Toggle theme"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}