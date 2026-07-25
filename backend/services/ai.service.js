const pdfParseModule = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

/**
 * Robust helper function to extract text from PDF buffer
 * supporting pdf-parse v1 (function), v2 (class/object), or default export.
 */
const extractTextFromPDF = async (fileBuffer) => {
  // 1. Check for pdf-parse v2 class structure
  if (pdfParseModule.PDFParse) {
    const parser = new pdfParseModule.PDFParse({ data: fileBuffer });
    const result = await parser.getText();
    if (parser.destroy) await parser.destroy();
    return result.text;
  }

  // 2. Check for pdf-parse v1 direct function or default function
  const parseFn = typeof pdfParseModule === 'function' 
    ? pdfParseModule 
    : pdfParseModule.default;

  if (typeof parseFn === 'function') {
    const data = await parseFn(fileBuffer);
    return data.text;
  }

  throw new Error('Unsupported pdf-parse module structure.');
};

const analyzeResumePDF = async (fileBuffer, targetRole = 'General') => {
  let resumeText = '';

  try {
    const rawText = await extractTextFromPDF(fileBuffer);
    resumeText = rawText ? rawText.slice(0, 15000) : '';
  } catch (pdfErr) {
    console.error('❌ PDF Text Extraction Error:', pdfErr.message);
    throw new Error('Failed to read content from the uploaded PDF file. Please upload a non-scanned PDF.');
  }

  if (!resumeText || resumeText.trim().length < 30) {
    throw new Error('Could not extract readable text from this PDF.');
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Server setup error: Missing GEMINI_API_KEY environment variable.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
    You are an expert ATS (Applicant Tracking System) resume reviewer, specifically evaluating this
    resume for a "${targetRole}" role.

    Analyze the resume text below and return STRICT JSON only, matching this exact structure:
    {
      "atsScore": 85,
      "summary": "2-3 sentence overview of ATS readiness for a ${targetRole} position",
      "strengths": ["strength 1", "strength 2"],
      "improvementAreas": ["improvement 1", "improvement 2"],
      "missingKeywords": ["keyword 1", "keyword 2"],
      "formattingIssues": ["formatting 1"],
      "actionableTips": ["tip 1", "tip 2"],
      "finalRecommendation": "1-2 sentence final recommendation"
    }
    Do not include markdown code block formatting or backticks outside the JSON.

    Resume Text:
    ${resumeText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    let rawText = response.text || '';
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(rawText);

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
  } catch (aiErr) {
    console.error('❌ Gemini Analysis Error:', aiErr.message);
    throw new Error(`AI Analysis failed: ${aiErr.message}`);
  }
};

module.exports = { analyzeResumePDF };