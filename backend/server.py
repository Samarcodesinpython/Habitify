from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import greedy_scheduler

app = FastAPI(title="Task Scheduler API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include only the greedy scheduler router
app.include_router(greedy_scheduler.router, prefix="/api", tags=["scheduling"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 