const admin = (req, res, next) => {
  try {
    console.log('🔐 Checking admin privileges...');

    // Check if user exists
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    console.log('👤 User role:', req.user.role);

    // Check if user is admin
    if (req.user.role === 'admin') {
      console.log('✅ Admin access granted');
      next();
    } else {
      console.log('❌ User is not admin');
      res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      });
    }
  } catch (error) {
    console.error('❌ Admin middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = { admin };