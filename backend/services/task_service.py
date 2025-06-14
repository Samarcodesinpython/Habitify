from typing import List, Optional
from datetime import datetime
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..database.models import Task, TaskDependency
from ..routers.priority_queue import greedy_job_scheduling, activity_selection

class TaskService:
    def __init__(self, db: Session):
        self.db = db

    async def create_task(self, user_id: UUID, task_data: dict) -> Task:
        task = Task(
            user_id=user_id,
            name=task_data["name"],
            importance=task_data["importance"],
            duration=task_data["duration"],
            deadline=task_data["deadline"]
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    async def get_user_tasks(self, user_id: UUID) -> List[Task]:
        return self.db.query(Task).filter(Task.user_id == user_id).all()

    async def update_task(self, task_id: UUID, task_data: dict) -> Task:
        task = self.db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        for key, value in task_data.items():
            setattr(task, key, value)
        
        self.db.commit()
        self.db.refresh(task)
        return task

    async def delete_task(self, task_id: UUID) -> None:
        task = self.db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        self.db.delete(task)
        self.db.commit()

    async def add_dependency(self, task_id: UUID, dependency_id: UUID) -> None:
        dependency = TaskDependency(task_id=task_id, dependency_id=dependency_id)
        self.db.add(dependency)
        self.db.commit()

    async def get_schedule(self, user_id: UUID) -> dict:
        tasks = await self.get_user_tasks(user_id)
        
        # Convert database tasks to scheduling format
        scheduling_tasks = [
            {
                "id": str(task.id),
                "name": task.name,
                "importance": task.importance,
                "duration": task.duration,
                "deadline": task.deadline,
                "dependencies": [
                    str(dep.dependency_id) 
                    for dep in self.db.query(TaskDependency)
                    .filter(TaskDependency.task_id == task.id)
                    .all()
                ]
            }
            for task in tasks
        ]
        
        # Get schedules using both algorithms
        greedy_schedule = greedy_job_scheduling(scheduling_tasks)
        activity_schedule = activity_selection(scheduling_tasks)
        
        # Choose the better schedule
        final_schedule = greedy_schedule if len(greedy_schedule) >= len(activity_schedule) else activity_schedule
        
        return {
            "scheduled_tasks": final_schedule,
            "algorithm_used": "greedy" if len(greedy_schedule) >= len(activity_schedule) else "activity_selection",
            "total_tasks_scheduled": len(final_schedule)
        } 