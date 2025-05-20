export interface Task {
  id: string
  name: string
  priority: 'high' | 'medium' | 'low' // 'high', 'medium', 'low'
  time_estimate: number    // in minutes
  energy_level: 'high' | 'medium' | 'low'  // 'high', 'medium', 'low'
  description?: string // Optional description
  due_date?: string | null    // ISO date string or null
  completed?: boolean // Optional completed status
  created_at?: string // ISO date string
}

export interface ScheduledTask extends Task {
    scheduled_start: string // ISO date string
    scheduled_end: string   // ISO date string
    completion_status: "completed" | "in_progress" | "pending" // Status
}

export interface ScheduleResponse {
    scheduled_tasks: ScheduledTask[]
    total_duration: number
    makespan: number
    efficiency_score: number
} 