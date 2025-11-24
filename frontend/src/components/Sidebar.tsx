// [file name]: Sidebar.tsx - FIXED
import React from 'react';

type Page = 'dashboard' | 'search' | 'applications' | 'profile' | 'settings' | 'employment-questions';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'search', label: 'Job Search', icon: '🔍' },
    { id: 'applications', label: 'Applications', icon: '📋' },
    { id: 'employment-questions', label: 'Employment Profile', icon: '📝' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ] as const;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">Job Agent AI</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => onPageChange(item.id as Page)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <style>{`
        .sidebar {
          width: 280px;
          background: #1e293b;
          border-right: 1px solid #334155;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .sidebar-header {
          padding: 24px 20px 16px;
          border-bottom: 1px solid #334155;
        }
        
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #f8fafc;
          font-weight: bold;
          font-size: 18px;
        }
        
        .logo-icon {
          font-size: 20px;
        }
        
        .logo-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .sidebar-nav {
          flex: 1;
          padding: 20px 0;
        }
        
        .sidebar-nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .nav-item {
          width: 100%;
          padding: 16px 24px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          font-size: 15px;
          color: #94a3b8;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 0;
        }
        
        .nav-item:hover {
          background-color: #334155;
          color: #f8fafc;
        }
        
        .nav-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 600;
          border-right: 3px solid #00f5a0;
        }
        
        .nav-icon {
          font-size: 18px;
          width: 24px;
          text-align: center;
        }
        
        .nav-label {
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;