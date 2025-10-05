const Resource = require('../models/Resource');
const Course = require('../models/Course');
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { uploadFile, deleteFile } = require('../services/fileService');

// File upload middleware
exports.uploadResourceFile = uploadFile.single('resourceFile');

// Get all resources with pagination and search
exports.getResource = catchAsync(async (req, res, next) => {
    // Validate ID format first
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new AppError('Invalid resource ID format', 400));
    }

    const resource = await Resource.findById(req.params.id)
        .populate({
            path: 'course',
            select: 'name code',
            options: { lean: true }  // Add lean() to prevent document issues
        })
        .populate({
            path: 'createdBy',
            select: 'name',
            options: { lean: true }
        })
        .lean();  // Convert to plain JavaScript object

    if (!resource) {
        return next(new AppError('Resource not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { resource }
    });
});

exports.getAllResources = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 10, search } = req.query;
    
    // Build query
    const query = {};
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }
    
    // Execute query with pagination
    const resources = await Resource.find(query)
        .populate('course', 'name code')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
    
    const total = await Resource.countDocuments(query);
    
    res.status(200).json({
        status: 'success',
        results: resources.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        data: { resources }
    });
});

exports.createResource = catchAsync(async (req, res, next) => {
    if (!req.file && !req.body.fileUrl) {
        return next(new AppError('Please upload a file or provide a file URL', 400));
    }

    const resourceData = {
        title: req.body.title,
        description: req.body.description,
        course: req.body.courseId,
        type: req.body.type,
        createdBy: req.user.id
    };

    if (req.file) {
        resourceData.fileUrl = req.file.path;
        resourceData.fileSize = req.file.size;
        resourceData.fileType = req.file.mimetype;
    } else {
        resourceData.fileUrl = req.body.fileUrl;
    }

    const resource = await Resource.create(resourceData);
    await Course.findByIdAndUpdate(req.body.courseId, { $inc: { resourceCount: 1 } });

    res.status(201).json({
        status: 'success',
        data: { resource }
    });
});

exports.updateResource = catchAsync(async (req, res, next) => {
    // 1. Find the resource and verify ownership
    const resource = await Resource.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user.id },
        { 'course.instructors': req.user.id }
      ]
    });
  
    if (!resource) {
      return next(new AppError('Resource not found or unauthorized', 404));
    }
  
    // 2. Prepare update data
    const updateData = {
      title: req.body.title || resource.title,
      description: req.body.description || resource.description,
      course: req.body.courseId || resource.course,
      type: req.body.type || resource.type
    };
  
    // 3. Handle file updates
    if (req.file) {
      if (resource.fileUrl) await deleteFile(resource.fileUrl).catch(console.error);
      updateData.fileUrl = req.file.path;
      updateData.fileSize = req.file.size;
      updateData.fileType = req.file.mimetype;
    }
  
    // 4. Perform the update
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('course', 'name code');
  
    res.status(200).json({
      status: 'success',
      data: { resource: updatedResource }
    });
  });

  exports.downloadResource = catchAsync(async (req, res, next) => {
    // 1. Find the resource
    const resource = await Resource.findById(req.params.id)
      .populate('course', 'instructors');
    
    if (!resource) {
      return next(new AppError('Resource not found', 404));
    }
  
    // 2. Verify access (enrolled or instructor)
    const hasAccess = await checkResourceAccess(req.user.id, resource);
    if (!hasAccess) {
      return next(new AppError('Not authorized to access this resource', 401));
    }
  
    // 3. Track download and serve file
    await Resource.findByIdAndUpdate(req.params.id, {
      $inc: { downloadCount: 1 }
    });
  
    if (resource.type === 'link') {
      return res.redirect(resource.fileUrl);
    }
  
    // For file downloads
    const filePath = path.join(__dirname, `../${resource.fileUrl}`);
    
    res.download(filePath, `${slugify(resource.title)}${path.extname(filePath)}`, (err) => {
      if (err) {
        console.error('Download failed:', err);
        return next(new AppError('File could not be downloaded', 500));
      }
    });
  });
  
  // Helper function to check access
  async function checkResourceAccess(userId, resource) {
    // Admins can access everything
    if (req.user.role === 'admin') return true;
  
    // Check if user is instructor for the course
    if (resource.course.instructors.includes(userId)) return true;
  
    // Check if user is enrolled
    return await Enrollment.exists({
      user: userId,
      course: resource.course._id,
      status: { $in: ['completed', 'active'] }
    });
  }

exports.deleteResource = catchAsync(async (req, res, next) => {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return next(new AppError('No resource found with that ID', 404));

    if (resource.fileUrl && resource.fileUrl.startsWith('uploads/')) {
        await deleteFile(resource.fileUrl);
    }

    await Course.findByIdAndUpdate(resource.course, { $inc: { resourceCount: -1 } });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.viewResource = catchAsync(async (req, res, next) => {
    // Validate ID format first
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new AppError('Invalid resource ID format', 400));
    }

    const resource = await Resource.findById(req.params.id)
        .populate({
            path: 'course',
            select: 'name code description instructor',
            options: { lean: true }
        })
        .populate({
            path: 'createdBy',
            select: 'name email role',
            options: { lean: true }
        })
        .lean();

    if (!resource) {
        return next(new AppError('Resource not found', 404));
    }

    // Get related resources
    const relatedResources = await Resource.find({
        course: resource.course._id,
        _id: { $ne: resource._id }
    })
    .sort('-createdAt')
    .limit(5)
    .select('title type downloadCount createdAt')
    .lean();

    const response = {
        resource: {
            id: resource._id,
            title: resource.title,
            description: resource.description,
            type: resource.type,
            fileUrl: resource.fileUrl,
            fileSize: formatFileSize(resource.fileSize),
            createdAt: resource.createdAt,
            downloadCount: resource.downloadCount
        },
        course: resource.course,
        uploadedBy: resource.createdBy,
        relatedResources,
        permissions: {
            canEdit: req.user.role === 'admin' || req.user.role === 'teacher' || req.user._id.equals(resource.createdBy._id),
            canDelete: req.user.role === 'admin' || req.user.role === 'teacher'
        }
    };

    res.status(200).json({
        status: 'success',
        data: response
    });
});

// Helper functions
const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
};

const getRelatedResources = async (courseId, excludeResourceId) => {
    return await Resource.find({ 
        course: courseId,
        _id: { $ne: excludeResourceId }
    })
    .sort('-createdAt')
    .limit(5)
    .select('title type downloadCount createdAt');
};