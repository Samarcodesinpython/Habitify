import { useState } from 'react';
import { schedulingApi, Task, ScheduleResponse } from '@/lib/api';

export const useScheduling = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScheduleResponse | null>(null);

  const scheduleTasks = async (tasks: Task[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await schedulingApi.greedySchedule(tasks);
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