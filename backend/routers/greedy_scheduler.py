from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from typing import List
from .models import Task, ScheduleRequest, ScheduledTask, ScheduleResponse

router = APIRouter()

@router.post("/greedy", response_model=ScheduleResponse)
async def greedy_schedule(request: ScheduleRequest):
    """
    Greedy scheduling algorithm that prioritizes tasks based on importance and deadline.
    
    Sample payload:
    {
        "tasks": [
            {
                "id": "task1",
                "name": "Complete Project",
                "importance": 5,
                "duration": 120,
                "dependencies": [],
                "deadline": "2024-03-20T18:00:00"
            }
        ]
    }
    """
    try:
        tasks = request.tasks
        current_time = datetime.now()
        scheduled_tasks: List[ScheduledTask] = []
        
        # Sort tasks by importance (descending) and deadline (ascending)
        sorted_tasks = sorted(
            tasks,
            key=lambda x: (-x.importance, x.deadline)
        )
        
        for task in sorted_tasks:
            # Check if all dependencies are completed
            if not all(dep in [t.id for t in scheduled_tasks] for dep in task.dependencies):
                continue
                
            scheduled_start = current_time
            scheduled_end = scheduled_start + timedelta(minutes=task.duration)
            
            scheduled_task = ScheduledTask(
                **task.dict(),
                scheduled_start=scheduled_start,
                scheduled_end=scheduled_end,
                completion_status="pending"
            )
            
            scheduled_tasks.append(scheduled_task)
            current_time = scheduled_end
        
        # Calculate metrics
        total_duration = sum(task.duration for task in scheduled_tasks)
        makespan = (scheduled_tasks[-1].scheduled_end - scheduled_tasks[0].scheduled_start).total_seconds() / 60
        efficiency_score = sum(task.importance for task in scheduled_tasks) / len(scheduled_tasks)
        
        return ScheduleResponse(
            scheduled_tasks=scheduled_tasks,
            total_duration=total_duration,
            makespan=makespan,
            efficiency_score=efficiency_score
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 