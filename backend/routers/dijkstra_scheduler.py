from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from typing import List, Dict, Set, Tuple
from heapq import heappush, heappop
from .models import Task, ScheduleRequest, ScheduledTask, ScheduleResponse

router = APIRouter()

@router.post("/dijkstra", response_model=ScheduleResponse)
async def dijkstra_schedule(request: ScheduleRequest):
    """
    Dijkstra-based scheduling that finds the optimal path through tasks.
    
    Sample payload:
    {
        "tasks": [
            {
                "id": "task1",
                "name": "Critical Path Task",
                "importance": 5,
                "duration": 60,
                "dependencies": [],
                "deadline": "2024-03-20T18:00:00"
            },
            {
                "id": "task2",
                "name": "Dependent Task",
                "importance": 4,
                "duration": 45,
                "dependencies": ["task1"],
                "deadline": "2024-03-21T18:00:00"
            }
        ]
    }
    """
    try:
        tasks = request.tasks
        current_time = datetime.now()
        
        # Build task graph
        task_map: Dict[str, Task] = {task.id: task for task in tasks}
        graph: Dict[str, Set[str]] = {task.id: set() for task in tasks}
        for task in tasks:
            for dep in task.dependencies:
                graph[dep].add(task.id)
        
        # Initialize distances and previous tasks
        distances: Dict[str, float] = {task.id: float('inf') for task in tasks}
        previous: Dict[str, str] = {task.id: None for task in tasks}
        visited: Set[str] = set()
        
        # Priority queue for Dijkstra's algorithm
        pq: List[Tuple[float, str]] = []
        
        # Find tasks with no dependencies to start with
        start_tasks = [task.id for task in tasks if not task.dependencies]
        if not start_tasks:
            raise HTTPException(
                status_code=400,
                detail="No tasks without dependencies found"
            )
        
        # Initialize distances for start tasks
        for task_id in start_tasks:
            distances[task_id] = 0
            heappush(pq, (0, task_id))
        
        # Run Dijkstra's algorithm
        while pq:
            current_distance, current_task = heappop(pq)
            
            if current_task in visited:
                continue
                
            visited.add(current_task)
            
            # Update distances for dependent tasks
            for dependent in graph[current_task]:
                if dependent in visited:
                    continue
                    
                task = task_map[dependent]
                new_distance = current_distance + task.duration
                
                if new_distance < distances[dependent]:
                    distances[dependent] = new_distance
                    previous[dependent] = current_task
                    heappush(pq, (new_distance, dependent))
        
        # Reconstruct the schedule
        scheduled_tasks: List[ScheduledTask] = []
        current_time = datetime.now()
        
        # Sort tasks by their distance (completion time)
        sorted_tasks = sorted(
            [(task_id, dist) for task_id, dist in distances.items()],
            key=lambda x: x[1]
        )
        
        for task_id, _ in sorted_tasks:
            task = task_map[task_id]
            
            # Calculate start and end times
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