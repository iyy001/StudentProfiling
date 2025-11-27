const express = require('express');
const Role = require('../models/Role');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get all roles (public for students)
router.get('/', auth, async (req, res) => {
  try {
    const roles = await Role.find({}).sort({ name: 1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single role
router.get('/:id', auth, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get role by name
router.get('/name/:name', auth, async (req, res) => {
  try {
    const role = await Role.findOne({ name: req.params.name });
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

