const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/profileValidator');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Get current user's profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    let profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'email']);
    
    if (!profile) {
      profile = await Profile.create({
        user: req.user.id,
        name: user.name,
        email: user.email,
        age: null,
        location: '',
        about: '',
        image: '/uploads/default-avatar.png'
      });
    }

    // Create absolute URL for the image
    const responseData = {
      ...profile.toObject(),
      imageUrl: `${req.protocol}://${req.get('host')}${profile.image}`
    };

    res.json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all profiles (admin only)
router.get('/', protect, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const profiles = await Profile.find().populate('user', ['name', 'email']);
    res.json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.put('/', protect, validateProfileUpdate, async (req, res) => {
  try {
    const { name, age, location, about } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Update profile fields
    if (name) profile.name = name;
    if (age) profile.age = age;
    if (location) profile.location = location;
    if (about) profile.about = about;

    await profile.save();

    // Return profile with absolute image URL
    const responseData = {
      ...profile.toObject(),
      imageUrl: `${req.protocol}://${req.get('host')}${profile.image}`
    };

    res.json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload profile image
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file' });
    }

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Delete old image if it's not the default
    if (profile.image && profile.image !== '/uploads/default-avatar.png') {
      const oldImagePath = path.join(__dirname, '../public', profile.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    profile.image = `/uploads/${req.file.filename}`;
    await profile.save();

    res.json({ 
      imageUrl: `${req.protocol}://${req.get('host')}${profile.image}`,
      relativePath: profile.image
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

module.exports = router;