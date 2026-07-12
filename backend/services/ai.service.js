const { PDFParse } = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

const analyzeResumePDF = async (fileBuffer, targetRole = 'General') => {
  const parser = new PDFParse({ data: fileBuffer });
  const parsedPdf = await parser.getText();
  await parser.destroy();

  const resumeText = parsedPdf.text.slice(0, 15000);

  if (!resumeText || resumeText.trim().length < 30) {
    throw new Error('Could not extract readable text from this PDF.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
    You are an expert ATS (Applicant Tracking System) resume reviewer, specifically evaluating this
    resume for a "${targetRole}" role.

    Analyze the resume text below and return STRICT JSON only, matching this exact structure:
    {
      "atsScore": 0-100 integer,
      "summary": "2-3 sentence overview of ATS readiness for a ${targetRole} position",
      "strengths": ["array of 3-5 specific strengths relevant to ${targetRole}"],
      "improvementAreas": ["array of 3-5 specific weaknesses or gaps for ${targetRole}"],
      "missingKeywords": ["array of 5-8 keywords/skills expected for ${targetRole} but missing"],
      "formattingIssues": ["array of 2-5 formatting/structure problems found"],
      "actionableTips": ["array of 3-5 short, concrete, actionable improvement steps"],
      "finalRecommendation": "1-2 sentence final verdict — is this resume ready for ${targetRole} roles or not, and why"
    }
    Do not include markdown, backticks, or any text outside the JSON object.

    Resume Text:
    ${resumeText}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  const parsed = JSON.parse(response.text);

  return {
    targetRole,
    atsScore: Math.max(0, Math.min(100, Math.round(parsed.atsScore ?? 0))),
    summary: parsed.summary || '',
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    improvementAreas: Array.isArray(parsed.improvementAreas) ? parsed.improvementAreas : [],
    missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
    formattingIssues: Array.isArray(parsed.formattingIssues) ? parsed.formattingIssues : [],
    actionableTips: Array.isArray(parsed.actionableTips) ? parsed.actionableTips : [],
    finalRecommendation: parsed.finalRecommendation || '',
  };
};

module.exports = { analyzeResumePDF };