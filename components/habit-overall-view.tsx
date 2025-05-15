"use client"

import type React from "react"

import { useState } from "react"
import { AlarmClockIcon as Alarm, SpaceIcon as Yoga, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Habit } from "@/components/habit-list"

const MONTHS_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function getMonthGrid() {
  const today = new Date()
  const months: { label: string; year: number; month: number; days: string[] }[] = []
  for (let i = 0; i < 12; i++) {
    const year = today.getFullYear() - (today.getMonth() < i ? 1 : 0)
    const month = i
    const label = MONTHS_LABELS[i]
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: string[] = []
    for (let d = 0; d < daysInMonth; d++) {
      const dayDate = new Date(year, month, d + 1)
      days.push(dayDate.toISOString().slice(0, 10))
    }
    months.push({ label, year, month, days })
  }
  return months
}

export function HabitOverallView({ habits = [] }: { habits: Habit[] }) {
  const months = getMonthGrid()
  return (
    <div className="space-y-8">
      <TooltipProvider>
        {habits.map((habit) => (
          <div key={habit.id} className="bg-white rounded-2xl shadow-md p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-lg">{habit.icon}</div>
              <span className="font-medium text-base">{habit.title}</span>
            </div>
            <div className="flex items-end flex-wrap gap-4">
              {months.map((month, mi) => (
                <div key={mi} className="flex flex-col items-center">
                  <div className="text-xs text-muted-foreground mb-1">{month.label}</div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {month.days.map((dateStr, di) => {
                      const completed = habit.completionDates?.includes(dateStr)
                      return (
                        <Tooltip key={dateStr}>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-3 h-3 rounded-full border flex items-center justify-center transition-colors ${completed ? "bg-teal-500 border-teal-500" : "bg-gray-200 border-gray-200"}`}
                            ></div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>{dateStr}</span>
                            {completed ? <span> – Completed</span> : null}
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </TooltipProvider>
    </div>
  )
}
