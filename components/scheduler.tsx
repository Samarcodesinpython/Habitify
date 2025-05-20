"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useScheduling } from '@/hooks/useScheduling'
import { Task, ScheduledTask } from '@/types/task'; // Import Task and ScheduledTask types
import { getClientSupabaseInstance } from "@/lib/supabase"; // Import Supabase client
import { useAuth } from "@/components/auth-provider"; // Import auth hook
import type { PostgrestError } from '@supabase/supabase-js' // Import Supabase error type

export const Scheduler = () => {
  const { scheduleTasks, loading, error, result } = useScheduling();
  const [fetchedTasks, setFetchedTasks] = useState<Task[]>([]);
  const [isFetchingTasks, setIsFetchingTasks] = useState(true);
  const [fetchError, setFetchError] = useState<PostgrestError | null>(null);

  const { user } = useAuth();

  const supabase = getClientSupabaseInstance();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) {
        setFetchedTasks([]);
        setIsFetchingTasks(false);
        return;
      }

      setIsFetchingTasks(true);
      setFetchError(null);

      const { data, error } = await supabase
        .from('tasks')
        .select('id, name, priority, time_estimate, energy_level, description, due_date, completed, created_at') // Explicitly select columns
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setFetchError(error);
        setFetchedTasks([]);
      } else {
        const tasksData: Task[] = data.map((task: any) => ({
          ...task,
          due_date: task.due_date ? new Date(task.due_date).toISOString() : null, // Ensure date is ISO string
          created_at: new Date(task.created_at).toISOString(), // Ensure date is ISO string
          time_estimate: Number(task.time_estimate), // Ensure number type
        }));
        setFetchedTasks(tasksData || []);
        setFetchError(null);
      }
      setIsFetchingTasks(false);
    };

    fetchTasks();

  }, [user, supabase]);

  const handleSchedule = async () => {
    // Pass the tasks fetched from Supabase here
    await scheduleTasks(fetchedTasks);
  };

  return (
    <div className="container mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Task Scheduler</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Fetched Tasks Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Your Tasks ({fetchedTasks.length})</h3>
          {isFetchingTasks && <div className="text-center text-gray-600 dark:text-gray-400">Loading tasks...</div>}
          {fetchError && <div className="text-red-500 mt-4">Error fetching tasks: {fetchError.message}</div>}

          {!isFetchingTasks && !fetchError && fetchedTasks.length > 0 && (
            <ul className="space-y-3">
              {fetchedTasks.map(task => (
                <li key={task.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm">
                  <p className="font-medium text-gray-800 dark:text-white">{task.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Priority: {task.priority}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Estimate: {task.time_estimate} mins</p>
                  {task.due_date && <p className="text-sm text-gray-600 dark:text-gray-400">Due: {new Date(task.due_date).toLocaleDateString()}</p>}
                </li>
              ))}
            </ul>
          )}
          {!isFetchingTasks && !fetchError && fetchedTasks.length === 0 && (
            <p className="text-gray-600 dark:text-gray-400">No tasks available. Add some tasks first!</p>
          )}
        </div>

        {/* Scheduling and Scheduled Tasks Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Scheduled Plan</h3>

          {!isFetchingTasks && !fetchError && fetchedTasks.length > 0 && (
            <Button onClick={handleSchedule} disabled={loading} className="mb-4 w-full">
              {loading ? "Scheduling..." : `Run Weighted Greedy Schedule for ${fetchedTasks.length} Tasks`}
            </Button>
          )}

          {loading && <div className="text-center text-gray-600 dark:text-gray-400">Running scheduler...</div>}
          {error && <div className="text-red-500 mt-4">Error scheduling tasks: {error}</div>}

          {result && result.scheduled_tasks && result.scheduled_tasks.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Scheduled Order:</h4>
              <ul className="space-y-3">
                {result.scheduled_tasks.map((task: ScheduledTask) => (
                  <li key={task.id} className="p-4 bg-green-50 dark:bg-green-700 rounded-md shadow-sm border border-green-200 dark:border-green-600">
                    <p className="font-semibold text-green-800 dark:text-white">{task.name}</p>
                    <p className="text-sm text-green-700 dark:text-green-200">Priority: {task.priority}</p>
                    <p className="text-sm text-green-700 dark:text-green-200">Estimate: {task.time_estimate} mins</p>
                    <p className="text-sm text-green-700 dark:text-green-200">Start: {new Date(task.scheduled_start).toLocaleString()}</p>
                    <p className="text-sm text-green-700 dark:text-green-200">End: {new Date(task.scheduled_end).toLocaleString()}</p>
                    <p className="text-sm text-green-700 dark:text-green-200">Status: {task.completion_status}</p>
                  </li>
                ))}
              </ul>
              <h4 className="text-lg font-medium mt-6 mb-2 text-gray-800 dark:text-gray-200">Metrics:</h4>
              <p className="text-gray-700 dark:text-gray-300">Total Duration: {result.total_duration} minutes</p>
              <p className="text-gray-700 dark:text-gray-300">Makespan: {result.makespan} minutes</p>
              <p className="text-gray-700 dark:text-gray-300">Efficiency Score: {result.efficiency_score.toFixed(2)}</p>
            </div>
          )}

          {result && (!result.scheduled_tasks || result.scheduled_tasks.length === 0) && !loading && (
            <p className="mt-4 text-gray-600 dark:text-gray-400">No tasks were scheduled based on the algorithm.</p>
          )}

          {!result && !loading && !error && !isFetchingTasks && fetchedTasks.length > 0 && (
            <p className="mt-4 text-gray-600 dark:text-gray-400">Run the scheduler to generate a plan.</p>
          )}
        </div>
      </div>
    </div>
  );
}; 