const express = require('express');
const { uploadAndAnalyzeResume, getUserHistory, downloadReport } = require('../controllers/resume.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.post('/upload', protect, upload.single('resume'), uploadAndAnalyzeResume);
router.get('/history', protect, getUserHistory);
router.get('/download/:id', protect, downloadReport);

module.exports = router;