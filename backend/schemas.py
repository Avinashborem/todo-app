from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ── Auth schemas ──

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# ── Subtask schemas ──

class SubtaskCreate(BaseModel):
    title: str

class SubtaskResponse(BaseModel):
    id: int
    title: str
    completed: bool
    task_id: int

    class Config:
        from_attributes = True

# ── Task schemas ──

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: Optional[str] = "medium"
    category: Optional[str] = "personal"
    deadline: Optional[str] = None
    completed: Optional[bool] = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    deadline: Optional[str] = None
    completed: Optional[bool] = None

class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    subtasks: List[SubtaskResponse] = []

    class Config:
        from_attributes = True