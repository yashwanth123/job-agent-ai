// [file name]: JobSearch.tsx
import React, { useState, useEffect } from 'react';
import { searchJobs, Job, createApplication, saveJob, getSavedJobs, unsaveJob } from '../api';
import JobDetailModal from '../components/JobDetailModal';

const JobSearch: React.FC<{ user: any }> = ({ user }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [applying, setApplying] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    loadJobs();
    loadSavedJobs();
  }, []);

  const loadJobs = async (query: string = '', loc: string = '') => {
    try {
      setLoading(true);
      setMessage('');
      const jobsData = await searchJobs(query, loc, user?.id || 1);
      setJobs(jobsData);
      if (jobsData.length === 0) {
        setMessage('No jobs found. Try different search terms or import jobs from dashboard.');
        setMessageType('info');
      }
    } catch (error: any) {
      console.error('Failed to load jobs:', error);
      setMessage(error.message || 'Failed to search jobs. Make sure backend is running.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedJobs = async () => {
    try {
      const saved = await getSavedJobs(user?.id || 1);
      const savedIds = new Set(saved.map(item => item.job.id));
      setSavedJobs(savedIds);
    } catch (error) {
      console.error('Failed to load saved jobs:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs(searchQuery, location);
  };

  const handleApply = async (job: Job) => {
    try {
      setApplying(job.id);
      await createApplication(user?.id || 1, job.id);
      if (job.apply_url) {
        window.open(job.apply_url, '_blank', 'noopener,noreferrer');
      }
      setMessage('✅ Application tracked successfully!');
      setMessageType('success');
      setTimeout(() => setApplying(null), 1000);
    } catch (error: any) {
      console.error('Failed to apply:', error);
      setMessage(error.message || 'Failed to track application.');
      setMessageType('error');
      setApplying(null);
    }
  };

  const handleSaveJob = async (job: Job) => {
    try {
      setSaving(job.id);
      if (savedJobs.has(job.id)) {
        // Unsave job
        // Note: You'd need to get the saved job ID first, but for simplicity we'll just remove from UI
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(job.id);
          return newSet;
        });
        setMessage('🗑️ Job removed from saved list');
      } else {
        // Save job
        await saveJob(user?.id || 1, job.id);
        setSavedJobs(prev => new Set(prev).add(job.id));
        setMessage('💾 Job saved to your collection!');
      }
      setMessageType('success');
      setTimeout(() => setSaving(null), 1000);
    } catch (error: any) {
      console.error('Failed to save job:', error);
      setMessage(error.message || 'Failed to save job.');
      setMessageType('error');
      setSaving(null);
    }
  };

  const handleQuickApply = (job: Job) => {
    if (job.apply_url) {
      window.open(job.apply_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
  };

  const cleanDescription = (text: string) => {
    if (!text) return 'No description available.';
    return text
      .replace(/<[^>]*>/g, '')
      .substring(0, 150) + (text.length > 150 ? '...' : '');
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="job-search-page">
      <div className="search-header">
        <h1>Find Your Dream Job</h1>
        <p>Search through thousands of real cloud and DevOps positions</p>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-inputs">
            <input
              type="text"
              placeholder="🔍 Job title, skills, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <input
              type="text"
              placeholder="📍 Location (e.g., Remote, San Francisco)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? 'Searching...' : 'Search Jobs'}
            </button>
          </div>
        </form>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="jobs-section">
        <div className="section-header">
          <h2>Available Positions</h2>
          <div className="header-right">
            <span className="jobs-count">{jobs.length} jobs found</span>
            {savedJobs.size > 0 && (
              <span className="saved-count">💾 {savedJobs.size} saved</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Searching for jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="no-jobs">
            <div className="no-jobs-icon">🔍</div>
            <h3>No jobs found</h3>
            <p>Try adjusting your search criteria or import jobs from the dashboard</p>
            <button onClick={() => loadJobs()} className="btn-primary">
              Show All Jobs
            </button>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <div className="job-title-section">
                    <h3>{job.title}</h3>
                    <div className="company">{job.company}</div>
                  </div>
                  <div className="job-actions-header">
                    <button 
                      onClick={() => handleSaveJob(job)}
                      disabled={saving === job.id}
                      className={`icon-btn save-btn ${savedJobs.has(job.id) ? 'saved' : ''}`}
                      title={savedJobs.has(job.id) ? "Remove from saved" : "Save job"}
                    >
                      {saving === job.id ? '💾' : (savedJobs.has(job.id) ? '❤️' : '🤍')}
                    </button>
                  </div>
                </div>
                
                <div className="job-meta">
                  <div className="location">📍 {job.location}</div>
                  {job.salary && (
                    <div className="salary">💰 {job.salary}</div>
                  )}
                  <div 
                    className="match-score"
                    style={{ backgroundColor: getMatchColor(job.matchScore) }}
                  >
                    🎯 {Math.round(job.matchScore)}% Match
                  </div>
                </div>
                
                <div className="job-description">
                  {cleanDescription(job.description)}
                </div>

                <div className="job-tags">
                  {job.tags?.slice(0, 3).map((tag, index) => (
                    <span key={index} className="job-tag">{tag}</span>
                  ))}
                </div>
                
                <div className="job-actions">
                  <button 
                    onClick={() => handleApply(job)}
                    disabled={applying === job.id}
                    className="apply-btn primary"
                  >
                    {applying === job.id ? 'Applying...' : '📝 Apply & Track'}
                  </button>
                  <button 
                    onClick={() => handleQuickApply(job)}
                    className="apply-btn secondary"
                  >
                    ⚡ Quick Apply
                  </button>
                  <button 
                    onClick={() => handleViewDetails(job)}
                    className="apply-btn outline"
                  >
                    👁️ Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          user={user}
          onClose={() => setSelectedJob(null)}
          onApply={() => handleApply(selectedJob)}
          onSave={() => handleSaveJob(selectedJob)}
        />
      )}

      <style>{`
        .job-search-page {
          padding: 0;
          min-height: 100vh;
          background: #0f172a;
        }
        
        .search-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        
        .search-header h1 {
          margin: 0 0 10px 0;
          font-size: 2.5em;
          font-weight: bold;
        }
        
        .search-header p {
          margin: 0 0 30px 0;
          font-size: 1.2em;
          opacity: 0.9;
        }
        
        .search-form {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .search-inputs {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .search-input {
          flex: 1;
          min-width: 250px;
          padding: 15px 20px;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          color: #1e293b;
        }
        
        .search-input::placeholder {
          color: #64748b;
        }
        
        .search-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 50px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          white-space: nowrap;
          transition: all 0.3s ease;
        }
        
        .search-btn:hover:not(:disabled) {
          background: #059669;
          transform: translateY(-2px);
        }
        
        .search-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .jobs-section {
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          color: #f8fafc;
        }
        
        .header-right {
          display: flex;
          gap: 15px;
          align-items: center;
        }
        
        .section-header h2 {
          margin: 0;
          font-size: 2em;
        }
        
        .jobs-count {
          background: #334155;
          color: #f8fafc;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
        }
        
        .saved-count {
          background: #ef4444;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 0.9em;
        }
        
        .jobs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 25px;
        }
        
        .job-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 25px;
          color: #f8fafc;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .job-card:hover {
          transform: translateY(-5px);
          border-color: #667eea;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
        }
        
        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }
        
        .job-title-section h3 {
          margin: 0 0 8px 0;
          color: #f8fafc;
          font-size: 1.3em;
          line-height: 1.3;
        }
        
        .company {
          color: #667eea;
          font-weight: bold;
          font-size: 1.1em;
        }
        
        .job-actions-header {
          display: flex;
          gap: 8px;
        }
        
        .icon-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.2em;
          padding: 5px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .save-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          transform: scale(1.1);
        }
        
        .save-btn.saved {
          color: #ef4444;
        }
        
        .job-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 15px 0;
          align-items: center;
        }
        
        .location, .salary {
          color: #94a3b8;
          font-size: 0.95em;
        }
        
        .match-score {
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.85em;
          font-weight: bold;
        }
        
        .job-description {
          color: #94a3b8;
          font-size: 0.95em;
          line-height: 1.5;
          margin-bottom: 15px;
        }
        
        .job-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }
        
        .job-tag {
          background: #334155;
          color: #e2e8f0;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.8em;
          font-weight: 500;
        }
        
        .job-actions {
          display: flex;
          gap: 8px;
        }
        
        .apply-btn {
          flex: 1;
          padding: 10px 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9em;
          font-weight: 600;
          transition: all 0.2s ease;
          text-align: center;
        }
        
        .apply-btn.primary {
          background: #667eea;
          color: white;
        }
        
        .apply-btn.primary:hover:not(:disabled) {
          background: #5a6fd8;
          transform: translateY(-1px);
        }
        
        .apply-btn.secondary {
          background: transparent;
          color: #667eea;
          border: 2px solid #667eea;
        }
        
        .apply-btn.secondary:hover {
          background: #667eea;
          color: white;
        }
        
        .apply-btn.outline {
          background: transparent;
          color: #94a3b8;
          border: 1px solid #334155;
          flex: 0.5;
        }
        
        .apply-btn.outline:hover {
          background: #334155;
          color: #f8fafc;
        }
        
        .apply-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .loading, .no-jobs {
          text-align: center;
          padding: 60px 20px;
          color: #f8fafc;
        }
        
        .no-jobs-icon {
          font-size: 4em;
          margin-bottom: 20px;
        }
        
        .no-jobs h3 {
          margin: 0 0 10px 0;
        }
        
        .no-jobs p {
          color: #94a3b8;
          margin-bottom: 25px;
        }
        
        .message {
          padding: 12px 20px;
          border-radius: 8px;
          margin: 20px auto;
          max-width: 1200px;
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
        
        .message.info {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        
        @media (max-width: 768px) {
          .jobs-grid {
            grid-template-columns: 1fr;
          }
          
          .job-actions {
            flex-direction: column;
          }
          
          .search-inputs {
            flex-direction: column;
          }
          
          .section-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
          
          .header-right {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default JobSearch;