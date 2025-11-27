import React from 'react';
import './StudentDetail.css';

const StudentDetail = ({ student, onClose, onUpdate }) => {
  return (
    <div className="modal show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {student.personalInfo?.firstName || ''} {student.personalInfo?.lastName || ''}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="student-detail-content">
          <div className="detail-section">
            <h4>Personal Information</h4>
            <div className="detail-grid">
              <div><strong>Email:</strong> {student.userId?.email || 'N/A'}</div>
              <div><strong>College:</strong> {student.personalInfo?.college || 'N/A'}</div>
              <div><strong>Degree:</strong> {student.personalInfo?.degree || 'N/A'}</div>
              <div><strong>Branch:</strong> {student.personalInfo?.branch || 'N/A'}</div>
              <div><strong>Year:</strong> {student.personalInfo?.year || 'N/A'}</div>
              <div><strong>Phone:</strong> {student.personalInfo?.phone || 'N/A'}</div>
            </div>
          </div>

          <div className="detail-section">
            <h4>Skills ({student.skills?.length || 0})</h4>
            <div className="skills-list">
              {student.skills?.map((skill, index) => (
                <span key={index} className="skill-badge">
                  {skill.name} ({skill.level})
                </span>
              )) || <p>No skills added</p>}
            </div>
          </div>

          <div className="detail-section">
            <h4>Projects ({student.projects?.length || 0})</h4>
            {student.projects?.map((project, index) => (
              <div key={index} className="list-item">
                <h5>{project.title}</h5>
                <p>{project.description}</p>
                <p><strong>Technologies:</strong> {project.technologies?.join(', ') || 'N/A'}</p>
              </div>
            )) || <p>No projects added</p>}
          </div>

          <div className="detail-section">
            <h4>Internships ({student.internships?.length || 0})</h4>
            {student.internships?.map((internship, index) => (
              <div key={index} className="list-item">
                <h5>{internship.company} - {internship.role}</h5>
                <p>{internship.description}</p>
                <p><strong>Skills Gained:</strong> {internship.skillsGained?.join(', ') || 'N/A'}</p>
              </div>
            )) || <p>No internships added</p>}
          </div>

          <div className="detail-section">
            <h4>Career Aspirations</h4>
            <p><strong>Desired Roles:</strong> {student.careerAspirations?.desiredRoles?.join(', ') || 'Not specified'}</p>
            <p><strong>Industries:</strong> {student.careerAspirations?.industries?.join(', ') || 'Not specified'}</p>
          </div>

          {student.readinessScores && Object.keys(student.readinessScores).length > 0 && (
            <div className="detail-section">
              <h4>Readiness Scores</h4>
              {Object.entries(student.readinessScores).map(([role, data]) => (
                <div key={role} className="readiness-item">
                  <strong>{role}:</strong> {data.score?.toFixed(1)}%
                  <div className="readiness-details">
                    <p>Matched Skills: {data.matchedSkills?.join(', ') || 'None'}</p>
                    <p>Missing Skills: {data.missingSkills?.join(', ') || 'None'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;

