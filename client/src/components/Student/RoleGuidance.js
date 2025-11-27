import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './RoleGuidance.css';

const RoleGuidance = () => {
  const [roleData, setRoleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [allRoles, setAllRoles] = useState([]);

  useEffect(() => {
    fetchAllRoles();
  }, []);

  const fetchAllRoles = async () => {
    try {
      const response = await axios.get('/api/roles');
      setAllRoles(response.data);
    } catch (error) {
      toast.error('Error fetching roles');
    }
  };

  const fetchRoleGuidance = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/recommendations/role/${id}`);
      setRoleData(response.data);
    } catch (error) {
      toast.error('Error fetching role guidance');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (e) => {
    const roleId = e.target.value;
    setSelectedRole(roleId);
    if (roleId) {
      fetchRoleGuidance(roleId);
    }
  };

  if (!selectedRole) {
    return (
      <div className="role-guidance-container">
        <h2>Role-Based Skill Guidance</h2>
        <p>Select a role to see detailed skill requirements and guidance.</p>
        <div className="form-group">
          <label>Select a Role</label>
          <select value={selectedRole} onChange={handleRoleChange}>
            <option value="">-- Select a Role --</option>
            {allRoles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading role guidance...</div>;
  }

  if (!roleData) {
    return <div className="error">Role data not found</div>;
  }

  const getScoreColor = (score) => {
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  return (
    <div className="role-guidance-container">
      <h2>Role-Based Skill Guidance</h2>

      <div className="form-group">
        <label>Select a Role</label>
        <select value={selectedRole} onChange={handleRoleChange}>
          <option value="">-- Select a Role --</option>
          {allRoles.map((role) => (
            <option key={role._id} value={role._id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <div className="role-guidance-card">
        <div className="role-header">
          <h3>{roleData.role.name}</h3>
          <div className={`readiness-score ${getScoreColor(roleData.readinessScore)}`}>
            {roleData.readinessScore.toFixed(1)}% Ready
          </div>
        </div>

        <p className="role-description">{roleData.role.description}</p>

        <div className="skill-guidance-section">
          <h4>Required Skills</h4>
          <div className="skills-grid">
            {roleData.skillGuidance.required.map((skill, index) => (
              <div
                key={index}
                className={`skill-item ${skill.hasSkill ? 'matched' : 'missing'}`}
              >
                <div className="skill-name">
                  {skill.skill} ({skill.level})
                </div>
                <div className="skill-status">
                  {skill.hasSkill ? '✓ You have this' : '✗ Missing'}
                </div>
                {!skill.hasSkill && skill.suggestedCourses.length > 0 && (
                  <div className="suggested-courses">
                    <strong>Suggested Courses:</strong>
                    <ul>
                      {skill.suggestedCourses.map((course, i) => (
                        <li key={i}>
                          <a href={course.url} target="_blank" rel="noopener noreferrer">
                            {course.name} ({course.platform})
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {roleData.featureContributions && roleData.featureContributions.length > 0 && (
          <div className="feature-contributions-section">
            <h4>AI Explanation (Feature Contributions)</h4>
            <div className="feature-contributions">
              {roleData.featureContributions.map((contrib, index) => (
                <div key={index} className="feature-contribution">
                  <div className="feature-name">{contrib.feature}</div>
                  <div className="contribution-bar">
                    <div
                      className={`contribution-fill ${
                        contrib.contribution > 0 ? 'positive' : 'negative'
                      }`}
                      style={{
                        width: `${Math.abs(contrib.contribution) * 10}%`
                      }}
                    />
                  </div>
                  <div className={`contribution-value ${contrib.contribution > 0 ? 'positive' : 'negative'}`}>
                    {contrib.contribution > 0 ? '+' : ''}
                    {contrib.contribution.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {roleData.role.courses && roleData.role.courses.length > 0 && (
          <div className="courses-section">
            <h4>Recommended Courses</h4>
            <ul>
              {roleData.role.courses.map((course, index) => (
                <li key={index}>
                  <a href={course.url} target="_blank" rel="noopener noreferrer">
                    {course.name} - {course.platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {roleData.role.resources && roleData.role.resources.length > 0 && (
          <div className="resources-section">
            <h4>Additional Resources</h4>
            <ul>
              {roleData.role.resources.map((resource, index) => (
                <li key={index}>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.title} ({resource.type})
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleGuidance;

