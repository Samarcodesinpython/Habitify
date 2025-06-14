from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from typing import List, Dict, Set, Tuple
from heapq import heappush, heappop
from .models import Task, ScheduleRequest, ScheduledTask, ScheduleResponse

router = APIRouter()

def greedy_job_scheduling(tasks: List[Task]) -> List[ScheduledTask]:
    """
    Greedy job scheduling algorithm that prioritizes tasks based on importance and deadline.
    Uses a priority queue to schedule tasks optimally.
    """
    # Sort tasks by deadline and importance
    sorted_tasks = sorted(tasks, key=lambda x: (x.deadline, -x.importance))
    
    current_time = datetime.now()
    scheduled_tasks = []
    
    for task in sorted_tasks:
        # Calculate start and end times
        start_time = max(current_time, task.deadline - timedelta(minutes=task.duration))
        end_time = start_time + timedelta(minutes=task.duration)
        
        # Check if task can be completed before deadline
        if end_time > task.deadline:
            continue  # Skip tasks that can't be completed before deadline
            
        scheduled_task = ScheduledTask(
            id=task.id,
            name=task.name,
            start_time=start_time,
            end_time=end_time,
            importance=task.importance
        )
        scheduled_tasks.append(scheduled_task)
        current_time = end_time
    
    return scheduled_tasks

def activity_selection(tasks: List[Task]) -> List[ScheduledTask]:
    """
    Activity selection algorithm that maximizes the number of tasks completed
    while considering their importance and duration.
    """
    # Sort tasks by end time (deadline) and importance
    sorted_tasks = sorted(tasks, key=lambda x: (x.deadline, -x.importance))
    
    current_time = datetime.now()
    scheduled_tasks = []
    
    for task in sorted_tasks:
        # Check if task can be started now and completed before deadline
        if current_time + timedelta(minutes=task.duration) <= task.deadline:
            start_time = current_time
            end_time = start_time + timedelta(minutes=task.duration)
            
            scheduled_task = ScheduledTask(
                id=task.id,
                name=task.name,
                start_time=start_time,
                end_time=end_time,
                importance=task.importance
            )
            scheduled_tasks.append(scheduled_task)
            current_time = end_time
    
    return scheduled_tasks

@router.post("/priority", response_model=ScheduleResponse)
async def priority_schedule(request: ScheduleRequest):
    """
    Priority queue-based scheduling that considers task importance and deadlines.
    Uses both greedy job scheduling and activity selection algorithms.
    
    Sample payload:
    {
        "tasks": [
            {
                "id": "task1",
                "name": "Urgent Task",
                "importance": 5,
                "duration": 30,
                "dependencies": [],
                "deadline": "2024-03-20T18:00:00"
            },
            {
                "id": "task2",
                "name": "Important Task",
                "importance": 4,
                "duration": 45,
                "dependencies": [],
                "deadline": "2024-03-21T18:00:00"
            }
        ]
    }
    """
    try:
        # Get schedules using both algorithms
        greedy_schedule = greedy_job_scheduling(request.tasks)
        activity_schedule = activity_selection(request.tasks)
        
        # Choose the better schedule based on number of tasks completed
        final_schedule = greedy_schedule if len(greedy_schedule) >= len(activity_schedule) else activity_schedule
        
        return ScheduleResponse(
            scheduled_tasks=final_schedule,
            algorithm_used="greedy" if len(greedy_schedule) >= len(activity_schedule) else "activity_selection",
            total_tasks_scheduled=len(final_schedule)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 