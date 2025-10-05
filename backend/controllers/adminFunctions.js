const User = require('../models/User');
const Resource = require('../models/Resource');
const Course = require('../models/Course');
const Result = require('../models/Result');
const RecentActivity = require('../models/RecentActivity');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.getAdminStats = catchAsync(async (req, res, next) => {
    const [totalUsers, totalResources, totalCourses, totalResults, totalDownloads] = await Promise.all([
        User.countDocuments(),
        Resource.countDocuments(),
        Course.countDocuments(),
        Result.countDocuments(),
        Resource.aggregate([
            { $group: { _id: null, total: { $sum: '$downloadCount' } } }
        ])
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats: {
                totalUsers,
                totalResources,
                totalCourses,
                totalResults,
                totalDownloads: totalDownloads[0]?.total || 0
            }
        }
    });
});

exports.createActivity = catchAsync(async (req, res, next) => {
  const { type, title, description, referenceId } = req.body;
  
  const activity = await RecentActivity.create({
    type,
    title,
    description,
    referenceId,
    performedBy: req.user.id
  });

  res.status(201).json({
    status: 'success',
    data: { activity }
  });
});

exports.updateActivity = catchAsync(async (req, res, next) => {
  const { title, description } = req.body;
  
  const activity = await RecentActivity.findByIdAndUpdate(
    req.params.id,
    { title, description },
    { new: true, runValidators: true }
  );

  if (!activity) {
    return next(new AppError('No activity found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { activity }
  });
});

exports.deleteActivity = catchAsync(async (req, res, next) => {
  const activity = await RecentActivity.findByIdAndDelete(req.params.id);

  if (!activity) {
    return next(new AppError('No activity found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getActivity = catchAsync(async (req, res, next) => {
  const activity = await RecentActivity.findById(req.params.id).populate('performedBy', 'name email');

  if (!activity) {
    return next(new AppError('No activity found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { activity }
  });
});

exports.getRecentActivities = catchAsync(async (req, res, next) => {
  const activities = await RecentActivity.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('performedBy', 'name email');

  res.status(200).json({
    status: 'success',
    results: activities.length,
    data: { activities }
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(User.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const users = await features.query;

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users }
    });
});

exports.updateUser = catchAsync(async (req, res, next) => {
    const { role, active } = req.body;
    const updateData = {};
    
    if (role) updateData.role = role;
    if (typeof active === 'boolean') updateData.active = active;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    );

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { user }
    });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getAllCourses = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Course.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const courses = await features.query.populate('instructor', 'name email');

    res.status(200).json({
        status: 'success',
        results: courses.length,
        data: { courses }
    });
});

exports.toggleCourseApproval = catchAsync(async (req, res, next) => {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
        return next(new AppError('No course found with that ID', 404));
    }

    course.approved = !course.approved;
    await course.save();

    res.status(200).json({
        status: 'success',
        data: { 
            course,
            message: `Course ${course.approved ? 'approved' : 'unapproved'} successfully`
        }
    });
});

exports.getSystemLogs = catchAsync(async (req, res, next) => {
    const logs = [
        {
            timestamp: new Date(),
            level: 'info',
            message: 'System check performed',
            user: req.user.id
        }
    ];

    res.status(200).json({
        status: 'success',
        results: logs.length,
        data: { logs }
    });
});