const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const {
  getDashboardStats,
  getUsers,
  deleteUser,
  getAllProperties,
  deleteProperty,
} = require('../controllers/adminController');

router.get('/stats', protect, admin, getDashboardStats);

router.route('/users')
  .get(protect, admin, getUsers);

router.route('/users/:id')
  .delete(protect, admin, deleteUser);

router.route('/properties')
  .get(protect, admin, getAllProperties);

router.route('/properties/:id')
  .delete(protect, admin, deleteProperty);

module.exports = router;