import { Task } from "@/types/task"

const API_BASE_URL = "http://localhost:8000/api"

export interface ScheduleResponse {
  scheduled_tasks: Array<Task & {
    scheduled_start: string
    scheduled_end: string
    completion_status: string
  }>
  total_duration: number
  makespan: number
  efficiency_score: number
}

export const scheduleApi = {
  // Greedy scheduling
  greedySchedule: async (tasks: Task[]): Promise<ScheduleResponse> => {
    const response = await fetch(`${API_BASE_URL}/greedy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tasks }),
    })
    if (!response.ok) throw new Error("Failed to schedule tasks")
    return response.json()
  },

  // Topological sort scheduling
  topologicalSchedule: async (tasks: Task[]): Promise<ScheduleResponse> => {
    const response = await fetch(`${API_BASE_URL}/topological`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tasks }),
    })
    if (!response.ok) throw new Error("Failed to schedule tasks")
    return response.json()
  },

  // Dynamic programming scheduling
  dynamicSchedule: async (tasks: Task[]): Promise<ScheduleResponse> => {
    const response = await fetch(`${API_BASE_URL}/dynamic`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tasks }),
    })
    if (!response.ok) throw new Error("Failed to schedule tasks")
    return response.json()
  },

  // Dijkstra's algorithm scheduling
  dijkstraSchedule: async (tasks: Task[]): Promise<ScheduleResponse> => {
    const response = await fetch(`${API_BASE_URL}/dijkstra`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tasks }),
    })
    if (!response.ok) throw new Error("Failed to schedule tasks")
    return response.json()
  },

  // Priority queue scheduling
  prioritySchedule: async (tasks: Task[]): Promise<ScheduleResponse> => {
    const response = await fetch(`${API_BASE_URL}/priority`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tasks }),
    })
    if (!response.ok) throw new Error("Failed to schedule tasks")
    return response.json()
  },
} 