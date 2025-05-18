from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from .models import Task, ScheduleRequest, ScheduledTask, ScheduleResponse

router = APIRouter()

@router.post("/dynamic", response_model=ScheduleResponse)
async def dynamic_schedule(request: ScheduleRequest):
    """
    Dynamic programming-based scheduling that optimizes for importance and deadline.
    
    Sample payload:
    {
        "tasks": [
            {
                "id": "task1",
                "name": "High Priority Task",
                "importance": 5,
                "duration": 60,
                "dependencies": [],
                "deadline": "2024-03-20T18:00:00"
            },
            {
                "id": "task2",
                "name": "Medium Priority Task",
                "importance": 3,
                "duration": 90,
                "dependencies": [],
                "deadline": "2024-03-21T18:00:00"
            }
        ]
    }
    """
    try:
        tasks = request.tasks
        current_time = datetime.now()
        
        def calculate_value(task: Task, current_time: datetime) -> float:
            """Calculate the value of scheduling a task at the current time."""
            time_until_deadline = (task.deadline - current_time).total_seconds() / 60
            if time_until_deadline < task.duration:
                return float('-inf')  # Task cannot be completed before deadline
            return task.importance / (time_until_deadline - task.duration)
        
        def dp_schedule(
            remaining_tasks: List[Task],
            current_time: datetime,
            memo: Dict[Tuple[str, ...], Tuple[List[ScheduledTask], float]]
        ) -> Tuple[List[ScheduledTask], float]:
            """Dynamic programming function to find optimal schedule."""
            task_ids = tuple(sorted(task.id for task in remaining_tasks))
            if task_ids in memo:
                return memo[task_ids]
            
            if not remaining_tasks:
                return [], 0.0
            
            best_schedule = []
            best_value = float('-inf')
            
            for i, task in enumerate(remaining_tasks):
                # Check if all dependencies are satisfied
                if not all(dep in [t.id for t in best_schedule] for dep in task.dependencies):
                    continue
                
                task_value = calculate_value(task, current_time)
                if task_value == float('-inf'):
                    continue
                
                scheduled_start = current_time
                scheduled_end = scheduled_start + timedelta(minutes=task.duration)
                
                scheduled_task = ScheduledTask(
                    **task.dict(),
                    scheduled_start=scheduled_start,
                    scheduled_end=scheduled_end,
                    completion_status="pending"
                )
                
                # Recursively schedule remaining tasks
                remaining = remaining_tasks[:i] + remaining_tasks[i+1:]
                sub_schedule, sub_value = dp_schedule(remaining, scheduled_end, memo)
                
                total_value = task_value + sub_value
                if total_value > best_value:
                    best_value = total_value
                    best_schedule = [scheduled_task] + sub_schedule
            
            memo[task_ids] = (best_schedule, best_value)
            return best_schedule, best_value
        
        # Run dynamic programming algorithm
        scheduled_tasks, _ = dp_schedule(tasks, current_time, {})
        
        if not scheduled_tasks:
            raise HTTPException(
                status_code=400,
                detail="No valid schedule found for the given tasks"
            )
        
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