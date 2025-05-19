"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Task } from "@/types/task"
import { scheduleApi, ScheduleResponse } from "@/lib/api"
import { toast } from "sonner"
import { useScheduling } from '@/hooks/useScheduling'

export const Scheduler = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('greedy')
  const { scheduleTasks, loading, error, result } = useScheduling()

  const handleSchedule = async (tasks: Task[]) => {
    await scheduleTasks(selectedAlgorithm, tasks)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Task Scheduler</h2>
        <div className="flex gap-4 mb-4">
          <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="greedy">Greedy Algorithm</SelectItem>
              <SelectItem value="topological">Topological Sort</SelectItem>
              <SelectItem value="dynamic">Dynamic Programming</SelectItem>
              <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
              <SelectItem value="priority">Priority Queue</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleSchedule([])} disabled={loading}>
            {loading ? "Scheduling..." : "Schedule Tasks"}
          </Button>
        </div>
      </div>

      {loading && <div className="text-center">Processing...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {result && (
        <div className="mt-4">
          <h3 className="text-lg font-medium">Schedule Result:</h3>
          <pre className="mt-2 p-4 bg-gray-100 rounded-md">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">Tasks</h3>
          <div className="space-y-4">
            {/* Task input form */}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Schedule</h3>
          {/* Schedule display */}
        </div>
      </div>
    </div>
  )
} 