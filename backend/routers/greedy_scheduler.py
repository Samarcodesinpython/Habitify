from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from typing import List
from .models import Task, ScheduleRequest, ScheduledTask, ScheduleResponse

router = APIRouter()

@router.post("/greedy", response_model=ScheduleResponse)
async def greedy_schedule(request: ScheduleRequest):
    """
    Weighted Greedy scheduling algorithm that prioritizes tasks based on priority, time_estimate, and energy_level.
    
    Sample payload:
    {
        "tasks": [
            {
                "id": "task1",
                "name": "Complete Project",
                "priority": "high",
                "time_estimate": 120,
                "energy_level": "high"
            }
        ]
    }
    """
    try:
        tasks = request.tasks
        current_time = datetime.now()
        scheduled_tasks: List[ScheduledTask] = []
        
        # Assign numeric values
        priority_map = {"high": 3, "medium": 2, "low": 1}
        energy_map = {"high": 3, "medium": 2, "low": 1}
        priority_weight = 3
        energy_weight = 2
        time_weight = 1

        # Calculate score for each task
        scored_tasks = []
        for task in tasks:
            score = (
                priority_weight * priority_map.get(task.priority, 1)
                + energy_weight * energy_map.get(task.energy_level, 1)
                - time_weight * task.time_estimate
            )
            scored_tasks.append((task, score))

        # Sort tasks by score descending
        sorted_tasks = [t for t, _ in sorted(scored_tasks, key=lambda x: x[1], reverse=True)]
        
        for task in sorted_tasks:
            scheduled_start = current_time
            scheduled_end = scheduled_start + timedelta(minutes=task.time_estimate)
            
            scheduled_task = ScheduledTask(
                **task.dict(),
                scheduled_start=scheduled_start,
                scheduled_end=scheduled_end,
                completion_status="pending"
            )
            
            scheduled_tasks.append(scheduled_task)
            current_time = scheduled_end
        
        # Calculate metrics
        total_duration = sum(task.time_estimate for task in scheduled_tasks)
        makespan = (
            (scheduled_tasks[-1].scheduled_end - scheduled_tasks[0].scheduled_start).total_seconds() / 60
            if scheduled_tasks else 0
        )
        efficiency_score = (
            sum(priority_map.get(task.priority, 1) for task in scheduled_tasks) / len(scheduled_tasks)
            if scheduled_tasks else 0
        )
        
        return ScheduleResponse(
            scheduled_tasks=scheduled_tasks,
            total_duration=total_duration,
            makespan=makespan,
            efficiency_score=efficiency_score
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 