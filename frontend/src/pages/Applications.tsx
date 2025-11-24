// [file name]: Applications.tsx
import React, { useState, useEffect } from 'react';
import { getUserApplications, Application } from '../api';

const Applications: React.FC<{ user: any }> = ({ user }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadApplications();
  }, [user]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const apps = await getUserApplications(user?.id || 1);
      setApplications(apps);
      if (apps.length === 0) {
        setMessage('No applications yet. Apply to jobs from the Dashboard or Search page.');
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
      setMessage('Failed to load applications. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'interview scheduled':
        return '#10b981';
      case 'under review':
        return '#f59e0b';
      case 'applied':
        return '#3b82f6';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const refreshApplications = () => {
    loadApplications();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="applications-page">
      <div className="applications-header">
        <h1>My Applications</h1>
        <p>Track your job applications and their status</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Failed') ? 'error' : 'info'}`}>
          {message}
        </div>
      )}

      <div className="applications-content">
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-number">{applications.length}</div>
            <div className="stat-label">Total Applications</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {applications.filter(app => app.status === 'Applied').length}
            </div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {applications.filter(app => app.status === 'Interview Scheduled').length}
            </div>
            <div className="stat-label">Interviews</div>
          </div>
          <div className="stat-card">
            <button onClick={refreshApplications} className="refresh-btn">
              🔄 Refresh
            </button>
          </div>
        </div>

        <div className="applications-list">
          <div className="section-header">
            <h2>Application History</h2>
            <span className="apps-count">{applications.length} applications</span>
          </div>
          
          {applications.length === 0 ? (
            <div className="no-applications">
              <div className="no-apps-icon">📝</div>
              <h3>No applications yet</h3>
              <p>Start applying to jobs from the Dashboard or Search page to track your progress here.</p>
              <button 
                onClick={() => window.location.hash = 'dashboard'}
                className="btn-primary"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="applications-table">
              {applications.map((app) => (
                <div key={app.id} className="application-item">
                  <div className="app-job-info">
                    <div className="job-title">{app.job?.title || 'Unknown Position'}</div>
                    <div className="company-name">{app.job?.company || 'Unknown Company'}</div>
                    <div className="job-location">📍 {app.job?.location || 'Remote'}</div>
                  </div>
                  
                  <div className="app-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(app.status) }}
                    >
                      {app.status}
                    </span>
                  </div>
                  
                  <div className="app-date">
                    Applied {formatDate(app.applied_at)}
                  </div>
                  
                  <div className="app-actions">
                    <button 
                      onClick={() => window.open(app.job?.apply_url, '_blank')}
                      className="view-job-btn"
                      disabled={!app.job?.apply_url}
                    >
                      {app.job?.apply_url ? 'View Job' : 'No Link'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .applications-page {
          padding: 0;
          min-height: 100vh;
          background: #0f172a;
          color: #f8fafc;
        }
        
        .applications-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        
        .applications-header h1 {
          margin: 0 0 10px 0;
          font-size: 2.5em;
          font-weight: bold;
        }
        
        .applications-header p {
          margin: 0;
          font-size: 1.2em;
          opacity: 0.9;
        }
        
        .applications-content {
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .stat-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 25px;
          text-align: center;
          transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          border-color: #667eea;
        }
        
        .stat-number {
          font-size: 2.5em;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 8px;
        }
        
        .stat-label {
          color: #94a3b8;
          font-size: 0.95em;
          font-weight: 600;
        }
        
        .refresh-btn {
          background: transparent;
          color: #667eea;
          border: 2px solid #667eea;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        
        .refresh-btn:hover {
          background: #667eea;
          color: white;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .section-header h2 {
          color: #f8fafc;
          margin: 0;
          font-size: 1.8em;
        }
        
        .apps-count {
          background: #334155;
          color: #f8fafc;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
        }
        
        .applications-table {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .application-item {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 20px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr auto;
          gap: 20px;
          align-items: center;
          transition: all 0.3s ease;
        }
        
        .application-item:hover {
          border-color: #667eea;
          transform: translateX(5px);
        }
        
        .app-job-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .job-title {
          font-weight: bold;
          font-size: 1.1em;
          color: #f8fafc;
        }
        
        .company-name {
          color: #667eea;
          font-weight: 600;
        }
        
        .job-location {
          color: #94a3b8;
          font-size: 0.9em;
        }
        
        .status-badge {
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: bold;
          text-align: center;
          display: inline-block;
          min-width: 120px;
        }
        
        .app-date {
          color: #94a3b8;
          font-size: 0.9em;
        }
        
        .view-job-btn {
          background: transparent;
          color: #667eea;
          border: 2px solid #667eea;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9em;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .view-job-btn:hover:not(:disabled) {
          background: #667eea;
          color: white;
        }
        
        .view-job-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          border-color: #6b7280;
          color: #6b7280;
        }
        
        .no-applications {
          text-align: center;
          padding: 60px 20px;
          background: #1e293b;
          border-radius: 12px;
          border: 2px dashed #334155;
        }
        
        .no-apps-icon {
          font-size: 4em;
          margin-bottom: 20px;
        }
        
        .no-applications h3 {
          margin: 0 0 10px 0;
          color: #f8fafc;
        }
        
        .no-applications p {
          color: #94a3b8;
          margin-bottom: 25px;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }
        
        @media (max-width: 768px) {
          .application-item {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 15px;
          }
          
          .stats-cards {
            grid-template-columns: 1fr;
          }
          
          .section-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default Applications;