const express = require('express');
const {
  getAllCourses,  // Changed from getCourses to match controller export
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats  // Added if you want to include stats route
} = require('../controllers/courseController');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

// Routes for /api/v1/courses
router
  .route('/')
  .get(getAllCourses)  // Changed to match controller export
  .post(protect, authorize('admin', 'teacher'), createCourse);

// Routes for /api/v1/courses/:id
router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('admin', 'teacher'), updateCourse)
  .delete(protect, authorize('admin', 'teacher'), deleteCourse);

// Route for course statistics (if needed)
router
  .route('/stats')
  .get(protect, authorize('admin', 'teacher'), getCourseStats);

module.exports = router;