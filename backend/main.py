from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models

from auth import router as auth_router
from complaints import router as complaints_router
from admin import router as admin_router




# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="Smart City AI Complaint Management",
    description="Smart City civic complaint management system",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",

        # Add your deployed frontend URL here later
        # "https://your-frontend-url.onrender.com"
    ],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# AUTHENTICATION
# =========================================================

app.include_router(auth_router)


# =========================================================
# COMPLAINTS
# =========================================================

app.include_router(complaints_router)


# =========================================================
# ADMIN
# =========================================================

app.include_router(admin_router)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message": "Smart City AI Complaint Management API is running!"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }