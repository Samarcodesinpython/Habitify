import axios from 'axios';
import { Task } from "@/types/task"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const schedulingApi = {
  // Greedy Scheduler
  greedySchedule: async (data: any) => {
    const response = await api.post('/greedy-schedule', data);
    return response.data;
  },

  // Topological Sort
  topologicalSort: async (data: any) => {
    const response = await api.post('/topological-sort', data);
    return response.data;
  },

  // Dynamic Programming
  dynamicProgramming: async (data: any) => {
    const response = await api.post('/dynamic-programming', data);
    return response.data;
  },

  // Dijkstra Scheduler
  dijkstraSchedule: async (data: any) => {
    const response = await api.post('/dijkstra-schedule', data);
    return response.data;
  },

  // Priority Queue
  priorityQueue: async (data: any) => {
    const response = await api.post('/priority-queue', data);
    return response.data;
  },
} 