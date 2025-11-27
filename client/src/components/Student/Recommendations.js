import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Recommendations.css';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get('/api/recommendations');
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      toast.error('Error fetching recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  if (loading) {
    return <div className="loading">Loading recommendations...</div>;
  }

  return (
    <div className="recommendations-container">
      <h2>Career Recommendations</h2>
      <p>Based on your profile, here are the roles that best match your skills and experience.</p>

      {recommendations.length === 0 ? (
        <div className="empty-state">
          <p>No recommendations available. Please update your profile first.</p>
        </div>
      ) : (
        <div className="recommendations-list">
          {recommendations.map((rec, index) => (
            <div key={index} className="recommendation-card">
              <div className="recommendation-header">
                <h3>{rec.role.name}</h3>
                <div className={`readiness-score ${getScoreColor(rec.readinessScore)}`}>
                  {rec.readinessScore.toFixed(1)}%
                </div>
              </div>
              <p className="recommendation-description">{rec.role.description}</p>
              <p className="explanation">{rec.explanation}</p>

              <div className="skills-section">
                <h4>Matched Skills ({rec.matchedSkills.length})</h4>
                <div className="skills-list">
                  {rec.matchedSkills.map((skill, i) => (
                    <span key={i} className="skill-badge matched">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {rec.missingSkills.length > 0 && (
                <div className="skills-section">
                  <h4>Missing Skills ({rec.missingSkills.length})</h4>
                  <div className="skills-list">
                    {rec.missingSkills.slice(0, 10).map((skill, i) => (
                      <span key={i} className="skill-badge missing">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="recommendation-footer">
                <p className="explanation">
                  Go to "Role-Based Guidance" tab to see detailed skill requirements for this role.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;

