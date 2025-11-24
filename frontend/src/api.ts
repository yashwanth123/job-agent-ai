// [file name]: api.ts - ENHANCED
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Enhanced API client with better error handling
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('session_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      throw new Error('Cannot connect to backend server. Please make sure the FastAPI server is running on port 8000.');
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('session_token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    
    throw error;
  }
);

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  summary: string;
  preferred_locations: string;
  desired_salary_min: number;
  desired_salary_max: number;
  skills: string;
  resume_text?: string;
  email_verified?: boolean;
}

export interface Application {
  id: number;
  job_id: number;
  status: string;
  applied_at: string;
  updated_at: string;
  job?: {
    id: number;
    title: string;
    company: string;
    location: string;
    apply_url: string;
    description: string;
  };
}

export interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  salary?: string;
  apply_url: string;
  score: number;
  matchScore: number;
  type: string;
  level: string;
  tags: string[];
}

export interface SavedJob {
  id: number;
  saved_at: string;
  job: Job;
}

export interface AIGenerationResponse {
  status: string;
  content: string;
  model?: string;
  fallback?: string;
  original?: string;
  error?: string;
}

export interface InterviewPrepResponse {
  status: string;
  questions: {
    technical_questions: string[];
    behavioral_questions: string[];
    tips: string[];
  };
  model?: string;
  error?: string;
}

// Backend connection test - NEW FUNCTION
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    console.log('🔌 Testing backend connection...');
    const response = await api.get('/health');
    console.log('✅ Backend connection successful:', response.data);
    return true;
  } catch (error: any) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
};

// Enhanced health check with detailed info
export const healthCheck = async (): Promise<any> => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error: any) {
    console.error('Health check failed:', error);
    throw new Error('Backend server is not responding. Please make sure it is running on port 8000.');
  }
};

// Auth API
export const loginUser = async (userData: any): Promise<any> => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

export const logoutUser = async (): Promise<any> => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data;
};

// User API
export const getUser = async (userId: number): Promise<User> => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId: number, userData: Partial<User>): Promise<User> => {
  try {
    console.log('🔄 Updating user via API:', userData);
    const response = await api.put(`/users/${userId}`, userData);
    console.log('✅ User updated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ API update failed:', error);
    // Enhanced fallback with better error handling
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

// Applications API
export const getUserApplications = async (userId: number): Promise<Application[]> => {
  const response = await api.get(`/users/${userId}/applications`);
  return response.data;
};

export const createApplication = async (userId: number, jobId: number): Promise<any> => {
  const response = await api.post('/applications', {
    user_id: userId,
    job_id: jobId
  });
  return response.data;
};

// Jobs API with enhanced error handling
export const getRecommendedJobs = async (userId: number = 1): Promise<Job[]> => {
  try {
    console.log('🔄 Fetching recommended jobs...');
    const response = await api.get(`/jobs/recommended?user_id=${userId}`);
    console.log(`✅ Loaded ${response.data.length} recommended jobs`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to load recommended jobs:', error);
    throw new Error(`Failed to load jobs: ${error.message}`);
  }
};

export const searchJobs = async (query: string = '', location: string = '', userId: number = 1): Promise<Job[]> => {
  try {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (location) params.append('location', location);
    params.append('user_id', userId.toString());
    
    console.log('🔍 Searching jobs with params:', { query, location });
    const response = await api.get(`/jobs/search?${params}`);
    console.log(`✅ Found ${response.data.length} jobs`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Job search failed:', error);
    throw new Error(`Search failed: ${error.message}`);
  }
};

export const importJobs = async (query: string = 'cloud engineer', userId: number = 1): Promise<any> => {
  try {
    console.log('📥 Importing jobs...');
    const response = await api.post('/jobs/import', {
      query,
      user_id: userId
    });
    console.log('✅ Jobs imported:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Job import failed:', error);
    throw new Error(`Import failed: ${error.message}`);
  }
};

// Saved Jobs API
export const getSavedJobs = async (userId: number): Promise<SavedJob[]> => {
  const response = await api.get(`/users/${userId}/saved-jobs`);
  return response.data;
};

export const saveJob = async (userId: number, jobId: number): Promise<any> => {
  const response = await api.post('/saved-jobs', {
    user_id: userId,
    job_id: jobId
  });
  return response.data;
};

export const unsaveJob = async (savedId: number): Promise<any> => {
  const response = await api.delete(`/saved-jobs/${savedId}`);
  return response.data;
};

// AI Generation API
export const generateCoverLetter = async (userId: number, jobId: number): Promise<AIGenerationResponse> => {
  const response = await api.post('/ai/generate/cover-letter', {
    user_id: userId,
    job_id: jobId
  });
  return response.data;
};

export const generateTailoredResume = async (userId: number, jobId: number): Promise<AIGenerationResponse> => {
  const response = await api.post('/ai/generate/resume', {
    user_id: userId,
    job_id: jobId
  });
  return response.data;
};

export const generateInterviewPrep = async (userId: number, jobId: number): Promise<InterviewPrepResponse> => {
  const response = await api.post('/ai/generate/interview-prep', {
    user_id: userId,
    job_id: jobId
  });
  return response.data;
};

export default api;