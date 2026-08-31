from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Literal


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value):
        if not value.isdigit() or len(value) != 10:
            raise ValueError("Phone number must contain exactly 10 digits")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value):
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters")
        return value


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    role: str

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str

class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: str
    priority:  Literal["low", "medium", "high"]  = "medium"
    location: str | None = None

class ComplaintResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    status: str
    priority: str
    user_id: int
    location: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class ComplaintUpdate(BaseModel):
    title: str
    description: str
    category: str
    priority: Literal["low", "medium", "high"]

class ComplaintStatusUpdate(BaseModel):
    status: Literal["pending", "in_progress", "resolved"]