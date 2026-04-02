const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Helper function to generate initials from full name
const generateInitials = (name) => {
  if (!name) return "U";
  const words = name.trim().split(" ");
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role = 'candidate', profileImageUrl } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate role
    if (role && !['candidate', 'interviewer'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'candidate' or 'interviewer'" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate initials if no profile image provided
    const initials = profileImageUrl || generateInitials(name);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'candidate',
      profileImageUrl: initials,
    });

    // Return user data with JWT
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register error details:", error);
    const fs = require('fs');
    const path = require('path');
    try {
      fs.appendFileSync(path.join(__dirname, '../signup_error.log'), `${new Date().toISOString()} - ${error.message}\n${error.stack}\n\n`);
    } catch (e) { console.error("Could not write to log file", e); }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user has a password (not OAuth user)
    if (!user.password) {
      return res.status(401).json({ message: "Please use Google login for this account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Fix profile image URL if needed
    let profileImageUrl = user.profileImageUrl;
    if (!profileImageUrl || profileImageUrl === "Hi" || profileImageUrl.length < 1 || profileImageUrl.length > 3) {
      const newInitials = generateInitials(user.name);
      user.profileImageUrl = newInitials;
      await user.save();
      profileImageUrl = newInitials;
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Login/Register user via Google OAuth
// @route   POST /api/auth/google
// @access  Public
const googleAuthUser = async (req, res) => {
  try {
    const { email, name, profileImageUrl, role } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with no password and default role 'candidate'
      const initials = profileImageUrl || generateInitials(name);
      user = await User.create({
        name,
        email,
        password: null, // Just explicit, not necessary if not required
        role: role || 'candidate',
        profileImageUrl: initials,
      });
    } else {
      // Update profile image if provided and different
      if (profileImageUrl && profileImageUrl !== user.profileImageUrl && profileImageUrl.startsWith('http')) {
        user.profileImageUrl = profileImageUrl;
        await user.save();
      }
    }

    // Return user data with JWT
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private (Requires JWT)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fix profile image URL if needed
    let profileImageUrl = user.profileImageUrl;
    if (!profileImageUrl || profileImageUrl === "Hi" || profileImageUrl.length < 1 || profileImageUrl.length > 3) {
      const newInitials = generateInitials(user.name);
      user.profileImageUrl = newInitials;
      await user.save();
      profileImageUrl = newInitials;
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: profileImageUrl,
      createdAt: user.created_at, // timestamps option uses created_at as configured
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Public (Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ created_at: -1 });
    res.status(200).json(users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      profileImageUrl: u.profileImageUrl,
      createdAt: u.created_at,
    })));
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/auth/users/:id
// @access  Public (Admin)
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// @desc    Update user resume link (keeping for compatibility)
// @route   PUT /api/auth/resume-link
// @access  Private
const updateResumeLink = async (req, res) => {
  try {
    const { resumeLink } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { resumeLink },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Resume link updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (error) {
    console.error("Error updating resume link:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, password, notificationPreferences } = req.body;

    if (name) {
      user.name = name;
      // Regenerate initials if it's currently an initial and not a URL
      if (!user.profileImageUrl || user.profileImageUrl.length <= 3) {
        user.profileImageUrl = generateInitials(name);
      }
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences
      };
    }

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImageUrl: updatedUser.profileImageUrl,
      notificationPreferences: updatedUser.notificationPreferences
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete my account
// @route   DELETE /api/auth/profile
// @access  Private
const deleteMyAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(req.user.id);
    // Optionally delete related interviews/jobs? 
    // In a real app we'd trigger a cleanup or use cascade.

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update user location
// @route   PUT /api/auth/location
// @access  Private
const updateLocation = async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    // Geocode the address using Nominatim (OpenStreetMap)
    const encodedAddress = encodeURIComponent(address);
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;
    
    const response = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'NextGenApp (contact@nextgen.local)' // Required by Nominatim policy
      }
    });

    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Could not find coordinates for this address" });
    }

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.location = { address, lat, lng };
    await user.save();

    res.json({
      message: "Location updated successfully",
      location: user.location
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get map locations of other users
// @route   GET /api/auth/map-locations
// @access  Private
const getMapLocations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Determine target role based on current user's role
    // Candidates see interviewers, Interviewers see candidates
    let targetRole;
    if (user.role === 'candidate') {
      targetRole = 'interviewer';
    } else {
      // If admin, recruiter, interviewer, or hiring_manager, let them see candidates
      targetRole = 'candidate';
    }

    // Find all users with the target role who have a location set
    const targets = await User.find(
      { 
        role: targetRole,
        'location.lat': { $ne: null },
        'location.lng': { $ne: null }
      },
      'name email profileImageUrl role location' // Only select necessary fields
    );

    res.json({
      currentUserLocation: user.location,
      markers: targets
    });
  } catch (error) {
    console.error("Get map locations error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  deleteUser,
  updateResumeLink,
  googleAuthUser,
  updateUserProfile,
  deleteMyAccount,
  updateLocation,
  getMapLocations,
};
