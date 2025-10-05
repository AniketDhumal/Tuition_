const { check } = require('express-validator');

exports.validateProfileUpdate = [
  check('name', 'Name is required').not().isEmpty(),
  check('age', 'Age must be a number between 1 and 120').optional().isInt({ min: 1, max: 120 }),
  check('location', 'Location is required').optional().not().isEmpty(),
  check('about', 'About cannot be more than 1000 characters').optional().isLength({ max: 1000 })
];

exports.validateProfileImage = [
  check('image', 'Image is required').exists()
];