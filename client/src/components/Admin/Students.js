import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import StudentDetail from './StudentDetail';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    college: '',
    skill: '',
    readinessScore: '',
    page: 1,
    limit: 20
  });
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const debounceTimer = useRef(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(`/api/admin/students?${params.toString()}`);
      setStudents(response.data.students || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      toast.error('Error fetching students');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle non-search filters immediately (role, college, skill, readinessScore)
  const handleFilterChange = (key, value) => {
    if (key === 'search') {
      // Update local input state and debounce updating the actual filter
      setSearchInput(value);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        setFilters(prev => ({ ...prev, search: value, page: 1 }));
      }, 500);
    } else {
      // Immediate update for other filters
      setFilters(prevFilters => ({ ...prevFilters, [key]: value, page: 1 }));
    }
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const handleViewStudent = async (studentId) => {
    try {
      const response = await axios.get(`/api/admin/students/${studentId}`);
      setSelectedStudent(response.data);
      setShowModal(true);
    } catch (error) {
      toast.error('Error fetching student details');
    }
  };

  // Sync local search input when filters.search changes externally
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  return (
    <div className="students-container">
      <h2>Student Management</h2>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name, email, college..."
          value={searchInput}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by role"
          value={filters.role}
          onChange={(e) => handleFilterChange('role', e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by college"
          value={filters.college}
          onChange={(e) => handleFilterChange('college', e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by skill"
          value={filters.skill}
          onChange={(e) => handleFilterChange('skill', e.target.value)}
        />
        <input
          type="number"
          placeholder="Min readiness score"
          value={filters.readinessScore}
          onChange={(e) => handleFilterChange('readinessScore', e.target.value)}
        />
      </div>

      <div className="students-list">
        {students.length === 0 ? (
          <div className="empty-state">
            <p>No students found</p>
          </div>
        ) : (
          students.map((student) => (
            <div key={student._id} className="student-card">
              <div className="student-card-header">
                <h3>
                  {student.personalInfo?.firstName || ''} {student.personalInfo?.lastName || ''}
                </h3>
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => handleViewStudent(student._id)}
                >
                  View Details
                </button>
              </div>
              <div className="student-card-body">
                <div className="student-info-item">
                  <label>Email</label>
                  <span>{student.userId?.email || 'N/A'}</span>
                </div>
                <div className="student-info-item">
                  <label>College</label>
                  <span>{student.personalInfo?.college || 'N/A'}</span>
                </div>
                <div className="student-info-item">
                  <label>Year</label>
                  <span>{student.personalInfo?.year || 'N/A'}</span>
                </div>
                <div className="student-info-item">
                  <label>Skills</label>
                  <span>{student.skills?.length || 0} skills</span>
                </div>
                <div className="student-info-item">
                  <label>Projects</label>
                  <span>{student.projects?.length || 0} projects</span>
                </div>
                <div className="student-info-item">
                  <label>Internships</label>
                  <span>{student.internships?.length || 0} internships</span>
                </div>
              </div>
              {student.careerAspirations?.desiredRoles && student.careerAspirations.desiredRoles.length > 0 && (
                <div className="student-roles">
                  <strong>Desired Roles:</strong>{' '}
                  {student.careerAspirations.desiredRoles.join(', ')}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 1}
          >
            Previous
          </button>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={filters.page === page ? 'active' : ''}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page === pagination.pages}
          >
            Next
          </button>
        </div>
      )}

      {showModal && selectedStudent && (
        <StudentDetail
          student={selectedStudent}
          onClose={() => {
            setShowModal(false);
            setSelectedStudent(null);
          }}
          onUpdate={fetchStudents}
        />
      )}
    </div>
  );
};

export default Students;

