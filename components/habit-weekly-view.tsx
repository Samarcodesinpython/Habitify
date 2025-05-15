"use client"

import type React from "react"

import { useState } from "react"
import { AlarmClockIcon as Alarm, SpaceIcon as Yoga } from "lucide-react"
import { Check } from "lucide-react"

type Habit = {
  id: string
  title: string
  icon: React.ReactNode
  frequency: string
  days: {
    [key: string]: boolean
  }
}

export function HabitWeeklyView() {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: "1",
      title: "Wake up early",
      icon: <Alarm className="h-5 w-5" />,
      frequency: "Everyday",
      days: {
        mon: false,
        tue: false,
        wed: true,
        thu: false,
        fri: false,
        sat: false,
        sun: false,
      },
    },
    {
      id: "2",
      title: "Stretching",
      icon: <Yoga className="h-5 w-5" />,
      frequency: "Everyday",
      days: {
        mon: false,
        tue: false,
        wed: true,
        thu: false,
        fri: false,
        sat: false,
        sun: false,
      },
    },
    {
      id: "3",
      title: "Balanced Breakfast",
      icon: <span className="text-lg">🍳</span>,
      frequency: "Everyday",
      days: {
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        sun: false,
      },
    },
    {
      id: "4",
      title: "Sunlight Exposure",
      icon: <span className="text-lg">☀️</span>,
      frequency: "Everyday",
      days: {
        mon: false,
        tue: false,
        wed: false,
        thu: false,
        fri: false,
        sat: false,
        sun: false,
      },
    },
  ])

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const toggleDay = (habitId: string, day: string) => {
    setHabits(
      habits.map((habit) => {
        if (habit.id === habitId) {
          return {
            ...habit,
            days: {
              ...habit.days,
              [day.toLowerCase()]: !habit.days[day.toLowerCase()],
            },
          }
        }
        return habit
      }),
    )
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <div key={habit.id} className="habit-card habit-card-violet">
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center">{habit.icon}</div>
              <span className="ml-3 flex-1 font-medium">{habit.title}</span>
              <span className="text-sm text-muted-foreground">{habit.frequency}</span>
            </div>

            <div className="flex justify-between">
              {days.map((day) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <button
                    onClick={() => toggleDay(habit.id, day.toLowerCase())}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-border transition-all hover:bg-primary/10 ${
                      habit.days[day.toLowerCase()] ? "bg-primary text-primary-foreground" : "bg-transparent"
                    }`}
                  >
                    {habit.days[day.toLowerCase()] && <Check className="h-4 w-4" />}
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
