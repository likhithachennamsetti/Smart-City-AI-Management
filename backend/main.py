from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models
from auth import router as auth_router
from complaints import router as complaints_router
from admin import router as admin_router
from ai_api import router as ai_router
from ai.ai_recommendation import router as ai_recommendation_router
from ai.ai_analyzer import router as ai_analyzer_router

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Smart City AI Complaint Management",
    description="AI-powered civic complaint management system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication routes
app.include_router(auth_router)

# Complaint routes
app.include_router(complaints_router)

#admin routes
app.include_router(admin_router)

# AI Detection routes
app.include_router(ai_router)

# AI Recommendation routes
app.include_router(ai_recommendation_router)

# AI Analyzer routes
app.include_router(ai_analyzer_router)


@app.get("/")
def root():
    return {
        "message": "Smart City AI Complaint Management API is running!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }