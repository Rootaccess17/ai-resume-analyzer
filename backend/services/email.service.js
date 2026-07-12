const nodemailer = require('nodemailer');

const sendReportEmail = async (userEmail, pdfBuffer, filename) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"AI Resume Analyzer" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Your ATS Resume Optimization Report',
    text: 'Hello! Attached is your AI-generated ATS analysis report.',
    attachments: [{ filename: filename || 'ATS_Report.pdf', content: pdfBuffer }],
  });
};

module.exports = { sendReportEmail };