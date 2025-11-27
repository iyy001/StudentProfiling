import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Students from './Students';
import Analytics from './Analytics';
import Roles from './Roles';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students');

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="admin-dashboard">
      <nav className="navbar">
        <h1>Maatram Admin Dashboard</h1>
        <div className="navbar-nav">
          <span style={{ marginRight: '20px' }}>Welcome, {user?.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Students
          </button>
          <button
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={`tab ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            Roles
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'students' && <Students />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'roles' && <Roles />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

