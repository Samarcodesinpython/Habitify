"use client"

import type React from "react"

import { useState } from "react"
import { AlarmClockIcon as Alarm, SpaceIcon as Yoga } from "lucide-react"
import { Check } from "lucide-react"
import type { Habit } from "@/components/habit-list"
import { markHabitComplete, unmarkHabitComplete, getHabitCompletions } from "@/lib/habitsApi"

interface HabitWeeklyViewProps {
  habits: Habit[]
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>
}

export function HabitWeeklyView({ habits, setHabits }: HabitWeeklyViewProps) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const toggleDay = async (habitId: string, day: string) => {
    const today = new Date();
    const dayIndex = ["mon","tue","wed","thu","fri","sat","sun"].indexOf(day.toLowerCase());
    const date = new Date(today.setDate(today.getDate() - today.getDay() + 1 + dayIndex));
    const dateStr = date.toISOString().slice(0, 10);
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    const completed = habit.days?.[day.toLowerCase()];
    if (completed) {
      await unmarkHabitComplete(habitId, dateStr);
    } else {
      await markHabitComplete(habitId, dateStr);
    }
    // Re-fetch completions for all habits
    Promise.all(habits.map(async (h) => {
      const completions = await getHabitCompletions(h.id);
      return { ...h, days: { ...h.days, [day.toLowerCase()]: completions.includes(dateStr) } };
    })).then(setHabits);
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <div key={habit.id} className="habit-card habit-card-violet">
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center">{habit.icon}</div>
              <span className="ml-3 flex-1 font-medium">{habit.title}</span>
              <span className="text-sm text-muted-foreground">{habit.frequency || "Everyday"}</span>
            </div>
            <div className="flex justify-between">
              {days.map((day) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <button
                    onClick={() => toggleDay(habit.id, day)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-border transition-all hover:bg-primary/10 ${
                      habit.days?.[day.toLowerCase()] ? "bg-primary text-primary-foreground animate-checkmark" : "bg-transparent"
                    }`}
                  >
                    {habit.days?.[day.toLowerCase()] && <Check className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
