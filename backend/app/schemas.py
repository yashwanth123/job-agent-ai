from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    summary: Optional[str] = None

class UserIn(UserBase):
    resume_text: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    summary: Optional[str] = None
    preferred_locations: Optional[str] = None
    desired_salary_min: Optional[int] = None
    desired_salary_max: Optional[int] = None
    skills: Optional[str] = None
    resume_text: Optional[str] = None

class UserResponse(BaseModel):
    user_id: int
    email: str
    full_name: Optional[str] = None
    message: str

    class Config:
        from_attributes = True

# Job Schemas
class JobOut(BaseModel):
    id: int
    title: str
    company: str
    location: str
    description: str
    apply_url: str
    score: float
    matchScore: float
    tags: List[str]
    posted: str
    type: str
    level: str
    salary: Optional[str] = None

    class Config:
        from_attributes = True

# Application Schemas
class ApplicationIn(BaseModel):
    email: str
    job_id: int

class ApplicationOut(BaseModel):
    id: int
    job_id: int
    status: str
    applied_at: datetime

    class Config:
        from_attributes = True

# AI Generation Schemas
class CoverLetterRequest(BaseModel):
    email: str
    job_id: int

class ResumeRequest(BaseModel):
    email: str
    job_id: int

class InterviewPrepRequest(BaseModel):
    email: str
    job_id: int

# Response schemas for new frontend
class UserProfile(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    summary: Optional[str] = None
    preferred_locations: Optional[str] = None
    desired_salary_min: Optional[int] = None
    desired_salary_max: Optional[int] = None
    skills: Optional[str] = None
    resume_text: Optional[str] = None

    class Config:
        from_attributes = True

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    status: str
    applied_at: datetime
    job: Optional[dict] = None

    class Config:
        from_attributes = True