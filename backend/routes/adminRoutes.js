const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminFunctions');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), adminController.getAdminStats);

router.get('/activities', protect, authorize('admin'), adminController.getRecentActivities);
router.post('/activities', protect, authorize('admin'), adminController.createActivity);
router.get('/activities/:id', protect, authorize('admin'), adminController.getActivity);
router.patch('/activities/:id', protect, authorize('admin'), adminController.updateActivity);
router.delete('/activities/:id', protect, authorize('admin'), adminController.deleteActivity);

router.get('/users', protect, authorize('admin'), adminController.getAllUsers);
router.patch('/users/:id', protect, authorize('admin'), adminController.updateUser);
router.delete('/users/:id', protect, authorize('admin'), adminController.deleteUser);

router.get('/courses', protect, authorize('admin'), adminController.getAllCourses);
router.patch('/courses/:id/approve', protect, authorize('admin'), adminController.toggleCourseApproval);

router.get('/logs', protect, authorize('admin'), adminController.getSystemLogs);

module.exports = router;