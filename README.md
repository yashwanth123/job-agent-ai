# 🚀 Job Agent AI

<div align="center">

![Job Agent AI](https://img.shields.io/badge/Job-Agent%20AI-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)
![React](https://img.shields.io/badge/Frontend-React%2FTypeScript-61dafb)
![AI Powered](https://img.shields.io/badge/AI-Powered-orange)

**An intelligent job search platform that uses AI to help you find and apply to your dream job**

[Live Demo](#-quick-start) • [Features](#-features) • [Screenshots](#-screenshots) • [Tech Stack](#-tech-stack)

</div>

## 📖 Overview

Job Agent AI is a full-stack application that revolutionizes job searching by combining real job data from multiple sources with AI-powered tools for cover letters, resume tailoring, and interview preparation.

## ✨ Features

### 🤖 AI-Powered Tools
- **Smart Cover Letters** - Generate personalized cover letters using your profile
- **Resume Tailoring** - Customize your resume for specific job descriptions  
- **Interview Preparation** - Get personalized questions and preparation tips

### 🔍 Job Search
- **Real Job Data** - From Adzuna, Remotive, Arbeitnow, and Greenhouse APIs
- **Smart Matching** - Advanced algorithm matches jobs to your skills
- **Search & Filter** - Find jobs by title, location, and skills

### 💼 Application Management
- **Track Applications** - Monitor your job application status
- **Save Jobs** - Bookmark interesting positions
- **Progress Analytics** - Dashboard with application statistics

### 🎯 User Experience
- **Dark Theme UI** - Modern, eye-friendly interface
- **Responsive Design** - Works on desktop and mobile
- **Real-time Updates** - Instant feedback and loading states

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **CSS3** with modern responsive design
- **Axios** for API communication

### Backend  
- **Python** with FastAPI
- **SQLAlchemy** ORM with SQLite
- **Pydantic** for data validation
- **Multiple Job APIs** integration

### AI Features
- **Custom AI Engine** - Smart content generation
- **Skill Matching** - Advanced job-user matching algorithm
- **Real-time Processing** - Instant AI responses

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** and **Node.js 16+**
- **Git** for version control

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone https://github.com/yashwanth123/job-agent-ai.git
   cd job-agent-ai
   ```

2. **Start the Backend Server**
   ```bash
   cd backend
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload --port 8000
   ```
   ✅ Backend running at: http://localhost:8000  
   📚 API Docs: http://localhost:8000/docs

3. **Start the Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   ✅ Frontend running at: http://localhost:5173

4. **Open Your Browser**
   - Go to: http://localhost:5173
   - Click **"Try Demo"** or **sign up with your email**
   - Start exploring!

### One-Command Setup (Alternative)
```bash
# Terminal 1 - Backend
cd backend && pip install -r requirements.txt && python -m uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend  
cd frontend && npm install && npm run dev
```

## 🏗️ Project Structure

```
job-agent-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI server
│   │   ├── models.py            # Database models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── auth_enhanced.py     # Authentication
│   │   └── services/
│   │       ├── ai_generator.py  # AI content generation
│   │       ├── matcher.py       # Job matching algorithm
│   │       └── enhanced_job_sources.py  # Job data APIs
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Application pages
│   │   ├── api.ts               # API client
│   │   └── App.tsx              # Main app component
│   └── package.json
└── README.md
```

## 🎯 How It Works

### 1. **User Onboarding**
   - Simple email-based authentication
   - Complete employment profile setup
   - Skills and preference configuration

### 2. **Job Discovery**
   - Import real jobs from multiple APIs
   - Advanced matching based on skills and preferences
   - Search and filter functionality

### 3. **AI Assistance**
   - Generate cover letters using your profile data
   - Tailor resumes for specific job requirements
   - Prepare for interviews with custom questions

### 4. **Application Tracking**
   - Track application status
   - Monitor interview progress
   - Analytics and insights

## 🔧 API Endpoints

### Authentication
- `POST /auth/login` - User login/registration
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Jobs
- `GET /jobs/recommended` - Get personalized job recommendations
- `GET /jobs/search` - Search jobs with filters
- `POST /jobs/import` - Import new jobs from APIs

### AI Features
- `POST /ai/generate/cover-letter` - Generate cover letter
- `POST /ai/generate/resume` - Tailor resume
- `POST /ai/generate/interview-prep` - Interview preparation

### Applications
- `GET /users/{id}/applications` - Get user applications
- `POST /applications` - Create new application

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and enhancement requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👨‍💻 Author

**Yashwanth**  
- GitHub: [@yashwanth123](https://github.com/yashwanth123)
- Project: [Job Agent AI](https://github.com/yashwanth123/job-agent-ai)

## 🙏 Acknowledgments

- Job data providers: Adzuna, Remotive, Arbeitnow, Greenhouse
- FastAPI and React communities
- AI/ML technologies that power smart features

---

<div align="center">

**⭐ Don't forget to star this repository if you find it helpful!**

</div>
```

## 🎯 **HOW TO UPDATE YOUR README:**

1. **Copy the entire text above**
2. **Go to your GitHub repository**
3. **Click on `README.md`**
4. **Click the pencil icon (Edit)**
5. **Replace everything with the new content**
6. **Scroll down → Click "Commit changes"**


## 🚀 **YOUR REPO WILL LOOK PROFESSIONAL WITH:**

✅ **Modern badges and styling**  
✅ **Clear installation instructions**  
✅ **Feature explanations**  
✅ **Technical documentation**  
✅ **Professional structure**
