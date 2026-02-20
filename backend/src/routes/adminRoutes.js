const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getUsers,
    deleteUser,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getDashboardStats);
router.route('/users')
    .get(protect, admin, getUsers);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;