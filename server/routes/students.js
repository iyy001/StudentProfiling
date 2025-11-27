const express = require('express');
const StudentProfile = require('../models/StudentProfile');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get student profile
router.get('/profile', auth, async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id })
      .populate('userId', 'email role');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update personal info
router.put('/profile/personal', auth, async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    profile.personalInfo = { ...profile.personalInfo, ...req.body };
    profile.lastUpdated = new Date();
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generic update route for profile sections
router.put('/profile/:section', auth, async (req, res) => {
  try {
    const { section } = req.params;
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const sectionMap = {
      'personal': 'personalInfo',
      'academics': 'academics',
      'skills': 'skills',
      'projects': 'projects',
      'internships': 'internships',
      'certifications': 'certifications',
      'extracurricular': 'extracurricular',
      'career-aspirations': 'careerAspirations'
    };

    const profileField = sectionMap[section];
    if (!profileField) {
      return res.status(400).json({ message: 'Invalid section' });
    }

    if (section === 'personal' || section === 'career-aspirations') {
      profile[profileField] = { ...profile[profileField], ...req.body };
    } else {
      profile[profileField] = req.body;
    }

    profile.lastUpdated = new Date();
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update academics
router.put('/profile/academics', auth, async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    profile.academics = req.body;
    profile.lastUpdated = new Date();
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update skills
router.put('/profile/skills', auth, async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    profile.skills = req.body;
    profile.lastUpdated = new Date();
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update projects
router.put('/profile/projects', auth, async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    profile.projects = req.body;
    profile.lastUpdated = new Date();
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update internships
router.put('/profile/internships', auth, async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    profile.internships = req.body;
    profile.lastUpdated = new Date();
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update certifications
router.put('/profile/certifications', auth, async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    profile.certifications = req.body;
    profile.lastUpdated = new Date();
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update extracurricular
router.put('/profile/extracurricular', auth, async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    profile.extracurricular = req.body;
    profile.lastUpdated = new Date();
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update career aspirations
router.put('/profile/career-aspirations', auth, async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    profile.careerAspirations = { ...profile.careerAspirations, ...req.body };
    profile.lastUpdated = new Date();
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

