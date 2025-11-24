// [file name]: JobDetailModal.tsx
import React, { useState } from "react";
import { generateCoverLetter, generateTailoredResume, generateInterviewPrep, AIGenerationResponse, InterviewPrepResponse } from "../api";

interface JobDetailModalProps {
  job: any;
  user: any;
  onClose: () => void;
  onApply: () => void;
  onSave: () => void;
}

export default function JobDetailModal({ job, user, onClose, onApply, onSave }: JobDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "cover-letter" | "resume" | "interview">("details");
  const [coverLetter, setCoverLetter] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [interviewPrep, setInterviewPrep] = useState<any>(null);
  const [loading, setLoading] = useState<"cover-letter" | "resume" | "interview" | null>(null);
  const [error, setError] = useState("");

  const cleanDescription = (text: string) => {
    if (!text) return 'No description available.';
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  };

  const generateCoverLetterHandler = async () => {
    setLoading("cover-letter");
    setError("");
    try {
      console.log('🔄 GENERATING COVER LETTER WITH REAL DATA');
      console.log('User:', user.full_name, user.email);
      console.log('Job:', job.title, job.company);
      
      const response: AIGenerationResponse = await generateCoverLetter(user.id, job.id);
      
      console.log('✅ COVER LETTER RESPONSE:', response);
      
      if (response.status === "success") {
        setCoverLetter(response.content);
      } else {
        setError(response.error || "Failed to generate cover letter");
      }
    } catch (error: any) {
      console.error("❌ COVER LETTER ERROR:", error);
      setError("Error generating cover letter. Please check console for details.");
    } finally {
      setLoading(null);
    }
  };

  const generateTailoredResumeHandler = async () => {
    setLoading("resume");
    setError("");
    try {
      console.log('🔄 GENERATING RESUME WITH REAL DATA');
      console.log('User resume:', user.resume_text?.substring(0, 200));
      
      const response: AIGenerationResponse = await generateTailoredResume(user.id, job.id);
      
      console.log('✅ RESUME RESPONSE:', response);
      
      if (response.status === "success") {
        setTailoredResume(response.content);
      } else {
        setError(response.error || "Failed to generate tailored resume");
      }
    } catch (error: any) {
      console.error("❌ RESUME ERROR:", error);
      setError("Error generating resume. Please check console for details.");
    } finally {
      setLoading(null);
    }
  };

  const generateInterviewPrepHandler = async () => {
    setLoading("interview");
    setError("");
    try {
      const response: InterviewPrepResponse = await generateInterviewPrep(user.id, job.id);
      
      if (response.status === "success") {
        setInterviewPrep(response.questions);
      } else {
        setError(response.error || "Failed to generate interview preparation");
      }
    } catch (error: any) {
      console.error("Error generating interview prep:", error);
      setError(error.message || "Error generating interview preparation. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const downloadAsText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExternalApply = () => {
    if (job.apply_url) {
      onApply();
      window.open(job.apply_url, "_blank", "noopener,noreferrer");
    } else {
      setError("No application URL available for this job.");
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="job-title-section">
            <h2>{job.title}</h2>
            <div className="company-info">
              <span className="company">{job.company}</span>
              <span className="location">📍 {job.location}</span>
            </div>
            {job.apply_url && (
              <div className="external-job-badge">
                🌐 External Job - Apply on company website
              </div>
            )}
          </div>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          {[
            { id: "details", label: "📄 Job Details", icon: "📄" },
            { id: "cover-letter", label: "✍️ Cover Letter", icon: "✍️" },
            { id: "resume", label: "📋 Tailored Resume", icon: "📋" },
            { id: "interview", label: "💼 Interview Prep", icon: "💼" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Content */}
        <div className="modal-body">
          {activeTab === "details" && (
            <div className="details-content">
              <div className="job-stats">
                <div className="stat-card">
                  <div className="stat-value" style={{ color: getMatchColor(job.matchScore) }}>
                    {Math.round(job.matchScore)}%
                  </div>
                  <div className="stat-label">Match Score</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{job.type || "Full-time"}</div>
                  <div className="stat-label">Job Type</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{job.level || "Mid Level"}</div>
                  <div className="stat-label">Experience</div>
                </div>
                {job.salary && (
                  <div className="stat-card">
                    <div className="stat-value">💰</div>
                    <div className="stat-label">{job.salary}</div>
                  </div>
                )}
              </div>

              <div className="job-description-section">
                <h3>About the Role</h3>
                <div className="job-description">
                  {cleanDescription(job.description)}
                </div>
              </div>

              {job.tags && job.tags.length > 0 && (
                <div className="job-tags-section">
                  <h3>Tags & Skills</h3>
                  <div className="tags-container">
                    {job.tags.map((tag: string, index: number) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "cover-letter" && (
            <div className="ai-content">
              <div className="content-header">
                <h3>AI-Generated Cover Letter</h3>
                {coverLetter && (
                  <button
                    className="download-btn"
                    onClick={() => downloadAsText(coverLetter, `cover-letter-${job.company}.txt`)}
                  >
                    💾 Download
                  </button>
                )}
              </div>

              {!coverLetter ? (
                <div className="generate-section">
                  <div className="generate-icon">✍️</div>
                  <h4>Generate Personalized Cover Letter</h4>
                  <p>Using your actual profile data and the job description</p>
                  <div className="data-preview">
                    <strong>Your Data Being Used:</strong>
                    <div>Name: <strong>{user.full_name}</strong></div>
                    <div>Email: {user.email}</div>
                    <div>Skills: {user.skills}</div>
                    <div>Resume: {user.resume_text ? `${user.resume_text.length} characters` : 'Not provided'}</div>
                  </div>
                  <button
                    className="generate-btn primary"
                    onClick={generateCoverLetterHandler}
                    disabled={loading !== null}
                  >
                    {loading === "cover-letter" ? "⏳ Processing Your Data..." : "🤖 Generate Real Cover Letter"}
                  </button>
                </div>
              ) : (
                <div className="generated-content">
                  <div className="content-text">
                    {coverLetter}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "resume" && (
            <div className="ai-content">
              <div className="content-header">
                <h3>AI-Tailored Resume</h3>
                {tailoredResume && (
                  <button
                    className="download-btn"
                    onClick={() => downloadAsText(tailoredResume, `resume-${job.company}.txt`)}
                  >
                    💾 Download
                  </button>
                )}
              </div>

              {!tailoredResume ? (
                <div className="generate-section">
                  <div className="generate-icon">📋</div>
                  <h4>Generate Tailored Resume</h4>
                  <p>Using your actual resume text and the job requirements</p>
                  <div className="data-preview">
                    <strong>Your Resume Data:</strong>
                    <div>Resume Text: {user.resume_text ? `${user.resume_text.length} characters` : 'Not provided'}</div>
                    <div>Skills: {user.skills}</div>
                    <div>Job: {job.title} at {job.company}</div>
                  </div>
                  <button
                    className="generate-btn primary"
                    onClick={generateTailoredResumeHandler}
                    disabled={loading !== null}
                  >
                    {loading === "resume" ? "⏳ Analyzing Your Resume..." : "🤖 Generate Real Tailored Resume"}
                  </button>
                </div>
              ) : (
                <div className="generated-content">
                  <div className="content-text">
                    {tailoredResume}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "interview" && (
            <div className="ai-content">
              <div className="content-header">
                <h3>AI Interview Preparation</h3>
                {interviewPrep && (
                  <button
                    className="download-btn"
                    onClick={() => downloadAsText(JSON.stringify(interviewPrep, null, 2), `interview-prep-${job.company}.json`)}
                  >
                    💾 Download
                  </button>
                )}
              </div>

              {!interviewPrep ? (
                <div className="generate-section">
                  <div className="generate-icon">💼</div>
                  <h4>Prepare for Your Interview</h4>
                  <p>Get personalized interview questions and preparation tips for this role</p>
                  <button
                    className="generate-btn primary"
                    onClick={generateInterviewPrepHandler}
                    disabled={loading !== null}
                  >
                    {loading === "interview" ? "⏳ Generating..." : "🤖 Generate Interview Prep"}
                  </button>
                </div>
              ) : (
                <div className="interview-content">
                  <div className="interview-section">
                    <h4>Technical Questions</h4>
                    <ul>
                      {interviewPrep.technical_questions?.map((question: string, index: number) => (
                        <li key={index}>{question}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="interview-section">
                    <h4>Behavioral Questions</h4>
                    <ul>
                      {interviewPrep.behavioral_questions?.map((question: string, index: number) => (
                        <li key={index}>{question}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="interview-section">
                    <h4>Preparation Tips</h4>
                    <ul>
                      {interviewPrep.tips?.map((tip: string, index: number) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn secondary" onClick={onSave}>
            💾 Save Job
          </button>
          <button 
            className="btn primary" 
            onClick={handleExternalApply} 
            disabled={!job.apply_url}
          >
            {job.apply_url ? "Apply Now →" : "No Apply Link"}
          </button>
        </div>

        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .modal-content {
            background: #1e293b;
            border-radius: 16px;
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            border: 1px solid #334155;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          }

          .modal-header {
            padding: 24px;
            border-bottom: 1px solid #334155;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            background: #0f172a;
          }

          .job-title-section h2 {
            margin: 0 0 8px 0;
            color: #f8fafc;
            font-size: 1.5em;
            line-height: 1.3;
          }

          .company-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .company {
            color: #667eea;
            font-weight: bold;
            font-size: 1.1em;
          }

          .location {
            color: #94a3b8;
            font-size: 0.95em;
          }

          .external-job-badge {
            background: rgba(0, 245, 160, 0.1);
            color: #00f5a0;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.8em;
            margin-top: 8px;
            display: inline-block;
          }

          .close-btn {
            background: transparent;
            border: none;
            color: #94a3b8;
            font-size: 24px;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s ease;
          }

          .close-btn:hover {
            background: #334155;
            color: #f8fafc;
          }

          .modal-tabs {
            display: flex;
            gap: 0;
            border-bottom: 1px solid #334155;
            background: #0f172a;
          }

          .tab-btn {
            flex: 1;
            padding: 16px;
            border: none;
            background: transparent;
            color: #94a3b8;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
            transition: all 0.3s ease;
            border-bottom: 3px solid transparent;
          }

          .tab-btn:hover {
            background: #1e293b;
            color: #f8fafc;
          }

          .tab-btn.active {
            background: #1e293b;
            color: #667eea;
            border-bottom-color: #667eea;
            font-weight: 600;
          }

          .tab-icon {
            font-size: 1.1em;
          }

          .tab-label {
            font-size: 0.9em;
          }

          .error-message {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            padding: 12px 16px;
            margin: 16px 24px;
            border-radius: 8px;
            border: 1px solid rgba(239, 68, 68, 0.3);
            font-size: 0.9em;
          }

          .modal-body {
            flex: 1;
            overflow: auto;
            padding: 24px;
          }

          .details-content {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .job-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 16px;
          }

          .stat-card {
            background: #0f172a;
            padding: 16px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #334155;
          }

          .stat-value {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 4px;
          }

          .stat-label {
            color: #94a3b8;
            font-size: 0.85em;
          }

          .job-description-section h3,
          .job-tags-section h3 {
            color: #f8fafc;
            margin: 0 0 12px 0;
            font-size: 1.1em;
          }

          .job-description {
            color: #94a3b8;
            line-height: 1.6;
            white-space: pre-wrap;
            max-height: 300px;
            overflow: auto;
            padding: 16px;
            background: #0f172a;
            border-radius: 8px;
            border: 1px solid #334155;
          }

          .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .tag {
            background: #334155;
            color: #e2e8f0;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 500;
          }

          .ai-content {
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .content-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .content-header h3 {
            margin: 0;
            color: #f8fafc;
            font-size: 1.2em;
          }

          .download-btn {
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

          .download-btn:hover {
            background: #667eea;
            color: white;
          }

          .generate-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 40px 20px;
            background: #0f172a;
            border-radius: 8px;
            border: 2px dashed #334155;
          }

          .generate-icon {
            font-size: 3em;
            margin-bottom: 16px;
          }

          .generate-section h4 {
            margin: 0 0 8px 0;
            color: #f8fafc;
            font-size: 1.1em;
          }

          .generate-section p {
            color: #94a3b8;
            margin: 0 0 20px 0;
            max-width: 400px;
          }

          .data-preview {
            background: #334155;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            text-align: left;
            max-width: 400px;
            width: 100%;
            font-size: 0.9em;
          }

          .data-preview strong {
            color: #f8fafc;
            display: block;
            margin-bottom: 8px;
          }

          .data-preview div {
            color: #94a3b8;
            margin: 4px 0;
            font-size: 0.85em;
            word-break: break-word;
          }

          .generate-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
          }

          .generate-btn.primary {
            background: #667eea;
            color: white;
          }

          .generate-btn.primary:hover:not(:disabled) {
            background: #5a6fd8;
            transform: translateY(-2px);
          }

          .generate-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          .generated-content {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .content-text {
            flex: 1;
            background: #0f172a;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #334155;
            color: #e2e8f0;
            white-space: pre-wrap;
            line-height: 1.6;
            overflow: auto;
            max-height: 400px;
          }

          .interview-content {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .interview-section {
            background: #0f172a;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #334155;
          }

          .interview-section h4 {
            margin: 0 0 12px 0;
            color: #f8fafc;
            font-size: 1em;
          }

          .interview-section ul {
            margin: 0;
            padding-left: 20px;
            color: #94a3b8;
          }

          .interview-section li {
            margin-bottom: 8px;
            line-height: 1.5;
          }

          .modal-footer {
            padding: 20px 24px;
            border-top: 1px solid #334155;
            display: flex;
            gap: 12px;
            background: #0f172a;
          }

          .btn {
            flex: 1;
            padding: 12px 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
          }

          .btn.primary {
            background: #667eea;
            color: white;
          }

          .btn.primary:hover:not(:disabled) {
            background: #5a6fd8;
            transform: translateY(-1px);
          }

          .btn.secondary {
            background: transparent;
            color: #667eea;
            border: 2px solid #667eea;
          }

          .btn.secondary:hover {
            background: #667eea;
            color: white;
          }

          .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
          }

          @media (max-width: 768px) {
            .modal-content {
              max-height: 95vh;
            }
            
            .modal-tabs {
              flex-wrap: wrap;
            }
            
            .tab-btn {
              flex: 1 0 50%;
            }
            
            .job-stats {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .modal-footer {
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </div>
  );
}