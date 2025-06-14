from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import greedy_scheduler, topological_sort, dynamic_programming, dijkstra_scheduler, priority_queue

app = FastAPI(title="Task Scheduler API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include rouers
app.include_router(greedy_scheduler.router, prefix="/api", tags=["scheduling"])
app.include_router(topological_sort.router, prefix="/api", tags=["scheduling"])
app.include_router(dynamic_programming.router, prefix="/api", tags=["scheduling"])
app.include_router(dijkstra_scheduler.router, prefix="/api", tags=["scheduling"])
app.include_router(priority_queue.router, prefix="/api", tags=["scheduling"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 