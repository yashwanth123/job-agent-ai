// [file name]: Settings.tsx - FIXED
import React, { useState } from 'react';

const Settings: React.FC<{ user: any }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    email_notifications: true,
    job_alerts: true,
    weekly_digest: false,
    privacy_public: false
  });
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: '',
    category: 'suggestion'
  });

  const handleSettingsChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const submitFeedback = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...feedback
        })
      });
      
      if (response.ok) {
        alert('Thank you for your feedback!');
        setFeedback({ rating: 0, comment: '', category: 'suggestion' });
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'preferences', label: 'Job Preferences', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'feedback', label: 'Feedback', icon: '💬' }
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings & Preferences</h1>
        <p>Manage your account and customize your experience</p>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          {menuItems.map(tab => (
            <button
              key={tab.id}
              className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Settings</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={user.full_name} 
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    defaultValue={user.email} 
                    className="input-field"
                  />
                  {!user.email_verified && (
                    <div className="verification-warning">
                      ⚠️ Email not verified
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    defaultValue={user.phone} 
                    className="input-field"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              <button className="save-btn">💾 Save Changes</button>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h2>Job Preferences</h2>
              <div className="form-group">
                <label>Preferred Locations</label>
                <input 
                  type="text" 
                  defaultValue={user.preferred_locations}
                  placeholder="e.g., Remote, San Francisco, New York"
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>Desired Salary Range</label>
                <div className="salary-inputs">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    defaultValue={user.desired_salary_min}
                    className="input-field"
                  />
                  <span className="salary-separator">to</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    defaultValue={user.desired_salary_max}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Skills & Technologies</label>
                <textarea 
                  defaultValue={user.skills}
                  placeholder="List your skills separated by commas"
                  rows={4}
                  className="textarea-field"
                />
              </div>
              <button className="save-btn">💾 Save Preferences</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              <div className="toggle-group">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <label>Email Notifications</label>
                    <p>Receive email updates about your applications</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.email_notifications}
                      onChange={(e) => handleSettingsChange('email_notifications', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-item">
                  <div className="toggle-info">
                    <label>Job Alerts</label>
                    <p>Get notified about new matching jobs</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.job_alerts}
                      onChange={(e) => handleSettingsChange('job_alerts', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-item">
                  <div className="toggle-info">
                    <label>Weekly Digest</label>
                    <p>Weekly summary of your job search activity</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={settings.weekly_digest}
                      onChange={(e) => handleSettingsChange('weekly_digest', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="settings-section">
              <h2>Share Your Feedback</h2>
              <div className="feedback-form">
                <div className="rating-section">
                  <label>How would you rate Job Agent AI?</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        className={`star ${star <= feedback.rating ? 'active' : ''}`}
                        onClick={() => setFeedback({...feedback, rating: star})}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={feedback.category}
                    onChange={(e) => setFeedback({...feedback, category: e.target.value})}
                    className="input-field"
                  >
                    <option value="suggestion">Suggestion</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="general">General Feedback</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Your Feedback</label>
                  <textarea
                    value={feedback.comment}
                    onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
                    placeholder="What can we improve? Share your thoughts..."
                    rows={5}
                    className="textarea-field"
                  />
                </div>
                
                <button className="submit-btn" onClick={submitFeedback}>
                  📤 Submit Feedback
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .settings-page {
          padding: 0;
          min-height: 100vh;
          background: #0f172a;
          color: #f8fafc;
        }
        
        .settings-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        
        .settings-header h1 {
          margin: 0 0 10px 0;
          font-size: 2.5em;
          font-weight: bold;
        }
        
        .settings-header p {
          margin: 0;
          font-size: 1.2em;
          opacity: 0.9;
        }
        
        .settings-layout {
          display: flex;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          gap: 40px;
        }
        
        .settings-sidebar {
          width: 280px;
          flex-shrink: 0;
        }
        
        .sidebar-tab {
          width: 100%;
          padding: 16px 20px;
          border: none;
          background: #1e293b;
          color: #94a3b8;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
          border: 1px solid #334155;
        }
        
        .sidebar-tab:hover {
          background: #334155;
          color: #f8fafc;
        }
        
        .sidebar-tab.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #667eea;
        }
        
        .tab-icon {
          font-size: 18px;
          width: 24px;
          text-align: center;
        }
        
        .tab-label {
          font-weight: 500;
        }
        
        .settings-content {
          flex: 1;
        }
        
        .settings-section {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 30px;
        }
        
        .settings-section h2 {
          margin: 0 0 25px 0;
          font-size: 1.5em;
          color: #f8fafc;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #f8fafc;
        }
        
        .input-field, .textarea-field {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #334155;
          border-radius: 8px;
          background: #0f172a;
          color: #f8fafc;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        
        .input-field:focus, .textarea-field:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .textarea-field {
          resize: vertical;
          min-height: 100px;
          font-family: inherit;
        }
        
        .verification-warning {
          color: #f59e0b;
          font-size: 0.85em;
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .salary-inputs {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .salary-inputs .input-field {
          flex: 1;
        }
        
        .salary-separator {
          color: #94a3b8;
          font-weight: 600;
        }
        
        .toggle-group {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .toggle-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: #0f172a;
          border-radius: 8px;
          border: 1px solid #334155;
        }
        
        .toggle-info label {
          font-weight: 600;
          color: #f8fafc;
          margin-bottom: 4px;
          display: block;
        }
        
        .toggle-info p {
          color: #94a3b8;
          margin: 0;
          font-size: 0.9em;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 26px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #334155;
          transition: .3s;
          border-radius: 13px;
        }
        
        .slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 3px;
          background: white;
          transition: .3s;
          border-radius: 50%;
        }
        
        input:checked + .slider {
          background: #667eea;
        }
        
        input:checked + .slider:before {
          transform: translateX(24px);
        }
        
        .star-rating {
          display: flex;
          gap: 8px;
          margin: 10px 0;
        }
        
        .star {
          background: none;
          border: none;
          font-size: 2em;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0.3;
        }
        
        .star.active {
          opacity: 1;
          transform: scale(1.1);
        }
        
        .star:hover {
          opacity: 0.7;
        }
        
        .save-btn, .submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .save-btn:hover, .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        @media (max-width: 768px) {
          .settings-layout {
            flex-direction: column;
            padding: 20px;
          }
          
          .settings-sidebar {
            width: 100%;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .salary-inputs {
            flex-direction: column;
            align-items: stretch;
          }
          
          .toggle-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;