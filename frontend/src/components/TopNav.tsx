// [file name]: TopNav.tsx
import React from 'react';

interface TopNavProps {
  user?: any;
  onLogout: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ user, onLogout }) => {
  return (
    <div className="top-nav">
      <div className="nav-content">
        <div className="nav-info">
          {user && (
            <div className="user-welcome">
              <span className="welcome-text">Welcome back,</span>
              <span className="user-name">{user.full_name || user.email}</span>
            </div>
          )}
        </div>
        
        <div className="nav-actions">
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <style>{`
        .top-nav {
          background: #1e293b;
          border-bottom: 1px solid #334155;
          padding: 0 20px;
          height: 64px;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        
        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        
        .nav-info {
          display: flex;
          align-items: center;
        }
        
        .user-welcome {
          display: flex;
          flex-direction: column;
        }
        
        .welcome-text {
          color: #94a3b8;
          font-size: 12px;
          margin-bottom: 2px;
        }
        
        .user-name {
          color: #f8fafc;
          font-weight: 600;
          font-size: 14px;
        }
        
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .logout-btn {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
        }
      `}</style>
    </div>
  );
};

export default TopNav;