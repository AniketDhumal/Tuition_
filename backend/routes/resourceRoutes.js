const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const authController = require('../middleware/auth');
const upload = require('../utils/multer'); // Adjust path as needed

// Protect all routes
router.use(authController.protect);

// File upload route with proper error handling
router.post('/upload', 
  upload.single('resourceFile'),
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  },
  resourceController.createResource
);

// Restrict some routes to admin/instructor
router.use(authController.restrictTo('admin', 'teacher'));

router.post('/', upload.single('resourceFile'), resourceController.createResource);
router.put(
    '/:id',
    upload.single('resourceFile'), // Handle file upload if present
    resourceController.updateResource
  );
router.delete('/:id', resourceController.deleteResource);

// Open routes (but still protected)
router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResource);
router.get('/:id/view', resourceController.viewResource);
router.get(
    '/:id/download',
    authController.protect, // Require authentication
    resourceController.downloadResource
  );

module.exports = router;