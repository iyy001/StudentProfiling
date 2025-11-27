const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  industry: String,
  requiredSkills: [{
    skill: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    weight: {
      type: Number,
      default: 1.0
    }
  }],
  preferredSkills: [{
    skill: String,
    level: String,
    weight: Number
  }],
  averageSalary: {
    min: Number,
    max: Number
  },
  growthProspect: {
    type: String,
    enum: ['high', 'medium', 'low']
  },
  courses: [{
    name: String,
    platform: String,
    url: String
  }],
  resources: [{
    title: String,
    type: String,
    url: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);

