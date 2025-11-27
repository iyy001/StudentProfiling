const express = require('express');
const StudentProfile = require('../models/StudentProfile');
const Role = require('../models/Role');
const { auth } = require('../middleware/auth');
const axios = require('axios');
const router = express.Router();

// Calculate readiness score (rule-based)
function calculateReadinessScore(studentProfile, role) {
  const studentSkills = studentProfile.skills || [];
  const studentProjects = studentProfile.projects || [];
  const studentInternships = studentProfile.internships || [];
  
  // Normalize skill names to lowercase for matching
  const studentSkillNames = studentSkills.map(s => s.name.toLowerCase());
  const studentProjectTechs = studentProjects.flatMap(p => 
    (p.technologies || []).map(t => t.toLowerCase())
  );
  const studentInternshipSkills = studentInternships.flatMap(i => 
    (i.skillsGained || []).map(s => s.toLowerCase())
  );
  
  // Combine all skill sources
  const allStudentSkills = new Set([
    ...studentSkillNames,
    ...studentProjectTechs,
    ...studentInternshipSkills
  ]);
  
  const requiredSkills = role.requiredSkills || [];
  const preferredSkills = role.preferredSkills || [];
  
  // Calculate matched skills
  const matchedRequired = requiredSkills.filter(rs => {
    const skillName = rs.skill.toLowerCase();
    return allStudentSkills.has(skillName);
  });
  
  const matchedPreferred = preferredSkills.filter(ps => {
    const skillName = ps.skill.toLowerCase();
    return allStudentSkills.has(skillName);
  });
  
  // Calculate missing skills
  const missingRequired = requiredSkills.filter(rs => {
    const skillName = rs.skill.toLowerCase();
    return !allStudentSkills.has(skillName);
  }).map(rs => rs.skill);
  
  // Calculate score: (matched required * weight) + (matched preferred * weight * 0.5)
  let score = 0;
  let totalWeight = 0;
  
  requiredSkills.forEach(rs => {
    const weight = rs.weight || 1.0;
    totalWeight += weight;
    if (matchedRequired.some(m => m.skill.toLowerCase() === rs.skill.toLowerCase())) {
      score += weight;
    }
  });
  
  preferredSkills.forEach(ps => {
    const weight = (ps.weight || 1.0) * 0.5;
    totalWeight += weight;
    if (matchedPreferred.some(m => m.skill.toLowerCase() === ps.skill.toLowerCase())) {
      score += weight;
    }
  });
  
  // Calculate percentage
  const readinessScore = totalWeight > 0 ? (score / totalWeight) * 100 : 0;
  
  // Generate explanation
  const explanation = `You have ${matchedRequired.length} out of ${requiredSkills.length} required skills. ` +
    `${matchedPreferred.length} preferred skills matched. ` +
    (missingRequired.length > 0 
      ? `Missing: ${missingRequired.slice(0, 5).join(', ')}${missingRequired.length > 5 ? '...' : ''}.`
      : 'Great match!');
  
  return {
    score: Math.round(readinessScore * 100) / 100,
    matchedSkills: matchedRequired.map(m => m.skill),
    missingSkills: missingRequired,
    explanation
  };
}

// Get recommendations for current student
router.get('/', auth, async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    // Get all roles
    const roles = await Role.find({});
    
    // Calculate readiness for each role
    const recommendations = roles.map(role => {
      const readiness = calculateReadinessScore(studentProfile, role);
      
      return {
        role: {
          id: role._id,
          name: role.name,
          description: role.description,
          industry: role.industry,
          averageSalary: role.averageSalary,
          growthProspect: role.growthProspect
        },
        readinessScore: readiness.score,
        matchedSkills: readiness.matchedSkills,
        missingSkills: readiness.missingSkills,
        explanation: readiness.explanation
      };
    });
    
    // Sort by readiness score
    recommendations.sort((a, b) => b.readinessScore - a.readinessScore);
    
    // Update student profile with readiness scores
    const readinessScoresMap = new Map();
    recommendations.forEach(rec => {
      readinessScoresMap.set(rec.role.name, {
        score: rec.readinessScore,
        matchedSkills: rec.matchedSkills,
        missingSkills: rec.missingSkills,
        explanation: rec.explanation
      });
    });
    
    studentProfile.readinessScores = readinessScoresMap;
    await studentProfile.save();
    
    res.json({
      recommendations: recommendations.slice(0, 10), // Top 10
      allRoles: recommendations.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recommendation for specific role
router.get('/role/:roleId', auth, async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    const role = await Role.findById(req.params.roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    const readiness = calculateReadinessScore(studentProfile, role);
    
    // Get SHAP-like feature contributions (simplified version)
    const featureContributions = generateFeatureContributions(studentProfile, role, readiness);
    
    res.json({
      role: {
        id: role._id,
        name: role.name,
        description: role.description,
        industry: role.industry,
        requiredSkills: role.requiredSkills,
        preferredSkills: role.preferredSkills,
        courses: role.courses,
        resources: role.resources,
        averageSalary: role.averageSalary,
        growthProspect: role.growthProspect
      },
      readinessScore: readiness.score,
      matchedSkills: readiness.matchedSkills,
      missingSkills: readiness.missingSkills,
      explanation: readiness.explanation,
      featureContributions: featureContributions,
      skillGuidance: {
        required: role.requiredSkills.map(rs => ({
          skill: rs.skill,
          level: rs.level,
          weight: rs.weight,
          hasSkill: readiness.matchedSkills.includes(rs.skill),
          suggestedCourses: role.courses.filter(c => 
            c.name.toLowerCase().includes(rs.skill.toLowerCase()) ||
            rs.skill.toLowerCase().includes(c.name.toLowerCase())
          )
        })),
        preferred: role.preferredSkills.map(ps => ({
          skill: ps.skill,
          level: ps.level,
          weight: ps.weight,
          hasSkill: readiness.matchedSkills.includes(ps.skill)
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate feature contributions (simplified SHAP-like explanation)
function generateFeatureContributions(studentProfile, role, readiness) {
  const contributions = [];
  const studentSkills = studentProfile.skills || [];
  const studentProjects = studentProfile.projects || [];
  const studentInternships = studentProfile.internships || [];
  
  // Skill contributions
  studentSkills.forEach(skill => {
    const skillName = skill.name.toLowerCase();
    const requiredSkill = role.requiredSkills.find(rs => rs.skill.toLowerCase() === skillName);
    const preferredSkill = role.preferredSkills.find(ps => ps.skill.toLowerCase() === skillName);
    
    if (requiredSkill) {
      const weight = requiredSkill.weight || 1.0;
      const contribution = (weight / role.requiredSkills.reduce((sum, rs) => sum + (rs.weight || 1.0), 0)) * 100;
      contributions.push({
        feature: `${skill.name} (Skill)`,
        contribution: Math.round(contribution * 100) / 100,
        type: 'positive'
      });
    } else if (preferredSkill) {
      const weight = (preferredSkill.weight || 1.0) * 0.5;
      const contribution = (weight / (role.requiredSkills.reduce((sum, rs) => sum + (rs.weight || 1.0), 0) + 
        role.preferredSkills.reduce((sum, ps) => sum + (ps.weight || 1.0) * 0.5, 0))) * 100;
      contributions.push({
        feature: `${skill.name} (Skill)`,
        contribution: Math.round(contribution * 100) / 100,
        type: 'positive'
      });
    }
  });
  
  // Project contributions
  studentProjects.forEach(project => {
    const projectTechs = (project.technologies || []).map(t => t.toLowerCase());
    projectTechs.forEach(tech => {
      const requiredSkill = role.requiredSkills.find(rs => rs.skill.toLowerCase() === tech);
      if (requiredSkill) {
        const weight = (requiredSkill.weight || 1.0) * 0.8; // Projects slightly less weight than direct skills
        const contribution = (weight / role.requiredSkills.reduce((sum, rs) => sum + (rs.weight || 1.0), 0)) * 100;
        contributions.push({
          feature: `${tech} (Project: ${project.title})`,
          contribution: Math.round(contribution * 100) / 100,
          type: 'positive'
        });
      }
    });
  });
  
  // Missing skills (negative contributions)
  readiness.missingSkills.forEach(skill => {
    const requiredSkill = role.requiredSkills.find(rs => rs.skill.toLowerCase() === skill.toLowerCase());
    if (requiredSkill) {
      const weight = requiredSkill.weight || 1.0;
      const contribution = -(weight / role.requiredSkills.reduce((sum, rs) => sum + (rs.weight || 1.0), 0)) * 100;
      contributions.push({
        feature: `Missing: ${skill}`,
        contribution: Math.round(contribution * 100) / 100,
        type: 'negative'
      });
    }
  });
  
  // Sort by absolute contribution
  contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  
  return contributions.slice(0, 10); // Top 10 contributions
}

// Call ML service for advanced predictions (optional)
router.post('/ml-predict', auth, async (req, res) => {
  try {
    const { roleId } = req.body;
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Check if ML service is available
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    
    try {
      // Prepare data for ML service
      const mlData = {
        studentProfile: {
          skills: studentProfile.skills,
          projects: studentProfile.projects,
          internships: studentProfile.internships,
          academics: studentProfile.academics,
          certifications: studentProfile.certifications
        },
        role: {
          requiredSkills: role.requiredSkills,
          preferredSkills: role.preferredSkills
        }
      };
      
      // Call ML service
      const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, mlData, {
        timeout: 5000
      });
      
      res.json({
        readinessScore: mlResponse.data.readinessScore,
        prediction: mlResponse.data.prediction,
        shapValues: mlResponse.data.shapValues,
        explanation: mlResponse.data.explanation
      });
    } catch (mlError) {
      // Fallback to rule-based if ML service is not available
      const readiness = calculateReadinessScore(studentProfile, role);
      res.json({
        readinessScore: readiness.score,
        prediction: readiness.score >= 70 ? 'ready' : readiness.score >= 50 ? 'partial' : 'not_ready',
        explanation: readiness.explanation,
        note: 'Using rule-based scoring (ML service unavailable)'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

