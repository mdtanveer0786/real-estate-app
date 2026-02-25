const User = require('../models/User');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats for admin:', req.user.email);

    // Total counts
    const totalProperties = await Property.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalInquiries = await Inquiry.countDocuments();
    const newInquiries = await Inquiry.countDocuments({ status: 'new' });

    // Property stats
    const availableProperties = await Property.countDocuments({ status: 'available' });
    const soldProperties = await Property.countDocuments({ status: 'sold' });
    const rentedProperties = await Property.countDocuments({ status: 'rented' });

    // Recent properties
    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name')
      .select('title price location city status createdAt');

    // Recent inquiries
    const recentInquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('property', 'title')
      .select('name email message status createdAt');

    res.json({
      success: true,
      stats: {
        totalProperties,
        totalUsers,
        totalInquiries,
        newInquiries,
        availableProperties,
        soldProperties,
        rentedProperties: rentedProperties || 0,
      },
      recentProperties,
      recentInquiries,
    });
  } catch (error) {
    console.error('❌ Error in getDashboardStats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    console.log('👥 Fetching all users...');

    const users = await User.find({})
      .select('-password')
      .sort('-createdAt');

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('❌ Error in getUsers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    console.log('🗑️ Deleting user:', req.params.id);

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Can't delete admin
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete admin user'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error in deleteUser:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all properties
// @route   GET /api/admin/properties
// @access  Private/Admin
const getAllProperties = async (req, res) => {
  try {
    console.log('🏠 Fetching all properties...');

    const properties = await Property.find({})
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      properties,
    });
  } catch (error) {
    console.error('❌ Error in getAllProperties:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete property
// @route   DELETE /api/admin/properties/:id
// @access  Private/Admin
const deleteProperty = async (req, res) => {
  try {
    console.log('🗑️ Deleting property:', req.params.id);

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    await property.deleteOne();

    res.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error in deleteProperty:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  deleteUser,
  getAllProperties,
  deleteProperty,
};