import { getClientSupabaseInstance } from './supabase';

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  color?: string;
  frequency?: any;
  created_at: string;
};

const supabase = getClientSupabaseInstance();

export async function fetchHabits(userId: string): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addHabit(userId: string, habit: { name: string; color?: string; frequency?: any }): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .insert([{ user_id: userId, ...habit }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', habitId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteHabit(habitId: string): Promise<void> {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId);
  if (error) throw error;
}

// --- Habit Completions API ---
export async function markHabitComplete(habitId: string, date: string): Promise<void> {
  const { error } = await supabase
    .from('habit_completions')
    .insert([{ habit_id: habitId, date, completed: true }]);
  if (error) throw error;
}

export async function unmarkHabitComplete(habitId: string, date: string): Promise<void> {
  const { error } = await supabase
    .from('habit_completions')
    .delete()
    .eq('habit_id', habitId)
    .eq('date', date);
  if (error) throw error;
}

export async function getHabitCompletions(habitId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('habit_completions')
    .select('date')
    .eq('habit_id', habitId)
    .eq('completed', true);
  if (error) throw error;
  return data ? data.map((row: { date: string }) => row.date) : [];
} 