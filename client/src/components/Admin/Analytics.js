import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [skillDistribution, setSkillDistribution] = useState([]);
  const [roleReadiness, setRoleReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchSkillDistribution();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchRoleReadiness(selectedRole);
    }
  }, [selectedRole]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/analytics/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSkillDistribution = async () => {
    try {
      const response = await axios.get('/api/admin/analytics/skills');
      setSkillDistribution(response.data.slice(0, 10));
    } catch (error) {
      toast.error('Error fetching skill distribution');
    }
  };

  const fetchRoleReadiness = async (role) => {
    try {
      const response = await axios.get(`/api/admin/analytics/role-readiness?role=${role}`);
      setRoleReadiness(response.data);
    } catch (error) {
      toast.error('Error fetching role readiness');
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  const skillChartData = {
    labels: skillDistribution.map(s => s.skill),
    datasets: [
      {
        label: 'Number of Students',
        data: skillDistribution.map(s => s.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const roleDistributionData = dashboardData?.roleDistribution ? {
    labels: dashboardData.roleDistribution.map(r => r.role),
    datasets: [
      {
        label: 'Number of Students',
        data: dashboardData.roleDistribution.map(r => r.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  } : null;

  return (
    <div className="analytics-container">
      <h2>Analytics Dashboard</h2>

      {dashboardData && (
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>Total Students</h4>
            <div className="value">{dashboardData.summary.totalStudents}</div>
          </div>
          <div className="analytics-card">
            <h4>Total Roles</h4>
            <div className="value">{dashboardData.summary.totalRoles}</div>
          </div>
          <div className="analytics-card">
            <h4>Total Skills</h4>
            <div className="value">{dashboardData.summary.totalSkills}</div>
          </div>
        </div>
      )}

      <div className="chart-wrapper">
        <h4>Top Skills Distribution</h4>
        {skillDistribution.length > 0 && (
          <Bar
            data={skillChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top'
                },
                title: {
                  display: true,
                  text: 'Most Popular Skills'
                }
              }
            }}
          />
        )}
      </div>

      {roleDistributionData && (
        <div className="chart-wrapper">
          <h4>Role Distribution (Desired Roles)</h4>
          <Bar
            data={roleDistributionData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top'
                },
                title: {
                  display: true,
                  text: 'Student Career Aspirations'
                }
              }
            }}
          />
        </div>
      )}

      <div className="chart-wrapper">
        <h4>Role Readiness Analysis</h4>
        <div className="form-group">
          <label>Select Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">-- Select a Role --</option>
            {dashboardData?.roleReadiness && Object.keys(dashboardData.roleReadiness).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {roleReadiness && (
          <div>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h4>Average Readiness</h4>
                <div className="value">{roleReadiness.statistics.average.toFixed(1)}%</div>
              </div>
              <div className="analytics-card">
                <h4>Ready (≥70%)</h4>
                <div className="value">{roleReadiness.statistics.ready}</div>
              </div>
              <div className="analytics-card">
                <h4>Needs Improvement (50-69%)</h4>
                <div className="value">{roleReadiness.statistics.needsImprovement}</div>
              </div>
              <div className="analytics-card">
                <h4>Not Ready (&lt;50%)</h4>
                <div className="value">{roleReadiness.statistics.notReady}</div>
              </div>
            </div>

            <h4>Top Candidates</h4>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>College</th>
                    <th>Readiness Score</th>
                    <th>Matched Skills</th>
                    <th>Missing Skills</th>
                  </tr>
                </thead>
                <tbody>
                  {roleReadiness.students.slice(0, 10).map((student, index) => (
                    <tr key={index}>
                      <td>{student.name}</td>
                      <td>{student.college}</td>
                      <td>{student.score.toFixed(1)}%</td>
                      <td>{student.matchedSkills.length}</td>
                      <td>{student.missingSkills.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;

