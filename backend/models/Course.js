const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    credits: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    duration: {
        type: Number,
        required: true,
        min: 1,
        max: 52
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate
courseSchema.virtual('resources', {
    ref: 'Resource',
    foreignField: 'course',
    localField: '_id'
});

courseSchema.virtual('results', {
    ref: 'Result',
    foreignField: 'course',
    localField: '_id'
});

// Indexes
courseSchema.index({ code: 1 }, { unique: true });
courseSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Course', courseSchema);