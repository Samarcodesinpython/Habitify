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

export default function Scheduler() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [algorithm, setAlgorithm] = useState<string>("greedy")
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const addTask = () => {
    const newTask: Task = {
      id: `task${tasks.length + 1}`,
      name: "",
      importance: 3,
      duration: 30,
      dependencies: [],
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    }
    setTasks([...tasks, newTask])
  }

  const updateTask = (index: number, field: keyof Task, value: any) => {
    const updatedTasks = [...tasks]
    updatedTasks[index] = { ...updatedTasks[index], [field]: value }
    setTasks(updatedTasks)
  }

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  const handleSchedule = async () => {
    try {
      setLoading(true)
      let response: ScheduleResponse

      switch (algorithm) {
        case "greedy":
          response = await scheduleApi.greedySchedule(tasks)
          break
        case "topological":
          response = await scheduleApi.topologicalSchedule(tasks)
          break
        case "dynamic":
          response = await scheduleApi.dynamicSchedule(tasks)
          break
        case "dijkstra":
          response = await scheduleApi.dijkstraSchedule(tasks)
          break
        case "priority":
          response = await scheduleApi.prioritySchedule(tasks)
          break
        default:
          throw new Error("Invalid algorithm selected")
      }

      setSchedule(response)
      toast.success("Tasks scheduled successfully!")
    } catch (error) {
      toast.error("Failed to schedule tasks")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Task Scheduler</h2>
        <div className="flex gap-4 mb-4">
          <Select value={algorithm} onValueChange={setAlgorithm}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="greedy">Greedy</SelectItem>
              <SelectItem value="topological">Topological Sort</SelectItem>
              <SelectItem value="dynamic">Dynamic Programming</SelectItem>
              <SelectItem value="dijkstra">Dijkstra</SelectItem>
              <SelectItem value="priority">Priority Queue</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={addTask}>Add Task</Button>
          <Button onClick={handleSchedule} disabled={loading || tasks.length === 0}>
            {loading ? "Scheduling..." : "Schedule Tasks"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">Tasks</h3>
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <Card key={task.id} className="p-4">
                <div className="space-y-4">
                  <div>
                    <Label>Task Name</Label>
                    <Input
                      value={task.name}
                      onChange={(e) => updateTask(index, "name", e.target.value)}
                      placeholder="Enter task name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Importance (1-5)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={task.importance}
                        onChange={(e) => updateTask(index, "importance", parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Duration (minutes)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={task.duration}
                        onChange={(e) => updateTask(index, "duration", parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Deadline</Label>
                    <Input
                      type="datetime-local"
                      value={task.deadline.slice(0, 16)}
                      onChange={(e) => updateTask(index, "deadline", new Date(e.target.value).toISOString())}
                    />
                  </div>
                  <Button variant="destructive" onClick={() => removeTask(index)}>
                    Remove Task
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Schedule</h3>
          {schedule ? (
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Metrics</h4>
                  <p>Total Duration: {schedule.total_duration} minutes</p>
                  <p>Makespan: {schedule.makespan} minutes</p>
                  <p>Efficiency Score: {schedule.efficiency_score.toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Scheduled Tasks</h4>
                  <div className="space-y-2">
                    {schedule.scheduled_tasks.map((task) => (
                      <div key={task.id} className="p-2 bg-muted rounded">
                        <p className="font-medium">{task.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Start: {new Date(task.scheduled_start).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          End: {new Date(task.scheduled_end).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Status: {task.completion_status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <p className="text-muted-foreground">No schedule generated yet</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 