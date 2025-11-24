// [file name]: Dashboard.tsx - FIXED
import React, { useState, useEffect } from 'react';
import { getRecommendedJobs, importJobs, createApplication, saveJob, getUserApplications, getSavedJobs, testBackendConnection } from '../api';

interface DashboardProps {
  user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    savedJobs: 0,
    matchRate: 0
  });
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // First test backend connection
      const isConnected = await testBackendConnection();
      setBackendConnected(isConnected);
      
      if (!isConnected) {
        setMessage('⚠️ Cannot connect to backend server. Please make sure the FastAPI server is running on port 8000.');
        setLoading(false);
        return;
      }

      const [jobs, applications, savedJobs] = await Promise.all([
        getRecommendedJobs(user?.id || 1),
        getUserApplications(user?.id || 1),
        getSavedJobs(user?.id || 1)
      ]);

      setRecommendedJobs(jobs);
      
      const interviews = applications.filter(app => 
        app.status.toLowerCase().includes('interview')
      ).length;
      
      const avgMatch = jobs.length > 0 ? 
        jobs.reduce((acc, job) => acc + job.matchScore, 0) / jobs.length : 0;

      setStats({
        applications: applications.length,
        interviews,
        savedJobs: savedJobs.length,
        matchRate: Math.round(avgMatch)
      });

      setMessage('');

    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImportJobs = async () => {
    try {
      setImporting(true);
      await importJobs('cloud engineer devops', user?.id || 1);
      setMessage('✅ Jobs imported successfully!');
      await loadDashboardData();
    } catch (error: any) {
      console.error('Failed to import jobs:', error);
      setMessage(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleApply = async (job: any) => {
    try {
      await createApplication(user?.id || 1, job.id);
      if (job.apply_url) {
        window.open(job.apply_url, '_blank', 'noopener,noreferrer');
      }
      setMessage('✅ Application tracked successfully!');
      await loadDashboardData();
    } catch (error: any) {
      console.error('Failed to apply:', error);
      setMessage(`Application failed: ${error.message}`);
    }
  };

  const handleSaveJob = async (job: any) => {
    try {
      await saveJob(user?.id || 1, job.id);
      setMessage('💾 Job saved successfully!');
      await loadDashboardData();
    } catch (error: any) {
      console.error('Failed to save job:', error);
      setMessage(`Save failed: ${error.message}`);
    }
  };

  const handleViewDetails = (job: any) => {
    // You can implement a modal or navigation here
    console.log('View details:', job);
    setMessage(`🔍 Viewing details for: ${job.title} at ${job.company}`);
  };

  return (
    <div className="enhanced-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome back, {user?.full_name || 'User'}! <span className="welcome-emoji">👋</span></h1>
          <p>Your personalized job search assistant is ready to help you find your next opportunity.</p>
        </div>
        <div className="quick-actions">
          <button className="action-btn primary" onClick={() => window.location.hash = 'search'}>
            🔍 Search Jobs
          </button>
          <button 
            className="action-btn secondary" 
            onClick={handleImportJobs} 
            disabled={importing || backendConnected === false}
          >
            {importing ? '🔄 Importing...' : '🚀 Import New Jobs'}
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {backendConnected === false && (
        <div className="connection-warning">
          <div className="warning-content">
            <span className="warning-icon">⚠️</span>
            <div className="warning-text">
              <strong>Backend Server Not Connected</strong>
              <p>Please start the FastAPI server on port 8000 to load jobs and use all features.</p>
              <div className="server-instructions">
                <code>cd backend && python -m uvicorn app.main:app --reload --port 8000</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`message ${message.includes('Error') || message.includes('Cannot connect') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-value">{stats.applications}</div>
            <div className="stat-label">Applications</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-info">
            <div className="stat-value">{stats.interviews}</div>
            <div className="stat-label">Interviews</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❤️</div>
          <div className="stat-info">
            <div className="stat-value">{stats.savedJobs}</div>
            <div className="stat-label">Saved Jobs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <div className="stat-value">{stats.matchRate}%</div>
            <div className="stat-label">Avg Match</div>
          </div>
        </div>
      </div>

      {/* Recommended Jobs Section */}
      <div className="section">
        <div className="section-header">
          <h2>Recommended For You</h2>
          <div className="section-actions">
            <button className="filter-btn">🎯 Top Matches</button>
            <button className="filter-btn">🕒 Recent</button>
            <button className="filter-btn">💼 Best Fit</button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p>Loading your personalized job recommendations...</p>
          </div>
        ) : recommendedJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💼</div>
            <h3>No jobs yet</h3>
            <p>Start by importing jobs to get personalized recommendations</p>
            <button 
              className="primary-btn" 
              onClick={handleImportJobs}
              disabled={backendConnected === false}
            >
              🚀 Import Jobs
            </button>
            {backendConnected === false && (
              <p className="connection-hint">Start the backend server first</p>
            )}
          </div>
        ) : (
          <div className="jobs-grid">
            {recommendedJobs.slice(0, 6).map((job) => (
              <div key={job.id} className="job-card enhanced">
                <div className="job-header">
                  <div className="job-badge">🔥 Hot Job</div>
                  <button 
                    className="save-btn" 
                    onClick={() => handleSaveJob(job)}
                    title="Save job"
                  >
                    ❤️
                  </button>
                </div>
                <div className="job-content">
                  <h3 className="job-title">{job.title}</h3>
                  <div className="company">{job.company}</div>
                  <div className="job-meta">
                    <span className="location">📍 {job.location}</span>
                    {job.salary && <span className="salary">💰 {job.salary}</span>}
                  </div>
                  <div className="match-score" style={{
                    backgroundColor: job.matchScore >= 80 ? '#10b981' : 
                                   job.matchScore >= 60 ? '#f59e0b' : '#ef4444'
                  }}>
                    🎯 {Math.round(job.matchScore)}% Match
                  </div>
                  <p className="job-description">
                    {job.description ? job.description.substring(0, 120) + '...' : 'No description available'}
                  </p>
                </div>
                <div className="job-actions">
                  <button 
                    className="btn primary" 
                    onClick={() => handleApply(job)}
                  >
                    Apply Now
                  </button>
                  <button 
                    className="btn outline" 
                    onClick={() => handleViewDetails(job)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .enhanced-dashboard {
          padding: 0;
          min-height: 100vh;
          background: #0f172a;
        }
        
        .welcome-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 60px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 30px;
        }
        
        .welcome-content h1 {
          margin: 0 0 12px 0;
          font-size: 2.8em;
          font-weight: bold;
        }
        
        .welcome-emoji {
          font-size: 0.9em;
        }
        
        .welcome-content p {
          margin: 0;
          font-size: 1.3em;
          opacity: 0.9;
          max-width: 500px;
        }
        
        .quick-actions {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .action-btn {
          padding: 16px 24px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        
        .action-btn.primary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }
        
        .action-btn.primary:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        
        .action-btn.secondary {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .connection-warning {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 8px;
          padding: 16px 20px;
          margin: 20px 40px;
          color: #f8fafc;
        }
        
        .warning-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        
        .warning-icon {
          font-size: 1.5em;
          flex-shrink: 0;
        }
        
        .warning-text strong {
          display: block;
          margin-bottom: 4px;
          color: #f59e0b;
        }
        
        .warning-text p {
          margin: 0 0 8px 0;
          color: #94a3b8;
        }
        
        .server-instructions code {
          background: rgba(0, 0, 0, 0.3);
          padding: 8px 12px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 0.9em;
          color: #00f5a0;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          padding: 40px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .stat-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 30px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          border-color: #667eea;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
        }
        
        .stat-icon {
          font-size: 2.5em;
        }
        
        .stat-value {
          font-size: 2.2em;
          font-weight: bold;
          color: #f8fafc;
          margin-bottom: 4px;
        }
        
        .stat-label {
          color: #94a3b8;
          font-size: 1em;
          font-weight: 600;
        }
        
        .section {
          padding: 40px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .section-header h2 {
          color: #f8fafc;
          margin: 0;
          font-size: 2em;
        }
        
        .section-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .filter-btn {
          background: #334155;
          color: #e2e8f0;
          border: 1px solid #475569;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .filter-btn:hover {
          background: #475569;
          color: #f8fafc;
        }
        
        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
        }
        
        .job-card.enhanced {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .job-card.enhanced:hover {
          transform: translateY(-5px);
          border-color: #667eea;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
        }
        
        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 20px 0;
        }
        
        .job-badge {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8em;
          font-weight: 600;
        }
        
        .save-btn {
          background: transparent;
          border: none;
          font-size: 1.2em;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .save-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          transform: scale(1.1);
        }
        
        .job-content {
          padding: 20px;
        }
        
        .job-title {
          color: #f8fafc;
          font-size: 1.3em;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }
        
        .company {
          color: #667eea;
          font-weight: 600;
          font-size: 1.1em;
          margin-bottom: 12px;
        }
        
        .job-meta {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }
        
        .location, .salary {
          color: #94a3b8;
          font-size: 0.9em;
        }
        
        .match-score {
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 15px;
        }
        
        .job-description {
          color: #94a3b8;
          font-size: 0.95em;
          line-height: 1.5;
          margin: 0;
        }
        
        .job-actions {
          padding: 20px;
          border-top: 1px solid #334155;
          display: flex;
          gap: 12px;
        }
        
        .btn {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .btn.primary {
          background: #667eea;
          color: white;
        }
        
        .btn.primary:hover {
          background: #5a6fd8;
          transform: translateY(-1px);
        }
        
        .btn.outline {
          background: transparent;
          color: #667eea;
          border: 2px solid #667eea;
        }
        
        .btn.outline:hover {
          background: #667eea;
          color: white;
        }
        
        .loading-section, .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #f8fafc;
        }
        
        .empty-icon {
          font-size: 4em;
          margin-bottom: 20px;
        }
        
        .empty-state h3 {
          margin: 0 0 12px 0;
          font-size: 1.5em;
        }
        
        .empty-state p {
          color: #94a3b8;
          margin-bottom: 25px;
          font-size: 1.1em;
        }
        
        .connection-hint {
          color: #f59e0b;
          font-size: 0.9em;
          margin-top: 10px;
        }
        
        .primary-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .primary-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .message {
          padding: 12px 20px;
          border-radius: 8px;
          margin: 20px 40px;
          text-align: center;
          font-weight: 500;
        }
        
        .message.success {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .message.error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        @media (max-width: 768px) {
          .welcome-section {
            padding: 40px 20px;
            text-align: center;
            flex-direction: column;
          }
          
          .welcome-content h1 {
            font-size: 2.2em;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
            padding: 20px;
          }
          
          .section {
            padding: 20px;
          }
          
          .jobs-grid {
            grid-template-columns: 1fr;
          }
          
          .section-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .connection-warning, .message {
            margin: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;