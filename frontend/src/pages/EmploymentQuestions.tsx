// [file name]: EmploymentQuestions.tsx - FIXED IMPORTS
import React, { useState } from 'react';

interface EmploymentQuestionsProps {
  user: any;
  onUpdateUser: (user: any) => void;
}

const EmploymentQuestions: React.FC<EmploymentQuestionsProps> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.preferred_locations || '',
    
    // Professional Background
    current_title: '',
    total_experience: '',
    current_company: '',
    industry: '',
    
    // Education
    highest_degree: '',
    university: '',
    graduation_year: '',
    certifications: '',
    
    // Skills & Expertise
    technical_skills: user?.skills || '',
    programming_languages: '',
    frameworks: '',
    tools_platforms: '',
    
    // Job Preferences
    desired_title: '',
    job_type: 'Full-time',
    work_location: 'Remote',
    target_companies: '',
    industries_preferred: '',
    
    // Salary & Compensation
    current_salary: '',
    desired_salary: user?.desired_salary_min ? `${user.desired_salary_min} - ${user.desired_salary_max}` : '',
    bonus_expectations: '',
    equity_interest: false,
    
    // Career Goals
    short_term_goals: '',
    long_term_goals: '',
    skills_to_develop: '',
    
    // Work Preferences
    company_size: '',
    management_preference: '',
    travel_willingness: '',
    relocation_willingness: '',
    
    // Additional Information
    notice_period: '',
    employment_gap: '',
    security_clearance: '',
    work_authorization: ''
  });

  const [currentSection, setCurrentSection] = useState(0);
  const [saved, setSaved] = useState(false);

  const sections = [
    { id: 'personal', title: 'Personal Information', icon: '👤' },
    { id: 'professional', title: 'Professional Background', icon: '💼' },
    { id: 'education', title: 'Education & Certifications', icon: '🎓' },
    { id: 'skills', title: 'Skills & Expertise', icon: '🔧' },
    { id: 'preferences', title: 'Job Preferences', icon: '🎯' },
    { id: 'career', title: 'Career Goals', icon: '🚀' }
  ];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Update user profile with employment data
      const updatedUser = {
        ...user,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        preferred_locations: formData.location,
        skills: formData.technical_skills,
        desired_salary_min: parseInt(formData.desired_salary.split('-')[0]) || user.desired_salary_min,
        desired_salary_max: parseInt(formData.desired_salary.split('-')[1]) || user.desired_salary_max,
        employment_data: formData // Store all employment questions data
      };

      onUpdateUser(updatedUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
    } catch (error) {
      console.error('Failed to save employment data:', error);
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 0: // Personal Information
        return (
          <div className="section-content">
            <h3>👤 Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className="input-field"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="input-field"
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="input-field"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="input-field"
                  placeholder="City, State or Remote"
                />
              </div>
            </div>
          </div>
        );

      case 1: // Professional Background
        return (
          <div className="section-content">
            <h3>💼 Professional Background</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Current/Most Recent Title *</label>
                <input
                  type="text"
                  value={formData.current_title}
                  onChange={(e) => handleChange('current_title', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div className="form-group">
                <label>Total Years of Experience *</label>
                <select
                  value={formData.total_experience}
                  onChange={(e) => handleChange('total_experience', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select experience</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div className="form-group">
                <label>Current/Most Recent Company</label>
                <input
                  type="text"
                  value={formData.current_company}
                  onChange={(e) => handleChange('current_company', e.target.value)}
                  className="input-field"
                  placeholder="Company name"
                />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Technology, Finance, Healthcare"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Education
        return (
          <div className="section-content">
            <h3>🎓 Education & Certifications</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Highest Degree Earned</label>
                <select
                  value={formData.highest_degree}
                  onChange={(e) => handleChange('highest_degree', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select degree</option>
                  <option value="High School">High School</option>
                  <option value="Associate">Associate</option>
                  <option value="Bachelor's">Bachelor's</option>
                  <option value="Master's">Master's</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>University/Institution</label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => handleChange('university', e.target.value)}
                  className="input-field"
                  placeholder="University name"
                />
              </div>
              <div className="form-group">
                <label>Graduation Year</label>
                <input
                  type="number"
                  value={formData.graduation_year}
                  onChange={(e) => handleChange('graduation_year', e.target.value)}
                  className="input-field"
                  placeholder="YYYY"
                  min="1950"
                  max="2030"
                />
              </div>
              <div className="form-group">
                <label>Certifications</label>
                <textarea
                  value={formData.certifications}
                  onChange={(e) => handleChange('certifications', e.target.value)}
                  className="textarea-field"
                  placeholder="List relevant certifications (AWS, Kubernetes, etc.)"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 3: // Skills
        return (
          <div className="section-content">
            <h3>🔧 Skills & Expertise</h3>
            <div className="form-group">
              <label>Technical Skills *</label>
              <textarea
                value={formData.technical_skills}
                onChange={(e) => handleChange('technical_skills', e.target.value)}
                className="textarea-field"
                placeholder="List your technical skills separated by commas (e.g., AWS, Python, React, Docker, Kubernetes)"
                rows={4}
              />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Programming Languages</label>
                <input
                  type="text"
                  value={formData.programming_languages}
                  onChange={(e) => handleChange('programming_languages', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Python, JavaScript, Java, Go"
                />
              </div>
              <div className="form-group">
                <label>Frameworks & Libraries</label>
                <input
                  type="text"
                  value={formData.frameworks}
                  onChange={(e) => handleChange('frameworks', e.target.value)}
                  className="input-field"
                  placeholder="e.g., React, Django, Spring Boot, TensorFlow"
                />
              </div>
              <div className="form-group">
                <label>Tools & Platforms</label>
                <input
                  type="text"
                  value={formData.tools_platforms}
                  onChange={(e) => handleChange('tools_platforms', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Docker, Kubernetes, AWS, Jenkins, Git"
                />
              </div>
            </div>
          </div>
        );

      case 4: // Preferences
        return (
          <div className="section-content">
            <h3>🎯 Job Preferences</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Desired Job Title *</label>
                <input
                  type="text"
                  value={formData.desired_title}
                  onChange={(e) => handleChange('desired_title', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Senior DevOps Engineer"
                />
              </div>
              <div className="form-group">
                <label>Job Type *</label>
                <select
                  value={formData.job_type}
                  onChange={(e) => handleChange('job_type', e.target.value)}
                  className="input-field"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div className="form-group">
                <label>Work Location *</label>
                <select
                  value={formData.work_location}
                  onChange={(e) => handleChange('work_location', e.target.value)}
                  className="input-field"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
              <div className="form-group">
                <label>Target Companies</label>
                <input
                  type="text"
                  value={formData.target_companies}
                  onChange={(e) => handleChange('target_companies', e.target.value)}
                  className="input-field"
                  placeholder="Companies you're interested in"
                />
              </div>
              <div className="form-group full-width">
                <label>Desired Salary Range *</label>
                <input
                  type="text"
                  value={formData.desired_salary}
                  onChange={(e) => handleChange('desired_salary', e.target.value)}
                  className="input-field"
                  placeholder="e.g., $120,000 - $160,000"
                />
              </div>
            </div>
          </div>
        );

      case 5: // Career Goals
        return (
          <div className="section-content">
            <h3>🚀 Career Goals</h3>
            <div className="form-group">
              <label>Short-term Goals (1-2 years)</label>
              <textarea
                value={formData.short_term_goals}
                onChange={(e) => handleChange('short_term_goals', e.target.value)}
                className="textarea-field"
                placeholder="What do you want to achieve in the next 1-2 years?"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Long-term Goals (3-5 years)</label>
              <textarea
                value={formData.long_term_goals}
                onChange={(e) => handleChange('long_term_goals', e.target.value)}
                className="textarea-field"
                placeholder="Where do you see yourself in 3-5 years?"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Skills You Want to Develop</label>
              <textarea
                value={formData.skills_to_develop}
                onChange={(e) => handleChange('skills_to_develop', e.target.value)}
                className="textarea-field"
                placeholder="What new skills or technologies do you want to learn?"
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="employment-questions-page">
      <div className="page-header">
        <h1>Employment Profile</h1>
        <p>Complete your profile to get better job matches and personalized AI assistance</p>
      </div>

      <div className="questions-layout">
        <div className="progress-sidebar">
          <div className="progress-steps">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`progress-step ${currentSection === index ? 'active' : ''} ${index < currentSection ? 'completed' : ''}`}
                onClick={() => setCurrentSection(index)}
              >
                <div className="step-icon">{section.icon}</div>
                <div className="step-info">
                  <div className="step-title">{section.title}</div>
                  <div className="step-status">
                    {index < currentSection ? '✓ Completed' : index === currentSection ? 'Current' : 'Upcoming'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="questions-content">
          <div className="content-card">
            {renderSection()}
            
            <div className="navigation-actions">
              <button
                className="nav-btn secondary"
                onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
                disabled={currentSection === 0}
              >
                ← Previous
              </button>
              
              <div className="progress-indicator">
                Step {currentSection + 1} of {sections.length}
              </div>
              
              {currentSection < sections.length - 1 ? (
                <button
                  className="nav-btn primary"
                  onClick={() => setCurrentSection(prev => Math.min(sections.length - 1, prev + 1))}
                >
                  Next →
                </button>
              ) : (
                <button
                  className="nav-btn primary"
                  onClick={handleSave}
                >
                  💾 Save Profile
                </button>
              )}
            </div>

            {saved && (
              <div className="save-message">
                ✅ Profile saved successfully! Your data will be used for better job matching and AI assistance.
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .employment-questions-page {
          padding: 0;
          min-height: 100vh;
          background: #0f172a;
          color: #f8fafc;
        }
        
        .page-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        
        .page-header h1 {
          margin: 0 0 10px 0;
          font-size: 2.5em;
          font-weight: bold;
        }
        
        .page-header p {
          margin: 0;
          font-size: 1.2em;
          opacity: 0.9;
        }
        
        .questions-layout {
          display: flex;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          gap: 40px;
        }
        
        .progress-sidebar {
          width: 320px;
          flex-shrink: 0;
        }
        
        .progress-steps {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 20px;
        }
        
        .progress-step {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }
        
        .progress-step:hover {
          background: #334155;
        }
        
        .progress-step.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #667eea;
        }
        
        .progress-step.completed {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);
        }
        
        .step-icon {
          font-size: 1.5em;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        
        .step-title {
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .step-status {
          font-size: 0.85em;
          opacity: 0.8;
        }
        
        .questions-content {
          flex: 1;
        }
        
        .content-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 30px;
        }
        
        .section-content h3 {
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
          margin-bottom: 20px;
        }
        
        .form-group.full-width {
          grid-column: 1 / -1;
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
        
        .navigation-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #334155;
        }
        
        .nav-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .nav-btn.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .nav-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .nav-btn.secondary {
          background: transparent;
          color: #667eea;
          border: 2px solid #667eea;
        }
        
        .nav-btn.secondary:hover:not(:disabled) {
          background: #667eea;
          color: white;
        }
        
        .nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .progress-indicator {
          color: #94a3b8;
          font-weight: 600;
        }
        
        .save-message {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid rgba(16, 185, 129, 0.3);
          margin-top: 20px;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .questions-layout {
            flex-direction: column;
            padding: 20px;
          }
          
          .progress-sidebar {
            width: 100%;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .navigation-actions {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default EmploymentQuestions;