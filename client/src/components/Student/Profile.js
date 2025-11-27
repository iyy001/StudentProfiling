import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/students/profile');
      setProfile(response.data);
    } catch (error) {
      toast.error('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (section, data) => {
    try {
      await axios.put(`/api/students/profile/${section}`, data);
      toast.success('Profile updated successfully');
      fetchProfile();
      setEditingSection(null);
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="error">Profile not found</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <p>Last updated: {new Date(profile.lastUpdated).toLocaleDateString()}</p>
      </div>

      <div className="profile-sections">
        <PersonalInfo
          data={profile.personalInfo}
          onUpdate={(data) => updateSection('personal', data)}
          editing={editingSection === 'personal'}
          setEditing={(val) => setEditingSection(val ? 'personal' : null)}
        />
        <Skills
          data={profile.skills}
          onUpdate={(data) => updateSection('skills', data)}
          editing={editingSection === 'skills'}
          setEditing={(val) => setEditingSection(val ? 'skills' : null)}
        />
        <CareerAspirations
          data={profile.careerAspirations}
          onUpdate={(data) => updateSection('career-aspirations', data)}
          editing={editingSection === 'aspirations'}
          setEditing={(val) => setEditingSection(val ? 'aspirations' : null)}
        />
        <Projects
          data={profile.projects}
          onUpdate={(data) => updateSection('projects', data)}
          editing={editingSection === 'projects'}
          setEditing={(val) => setEditingSection(val ? 'projects' : null)}
        />
        <Internships
          data={profile.internships}
          onUpdate={(data) => updateSection('internships', data)}
          editing={editingSection === 'internships'}
          setEditing={(val) => setEditingSection(val ? 'internships' : null)}
        />
        <Academics
          data={profile.academics}
          onUpdate={(data) => updateSection('academics', data)}
          editing={editingSection === 'academics'}
          setEditing={(val) => setEditingSection(val ? 'academics' : null)}
        />
        <Certifications
          data={profile.certifications}
          onUpdate={(data) => updateSection('certifications', data)}
          editing={editingSection === 'certifications'}
          setEditing={(val) => setEditingSection(val ? 'certifications' : null)}
        />
      </div>
    </div>
  );
};

// Personal Info Component
const PersonalInfo = ({ data, onUpdate, editing, setEditing }) => {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <h3>Personal Information</h3>
        <button className="btn btn-secondary btn-small" onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className="section-content">
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>College</label>
              <input
                type="text"
                value={formData.college || ''}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Degree</label>
              <input
                type="text"
                value={formData.degree || ''}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Branch</label>
              <input
                type="text"
                value={formData.branch || ''}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || '' })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="section-content">
          <p><strong>Name:</strong> {data?.firstName || ''} {data?.lastName || ''}</p>
          <p><strong>College:</strong> {data?.college || 'Not provided'}</p>
          <p><strong>Degree:</strong> {data?.degree || 'Not provided'}</p>
          <p><strong>Branch:</strong> {data?.branch || 'Not provided'}</p>
          <p><strong>Year:</strong> {data?.year || 'Not provided'}</p>
          <p><strong>Phone:</strong> {data?.phone || 'Not provided'}</p>
        </div>
      )}
    </div>
  );
};

// Skills Component
const Skills = ({ data, onUpdate, editing, setEditing }) => {
  const [skills, setSkills] = useState(data || []);

  useEffect(() => {
    setSkills(data || []);
  }, [data]);

  const addSkill = () => {
    setSkills([...skills, { name: '', level: 'beginner', certification: { hasCertification: false } }]);
  };

  const updateSkill = (index, field, value) => {
    const updated = [...skills];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updated[index] = {
        ...updated[index],
        [parent]: { ...updated[index][parent], [child]: value }
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setSkills(updated);
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(skills);
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <h3>Skills</h3>
        <button className="btn btn-secondary btn-small" onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className="section-content">
          {skills.map((skill, index) => (
            <div key={index} className="list-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Skill Name</label>
                  <input
                    type="text"
                    value={skill.name || ''}
                    onChange={(e) => updateSkill(index, 'name', e.target.value)}
                    placeholder="e.g., Python, React, Java"
                  />
                </div>
                <div className="form-group">
                  <label>Level</label>
                  <select
                    value={skill.level || 'beginner'}
                    onChange={(e) => updateSkill(index, 'level', e.target.value)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={skill.certification?.hasCertification || false}
                    onChange={(e) => updateSkill(index, 'certification.hasCertification', e.target.checked)}
                  />
                  Has Certification
                </label>
              </div>
              {skill.certification?.hasCertification && (
                <div className="form-group">
                  <label>Certificate Name</label>
                  <input
                    type="text"
                    value={skill.certification.certificateName || ''}
                    onChange={(e) => updateSkill(index, 'certification.certificateName', e.target.value)}
                  />
                </div>
              )}
              <button
                type="button"
                className="btn btn-danger btn-small"
                onClick={() => removeSkill(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={addSkill}>
            Add Skill
          </button>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="section-content">
          {skills.length > 0 ? (
            <div className="skills-list">
              {skills.map((skill, index) => (
                <span key={index} className="skill-badge">
                  {skill.name} ({skill.level})
                </span>
              ))}
            </div>
          ) : (
            <p className="empty-state">No skills added yet</p>
          )}
        </div>
      )}
    </div>
  );
};

// Career Aspirations Component
const CareerAspirations = ({ data, onUpdate, editing, setEditing }) => {
  const [desiredRolesText, setDesiredRolesText] = useState('');
  const [industriesText, setIndustriesText] = useState('');

  useEffect(() => {
    if (data) {
      setDesiredRolesText(data.desiredRoles?.join(', ') || '');
      setIndustriesText(data.industries?.join(', ') || '');
    }
  }, [data, editing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const desiredRoles = desiredRolesText.split(',').map(s => s.trim()).filter(s => s);
    const industries = industriesText.split(',').map(s => s.trim()).filter(s => s);
    onUpdate({ desiredRoles, industries });
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <h3>Career Aspirations</h3>
        <button className="btn btn-secondary btn-small" onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className="section-content">
          <div className="form-group">
            <label>Desired Roles (comma-separated)</label>
            <input
              type="text"
              value={desiredRolesText}
              onChange={(e) => setDesiredRolesText(e.target.value)}
              placeholder="e.g., Software Engineer, Data Analyst, Web Developer"
              style={{ width: '100%' }}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>Separate multiple roles with commas</small>
          </div>
          <div className="form-group">
            <label>Industries (comma-separated)</label>
            <input
              type="text"
              value={industriesText}
              onChange={(e) => setIndustriesText(e.target.value)}
              placeholder="e.g., Technology, Finance, Healthcare"
              style={{ width: '100%' }}
            />
            <small style={{ color: '#666', fontSize: '12px' }}>Separate multiple industries with commas</small>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="section-content">
          <p><strong>Desired Roles:</strong> {data?.desiredRoles?.join(', ') || 'Not specified'}</p>
          <p><strong>Industries:</strong> {data?.industries?.join(', ') || 'Not specified'}</p>
        </div>
      )}
    </div>
  );
};

// Projects Component
const Projects = ({ data, onUpdate, editing, setEditing }) => {
  const [projects, setProjects] = useState(data || []);

  useEffect(() => {
    setProjects(data || []);
  }, [data]);

  const addProject = () => {
    setProjects([...projects, {
      title: '',
      description: '',
      technologies: [],
      githubUrl: '',
      liveUrl: '',
      startDate: '',
      endDate: ''
    }]);
  };

  const updateProject = (index, field, value) => {
    const updated = [...projects];
    if (field === 'technologies') {
      updated[index].technologies = value.split(',').map(t => t.trim()).filter(t => t);
    } else {
      updated[index][field] = value;
    }
    setProjects(updated);
  };

  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(projects);
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <h3>Projects</h3>
        <button className="btn btn-secondary btn-small" onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className="section-content">
          {projects.map((project, index) => (
            <div key={index} className="list-item">
              <div className="form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  value={project.title || ''}
                  onChange={(e) => updateProject(index, 'title', e.target.value)}
                  placeholder="e.g., E-Commerce Website"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={project.description || ''}
                  onChange={(e) => updateProject(index, 'description', e.target.value)}
                  placeholder="Describe your project..."
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Technologies (comma-separated)</label>
                  <input
                    type="text"
                    value={project.technologies?.join(', ') || ''}
                    onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                    placeholder="e.g., React, Node.js, MongoDB"
                  />
                </div>
                <div className="form-group">
                  <label>GitHub URL</label>
                  <input
                    type="url"
                    value={project.githubUrl || ''}
                    onChange={(e) => updateProject(index, 'githubUrl', e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Live URL</label>
                  <input
                    type="url"
                    value={project.liveUrl || ''}
                    onChange={(e) => updateProject(index, 'liveUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={project.startDate || ''}
                    onChange={(e) => updateProject(index, 'startDate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={project.endDate || ''}
                    onChange={(e) => updateProject(index, 'endDate', e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-small"
                onClick={() => removeProject(index)}
              >
                Remove Project
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={addProject}>
            Add Project
          </button>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="section-content">
          {projects.length > 0 ? (
            projects.map((project, index) => (
              <div key={index} className="list-item">
                <h4>{project.title || 'Untitled Project'}</h4>
                <p>{project.description || 'No description'}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <p><strong>Technologies:</strong> {project.technologies.join(', ')}</p>
                )}
                {project.githubUrl && <p><strong>GitHub:</strong> <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">{project.githubUrl}</a></p>}
                {project.liveUrl && <p><strong>Live:</strong> <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">{project.liveUrl}</a></p>}
              </div>
            ))
          ) : (
            <p className="empty-state">No projects added yet</p>
          )}
        </div>
      )}
    </div>
  );
};

// Internships Component
const Internships = ({ data, onUpdate, editing, setEditing }) => {
  const [internships, setInternships] = useState(data || []);

  useEffect(() => {
    setInternships(data || []);
  }, [data]);

  const addInternship = () => {
    setInternships([...internships, {
      company: '',
      role: '',
      description: '',
      startDate: '',
      endDate: '',
      skillsGained: []
    }]);
  };

  const updateInternship = (index, field, value) => {
    const updated = [...internships];
    if (field === 'skillsGained') {
      updated[index].skillsGained = value.split(',').map(s => s.trim()).filter(s => s);
    } else {
      updated[index][field] = value;
    }
    setInternships(updated);
  };

  const removeInternship = (index) => {
    setInternships(internships.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(internships);
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <h3>Internships</h3>
        <button className="btn btn-secondary btn-small" onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className="section-content">
          {internships.map((internship, index) => (
            <div key={index} className="list-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    value={internship.company || ''}
                    onChange={(e) => updateInternship(index, 'company', e.target.value)}
                    placeholder="e.g., Google, Microsoft"
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    value={internship.role || ''}
                    onChange={(e) => updateInternship(index, 'role', e.target.value)}
                    placeholder="e.g., Software Development Intern"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={internship.description || ''}
                  onChange={(e) => updateInternship(index, 'description', e.target.value)}
                  placeholder="Describe your internship experience..."
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={internship.startDate || ''}
                    onChange={(e) => updateInternship(index, 'startDate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={internship.endDate || ''}
                    onChange={(e) => updateInternship(index, 'endDate', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Skills Gained (comma-separated)</label>
                <input
                  type="text"
                  value={internship.skillsGained?.join(', ') || ''}
                  onChange={(e) => updateInternship(index, 'skillsGained', e.target.value)}
                  placeholder="e.g., React, Python, Team Collaboration"
                />
              </div>
              <button
                type="button"
                className="btn btn-danger btn-small"
                onClick={() => removeInternship(index)}
              >
                Remove Internship
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={addInternship}>
            Add Internship
          </button>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="section-content">
          {internships.length > 0 ? (
            internships.map((internship, index) => (
              <div key={index} className="list-item">
                <h4>{internship.company || 'Unknown Company'} - {internship.role || 'Unknown Role'}</h4>
                <p>{internship.description || 'No description'}</p>
                {internship.startDate && internship.endDate && (
                  <p><strong>Duration:</strong> {new Date(internship.startDate).toLocaleDateString()} to {new Date(internship.endDate).toLocaleDateString()}</p>
                )}
                {internship.skillsGained && internship.skillsGained.length > 0 && (
                  <p><strong>Skills Gained:</strong> {internship.skillsGained.join(', ')}</p>
                )}
              </div>
            ))
          ) : (
            <p className="empty-state">No internships added yet</p>
          )}
        </div>
      )}
    </div>
  );
};

// Academics Component
const Academics = ({ data, onUpdate, editing, setEditing }) => {
  const [academics, setAcademics] = useState(data || []);

  useEffect(() => {
    setAcademics(data || []);
  }, [data]);

  const addSemester = () => {
    setAcademics([...academics, {
      semester: academics.length + 1,
      cgpa: 0,
      courses: []
    }]);
  };

  const updateSemester = (index, field, value) => {
    const updated = [...academics];
    updated[index][field] = field === 'semester' || field === 'cgpa' ? parseFloat(value) || 0 : value;
    setAcademics(updated);
  };

  const addCourse = (semesterIndex) => {
    const updated = [...academics];
    updated[semesterIndex].courses = [...(updated[semesterIndex].courses || []), {
      name: '',
      grade: '',
      credits: 0
    }];
    setAcademics(updated);
  };

  const updateCourse = (semesterIndex, courseIndex, field, value) => {
    const updated = [...academics];
    updated[semesterIndex].courses[courseIndex][field] = field === 'credits' ? parseFloat(value) || 0 : value;
    setAcademics(updated);
  };

  const removeCourse = (semesterIndex, courseIndex) => {
    const updated = [...academics];
    updated[semesterIndex].courses = updated[semesterIndex].courses.filter((_, i) => i !== courseIndex);
    setAcademics(updated);
  };

  const removeSemester = (index) => {
    setAcademics(academics.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(academics);
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <h3>Academics</h3>
        <button className="btn btn-secondary btn-small" onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className="section-content">
          {academics.map((semester, index) => (
            <div key={index} className="list-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Semester</label>
                  <input
                    type="number"
                    value={semester.semester || ''}
                    onChange={(e) => updateSemester(index, 'semester', e.target.value)}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>CGPA</label>
                  <input
                    type="number"
                    value={semester.cgpa || ''}
                    onChange={(e) => updateSemester(index, 'cgpa', e.target.value)}
                    min="0"
                    max="10"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Courses</label>
                {(semester.courses || []).map((course, courseIndex) => (
                  <div key={courseIndex} style={{ marginBottom: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Course Name</label>
                        <input
                          type="text"
                          value={course.name || ''}
                          onChange={(e) => updateCourse(index, courseIndex, 'name', e.target.value)}
                          placeholder="e.g., Data Structures"
                        />
                      </div>
                      <div className="form-group">
                        <label>Grade</label>
                        <input
                          type="text"
                          value={course.grade || ''}
                          onChange={(e) => updateCourse(index, courseIndex, 'grade', e.target.value)}
                          placeholder="e.g., A, B+, 85"
                        />
                      </div>
                      <div className="form-group">
                        <label>Credits</label>
                        <input
                          type="number"
                          value={course.credits || ''}
                          onChange={(e) => updateCourse(index, courseIndex, 'credits', e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-danger btn-small"
                          onClick={() => removeCourse(index, courseIndex)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => addCourse(index)}
                >
                  Add Course
                </button>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-small"
                onClick={() => removeSemester(index)}
              >
                Remove Semester
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={addSemester}>
            Add Semester
          </button>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="section-content">
          {academics.length > 0 ? (
            academics.map((semester, index) => (
              <div key={index} className="list-item">
                <h4>Semester {semester.semester}</h4>
                <p><strong>CGPA:</strong> {semester.cgpa || 'N/A'}</p>
                {semester.courses && semester.courses.length > 0 && (
                  <div>
                    <strong>Courses:</strong>
                    <ul>
                      {semester.courses.map((course, i) => (
                        <li key={i}>
                          {course.name || 'Unnamed'} - Grade: {course.grade || 'N/A'} ({course.credits || 0} credits)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="empty-state">No academic data added yet</p>
          )}
        </div>
      )}
    </div>
  );
};

// Certifications Component
const Certifications = ({ data, onUpdate, editing, setEditing }) => {
  const [certifications, setCertifications] = useState(data || []);

  useEffect(() => {
    setCertifications(data || []);
  }, [data]);

  const addCertification = () => {
    setCertifications([...certifications, {
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: ''
    }]);
  };

  const updateCertification = (index, field, value) => {
    const updated = [...certifications];
    updated[index][field] = value;
    setCertifications(updated);
  };

  const removeCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(certifications);
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <h3>Certifications</h3>
        <button className="btn btn-secondary btn-small" onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className="section-content">
          {certifications.map((cert, index) => (
            <div key={index} className="list-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Certification Name</label>
                  <input
                    type="text"
                    value={cert.name || ''}
                    onChange={(e) => updateCertification(index, 'name', e.target.value)}
                    placeholder="e.g., AWS Certified Solutions Architect"
                  />
                </div>
                <div className="form-group">
                  <label>Issuer</label>
                  <input
                    type="text"
                    value={cert.issuer || ''}
                    onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                    placeholder="e.g., Amazon Web Services"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Credential ID</label>
                  <input
                    type="text"
                    value={cert.credentialId || ''}
                    onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                    placeholder="e.g., ABC123XYZ"
                  />
                </div>
                <div className="form-group">
                  <label>Issue Date</label>
                  <input
                    type="date"
                    value={cert.issueDate || ''}
                    onChange={(e) => updateCertification(index, 'issueDate', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date (if applicable)</label>
                  <input
                    type="date"
                    value={cert.expiryDate || ''}
                    onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-small"
                onClick={() => removeCertification(index)}
              >
                Remove Certification
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={addCertification}>
            Add Certification
          </button>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="section-content">
          {certifications.length > 0 ? (
            certifications.map((cert, index) => (
              <div key={index} className="list-item">
                <h4>{cert.name || 'Unnamed Certification'}</h4>
                <p><strong>Issuer:</strong> {cert.issuer || 'N/A'}</p>
                {cert.credentialId && <p><strong>Credential ID:</strong> {cert.credentialId}</p>}
                {cert.issueDate && <p><strong>Issue Date:</strong> {new Date(cert.issueDate).toLocaleDateString()}</p>}
                {cert.expiryDate && <p><strong>Expiry Date:</strong> {new Date(cert.expiryDate).toLocaleDateString()}</p>}
              </div>
            ))
          ) : (
            <p className="empty-state">No certifications added yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
