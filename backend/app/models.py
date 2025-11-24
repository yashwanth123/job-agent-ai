# [file name]: models.py - COMPLETE
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String, default="Demo User")
    phone = Column(String, nullable=True)
    summary = Column(Text, default="Experienced cloud and DevOps professional")
    resume_text = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Preferences
    preferred_locations = Column(Text, default="Remote, San Francisco, New York")
    desired_salary_min = Column(Integer, default=120000)
    desired_salary_max = Column(Integer, default=200000)
    skills = Column(Text, default="AWS, Azure, Terraform, Kubernetes, Docker, Python, DevOps")
    
    # Relationships
    applications = relationship("Application", back_populates="user")
    saved_jobs = relationship("SavedJob", back_populates="user")

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String, unique=True, index=True, nullable=True)
    title = Column(String, index=True)
    company = Column(String)
    description = Column(Text)
    location = Column(String)
    apply_url = Column(String)
    job_type = Column(String, default="Full-time")
    level = Column(String, default="Mid Level")
    salary = Column(String, nullable=True)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    score = Column(Float, default=50.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    status = Column(String, default="Application Submitted")
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="applications")
    job = relationship("Job")

class SavedJob(Base):
    __tablename__ = "saved_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    saved_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="saved_jobs")
    job = relationship("Job")

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer)  # 1-5 stars
    comment = Column(Text)
    category = Column(String)  # bug, suggestion, feature
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")