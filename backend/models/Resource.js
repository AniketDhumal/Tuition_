const mongoose = require('mongoose');
const path = require('path');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    type: {
        type: String,
        enum: ['pdf', 'video', 'link', 'document', 'presentation'],
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number
    },
    fileType: {
        type: String
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

resourceSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);