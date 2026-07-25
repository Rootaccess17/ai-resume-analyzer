const nodemailer = require('nodemailer');

// 1. Initialize transporter outside the function to reuse connections
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // TLS/SSL required for Render cloud hosting
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // MUST be a 16-character Google App Password
  },
});

const sendReportEmail = async (userEmail, pdfBuffer, filename) => {
  if (!userEmail || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('⚠️ Skipping email: Missing EMAIL_USER, EMAIL_PASS, or recipient address.');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"AI Resume Analyzer" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Your ATS Resume Optimization Report',
      text: 'Hello! Attached is your AI-generated ATS analysis report.',
      attachments: [{ filename: filename || 'ATS_Report.pdf', content: pdfBuffer }],
    });

    console.log(`📧 Email delivered to ${userEmail}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${userEmail}:`, error.message);
    throw error; // Re-throw so controller catches it gracefully in background
  }
};

module.exports = { sendReportEmail };