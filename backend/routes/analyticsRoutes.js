const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// Analytics endpoints
router.get('/downloads', protect, authorize('admin', 'teacher'), analyticsController.getDownloadsData);
router.get('/resource-types', protect, authorize('admin', 'teacher'), analyticsController.getResourceTypesData);
router.get('/course-popularity', protect, authorize('admin', 'teacher'), analyticsController.getCoursePopularityData);
router.get('/grade-distribution', protect, authorize('admin', 'teacher'), analyticsController.getGradeDistributionData);
router.get('/performance', protect, authorize('admin', 'teacher'), analyticsController.getPerformanceData);

module.exports = router;