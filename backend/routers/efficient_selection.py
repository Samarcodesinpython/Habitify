from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from ..efficient_selection import analyze_tasks
from .models import get_user_tasks  # You need to implement this to fetch tasks for the user

router = APIRouter()

@router.get("/efficient-selection")
async def efficient_selection(user_id: str):
    tasks = get_user_tasks(user_id)  # Fetch tasks from DB
    analysis = analyze_tasks(tasks)
    return {"analysis": analysis}

def analyze_tasks(tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    now = datetime.now()
    results = []
    for task in tasks:
        name = task["title"]
        duration = float(task.get("duration", 1))  # in hours
        deadline_str = task.get("due_date")
        priority = task.get("priority", "medium")
        energy = task.get("energy", "medium")
        deadline = datetime.fromisoformat(deadline_str) if deadline_str else now

        time_left = (deadline - now).total_seconds() / 3600

        if duration > time_left:
            suggestion = {
                "task": name,
                "status": "impossible",
                "reason": f"Duration ({duration}h) > time left ({time_left:.2f}h)",
                "actions": ["skip", "reschedule"]
            }
            if duration > 1:
                subtasks = [
                    {"name": f"{name} - Part {i+1}", "duration": 1}
                    for i in range(int(duration))
                ]
                suggestion["subtasks"] = subtasks
            results.append(suggestion)
        elif priority == "low" or energy == "low":
            results.append({
                "task": name,
                "status": "skip",
                "reason": "Low priority or low energy"
            })
        else:
            results.append({
                "task": name,
                "status": "feasible",
                "reason": f"Can be completed in time ({time_left:.2f}h left)"
            })
    return results
