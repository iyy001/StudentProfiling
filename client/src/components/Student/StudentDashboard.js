import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Profile from './Profile';
import Recommendations from './Recommendations';
import RoleGuidance from './RoleGuidance';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="student-dashboard">
      <nav className="navbar">
        <h1>Maatram Student Profiling</h1>
        <div className="navbar-nav">
          <span style={{ marginRight: '20px' }}>Welcome, {user?.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            My Profile
          </button>
          <button
            className={`tab ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            Career Recommendations
          </button>
          <button
            className={`tab ${activeTab === 'guidance' ? 'active' : ''}`}
            onClick={() => setActiveTab('guidance')}
          >
            Role-Based Guidance
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'recommendations' && <Recommendations />}
          {activeTab === 'guidance' && <RoleGuidance />}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

