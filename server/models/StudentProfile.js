const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: String,
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  certification: {
    hasCertification: Boolean,
    certificateName: String,
    issueDate: Date,
    expiryDate: Date
  }
});

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  technologies: [String],
  githubUrl: String,
  liveUrl: String,
  startDate: Date,
  endDate: Date
});

const internshipSchema = new mongoose.Schema({
  company: String,
  role: String,
  description: String,
  startDate: Date,
  endDate: Date,
  skillsGained: [String]
});

const academicSchema = new mongoose.Schema({
  semester: Number,
  cgpa: Number,
  courses: [{
    name: String,
    grade: String,
    credits: Number
  }]
});

const studentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: String,
    lastName: String,
    college: String,
    degree: String,
    branch: String,
    year: Number,
    phone: String
  },
  academics: [academicSchema],
  skills: [skillSchema],
  projects: [projectSchema],
  internships: [internshipSchema],
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String
  }],
  extracurricular: [{
    activity: String,
    role: String,
    description: String,
    startDate: Date,
    endDate: Date
  }],
  careerAspirations: {
    desiredRoles: [String],
    industries: [String],
    preferredLocations: [String],
    salaryExpectation: Number
  },
  readinessScores: {
    type: Map,
    of: {
      score: Number,
      matchedSkills: [String],
      missingSkills: [String],
      explanation: String
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);

