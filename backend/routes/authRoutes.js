const express = require('express');
const router = express.Router();
const {
  getStudents,
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

router.get('/students',
  getStudents
);
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;