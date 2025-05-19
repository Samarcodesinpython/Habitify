import { useState } from 'react';
import { schedulingApi } from '@/lib/api';
import { Task } from '@/types/task';

export const useScheduling = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const scheduleTasks = async (algorithm: string, tasks: Task[]) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      switch (algorithm) {
        case 'greedy':
          response = await schedulingApi.greedySchedule({ tasks });
          break;
        case 'topological':
          response = await schedulingApi.topologicalSort({ tasks });
          break;
        case 'dynamic':
          response = await schedulingApi.dynamicProgramming({ tasks });
          break;
        case 'dijkstra':
          response = await schedulingApi.dijkstraSchedule({ tasks });
          break;
        case 'priority':
          response = await schedulingApi.priorityQueue({ tasks });
          break;
        default:
          throw new Error('Invalid algorithm selected');
      }
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    scheduleTasks,
    loading,
    error,
    result,
  };
}; 