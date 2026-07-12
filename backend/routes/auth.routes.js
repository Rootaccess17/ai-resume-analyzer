const express = require('express');
const { registerUser, loginUser, forgotPassword, resetPassword } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;