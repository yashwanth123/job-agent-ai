# [file name]: matcher.py
import re
from typing import Dict, Any, List

def extract_skills_from_text(text: str) -> List[str]:
    """Extract technical skills from text using pattern matching"""
    if not text:
        return []
    
    text_lower = text.lower()
    
    # Comprehensive skill patterns
    skill_patterns = {
        'aws': r'\b(aws|amazon web services)\b',
        'azure': r'\b(azure|microsoft azure)\b', 
        'gcp': r'\b(gcp|google cloud|gcp platform)\b',
        'terraform': r'\b(terraform)\b',
        'kubernetes': r'\b(kubernetes|k8s)\b',
        'docker': r'\b(docker|container)\b',
        'python': r'\b(python)\b',
        'java': r'\b(java)\b',
        'javascript': r'\b(javascript|js)\b',
        'typescript': r'\b(typescript|ts)\b',
        'react': r'\b(react)\b',
        'node': r'\b(node|nodejs|node.js)\b',
        'linux': r'\b(linux|unix)\b',
        'bash': r'\b(bash|shell scripting)\b',
        'git': r'\b(git)\b',
        'jenkins': r'\b(jenkins)\b',
        'ansible': r'\b(ansible)\b',
        'puppet': r'\b(puppet)\b',
        'chef': r'\b(chef)\b',
        'ci/cd': r'\b(ci/cd|continuous integration|continuous deployment)\b',
        'devops': r'\b(devops)\b',
        'sre': r'\b(sre|site reliability)\b',
        'microservices': r'\b(microservices)\b',
        'api': r'\b(api|rest api|graphql)\b',
        'sql': r'\b(sql|mysql|postgresql|mongodb|redis)\b'
    }
    
    skills = []
    for skill, pattern in skill_patterns.items():
        if re.search(pattern, text_lower):
            skills.append(skill)
    
    return skills

def calculate_advanced_match_score(job, user) -> float:
    """Advanced matching with skill weights and priorities"""
    if not user:
        return 75.0
    
    score = 0
    max_score = 100
    
    # Extract skills from job description and user profile
    job_desc = job.description if hasattr(job, 'description') else ""
    user_resume = user.resume_text if hasattr(user, 'resume_text') else ""
    user_skills_text = user.skills if hasattr(user, 'skills') else ""
    
    job_skills = extract_skills_from_text(job_desc)
    user_skills = extract_skills_from_text(user_resume) + extract_skills_from_text(user_skills_text)
    
    # Remove duplicates
    user_skills = list(set(user_skills))
    
    # Skill weights (higher = more important)
    skill_weights = {
        'aws': 10, 'azure': 10, 'gcp': 10,
        'terraform': 9, 'kubernetes': 9, 'docker': 8,
        'devops': 8, 'sre': 8, 'ci/cd': 7,
        'python': 6, 'java': 5, 'linux': 5,
        'ansible': 6, 'puppet': 6, 'chef': 6,
        'jenkins': 5, 'git': 4, 'bash': 4,
        'javascript': 4, 'typescript': 4, 'react': 3,
        'node': 4, 'microservices': 5, 'api': 4,
        'sql': 4
    }
    
    # Calculate skill match score (50 points max)
    skill_score = 0
    matched_skills = []
    
    for skill in job_skills:
        if skill in user_skills:
            weight = skill_weights.get(skill, 3)
            skill_score += weight
            matched_skills.append(skill)
    
    # Normalize skill score to 50 points
    max_possible_skill_score = sum(skill_weights.get(skill, 3) for skill in job_skills)
    if max_possible_skill_score > 0:
        score += min((skill_score / max_possible_skill_score) * 50, 50)
    else:
        score += 25  # Default score if no skills detected
    
    # Experience level matching (15 points)
    job_level = (getattr(job, 'level', '') or "").lower()
    user_experience = extract_experience_level(user_resume)
    
    if job_level in user_experience:
        score += 15
    elif any(level in user_experience for level in ['senior', 'lead']) and job_level in ['senior', 'lead']:
        score += 12
    elif any(level in user_experience for level in ['mid']) and job_level in ['mid']:
        score += 10
    
    # Location matching (20 points)
    if hasattr(user, 'preferred_locations') and user.preferred_locations and hasattr(job, 'location') and job.location:
        user_locations = [loc.strip().lower() for loc in user.preferred_locations.split(',')]
        job_location = job.location.lower()
        
        if any(loc in job_location for loc in user_locations):
            score += 20
        elif 'remote' in job_location and any('remote' in loc for loc in user_locations):
            score += 20
        elif any(user_loc in job_location for user_loc in ['remote', 'anywhere', 'global']):
            score += 15
    
    # Salary matching (15 points)
    if hasattr(user, 'desired_salary_min') and user.desired_salary_min and hasattr(job, 'salary_max') and job.salary_max:
        if job.salary_max >= user.desired_salary_min:
            salary_ratio = min(job.salary_max / user.desired_salary_min, 2.0)
            score += min(15 * salary_ratio, 15)
        elif hasattr(job, 'salary_min') and job.salary_min and job.salary_min >= user.desired_salary_min:
            score += 10
    
    return min(score, max_score)

def extract_experience_level(text: str) -> List[str]:
    """Extract experience level from text"""
    if not text:
        return ['mid']
        
    text_lower = text.lower()
    levels = []
    
    if any(word in text_lower for word in ['senior', 'lead', 'principal', 'staff', '5+ years', '6+ years', '7+ years', '8+ years']):
        levels.append('senior')
    if any(word in text_lower for word in ['mid-level', 'mid level', 'intermediate', '3+ years', '4+ years']):
        levels.append('mid')
    if any(word in text_lower for word in ['junior', 'entry', 'associate', '0-2 years', '1+ years', '2+ years']):
        levels.append('junior')
    
    return levels if levels else ['mid']  # Default to mid-level

def calculate_match_score(job, user):
    """Main match score calculation - uses advanced matching"""
    return calculate_advanced_match_score(job, user)

# Keep the original function for backward compatibility
def compute_match_score(resume_text: str, job_description: str, job_title: str) -> float:
    """Original function for backward compatibility"""
    # Create mock objects for the new function
    class MockJob:
        def __init__(self, description, title):
            self.description = description
            self.title = title
            self.level = extract_experience_level(title)[0]
            self.location = "Remote"
            self.salary_min = None
            self.salary_max = None
    
    class MockUser:
        def __init__(self, resume_text):
            self.resume_text = resume_text
            self.skills = ""
            self.preferred_locations = "Remote"
            self.desired_salary_min = 120000
    
    mock_job = MockJob(job_description, job_title)
    mock_user = MockUser(resume_text)
    
    return calculate_advanced_match_score(mock_job, mock_user)