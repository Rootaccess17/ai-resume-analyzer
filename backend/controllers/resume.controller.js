const Resume = require('../models/Resume');
const { analyzeResumePDF } = require('../services/ai.service');
const { generateReportPDF } = require('../services/pdf.service');
const { sendReportEmail } = require('../services/email.service');

const uploadAndAnalyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const targetRole = req.body.targetRole || 'General';
    const aiAnalysis = await analyzeResumePDF(req.file.buffer, targetRole);

    const newResume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      ...aiAnalysis,
    });

    try {
      const pdfBuffer = await generateReportPDF(newResume);
      await sendReportEmail(req.user.email, pdfBuffer, `ATS_Report_${newResume._id}.pdf`);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    res.status(201).json({ message: 'Analysis complete!', data: newResume });
  } catch (error) {
    res.status(500).json({ message: 'Error processing resume', error: error.message });
  }
};

const getUserHistory = async (req, res) => {
  try {
    const history = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
};

const downloadReport = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ message: 'Report not found' });

    // Owner OR admin can download
    const isOwner = resume.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to access this report' });
    }

    const pdfBuffer = await generateReportPDF(resume);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ATS_Report_${resume._id}.pdf"`,
    });
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

module.exports = { uploadAndAnalyzeResume, getUserHistory, downloadReport };