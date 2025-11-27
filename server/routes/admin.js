const express = require('express');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const Role = require('../models/Role');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// All admin routes require admin authentication
router.use(adminAuth);

// Get all students with filters
router.get('/students', async (req, res) => {
  try {
    const {
      role,
      college,
      skill,
      readinessScore,
      search,
      page = 1,
      limit = 50,
      sortBy = 'lastUpdated',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Filter by role (desired roles)
    if (role) {
      query['careerAspirations.desiredRoles'] = { $in: [role] };
    }

    // Filter by college
    if (college) {
      query['personalInfo.college'] = new RegExp(college, 'i');
    }

    // Filter by skill
    if (skill) {
      query['skills.name'] = new RegExp(skill, 'i');
    }

    // Filter by readiness score (if specific role is provided)
    if (readinessScore && role) {
      const minScore = parseFloat(readinessScore);
      query[`readinessScores.${role}.score`] = { $gte: minScore };
    }

    // Search across multiple fields
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': new RegExp(search, 'i') },
        { 'personalInfo.lastName': new RegExp(search, 'i') },
        { 'personalInfo.college': new RegExp(search, 'i') },
        { 'personalInfo.email': new RegExp(search, 'i') }
      ];
    }

    // Calculate skip
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const students = await StudentProfile.find(query)
      .populate('userId', 'email role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await StudentProfile.countDocuments(query);

    res.json({
      students,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single student profile
router.get('/students/:id', async (req, res) => {
  try {
    const student = await StudentProfile.findById(req.params.id)
      .populate('userId', 'email role');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update student profile (admin can verify/update)
router.put('/students/:id', async (req, res) => {
  try {
    const student = await StudentProfile.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update any field
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        student[key] = req.body[key];
      }
    });
    student.lastUpdated = new Date();

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics - skill distribution
router.get('/analytics/skills', async (req, res) => {
  try {
    const students = await StudentProfile.find({});
    const skillCount = {};

    students.forEach(student => {
      student.skills.forEach(skill => {
        const skillName = skill.name.toLowerCase();
        skillCount[skillName] = (skillCount[skillName] || 0) + 1;
      });
    });

    const skillDistribution = Object.entries(skillCount)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count);

    res.json(skillDistribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics - role readiness
router.get('/analytics/role-readiness', async (req, res) => {
  try {
    const { role } = req.query;
    if (!role) {
      return res.status(400).json({ message: 'Role parameter is required' });
    }

    const students = await StudentProfile.find({
      [`readinessScores.${role}`]: { $exists: true }
    });

    const readinessData = students.map(student => ({
      studentId: student._id,
      name: `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.trim(),
      email: student.userId?.email || '',
      college: student.personalInfo?.college || '',
      score: student.readinessScores.get(role)?.score || 0,
      matchedSkills: student.readinessScores.get(role)?.matchedSkills || [],
      missingSkills: student.readinessScores.get(role)?.missingSkills || []
    }));

    // Sort by score descending
    readinessData.sort((a, b) => b.score - a.score);

    // Calculate statistics
    const scores = readinessData.map(d => d.score);
    const stats = {
      total: readinessData.length,
      average: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      max: scores.length > 0 ? Math.max(...scores) : 0,
      min: scores.length > 0 ? Math.min(...scores) : 0,
      ready: readinessData.filter(d => d.score >= 70).length,
      needsImprovement: readinessData.filter(d => d.score < 70 && d.score >= 50).length,
      notReady: readinessData.filter(d => d.score < 50).length
    };

    res.json({
      role,
      statistics: stats,
      students: readinessData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics - batch performance
router.get('/analytics/batch-performance', async (req, res) => {
  try {
    const students = await StudentProfile.find({});
    
    // Group by college and year
    const batchData = {};
    
    students.forEach(student => {
      const college = student.personalInfo?.college || 'Unknown';
      const year = student.personalInfo?.year || 'Unknown';
      const key = `${college}-${year}`;
      
      if (!batchData[key]) {
        batchData[key] = {
          college,
          year,
          totalStudents: 0,
          averageReadiness: 0,
          students: []
        };
      }
      
      batchData[key].totalStudents++;
      
      // Calculate average readiness across all roles
      const readinessScores = Array.from(student.readinessScores.values());
      const avgScore = readinessScores.length > 0
        ? readinessScores.reduce((sum, r) => sum + (r.score || 0), 0) / readinessScores.length
        : 0;
      
      batchData[key].students.push({
        studentId: student._id,
        name: `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.trim(),
        averageReadiness: avgScore
      });
    });
    
    // Calculate average readiness for each batch
    Object.keys(batchData).forEach(key => {
      const batch = batchData[key];
      const totalScore = batch.students.reduce((sum, s) => sum + s.averageReadiness, 0);
      batch.averageReadiness = batch.totalStudents > 0 ? totalScore / batch.totalStudents : 0;
    });
    
    const batches = Object.values(batchData).sort((a, b) => b.averageReadiness - a.averageReadiness);
    
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics - top candidates
router.get('/analytics/top-candidates', async (req, res) => {
  try {
    const { role, limit = 10 } = req.query;
    
    if (!role) {
      return res.status(400).json({ message: 'Role parameter is required' });
    }
    
    const students = await StudentProfile.find({
      [`readinessScores.${role}`]: { $exists: true }
    })
      .populate('userId', 'email')
      .sort({ [`readinessScores.${role}.score`]: -1 })
      .limit(parseInt(limit));
    
    const topCandidates = students.map(student => ({
      studentId: student._id,
      name: `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.trim(),
      email: student.userId?.email || '',
      college: student.personalInfo?.college || '',
      score: student.readinessScores.get(role)?.score || 0,
      matchedSkills: student.readinessScores.get(role)?.matchedSkills || [],
      missingSkills: student.readinessScores.get(role)?.missingSkills || [],
      explanation: student.readinessScores.get(role)?.explanation || ''
    }));
    
    res.json(topCandidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics - dashboard summary
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const totalRoles = await Role.countDocuments();
    
    // Get skill distribution
    const students = await StudentProfile.find({});
    const skillCount = {};
    students.forEach(student => {
      student.skills.forEach(skill => {
        const skillName = skill.name.toLowerCase();
        skillCount[skillName] = (skillCount[skillName] || 0) + 1;
      });
    });
    
    // Get role distribution (desired roles)
    const roleCount = {};
    students.forEach(student => {
      student.careerAspirations?.desiredRoles?.forEach(role => {
        roleCount[role] = (roleCount[role] || 0) + 1;
      });
    });
    
    // Get college distribution
    const collegeCount = {};
    students.forEach(student => {
      const college = student.personalInfo?.college || 'Unknown';
      collegeCount[college] = (collegeCount[college] || 0) + 1;
    });
    
    // Calculate average readiness (if any role is specified)
    const roles = await Role.find({});
    const roleReadiness = {};
    
    for (const role of roles) {
      const roleName = role.name;
      const studentsWithScore = await StudentProfile.find({
        [`readinessScores.${roleName}`]: { $exists: true }
      });
      
      if (studentsWithScore.length > 0) {
        const scores = studentsWithScore.map(s => s.readinessScores.get(roleName)?.score || 0);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        roleReadiness[roleName] = {
          average: avgScore,
          count: studentsWithScore.length,
          ready: studentsWithScore.filter(s => (s.readinessScores.get(roleName)?.score || 0) >= 70).length
        };
      }
    }
    
    res.json({
      summary: {
        totalStudents,
        totalRoles,
        totalSkills: Object.keys(skillCount).length
      },
      skillDistribution: Object.entries(skillCount)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      roleDistribution: Object.entries(roleCount)
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count),
      collegeDistribution: Object.entries(collegeCount)
        .map(([college, count]) => ({ college, count }))
        .sort((a, b) => b.count - a.count),
      roleReadiness
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create/Update role
router.post('/roles', async (req, res) => {
  try {
    const role = new Role(req.body);
    await role.save();
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update role
router.put('/roles/:id', async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete role
router.delete('/roles/:id', async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

