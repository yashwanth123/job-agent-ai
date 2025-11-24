// REPLACE THE WHOLE EnhancedAuth.tsx FILE WITH THIS:
import React, { useState } from 'react';

interface AuthProps {
  onLogin: (user: any, token: string) => void;
  onSignup: (user: any, token: string) => void;
}

const EnhancedAuth: React.FC<AuthProps> = ({ onLogin, onSignup }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // SIMPLE - just use email, no passwords
      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.full_name || 'Job Seeker',
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      onLogin(data.user, data.session_token);
      
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = {
      id: 1,
      email: 'demo@jobagent.ai',
      full_name: 'Demo User',
      resume_text: 'Senior Cloud Engineer with 6+ years experience.',
      skills: 'AWS, Azure, Kubernetes, Docker, Python, DevOps',
      preferred_locations: 'Remote, San Francisco, New York',
      desired_salary_min: 120000,
      desired_salary_max: 200000,
    };
    onLogin(demoUser, 'demo_token');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Job Agent AI</h1>
          <p>Your AI job search assistant</p>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button className={`tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>
              Sign In
            </button>
            <button className={`tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>
              Sign Up
            </button>
          </div>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                disabled={loading}
              />
            )}
            
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={loading}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <button onClick={handleDemoLogin} className="demo-btn">
            🚀 Try Demo
          </button>
        </div>
      </div>

      <style>{`
        .auth-page { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .auth-container { max-width: 400px; width: 100%; }
        .auth-header { text-align: center; color: white; margin-bottom: 30px; }
        .auth-header h1 { margin: 0 0 10px 0; font-size: 2.5em; }
        .auth-card { background: white; padding: 30px; border-radius: 10px; }
        .auth-tabs { display: flex; margin-bottom: 20px; }
        .tab { flex: 1; padding: 10px; border: none; background: #f1f5f9; cursor: pointer; }
        .tab.active { background: #667eea; color: white; }
        input { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px; }
        button { width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; }
        button:disabled { opacity: 0.6; }
        .demo-btn { background: #10b981; margin-top: 10px; }
        .error { background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
      `}</style>
    </div>
  );
};

export default EnhancedAuth;