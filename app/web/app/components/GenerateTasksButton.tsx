'use client'

import { useState } from 'react'

interface Activity {
  type: string
  body: string
  created_at: string
}

interface Task {
  title: string
  priority: 'high' | 'medium' | 'low'
  due_days: number
  description?: string
}

interface GenerateTasksButtonProps {
  contactName: string
  activities: Activity[]
  tenantId: string
}

export function GenerateTasksButton({
  contactName,
  activities,
  tenantId,
}: GenerateTasksButtonProps) {
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleGenerateTasks = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/ai/generate-tasks', {
        method: 'POST',
        headers: {
          'x-tenant-id': tenantId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact_name: contactName,
          activities: activities.map((a) => ({
            type: a.type,
            body: a.body,
          })),
        }),
      })

      if (res.status === 429) {
        setError('Insufficient quota. Upgrade for more tasks.')
        return
      }

      if (res.status === 402) {
        setError('AI not enabled. Upgrade your plan.')
        return
      }

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate tasks')
      }

      const data = await res.json()
      setTasks(data.tasks)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const priorityColors = {
    high: 'bg-red-50 border-red-200 text-red-900',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    low: 'bg-blue-50 border-blue-200 text-blue-900',
  }

  const priorityBadge = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleGenerateTasks}
        disabled={loading || activities.length === 0}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
          loading
            ? 'bg-green-100 text-green-600 cursor-wait'
            : activities.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'btn-primary bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
        }`}
      >
        {loading ? (
          <>
            <span className="animate-spin">⚙️</span>
            Generating...
          </>
        ) : (
          <>
            <span>✓</span>
            Generate Follow-Up Tasks
          </>
        )}
      </button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg scale-in">
          <div className="flex gap-3">
            <span>⚠️</span>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="space-y-3 scale-in">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <span>📋</span> Suggested Tasks ({tasks.length})
          </h4>
          {tasks.map((task, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${priorityColors[task.priority]}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 mb-1">
                    {task.title}
                  </h5>
                  {task.description && (
                    <p className="text-sm text-gray-700 mb-2">
                      {task.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-600">
                    Due in {task.due_days} {task.due_days === 1 ? 'day' : 'days'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${priorityBadge[task.priority]}`}>
                    {task.priority}
                  </span>
                  <button className="text-xs px-2 py-1 bg-white rounded border border-gray-200 hover:bg-gray-50 transition">
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="pt-2 text-xs text-gray-600">
            💡 Click "Add Task" to create tasks in your system
          </div>
        </div>
      )}
    </div>
  )
}
