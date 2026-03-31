'use strict';
const express = require('express');
const router  = express.Router();
const {
    getDashboardStats, getUsers, updateUser, deleteUser,
    getAllProperties, toggleFeatured, updatePropertyStatus,
} = require('../controllers/adminController');
const { protect }     = require('../middleware/authMiddleware');
const { admin: adminOnly } = require('../middleware/adminMiddleware');

router.use(protect, adminOnly);

router.get('/stats',                    getDashboardStats);
router.get('/users',                    getUsers);
router.put('/users/:id',                updateUser);
router.delete('/users/:id',             deleteUser);
router.get('/properties',               getAllProperties);
router.put('/properties/:id/feature',   toggleFeatured);
router.put('/properties/:id/status',    updatePropertyStatus);

module.exports = router;
