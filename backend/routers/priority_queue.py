from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from typing import List, Dict, Set, Tuple
from heapq import heappush, heappop
from .models import Task, ScheduleRequest, ScheduledTask, ScheduleResponse

router = APIRouter()

@router.post("/priority", response_model=ScheduleResponse)
async def priority_schedule(request: ScheduleRequest):
    """
    Priority queue-based scheduling that considers task importance and deadlines.
    
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
        tasks = request.tasks
        current_time = datetime.now()
        scheduled_tasks: List[ScheduledTask] = []
        
        # Build dependency graph
        task_map: Dict[str, Task] = {task.id: task for task in tasks}
        graph: Dict[str, Set[str]] = {task.id: set() for task in tasks}
        in_degree: Dict[str, int] = {task.id: 0 for task in tasks}
        
        for task in tasks:
            for dep in task.dependencies:
                graph[dep].add(task.id)
                in_degree[task.id] += 1
        
        # Priority queue for available tasks
        # Priority is based on: (importance, -time_until_deadline)
        pq: List[Tuple[float, str]] = []
        
        # Add tasks with no dependencies to the queue
        for task in tasks:
            if in_degree[task.id] == 0:
                time_until_deadline = (task.deadline - current_time).total_seconds() / 60
                priority = (task.importance, -time_until_deadline)
                heappush(pq, (-priority[0], task.id))  # Negative for max heap
        
        while pq:
            # Get highest priority task
            _, task_id = heappop(pq)
            task = task_map[task_id]
            
            # Schedule the task
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
            
            # Update dependencies
            for dependent in graph[task_id]:
                in_degree[dependent] -= 1
                if in_degree[dependent] == 0:
                    dep_task = task_map[dependent]
                    time_until_deadline = (dep_task.deadline - current_time).total_seconds() / 60
                    priority = (dep_task.importance, -time_until_deadline)
                    heappush(pq, (-priority[0], dependent))
        
        # Check if all tasks were scheduled
        if len(scheduled_tasks) != len(tasks):
            raise HTTPException(
                status_code=400,
                detail="Circular dependency detected in tasks"
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