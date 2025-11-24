// [file name]: Profile.tsx
import React, { useState, useEffect } from 'react';
import { getUser, updateUser, User } from '../api';

const Profile: React.FC<{ user: any }> = ({ user: propUser }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState<'personal' | 'professional' | 'preferences'>('personal');

  const userId = 1;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      console.log('Loading user data...');
      const userData = await getUser(userId);
      console.log('User data loaded:', userData);
      setUser(userData);
      setFormData(userData);
    } catch (error) {
      console.error('Failed to load user from API:', error);
      // Use prop user as fallback
      if (propUser) {
        console.log('Using prop user as fallback:', propUser);
        setUser(propUser);
        setFormData(propUser);
      }
    }
  };

  const handleSave = async () => {
    try {
      console.log('🔄 Saving profile data to database:', formData);
      
      // Prepare data for API - ensure all fields have values
      const updateData = {
        full_name: formData.full_name || 'Demo User',
        email: formData.email || 'demo@example.com',
        phone: formData.phone || '',
        summary: formData.summary || '',
        skills: formData.skills || 'AWS, Azure, Terraform, Kubernetes, Docker, Python, DevOps',
        preferred_locations: formData.preferred_locations || 'Remote, San Francisco, New York',
        desired_salary_min: formData.desired_salary_min || 120000,
        desired_salary_max: formData.desired_salary_max || 200000,
        resume_text: formData.resume_text || ''
      };

      console.log('Sending update data:', updateData);
      
      const updatedUser = await updateUser(userId, updateData);
      console.log('✅ Profile saved successfully:', updatedUser);
      
      // Update both local state and localStorage
      setUser(updatedUser);
      setFormData(updatedUser);
      
      // Update localStorage to persist changes
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUserData = { ...currentUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      setIsEditing(false);
      setMessage('✅ Profile updated successfully! Changes saved to database.');
      setTimeout(() => setMessage(''), 5000);
    } catch (error: any) {
      console.error('❌ Failed to update user in database:', error);
      
      // Even if API fails, update localStorage for immediate feedback
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUserData = { ...currentUser, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      setMessage('✅ Profile updated locally! (Database connection issue)');
      setUser(formData as User);
      setIsEditing(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleReset = () => {
    setFormData(user || {});
    setIsEditing(false);
    setMessage('');
  };

  const handleChange = (field: keyof User, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p>Manage your personal information and job preferences</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="profile-content">
        {/* Sidebar Navigation */}
        <div className="profile-sidebar">
          <div className="sidebar-section">
            <button 
              className={`sidebar-item ${activeSection === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveSection('personal')}
            >
              <span className="sidebar-icon">👤</span>
              <span>Personal Info</span>
            </button>
            <button 
              className={`sidebar-item ${activeSection === 'professional' ? 'active' : ''}`}
              onClick={() => setActiveSection('professional')}
            >
              <span className="sidebar-icon">💼</span>
              <span>Professional</span>
            </button>
            <button 
              className={`sidebar-item ${activeSection === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveSection('preferences')}
            >
              <span className="sidebar-icon">🎯</span>
              <span>Preferences</span>
            </button>
          </div>
          
          <div className="profile-actions">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="btn-primary full-width">
                  💾 Save Changes
                </button>
                <button onClick={handleReset} className="btn-secondary full-width">
                  ↩️ Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="btn-primary full-width">
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main">
          {activeSection === 'personal' && (
            <div className="profile-section">
              <h2>👤 Personal Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.full_name || ''}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="display-value">{user.full_name || 'Not set'}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="input-field"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="display-value">{user.email}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="input-field"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="display-value">{user.phone || 'Not set'}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'professional' && (
            <div className="profile-section">
              <h2>💼 Professional Information</h2>
              
              <div className="form-group">
                <label>Professional Summary</label>
                {isEditing ? (
                  <textarea
                    value={formData.summary || ''}
                    onChange={(e) => handleChange('summary', e.target.value)}
                    className="textarea-field"
                    placeholder="Describe your professional background, experience, and career goals..."
                    rows={4}
                  />
                ) : (
                  <div className="display-value summary-text">
                    {user.summary || 'No summary provided'}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Skills & Technologies</label>
                {isEditing ? (
                  <textarea
                    value={formData.skills || ''}
                    onChange={(e) => handleChange('skills', e.target.value)}
                    className="textarea-field"
                    placeholder="List your skills separated by commas (e.g., AWS, Python, React, Docker)..."
                    rows={3}
                  />
                ) : (
                  <div className="skills-display">
                    {user.skills ? (
                      <div className="skills-tags">
                        {user.skills.split(',').map((skill, index) => (
                          <span key={index} className="skill-tag">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="display-value">No skills listed</div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Resume Text</label>
                {isEditing ? (
                  <textarea
                    value={formData.resume_text || ''}
                    onChange={(e) => handleChange('resume_text', e.target.value)}
                    className="textarea-field"
                    placeholder="Paste your resume text here for better job matching..."
                    rows={6}
                  />
                ) : (
                  <div className="display-value resume-text">
                    {user.resume_text || 'No resume text provided'}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className="profile-section">
              <h2>🎯 Job Preferences</h2>
              
              <div className="form-group">
                <label>Preferred Locations</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.preferred_locations || ''}
                    onChange={(e) => handleChange('preferred_locations', e.target.value)}
                    className="input-field"
                    placeholder="e.g., Remote, San Francisco, New York"
                  />
                ) : (
                  <div className="display-value">{user.preferred_locations || 'Not specified'}</div>
                )}
                <div className="help-text">Separate multiple locations with commas</div>
              </div>

              <div className="salary-preferences">
                <label>Desired Salary Range</label>
                {isEditing ? (
                  <div className="salary-inputs">
                    <div className="input-group">
                      <span className="input-prefix">$</span>
                      <input
                        type="number"
                        value={formData.desired_salary_min || ''}
                        onChange={(e) => handleChange('desired_salary_min', parseInt(e.target.value) || 0)}
                        className="input-field"
                        placeholder="Min"
                      />
                    </div>
                    <span className="salary-separator">to</span>
                    <div className="input-group">
                      <span className="input-prefix">$</span>
                      <input
                        type="number"
                        value={formData.desired_salary_max || ''}
                        onChange={(e) => handleChange('desired_salary_max', parseInt(e.target.value) || 0)}
                        className="input-field"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="salary-display">
                    ${(user.desired_salary_min || 0).toLocaleString()} - ${(user.desired_salary_max || 0).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .profile-page {
          padding: 0;
          min-height: 100vh;
          background: #0f172a;
          color: #f8fafc;
        }
        
        .profile-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        
        .profile-header h1 {
          margin: 0 0 10px 0;
          font-size: 2.5em;
          font-weight: bold;
        }
        
        .profile-header p {
          margin: 0;
          font-size: 1.2em;
          opacity: 0.9;
        }
        
        .profile-content {
          display: flex;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          gap: 30px;
        }
        
        .profile-sidebar {
          width: 300px;
          flex-shrink: 0;
        }
        
        .sidebar-section {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        
        .sidebar-item {
          width: 100%;
          padding: 16px 20px;
          border: none;
          background: none;
          color: #94a3b8;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          border-bottom: 1px solid #334155;
        }
        
        .sidebar-item:last-child {
          border-bottom: none;
        }
        
        .sidebar-item:hover {
          background: #334155;
          color: #f8fafc;
        }
        
        .sidebar-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 600;
        }
        
        .sidebar-icon {
          font-size: 18px;
          width: 24px;
        }
        
        .profile-actions {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 20px;
        }
        
        .full-width {
          width: 100%;
          margin-bottom: 10px;
        }
        
        .full-width:last-child {
          margin-bottom: 0;
        }
        
        .profile-main {
          flex: 1;
        }
        
        .profile-section {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 20px;
        }
        
        .profile-section h2 {
          margin: 0 0 25px 0;
          font-size: 1.5em;
          color: #f8fafc;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .form-group {
          margin-bottom: 25px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #f8fafc;
        }
        
        .display-value {
          background: #334155;
          padding: 12px 16px;
          border-radius: 8px;
          color: #e2e8f0;
          min-height: 44px;
          display: flex;
          align-items: center;
        }
        
        .summary-text, .resume-text {
          white-space: pre-wrap;
          line-height: 1.6;
        }
        
        .skills-display {
          background: #334155;
          padding: 16px;
          border-radius: 8px;
        }
        
        .skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .skill-tag {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 500;
        }
        
        .salary-preferences {
          margin-bottom: 25px;
        }
        
        .salary-inputs {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .input-group {
          flex: 1;
          position: relative;
        }
        
        .input-prefix {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-weight: 600;
        }
        
        .salary-inputs .input-field {
          padding-left: 30px;
        }
        
        .salary-separator {
          color: #94a3b8;
          font-weight: 600;
        }
        
        .salary-display {
          background: #334155;
          padding: 12px 16px;
          border-radius: 8px;
          color: #e2e8f0;
          font-weight: 600;
          font-size: 1.1em;
        }
        
        .help-text {
          color: #94a3b8;
          font-size: 0.85em;
          margin-top: 5px;
        }
        
        .btn-primary, .btn-secondary {
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          font-size: 14px;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .btn-secondary {
          background: transparent;
          color: #667eea;
          border: 2px solid #667eea;
        }
        
        .btn-secondary:hover {
          background: #667eea;
          color: white;
        }
        
        .input-field, .textarea-field {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #334155;
          border-radius: 8px;
          font-size: 14px;
          background: #0f172a;
          color: #f8fafc;
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
        
        .message {
          padding: 12px 20px;
          border-radius: 8px;
          margin: 20px auto;
          max-width: 1200px;
          font-size: 14px;
          text-align: center;
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
          .profile-content {
            flex-direction: column;
            padding: 20px;
          }
          
          .profile-sidebar {
            width: 100%;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .salary-inputs {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;