const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add your full name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  course: {
    type: String,
    required: [true, 'Please select a course'],
    enum: ['math', 'science', 'english'] // matches your form options
  },
  address: {
    type: String,
    required: [true, 'Please add your address']
  }
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema);