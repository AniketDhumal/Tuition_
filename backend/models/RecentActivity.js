// models/RecentActivity.js
const mongoose = require('mongoose');

const recentActivitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['resource', 'course', 'user', 'result', 'system']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

recentActivitySchema.index({ createdAt: -1 });

const RecentActivity = mongoose.model('RecentActivity', recentActivitySchema);

module.exports = RecentActivity;