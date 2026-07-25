const express = require('express');
const { uploadAndAnalyzeResume, getUserHistory, downloadReport } = require('../controllers/resume.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Middleware wrapper to handle Multer upload errors cleanly
const handleUpload = (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'File upload error' });
    }
    next();
  });
};

router.post('/upload', protect, handleUpload, uploadAndAnalyzeResume);
router.get('/history', protect, getUserHistory);
router.get('/download/:id', protect, downloadReport);

module.exports = router;