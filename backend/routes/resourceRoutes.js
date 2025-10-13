// resourceRoutes.js
const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const authController = require('../middleware/auth');
const upload = require('../utils/multer');

// ----------------------
// PUBLIC ROUTES
// ----------------------

// Everyone can list, view, and download resources (no login required)
router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResource);
router.get('/:id/view', resourceController.viewResource);
router.get('/:id/download', resourceController.downloadResource);

// Optional: public download tracker
router.post('/:id/track-download', resourceController.trackDownload);

// ----------------------
// PROTECTED ROUTES (require login)
// ----------------------
router.use(authController.protect);

// Only teachers/admins can modify resources
router.post(
  '/',
  authController.restrictTo('admin', 'teacher'),
  upload.single('resourceFile'),
  resourceController.createResource
);

router.put(
  '/:id',
  authController.restrictTo('admin', 'teacher'),
  upload.single('resourceFile'),
  resourceController.updateResource
);

router.delete(
  '/:id',
  authController.restrictTo('admin', 'teacher'),
  resourceController.deleteResource
);

router.post(
  '/upload',
  authController.restrictTo('admin', 'teacher'),
  upload.single('resourceFile'),
  resourceController.createResource
);

module.exports = router;
