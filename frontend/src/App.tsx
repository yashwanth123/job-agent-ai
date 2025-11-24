// [file name]: App.tsx - COMPLETE FIXED
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard';
import JobSearch from './pages/JobSearch';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import EmploymentQuestions from './pages/EmploymentQuestions';
import EnhancedAuth from './pages/EnhancedAuth';
import './App.css';

type Page = 'dashboard' | 'search' | 'applications' | 'profile' | 'settings' | 'employment-questions';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 App starting - checking for saved user...');
    const token = localStorage.getItem('session_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('✅ Restored user from localStorage:', userData);
        setUser(userData);
      } catch (error) {
        console.error('❌ Error parsing saved user:', error);
        localStorage.removeItem('session_token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: any, token: string) => {
    console.log('✅ Login successful, saving user:', userData);
    setUser(userData);
    localStorage.setItem('session_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleSignup = (userData: any, token: string) => {
    console.log('✅ Signup successful, saving user:', userData);
    setUser(userData);
    localStorage.setItem('session_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    console.log('🚪 Logging out user');
    setUser(null);
    localStorage.removeItem('session_token');
    localStorage.removeItem('user');
    setCurrentPage('dashboard');
  };

  const updateUserData = (updatedUser: any) => {
    console.log('🔄 Updating user data in app state:', updatedUser);
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Job Agent AI...</p>
      </div>
    );
  }

  if (!user) {
    return <EnhancedAuth onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return (
    <div className="app">
      <TopNav user={user} onLogout={handleLogout} />
      <div className="app-content">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="main-content">
          {currentPage === 'dashboard' && <Dashboard user={user} />}
          {currentPage === 'search' && <JobSearch user={user} />}
          {currentPage === 'applications' && <Applications user={user} />}
          {currentPage === 'profile' && <Profile user={user} onUpdateUser={updateUserData} />}
          {currentPage === 'settings' && <Settings user={user} />}
          {currentPage === 'employment-questions' && <EmploymentQuestions user={user} onUpdateUser={updateUserData} />}
        </main>
      </div>
    </div>
  );
}

export default App;