const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    targetRole: { type: String, default: 'General' },
    atsScore: { type: Number, required: true },
    summary: { type: String },
    strengths: [{ type: String }],
    improvementAreas: [{ type: String }],
    missingKeywords: [{ type: String }],
    formattingIssues: [{ type: String }],
    actionableTips: [{ type: String }],
    finalRecommendation: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', ResumeSchema);