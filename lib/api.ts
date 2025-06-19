import axios from 'axios';
import { Task, ScheduleResponse } from "@/types/task"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const schedulingApi = {
  // Weighted Greedy Scheduler
  greedySchedule: async (tasks: Task[]): Promise<ScheduleResponse> => {
    const response = await api.post<ScheduleResponse>('/greedy', { tasks });
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

export const getEfficientSelection = async (userId: string) => {
  const res = await fetch(`/api/efficient-selection?user_id=${userId}`);
  return res.json();
};

export type { Task, ScheduleResponse }; 