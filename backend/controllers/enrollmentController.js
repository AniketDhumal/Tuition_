const Enrollment = require('../models/Enrollment');

// @desc    Create new enrollment
// @route   POST /api/enrollments
// @access  Public
exports.createEnrollment = async (req, res, next) => {
  try {
    const { fullName, email, phone, course, address } = req.body;

    // Simple validation
    if (!fullName || !email || !phone || !course || !address) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    const enrollment = await Enrollment.create({
      fullName,
      email,
      phone,
      course,
      address
    });

    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all enrollments (for admin purposes)
// @route   GET /api/enrollments
// @access  Private/Admin
exports.getEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find();

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};