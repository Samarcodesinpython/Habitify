from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Task(BaseModel):
    id: str
    name: str
    priority: str  # 'high', 'medium', 'low'
    time_estimate: int  # in minutes
    energy_level: str  # 'high', 'medium', 'low'
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: Optional[bool] = False
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class ScheduleRequest(BaseModel):
    tasks: List[Task]

class ScheduledTask(Task):
    scheduled_start: datetime
    scheduled_end: datetime
    completion_status: str  # "completed", "in_progress", "pending"

class ScheduleResponse(BaseModel):
    scheduled_tasks: List[ScheduledTask]
    total_duration: int
    makespan: int
    efficiency_score: float 