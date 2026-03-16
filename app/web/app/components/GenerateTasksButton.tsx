'use client'

import { useState } from 'react'

interface Task {
  title: string
  priority: 'high' | 'medium' | 'low'
  due_days: number
}

interface TasksResult {
  tasks: Task[]
  units_used: number
  quota_remaining: number
}

interface GenerateTasksButtonProps {
  contactId: string
  contactName: string
  tenantId: string
}

export function GenerateTasksButton({ contactId, contactName, tenantId }: GenerateTasksButtonProps) {
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState<TasksResult | null>(null)
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
        body: JSON.stringify({ contactId, contactName }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate tasks')
      }

      const data = await res.json()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating tasks')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#dc2626'
      case 'medium':
        return '#ea580c'
      case 'low':
        return '#16a34a'
      default:
        return '#666'
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <button
        onClick={handleGenerateTasks}
        disabled={loading}
        style={{
          padding: '10px 16px',
          backgroundColor: loading ? '#e0e0e0' : '#7c3aed',
          color: 'white',
          borderRadius: '6px',
          border: 'none',
          cursor: loading ? 'wait' : 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
      >
        {loading ? '⏳ Generating...' : '✓ Generate Tasks'}
      </button>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fee', borderRadius: '6px', color: '#c33', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {tasks && (
        <div style={{ padding: '16px', backgroundColor: '#f5f3ff', borderRadius: '8px', borderLeft: '4px solid #7c3aed' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111', marginBottom: '12px' }}>Suggested Tasks</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tasks.tasks.map((task, i) => (
              <div key={i} style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '6px', borderLeft: `3px solid ${getPriorityColor(task.priority)}` }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{task.title}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {task.priority.toUpperCase()} • Due in {task.due_days} days
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '12px' }}>
            Quota: {tasks.quota_remaining} remaining
          </p>
        </div>
      )}
    </div>
  )
}
