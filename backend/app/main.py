# [file name]: main.py - CORRECTED IMPORT
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import secrets
import logging
import bcrypt

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.database import get_db, engine, SessionLocal
from app.models import Base, User, Job, Application, SavedJob, Feedback
from app.schemas import UserProfile, ApplicationResponse
from app.services.matcher import calculate_match_score
from app.services.ai_generator import (
    generate_cover_letter_with_ai, 
    generate_tailored_resume_with_ai,
    generate_interview_prep_with_ai
)
# CORRECTED IMPORT - from services folder
from app.services.enhanced_job_sources import fetch_all_enhanced_jobs

# ... rest of the main.py code remains the same ...# ADD THIS

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Job Agent AI API",
    description="AI-powered job search platform",
    version="3.0"
)

# Security
security = HTTPBearer()

# Session storage (in production use Redis)
user_sessions = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_current_user(token: str = Depends(security), db: Session = Depends(get_db)):
    """Get current user from session token"""
    if token.credentials not in user_sessions:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token"
        )
    
    user_id = user_sessions[token.credentials]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@app.get("/")
def root():
    return {
        "message": "Job Agent AI API", 
        "status": "running", 
        "version": "3.0",
        "docs": "/docs",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute("SELECT 1")
        user_count = db.query(User).count()
        job_count = db.query(Job).count()
        app_count = db.query(Application).count()
        saved_count = db.query(SavedJob).count()
        return {
            "status": "healthy", 
            "database": "connected",
            "users": user_count,
            "jobs": job_count,
            "applications": app_count,
            "saved_jobs": saved_count,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}

# AUTH ENDPOINTS
# ADD THIS NEW ENDPOINT to the AUTH ENDPOINTS section

@app.post("/auth/register")
def register(user_data: dict, db: Session = Depends(get_db)):
    try:
        email = user_data.get("email")
        password = user_data.get("password")
        full_name = user_data.get("full_name", "")
        
        if not email:
            raise HTTPException(400, "Email is required")
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(400, "Email already registered")
        
        # Create new user
        user = User(
            email=email,
            full_name=full_name,
            resume_text=user_data.get("resume_text", ""),
            skills="AWS, Azure, Terraform, Kubernetes, Docker, Python, DevOps",
            preferred_locations="Remote, San Francisco, New York",
            desired_salary_min=120000,
            desired_salary_max=200000,
            summary="Experienced cloud and DevOps professional"
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create session
        session_token = secrets.token_hex(32)
        user_sessions[session_token] = user.id
        
        logger.info(f"New user registered: {email}")
        
        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "phone": user.phone,
                "summary": user.summary,
                "skills": user.skills,
                "preferred_locations": user.preferred_locations,
                "desired_salary_min": user.desired_salary_min,
                "desired_salary_max": user.desired_salary_max,
                "resume_text": user.resume_text
            },
            "session_token": session_token,
            "message": "Registration successful"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Registration error: {e}")
        raise HTTPException(500, "Registration failed")
        
@app.post("/auth/login")
def login(user_data: dict, db: Session = Depends(get_db)):
    try:
        email = user_data.get("email")
        full_name = user_data.get("full_name", "")
        resume_text = user_data.get("resume_text", "")
        
        if not email:
            raise HTTPException(400, "Email is required")
        
        # Find or create user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                full_name=full_name,
                resume_text=resume_text,
                skills="AWS, Azure, Terraform, Kubernetes, Docker, Python, DevOps",
                preferred_locations="Remote, San Francisco, New York",
                desired_salary_min=120000,
                desired_salary_max=200000,
                summary="Experienced cloud and DevOps professional with expertise in modern infrastructure and automation."
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Created new user: {email}")
        else:
            # Update user data if provided
            if full_name:
                user.full_name = full_name
            if resume_text:
                user.resume_text = resume_text
            db.commit()
            logger.info(f"User logged in: {email}")
        
        # Create session
        session_token = secrets.token_hex(32)
        user_sessions[session_token] = user.id
        
        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "phone": user.phone,
                "summary": user.summary,
                "skills": user.skills,
                "preferred_locations": user.preferred_locations,
                "desired_salary_min": user.desired_salary_min,
                "desired_salary_max": user.desired_salary_max,
                "resume_text": user.resume_text
            },
            "session_token": session_token,
            "message": "Login successful"
        }
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(500, "Internal server error during login")

@app.post("/auth/logout")
def logout(token: str = Depends(security)):
    try:
        if token.credentials in user_sessions:
            del user_sessions[token.credentials]
        return {"message": "Logged out successfully"}
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(500, "Internal server error during logout")

@app.get("/auth/me")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "summary": current_user.summary,
        "preferred_locations": current_user.preferred_locations,
        "desired_salary_min": current_user.desired_salary_min,
        "desired_salary_max": current_user.desired_salary_max,
        "skills": current_user.skills,
        "resume_text": current_user.resume_text
    }

# SETTINGS & FEEDBACK ENDPOINTS
@app.post("/feedback")
def submit_feedback(feedback_data: dict, db: Session = Depends(get_db)):
    try:
        feedback = Feedback(
            user_id=feedback_data.get("user_id"),
            rating=feedback_data.get("rating"),
            comment=feedback_data.get("comment"),
            category=feedback_data.get("category", "suggestion")
        )
        
        db.add(feedback)
        db.commit()
        
        return {"message": "Feedback submitted successfully"}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Feedback submission error: {e}")
        raise HTTPException(500, "Failed to submit feedback")

@app.get("/feedback/stats")
def get_feedback_stats(db: Session = Depends(get_db)):
    try:
        total_feedback = db.query(Feedback).count()
        avg_rating = db.query(Feedback.rating).scalar() or 0
        
        return {
            "total_feedback": total_feedback,
            "average_rating": avg_rating,
            "categories": {
                "suggestion": db.query(Feedback).filter(Feedback.category == "suggestion").count(),
                "bug": db.query(Feedback).filter(Feedback.category == "bug").count(),
                "feature": db.query(Feedback).filter(Feedback.category == "feature").count()
            }
        }
    except Exception as e:
        logger.error(f"Feedback stats error: {e}")
        raise HTTPException(500, "Failed to get feedback stats")

# USER ENDPOINTS
@app.get("/users/{user_id}", response_model=UserProfile)
def get_user(user_id: int, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(404, "User not found")
        return user
    except Exception as e:
        logger.error(f"Get user error: {e}")
        raise HTTPException(500, "Internal server error")

@app.put("/users/{user_id}", response_model=UserProfile)
def update_user(user_id: int, user_data: dict, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(404, "User not found")
        
        updatable_fields = ['full_name', 'phone', 'summary', 'preferred_locations', 
                           'desired_salary_min', 'desired_salary_max', 'skills', 'resume_text']
        
        for field, value in user_data.items():
            if field in updatable_fields and hasattr(user, field):
                setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        logger.error(f"Update user error: {e}")
        raise HTTPException(500, "Internal server error")

# APPLICATIONS ENDPOINTS
@app.get("/users/{user_id}/applications")
def get_user_applications(user_id: int, db: Session = Depends(get_db)):
    try:
        applications = db.query(Application).filter(Application.user_id == user_id).all()
        
        result = []
        for app in applications:
            job = db.query(Job).filter(Job.id == app.job_id).first()
            if job:
                result.append({
                    "id": app.id,
                    "job_id": job.id,
                    "status": app.status,
                    "applied_at": app.applied_at.isoformat(),
                    "updated_at": app.updated_at.isoformat(),
                    "job": {
                        "id": job.id,
                        "title": job.title,
                        "company": job.company,
                        "location": job.location,
                        "apply_url": job.apply_url,
                        "description": job.description[:200] + "..." if job.description else ""
                    }
                })
        
        return result
    except Exception as e:
        logger.error(f"Get applications error: {e}")
        raise HTTPException(500, "Internal server error")

@app.post("/applications")
def create_application(application_data: dict, db: Session = Depends(get_db)):
    try:
        user_id = application_data.get("user_id", 1)
        job_id = application_data.get("job_id")
        
        if not job_id:
            raise HTTPException(400, "Job ID is required")
        
        # Check if job exists
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(404, "Job not found")
        
        # Check if already applied
        existing = db.query(Application).filter(
            Application.user_id == user_id,
            Application.job_id == job_id
        ).first()
        
        if existing:
            return {
                "message": "Already applied to this job", 
                "application_id": existing.id,
                "status": existing.status
            }
        
        # Create new application
        application = Application(
            user_id=user_id,
            job_id=job_id,
            status="Applied",
            applied_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(application)
        db.commit()
        db.refresh(application)
        
        logger.info(f"Application created: user={user_id}, job={job_id}")
        return {
            "message": "Application submitted successfully",
            "application_id": application.id,
            "status": application.status
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Create application error: {e}")
        raise HTTPException(500, "Internal server error")

# JOBS ENDPOINTS
@app.get("/jobs/recommended")
def get_recommended_jobs(db: Session = Depends(get_db), user_id: int = Query(1)):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        jobs = db.query(Job).all()
        
        # Calculate match scores for all jobs
        jobs_with_scores = []
        for job in jobs:
            score = calculate_match_score(job, user) if user else 75.0
            jobs_with_scores.append({
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "description": job.description,
                "apply_url": job.apply_url,
                "salary_min": job.salary_min,
                "salary_max": job.salary_max,
                "salary": job.salary,
                "score": score,
                "matchScore": score,
                "type": job.job_type,
                "level": job.level,
                "tags": [job.job_type, job.level] if job.job_type and job.level else ["Full-time", "Mid Level"]
            })
        
        # Sort by match score and return top 50
        sorted_jobs = sorted(jobs_with_scores, key=lambda x: x["matchScore"], reverse=True)
        return sorted_jobs[:50]
    except Exception as e:
        logger.error(f"Get recommended jobs error: {e}")
        raise HTTPException(500, "Internal server error")

@app.get("/jobs/search")
def search_jobs(
    query: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user_id: int = Query(1)
):
    try:
        jobs_query = db.query(Job)
        user = db.query(User).filter(User.id == user_id).first()
        
        if query:
            jobs_query = jobs_query.filter(
                Job.title.ilike(f"%{query}%") | 
                Job.description.ilike(f"%{query}%") |
                Job.company.ilike(f"%{query}%")
            )
        
        if location:
            jobs_query = jobs_query.filter(Job.location.ilike(f"%{location}%"))
        
        jobs = jobs_query.limit(100).all()
        
        # Calculate match scores
        result = []
        for job in jobs:
            score = calculate_match_score(job, user) if user else 75.0
            result.append({
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "description": job.description,
                "apply_url": job.apply_url,
                "salary_min": job.salary_min,
                "salary_max": job.salary_max,
                "salary": job.salary,
                "score": score,
                "matchScore": score,
                "type": job.job_type,
                "level": job.level,
                "tags": [job.job_type, job.level] if job.job_type and job.level else ["Full-time", "Mid Level"]
            })
        
        return sorted(result, key=lambda x: x["matchScore"], reverse=True)
    except Exception as e:
        logger.error(f"Search jobs error: {e}")
        raise HTTPException(500, "Internal server error")

@app.post("/jobs/import")
def import_jobs(import_data: dict, db: Session = Depends(get_db)):
    try:
        query = import_data.get("query", "cloud engineer")
        user_id = import_data.get("user_id", 1)
        
        # Fetch enhanced real jobs from multiple sources
        jobs_data = fetch_all_enhanced_jobs(query)
        
        # Import to database
        imported_count = 0
        for job_data in jobs_data:
            # Check if job already exists
            existing = db.query(Job).filter(
                Job.title == job_data.get("title"),
                Job.company == job_data.get("company")
            ).first()
            
            if not existing:
                job = Job(
                    title=job_data.get("title", ""),
                    company=job_data.get("company", ""),
                    description=job_data.get("description", ""),
                    location=job_data.get("location", "Remote"),
                    apply_url=job_data.get("apply_url", ""),
                    job_type=job_data.get("job_type", "Full-time"),
                    level=job_data.get("level", "Mid Level"),
                    salary_min=job_data.get("salary_min"),
                    salary_max=job_data.get("salary_max"),
                    salary=job_data.get("salary"),
                    score=75.0
                )
                db.add(job)
                imported_count += 1
        
        db.commit()
        
        logger.info(f"Imported {imported_count} jobs for query: {query}")
        return {
            "status": "success",
            "imported": imported_count,
            "total_found": len(jobs_data),
            "message": f"Successfully imported {imported_count} new jobs"
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Import jobs error: {e}")
        raise HTTPException(500, "Internal server error")

# SAVED JOBS ENDPOINTS
@app.get("/users/{user_id}/saved-jobs")
def get_saved_jobs(user_id: int, db: Session = Depends(get_db)):
    try:
        saved_jobs = db.query(SavedJob).filter(SavedJob.user_id == user_id).all()
        
        result = []
        for saved in saved_jobs:
            job = db.query(Job).filter(Job.id == saved.job_id).first()
            if job:
                result.append({
                    "id": saved.id,
                    "saved_at": saved.saved_at.isoformat(),
                    "job": {
                        "id": job.id,
                        "title": job.title,
                        "company": job.company,
                        "location": job.location,
                        "description": job.description,
                        "apply_url": job.apply_url,
                        "salary": job.salary,
                        "type": job.job_type,
                        "level": job.level
                    }
                })
        
        return result
    except Exception as e:
        logger.error(f"Get saved jobs error: {e}")
        raise HTTPException(500, "Internal server error")

@app.post("/saved-jobs")
def save_job(save_data: dict, db: Session = Depends(get_db)):
    try:
        user_id = save_data.get("user_id")
        job_id = save_data.get("job_id")
        
        if not user_id or not job_id:
            raise HTTPException(400, "User ID and Job ID are required")
        
        # Check if already saved
        existing = db.query(SavedJob).filter(
            SavedJob.user_id == user_id,
            SavedJob.job_id == job_id
        ).first()
        
        if existing:
            return {"message": "Job already saved", "saved_id": existing.id}
        
        # Save job
        saved_job = SavedJob(
            user_id=user_id,
            job_id=job_id,
            saved_at=datetime.utcnow()
        )
        
        db.add(saved_job)
        db.commit()
        db.refresh(saved_job)
        
        logger.info(f"Job saved: user={user_id}, job={job_id}")
        return {
            "message": "Job saved successfully",
            "saved_id": saved_job.id
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Save job error: {e}")
        raise HTTPException(500, "Internal server error")

@app.delete("/saved-jobs/{saved_id}")
def unsave_job(saved_id: int, db: Session = Depends(get_db)):
    try:
        saved_job = db.query(SavedJob).filter(SavedJob.id == saved_id).first()
        if not saved_job:
            raise HTTPException(404, "Saved job not found")
        
        db.delete(saved_job)
        db.commit()
        
        logger.info(f"Job unsaved: {saved_id}")
        return {"message": "Job removed from saved list"}
    except Exception as e:
        db.rollback()
        logger.error(f"Unsave job error: {e}")
        raise HTTPException(500, "Internal server error")

# AI GENERATION ENDPOINTS
@app.post("/ai/generate/cover-letter")
def generate_cover_letter(request_data: dict, db: Session = Depends(get_db)):
    """Generate cover letter - NO FALLBACKS, ONLY REAL DATA"""
    try:
        user_id = request_data.get("user_id", 1)
        job_id = request_data.get("job_id", 1)
        
        print(f"🎯 GENERATING COVER LETTER - REAL DATA ONLY")
        
        # Get real user data
        user = db.query(User).filter(User.id == user_id).first()
        job = db.query(Job).filter(Job.id == job_id).first()
        
        if not user:
            return {"status": "error", "error": "User not found"}
        if not job:
            return {"status": "error", "error": "Job not found"}
        
        print(f"🔍 USER DATA: {user.full_name}, {user.email}")
        print(f"🔍 USER SKILLS: {user.skills}")
        print(f"🔍 USER RESUME LENGTH: {len(user.resume_text or '')}")
        print(f"🔍 JOB: {job.title} at {job.company}")
        
        # Convert to dict - no defaults
        user_data = {
            "full_name": user.full_name or "",
            "email": user.email or "",
            "phone": user.phone or "",
            "skills": user.skills or "",
            "resume_text": user.resume_text or "",
            "summary": user.summary or ""
        }
        
        result = generate_cover_letter_with_ai(
            user_data,
            job.title, 
            job.company,
            job.description or ""
        )
        
        print(f"✅ COVER LETTER GENERATED: {len(result.get('content', ''))} chars")
        return result
        
    except Exception as e:
        print(f"❌ COVER LETTER ERROR: {e}")
        return {"status": "error", "error": f"Generation failed: {str(e)}"}

@app.post("/ai/generate/resume")
def generate_tailored_resume(request_data: dict, db: Session = Depends(get_db)):
    """Generate resume - NO FALLBACKS, ONLY REAL DATA"""
    try:
        user_id = request_data.get("user_id", 1)
        job_id = request_data.get("job_id", 1)
        
        print(f"🎯 GENERATING RESUME - REAL DATA ONLY")
        
        # Get real user data
        user = db.query(User).filter(User.id == user_id).first()
        job = db.query(Job).filter(Job.id == job_id).first()
        
        if not user:
            return {"status": "error", "error": "User not found"}
        if not job:
            return {"status": "error", "error": "Job not found"}
        
        print(f"🔍 USER DATA: {user.full_name}")
        print(f"🔍 USER RESUME: {user.resume_text[:200] if user.resume_text else 'EMPTY'}...")
        
        # Convert to dict - no defaults
        user_data = {
            "full_name": user.full_name or "",
            "email": user.email or "",
            "phone": user.phone or "",
            "skills": user.skills or "",
            "resume_text": user.resume_text or "",
            "summary": user.summary or ""
        }
        
        result = generate_tailored_resume_with_ai(
            user_data,
            job.title,
            job.description or ""
        )
        
        print(f"✅ RESUME GENERATED: {len(result.get('content', ''))} chars")
        return result
        
    except Exception as e:
        print(f"❌ RESUME ERROR: {e}")
        return {"status": "error", "error": f"Generation failed: {str(e)}"}

@app.post("/ai/generate/interview-prep")
def generate_interview_prep(request_data: dict, db: Session = Depends(get_db)):
    """Generate interview prep - NO FALLBACKS, ONLY REAL DATA"""
    try:
        user_id = request_data.get("user_id", 1)
        job_id = request_data.get("job_id", 1)
        
        user = db.query(User).filter(User.id == user_id).first()
        job = db.query(Job).filter(Job.id == job_id).first()
        
        if not user or not job:
            return {"status": "error", "error": "User or job not found"}
        
        user_data = {
            "full_name": user.full_name or "",
            "skills": user.skills or "",
            "resume_text": user.resume_text or ""
        }
        
        result = generate_interview_prep_with_ai(
            user_data,
            job.title,
            job.company,
            job.description or ""
        )
        
        return result
        
    except Exception as e:
        return {"status": "error", "error": f"Generation failed: {str(e)}"}

# Startup with enhanced jobs
@app.on_event("startup")
def startup_event():
    print("🚀 Starting Job Agent AI Backend v3.0...")
    db = SessionLocal()
    try:
        # Import initial enhanced real jobs if none exist
        jobs_count = db.query(Job).count()
        if jobs_count == 0:
            print("📥 Importing initial enhanced real jobs...")
            jobs_data = fetch_all_enhanced_jobs("cloud engineer devops")
            for job_data in jobs_data:
                job = Job(
                    title=job_data.get("title", ""),
                    company=job_data.get("company", ""),
                    description=job_data.get("description", ""),
                    location=job_data.get("location", "Remote"),
                    apply_url=job_data.get("apply_url", ""),
                    job_type=job_data.get("job_type", "Full-time"),
                    level=job_data.get("level", "Mid Level"),
                    salary_min=job_data.get("salary_min"),
                    salary_max=job_data.get("salary_max"),
                    salary=job_data.get("salary"),
                    score=75.0
                )
                db.add(job)
            db.commit()
            print(f"✅ Imported {len(jobs_data)} enhanced real jobs")
        else:
            print(f"✅ Database has {jobs_count} jobs")
            
    except Exception as e:
        print(f"❌ Startup error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)