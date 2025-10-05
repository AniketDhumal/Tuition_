const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const authController = require('../middleware/auth');
const upload = require('../utils/multer');

// Protect all routes
router.use(authController.protect);

// Restrict some routes to admin/instructor
router.post('/', authController.restrictTo('admin', 'teacher'), resultController.createResult);
router.post('/import', authController.restrictTo('admin', 'teacher'), upload.single('resultsFile'), resultController.importResults);
router.put(
  '/:id',
  authController.protect,
  authController.restrictTo('admin', 'teacher'),
  resultController.updateResult
);
router.delete('/:id', authController.restrictTo('admin', 'teacher'), resultController.deleteResult);

// Open routes (but still protected)
router.get('/', resultController.getAllResults);
router.get('/statistics', resultController.getResultStatistics);
router.get('/:id', resultController.getResult);
router.get('/student/:studentId', resultController.getStudentResults);

module.exports = router;