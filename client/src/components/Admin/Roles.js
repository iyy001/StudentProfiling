import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    requiredSkills: [],
    preferredSkills: [],
    courses: [],
    resources: []
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/api/roles');
      setRoles(response.data);
    } catch (error) {
      toast.error('Error fetching roles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await axios.put(`/api/admin/roles/${editingRole._id}`, formData);
        toast.success('Role updated successfully');
      } else {
        await axios.post('/api/admin/roles', formData);
        toast.success('Role created successfully');
      }
      fetchRoles();
      resetForm();
    } catch (error) {
      toast.error('Error saving role');
    }
  };

  const handleDelete = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await axios.delete(`/api/admin/roles/${roleId}`);
        toast.success('Role deleted successfully');
        fetchRoles();
      } catch (error) {
        toast.error('Error deleting role');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      industry: '',
      requiredSkills: [],
      preferredSkills: [],
      courses: [],
      resources: []
    });
    setEditingRole(null);
    setShowForm(false);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      industry: role.industry || '',
      requiredSkills: role.requiredSkills || [],
      preferredSkills: role.preferredSkills || [],
      courses: role.courses || [],
      resources: role.resources || []
    });
    setShowForm(true);
  };

  if (loading) {
    return <div className="loading">Loading roles...</div>;
  }

  return (
    <div className="roles-container">
      <div className="dashboard-header">
        <h2>Role Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add New Role
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>{editingRole ? 'Edit Role' : 'Add New Role'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Role Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingRole ? 'Update' : 'Create'} Role
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="roles-list">
        {roles.map((role) => (
          <div key={role._id} className="card">
            <div className="role-header">
              <h3>{role.name}</h3>
              <div>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => handleEdit(role)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => handleDelete(role._id)}
                >
                  Delete
                </button>
              </div>
            </div>
            <p>{role.description}</p>
            <p><strong>Industry:</strong> {role.industry || 'N/A'}</p>
            <p><strong>Required Skills:</strong> {role.requiredSkills?.length || 0}</p>
            <p><strong>Preferred Skills:</strong> {role.preferredSkills?.length || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roles;

