const express = require('express');
const { getAdminDashboardData } = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), getAdminDashboardData);

module.exports = router;