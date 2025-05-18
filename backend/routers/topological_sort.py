from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from typing import List, Dict, Set
from collections import defaultdict, deque
from .models import Task, ScheduleRequest, ScheduledTask, ScheduleResponse

router = APIRouter()

@router.post("/topological", response_model=ScheduleResponse)
async def topological_schedule(request: ScheduleRequest):
    """
    Topological sort-based scheduling that respects task dependencies.
    
    Sample payload:
    {
        "tasks": [
            {
                "id": "task1",
                "name": "Design",
                "importance": 4,
                "duration": 60,
                "dependencies": [],
                "deadline": "2024-03-20T18:00:00"
            },
            {
                "id": "task2",
                "name": "Implementation",
                "importance": 5,
                "duration": 120,
                "dependencies": ["task1"],
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
        graph: Dict[str, Set[str]] = defaultdict(set)
        in_degree: Dict[str, int] = defaultdict(int)
        task_map: Dict[str, Task] = {task.id: task for task in tasks}
        
        for task in tasks:
            for dep in task.dependencies:
                graph[dep].add(task.id)
                in_degree[task.id] += 1
        
        # Topological sort using Kahn's algorithm
        queue = deque([task.id for task in tasks if in_degree[task.id] == 0])
        
        while queue:
            task_id = queue.popleft()
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
                    queue.append(dependent)
        
        # Check for cycles
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