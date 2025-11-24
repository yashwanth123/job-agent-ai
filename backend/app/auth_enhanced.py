# [file name]: auth_enhanced.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import bcrypt
import secrets
from datetime import datetime, timedelta
from .database import get_db
from .models import User, Feedback
from .schemas import UserCreate, UserLogin, UserResponse
import logging

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)

# Session storage (in production use Redis)
user_sessions = {}
verification_tokens = {}

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create new user
        user = User(
            email=user_data.email,
            password_hash=hash_password(user_data.password),
            full_name=user_data.full_name,
            verification_token=secrets.token_urlsafe(32),
            email_verified=False
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create session
        session_token = secrets.token_hex(32)
        user_sessions[session_token] = user.id
        
        # In production: Send verification email here
        logger.info(f"Verification token for {user.email}: {user.verification_token}")
        
        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "email_verified": user.email_verified
            },
            "session_token": session_token,
            "message": "Registration successful. Please check your email for verification."
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=UserResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == user_data.email).first()
        
        if not user or not verify_password(user_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        if not user.email_verified:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Please verify your email before logging in"
            )
        
        # Create session
        session_token = secrets.token_hex(32)
        user_sessions[session_token] = user.id
        
        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "email_verified": user.email_verified,
                "phone": user.phone,
                "summary": user.summary,
                "preferred_locations": user.preferred_locations,
                "desired_salary_min": user.desired_salary_min,
                "desired_salary_max": user.desired_salary_max,
                "skills": user.skills,
                "resume_text": user.resume_text
            },
            "session_token": session_token,
            "message": "Login successful"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    user.email_verified = True
    user.verification_token = None
    db.commit()
    
    return {"message": "Email verified successfully"}

@router.post("/feedback")
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit feedback"
        )