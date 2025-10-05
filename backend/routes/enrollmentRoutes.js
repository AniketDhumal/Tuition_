const express = require('express');
const {
  createEnrollment,
  getEnrollments
} = require('../controllers/enrollmentController');

const router = express.Router();

router.route('/')
  .post(createEnrollment)
  .get(getEnrollments);

module.exports = router;