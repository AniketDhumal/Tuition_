const path = require('path');
const fs = require('fs');
const slugify = require('slugify');
const mongoose = require('mongoose');

const Resource = require('../models/Resource');
const Course = require('../models/Course');
let Enrollment;
try { Enrollment = require('../models/Enrollment'); } catch (e) {}
const User = require('../models/User');

const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return 'N/A';
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

async function checkResourceAccess(user, resource) {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'teacher') return true;
  const courseId = resource.course && typeof resource.course === 'object' ? resource.course._id : resource.course;
  if (!courseId) return false;
  if (resource.course && Array.isArray(resource.course.instructors)) {
    if (resource.course.instructors.some((i) => String(i) === String(user._id))) return true;
  }
  if (Enrollment) {
    const enrolled = await Enrollment.exists({
      user: user._id,
      course: courseId,
      status: { $in: ['active', 'completed'] }
    });
    if (enrolled) return true;
  }
  return false;
}

exports.getAllResources = catchAsync(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;
  const search = req.query.search ? String(req.query.search).trim() : null;
  const filter = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  if (req.query.courseId) {
    if (mongoose.Types.ObjectId.isValid(req.query.courseId)) {
      filter.course = req.query.courseId;
    }
  }
  const [total, docs] = await Promise.all([
    Resource.countDocuments(filter),
    Resource.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('course', 'name code')
      .lean()
  ]);
  const totalPages = Math.ceil(total / limit) || 1;
  res.status(200).json({
    status: 'success',
    pagination: { page, limit, total, totalPages },
    data: { resources: docs }
  });
});

exports.getResource = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError('Invalid resource id', 400));
  const resource = await Resource.findById(id)
    .populate('course', 'name code description instructors')
    .populate('createdBy', 'name email role')
    .lean();
  if (!resource) return next(new AppError('Resource not found', 404));
  res.status(200).json({ status: 'success', data: resource });
});

exports.viewResource = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError('Invalid resource id', 400));
  const resource = await Resource.findById(id)
    .populate({ path: 'course', select: 'name code instructors description' })
    .populate({ path: 'createdBy', select: 'name email role' })
    .lean();
  if (!resource) return next(new AppError('Resource not found', 404));
  const canEdit = req.user && (req.user.role === 'admin' || req.user.role === 'teacher' || (resource.createdBy && String(resource.createdBy._id) === String(req.user._id)));
  const canDelete = req.user && (req.user.role === 'admin' || req.user.role === 'teacher');
  let relatedResources = [];
  if (resource.course && resource.course._id) {
    relatedResources = await Resource.find({ course: resource.course._id, _id: { $ne: resource._id } })
      .sort('-createdAt')
      .limit(6)
      .select('title type downloadCount createdAt')
      .lean();
  }
  res.status(200).json({
    status: 'success',
    data: {
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
      course: resource.course || null,
      uploadedBy: resource.createdBy || null,
      relatedResources,
      permissions: { canEdit, canDelete }
    }
  });
});

exports.downloadResource = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid resource id', 400));
  }

  // load resource (no access checks so downloads are public)
  const resource = await Resource.findById(id).lean();
  if (!resource) return next(new AppError('Resource not found', 404));

  
  // if it's an external link, redirect to it
  if (resource.type === 'link' || /^https?:\/\//i.test(String(resource.fileUrl))) {
    if (!resource.fileUrl) return next(new AppError('No external URL for this resource', 404));
    return res.redirect(resource.fileUrl);
  }

  // otherwise treat fileUrl as a local file path
  let filePath = resource.fileUrl;
  if (!filePath) return next(new AppError('No file associated with this resource', 404));

  if (!path.isAbsolute(filePath)) {
    filePath = path.resolve(process.cwd(), filePath);
  }

  if (!fs.existsSync(filePath)) {
    console.error('Download failed — file not found:', filePath);
    return next(new AppError('File not found on server', 404));
  }

  const ext = path.extname(filePath) || '';
  const safeName = slugify(resource.title || 'resource', { lower: true, strict: true });
  const downloadName = `${safeName}${ext}`;

  return res.download(filePath, downloadName, (err) => {
    if (err) {
      console.error('res.download error:', err);
      if (!res.headersSent) return next(new AppError('Failed to download file', 500));
    }
  });
});


exports.createResource = catchAsync(async (req, res, next) => {
  const { title, description, courseId, type, fileUrl } = req.body;
  if (!title || !description || !courseId || !type) {
    return next(new AppError('Missing required fields: title, description, courseId, type', 400));
  }
  if (!mongoose.Types.ObjectId.isValid(courseId)) return next(new AppError('Invalid course id', 400));
  const course = await Course.findById(courseId);
  if (!course) return next(new AppError('Course not found', 404));
  const doc = {
    title,
    description,
    course: courseId,
    type,
    createdBy: req.user ? req.user._id : undefined
  };
  if (req.file && req.file.path) {
    doc.fileUrl = req.file.path || (req.file.destination ? path.join(req.file.destination, req.file.filename) : undefined);
    if (req.file.size) doc.fileSize = req.file.size;
  } else if (type === 'link' && fileUrl) {
    doc.fileUrl = fileUrl;
  } else if (type !== 'link') {
    return next(new AppError('Please upload a file for this resource type', 400));
  }
  const created = await Resource.create(doc);
  res.status(201).json({ status: 'success', data: created });
});

exports.updateResource = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError('Invalid resource id', 400));
  const resource = await Resource.findById(id);
  if (!resource) return next(new AppError('Resource not found', 404));
  if (!(req.user && (req.user.role === 'admin' || req.user.role === 'teacher' || String(resource.createdBy) === String(req.user._id)))) {
    return next(new AppError('Not authorized to update this resource', 403));
  }
  const { title, description, courseId, type, fileUrl } = req.body;
  if (title) resource.title = title;
  if (description) resource.description = description;
  if (courseId && mongoose.Types.ObjectId.isValid(courseId)) resource.course = courseId;
  if (type) resource.type = type;
  if (req.file && req.file.path) {
    if (resource.fileUrl && !/^https?:\/\//i.test(String(resource.fileUrl))) {
      try {
        const oldPath = path.isAbsolute(resource.fileUrl) ? resource.fileUrl : path.resolve(process.cwd(), resource.fileUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch (e) {
        console.warn('Failed to remove old resource file:', e.message || e);
      }
    }
    resource.fileUrl = req.file.path || (req.file.destination ? path.join(req.file.destination, req.file.filename) : resource.fileUrl);
    if (req.file.size) resource.fileSize = req.file.size;
  } else if (type === 'link' && fileUrl) {
    resource.fileUrl = fileUrl;
    resource.fileSize = undefined;
  }
  await resource.save();
  res.status(200).json({ status: 'success', data: resource });
});

exports.deleteResource = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError('Invalid resource id', 400));
  const resource = await Resource.findById(id);
  if (!resource) return next(new AppError('Resource not found', 404));
  if (!(req.user && (req.user.role === 'admin' || req.user.role === 'teacher' || String(resource.createdBy) === String(req.user._id)))) {
    return next(new AppError('Not authorized to delete this resource', 403));
  }
  if (resource.fileUrl && !/^https?:\/\//i.test(String(resource.fileUrl))) {
    try {
      const filePath = path.isAbsolute(resource.fileUrl) ? resource.fileUrl : path.resolve(process.cwd(), resource.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
      console.warn('Failed to remove resource file during delete:', err.message || err);
    }
  }
  await Resource.findByIdAndDelete(id);
  res.status(200).json({ status: 'success', data: null });
});

exports.trackDownload = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError('Invalid resource id', 400));
  await Resource.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } }).catch(() => {});
  return res.status(200).json({ status: 'success', message: 'download tracked' });
});

module.exports = {
  getAllResources: exports.getAllResources,
  getResource: exports.getResource,
  viewResource: exports.viewResource,
  downloadResource: exports.downloadResource,
  createResource: exports.createResource,
  updateResource: exports.updateResource,
  deleteResource: exports.deleteResource,
  trackDownload: exports.trackDownload
};
