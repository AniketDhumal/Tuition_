const Course = require('../models/Course');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

// In courseController.js
exports.getAllCourses = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Course.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    
    const courses = await features.query;
    const total = await Course.countDocuments(features.query.getFilter());
    const limit = parseInt(req.query.limit) || 10;
    const totalPages = Math.ceil(total / limit);
    const page = parseInt(req.query.page) || 1;

    res.status(200).json({
        status: 'success',
        results: courses.length,
        total,
        totalPages,
        page,
        data: {
            courses
        }
    });
});

exports.getCourse = catchAsync(async (req, res, next) => {
    const course = await Course.findById(req.params.id)
        .populate('instructor', 'name email')
        .populate({
            path: 'resources',
            select: 'title type downloadCount createdAt',
            options: { sort: { createdAt: -1 }, limit: 5 }
        })
        .populate({
            path: 'results',
            select: 'student score grade date',
            populate: {
                path: 'student',
                select: 'name email'
            },
            options: { sort: { date: -1 }, limit: 5 }
        });

    if (!course) {
        return next(new AppError('No course found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            course
        }
    });
});

exports.createCourse = catchAsync(async (req, res, next) => {
    // Set instructor to current user if not specified
    if (!req.body.instructor) req.body.instructor = req.user.id;
    
    const course = await Course.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            course
        }
    });
});

exports.updateCourse = catchAsync(async (req, res, next) => {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!course) {
        return next(new AppError('No course found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            course
        }
    });
});

exports.deleteCourse = catchAsync(async (req, res, next) => {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
        return next(new AppError('No course found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getCourseStats = catchAsync(async (req, res, next) => {
    const stats = await Course.aggregate([
        {
            $lookup: {
                from: 'resources',
                localField: '_id',
                foreignField: 'course',
                as: 'resources'
            }
        },
        {
            $lookup: {
                from: 'results',
                localField: '_id',
                foreignField: 'course',
                as: 'results'
            }
        },
        {
            $project: {
                name: 1,
                code: 1,
                resourceCount: { $size: '$resources' },
                downloadCount: { $sum: '$resources.downloadCount' },
                avgScore: { $avg: '$results.score' },
                studentCount: { $size: '$results.student' }
            }
        },
        { $sort: { resourceCount: -1 } }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
});

