import { getClientSupabaseInstance } from './supabase';

export type Task = {
  id: string;
  user_id: string;
  name: string;
  importance: number;
  duration: number;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
};

const supabase = getClientSupabaseInstance();

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('deadline', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function addTask(task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  
  if (error) throw error;
}

export async function addTaskDependency(taskId: string, dependencyId: string): Promise<void> {
  const { error } = await supabase
    .from('task_dependencies')
    .insert([{ task_id: taskId, dependency_id: dependencyId }]);
  
  if (error) throw error;
}

export async function getTaskSchedule(): Promise<{
  scheduled_tasks: any[];
  algorithm_used: string;
  total_tasks_scheduled: number;
}> {
  // First get all tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .order('deadline', { ascending: true });
  
  if (tasksError) throw tasksError;

  // Get all dependencies
  const { data: dependencies, error: depsError } = await supabase
    .from('task_dependencies')
    .select('*');
  
  if (depsError) throw depsError;

  // Convert to scheduling format
  const schedulingTasks = tasks.map(task => ({
    id: task.id,
    name: task.name,
    importance: task.importance,
    duration: task.duration,
    deadline: task.deadline,
    dependencies: dependencies
      .filter(dep => dep.task_id === task.id)
      .map(dep => dep.dependency_id)
  }));

  // Sort tasks by deadline and importance
  const sortedTasks = [...schedulingTasks].sort((a, b) => {
    const deadlineCompare = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    if (deadlineCompare === 0) {
      return b.importance - a.importance;
    }
    return deadlineCompare;
  });

  // Greedy scheduling
  const currentTime = new Date();
  const scheduledTasks = [];
  let lastEndTime = currentTime;

  for (const task of sortedTasks) {
    const startTime = new Date(Math.max(lastEndTime.getTime(), currentTime.getTime()));
    const endTime = new Date(startTime.getTime() + task.duration * 60000);

    if (endTime <= new Date(task.deadline)) {
      scheduledTasks.push({
        ...task,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
      });
      lastEndTime = endTime;
    }
  }

  return {
    scheduled_tasks: scheduledTasks,
    algorithm_used: 'greedy',
    total_tasks_scheduled: scheduledTasks.length
  };
} 