export function groupAndSortTasks(tasks) {
  const now = new Date()
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)
  const weekEnd = new Date(now)
  weekEnd.setDate(weekEnd.getDate() + 7)
  weekEnd.setHours(23, 59, 59, 999)

  const groups = {
    overdue:  { label: 'Overdue',   tasks: [], color: 'text-red-400',   dot: 'bg-red-400'    },
    today:    { label: 'Today',     tasks: [], color: 'text-amber-400', dot: 'bg-amber-400'  },
    upcoming: { label: 'Upcoming',  tasks: [], color: 'text-blue-400',  dot: 'bg-blue-400'   },
    someday:  { label: 'Someday',   tasks: [], color: 'text-text-muted',dot: 'bg-text-muted' },
  }

  for (const task of tasks) {
    if (!task.deadline) {
      groups.someday.tasks.push(task)
      continue
    }
    const deadline = new Date(task.deadline)
    if (!task.completed && deadline < now) {
      groups.overdue.tasks.push(task)
    } else if (deadline <= todayEnd) {
      groups.today.tasks.push(task)
    } else if (deadline <= weekEnd) {
      groups.upcoming.tasks.push(task)
    } else {
      groups.someday.tasks.push(task)
    }
  }

  // Sort within each group
  const byPriority = { high: 0, medium: 1, low: 2 }

  for (const group of Object.values(groups)) {
    group.tasks.sort((a, b) => {
      // Tasks with deadlines: sort by closest deadline first
      if (a.deadline && b.deadline) {
        return new Date(a.deadline) - new Date(b.deadline)
      }
      // Tasks without deadlines: sort by priority
      if (!a.deadline && !b.deadline) {
        return (byPriority[a.priority] ?? 1) - (byPriority[b.priority] ?? 1)
      }
      // Deadline tasks before no-deadline tasks
      return a.deadline ? -1 : 1
    })
  }

  // Return only non-empty groups, in fixed order
  return Object.entries(groups)
    .filter(([_, g]) => g.tasks.length > 0)
    .map(([key, g]) => ({ key, ...g }))
}

export function getOverdueCount(tasks) {
  const now = new Date()
  return tasks.filter(t => !t.completed && t.deadline && new Date(t.deadline) < now).length
}