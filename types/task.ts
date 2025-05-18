export interface Task {
  id: string
  name: string
  importance: number  // 1-5 scale
  duration: number    // in minutes
  dependencies: string[]  // list of task IDs
  deadline: string    // ISO date string
  start_time?: string // ISO date string
  end_time?: string   // ISO date string
} 