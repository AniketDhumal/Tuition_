const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Helper: Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

// @desc    Register user (without email verification)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, grade } = req.body;

    // Input validation
    if (!name || !email || !password || !role) {
      return next(new ErrorResponse('Please provide all required fields', 400));
    }

    // Validate role
    if (!['student', 'teacher'].includes(role)) {
      return next(new ErrorResponse('Invalid role specified', 400));
    }

    // Student validation
    if (role === 'student' && !grade) {
      return next(new ErrorResponse('Grade is required for students', 400));
    }

    // Create user
    const userData = {
      name,
      email,
      password,
      role,
      isVerified: true
    };

    // Only add grade if role is student
    if (role === 'student') {
      userData.grade = grade;
    }

    const user = await User.create(userData);

    // Return response with role
    sendTokenResponse(user, 200, res);

  } catch (err) {
    // Handle duplicate email
    if (err.code === 11000) {
      return next(new ErrorResponse('Email already exists', 400));
    }
    console.error('Registration error:', err);
    next(new ErrorResponse('Registration failed', 500));
  }
};

// @desc    Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorResponse('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    if (!user.isVerified) {
      return next(new ErrorResponse('Please verify your email first', 401));
    }

    const token = user.getSignedJwtToken();
    res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role  // Make sure this is included
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user
  });
};

// @desc    Logout user / clear cookie
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Update user details
exports.updateDetails = async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
};

// @desc    Update password
exports.updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
};

// @desc    Forgot password
exports.forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('No user with that email', 404));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
  const message = `You are receiving this email because you requested a password reset. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Email could not be sent', 500));
  }
};

// @desc    Reset password
exports.resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
};

exports.getStudents = async (req, res, next) => {
  try {
    // Advanced query filtering
    const queryObj = { role: 'student' };
    const query = User.find(queryObj).select('name email _id');
    
    // Execute query
    const students = await query;

    res.status(200).json({
      status: 'success',
      results: students.length,
      data: {
        students
      }
    });
  } catch (err) {
    console.error('Error fetching students:', err);
    next(new ErrorResponse('Failed to fetch students', 500));
  }
};