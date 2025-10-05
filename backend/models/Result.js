const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Must match User model name
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course', // Must match Course model name
    required: true
  },
  semester: {
    type: Number,
    required: [true, 'Please specify the semester'],
    min: [1, 'Semester must be at least 1'],
    max: [8, 'Semester cannot be greater than 8']
  },
  score: {
    type: Number,
    required: [true, 'Please provide a score'],
    min: [0, 'Score cannot be less than 0'],
    max: [100, 'Score cannot exceed 100']
  },
  grade: {
    type: String,
    required: [true, 'Grade must be calculated'],
    enum: {
      values: ['A', 'B', 'C', 'D', 'F'],
      message: 'Grade must be A, B, C, D, or F'
    }
  },
  date: {
    type: Date,
    default: Date.now
  },
  recordedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate grade before saving
resultSchema.pre('save', function(next) {
  if (this.isModified('score')) {
    this.grade = calculateGrade(this.score);
  }
  next();
});

// Calculate grade helper function
function calculateGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// Populate student and course data when querying

resultSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'student',  
    select: 'name email'
  }).populate({
    path: 'course',  
    select: 'code name'
  });
  next();
});

module.exports = mongoose.model('Result', resultSchema);