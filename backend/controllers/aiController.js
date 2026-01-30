const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const Job = require("../models/Job");
const {
  conceptExplainPrompt,
  questionAnswerPrompt,
  transcriptAnalysisPrompt,
  transcriptCleanupPrompt,
} = require("../utils/prompts");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Helper function for exponential backoff retry
const generateContentWithRetry = async (model, prompt, retries = 3, delay = 1000) => {
  try {
    return await model.generateContent(prompt);
  } catch (error) {
    if (retries > 0 && (error.status === 429 || error.message?.includes('429'))) {
      const msg = `[${new Date().toISOString()}] Hit rate limit. Retrying in ${delay}ms... (${retries} retries left)\n`;
      fs.appendFileSync(path.join(__dirname, '../error_log.txt'), msg);
      console.log(msg.trim());
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateContentWithRetry(model, prompt, retries - 1, delay * 2);
    }
    const msg = `[${new Date().toISOString()}] API Error: ${error.message}\nStack: ${error.stack}\n`;
    fs.appendFileSync(path.join(__dirname, '../error_log.txt'), msg);
    throw error;
  }
};

const getFallbackQuestion = (jobTitle) => {
  const fallbacks = {
    'frontend': {
      question: "Explain the difference between 'debouncing' and 'throttling' in JavaScript. When would you use each, and can you provide a simple code example for one of them?",
      hint: "Think about user input like search boxes (debouncing) vs window scrolling (throttling)."
    },
    'backend': {
      question: "What is the difference between SQL and NoSQL databases? In what scenarios would you choose one over the other for a high-traffic application?",
      hint: "Consider consistency (ACID) vs scalability and schema flexibility."
    },
    'fullstack': {
      question: "Describe the process of a browser fetching a webpage from a server. What happens from the moment you hit Enter in the URL bar until the page is fully rendered?",
      hint: "Mention DNS, TCP/IP, HTTP, DOM construction, and CSSOM."
    },
    'javascript': {
      question: "Explain the concept of 'closures' in JavaScript. How do they work, and what are some practical use cases for them in modern web development?",
      hint: "Think about private variables and factory functions."
    }
  };

  const title = jobTitle.toLowerCase();
  for (const key in fallbacks) {
    if (title.includes(key)) return fallbacks[key];
  }

  return {
    question: "Briefly explain the SOLID principles of object-oriented design and how they help in creating maintainable software.",
    hint: "Think about Single Responsibility, Open-Closed, etc."
  };
};

// Global helper to extract and parse JSON from AI response
const parseAIJSON = (rawText) => {
  try {
    // Clean markdown code blocks
    let cleanedText = rawText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Find the first { or [ and last } or ]
    const firstBrace = cleanedText.indexOf('{');
    const firstBracket = cleanedText.indexOf('[');
    const start = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;

    const lastBrace = cleanedText.lastIndexOf('}');
    const lastBracket = cleanedText.lastIndexOf(']');
    const end = Math.max(lastBrace, lastBracket);

    if (start !== -1 && end !== -1 && end > start) {
      cleanedText = cleanedText.substring(start, end + 1);
    }

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse AI JSON:", error.message);
    console.error("Cleaned text that failed:", rawText);
    throw error;
  }
};

// @desc    Generate interview questions and answers using Gemini
// @route   POST /api/ai/generate-questions
// @access  Private
const generateInterviewQuestions = async (req, res) => {
  try {
    console.log("Generate questions request received:", req.body);
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      console.log("Missing required fields:", { role, experience, topicsToFocus, numberOfQuestions });
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = questionAnswerPrompt(
      role,
      experience,
      topicsToFocus,
      numberOfQuestions
    );

    console.log("About to call Gemini API with prompt:", prompt.substring(0, 100) + "...");

    // Create a new instance for each request to avoid any caching issues
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content with error handling and retry logic
    const result = await generateContentWithRetry(model, prompt);

    if (!result || !result.response) {
      throw new Error("Invalid response from Gemini API");
    }

    const response = result.response;
    const rawText = response.text();

    console.log("Gemini API response received, length:", rawText.length);

    try {
      const questionsData = parseAIJSON(rawText);
      const questions = Array.isArray(questionsData) ? questionsData : (questionsData.questions || []);

      if (!questions.length) {
        throw new Error("No questions found in AI response");
      }

      console.log(`Successfully parsed ${questions.length} questions`);
      return res.status(200).json({ questions });
    } catch (parseError) {
      console.error("Critical parse error:", parseError.message);
      throw new Error("Failed to parse valid JSON from AI");
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Failed to generate questions",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Generate explains a interview question
// @route   POST /api/ai/generate-explanation
// @access  Private
const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = conceptExplainPrompt(question);

    // Create a new instance for each request to avoid any caching issues
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate content with retry logic
    const result = await generateContentWithRetry(model, prompt);
    const response = result.response;
    let rawText = response.text();

    console.log("Explanation API response received, length:", rawText.length);
    console.log("Raw response preview:", rawText.substring(0, 200) + "...");

    // Clean it: Remove ```json and ``` from beginning and end, and handle extra content
    let cleanedText = rawText
      .replace(/^```json\s*/, "") // remove starting ```json
      .replace(/```.*$/, "") // remove ending ``` and anything after it
      .trim(); // remove extra spaces

    // Find the end of the JSON object and cut off any extra content
    let jsonEndIndex = -1;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < cleanedText.length; i++) {
      const char = cleanedText[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '[' || char === '{') {
          bracketCount++;
        } else if (char === ']' || char === '}') {
          bracketCount--;
          if (bracketCount === 0) {
            jsonEndIndex = i;
            break;
          }
        }
      }
    }

    if (jsonEndIndex > -1) {
      cleanedText = cleanedText.substring(0, jsonEndIndex + 1);
    }

    // Remove control characters except for valid whitespace
    cleanedText = cleanedText.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

    console.log("Cleaned explanation text preview:", cleanedText.substring(0, 200) + "...");

    // Now safe to parse
    let data;
    try {
      data = JSON.parse(cleanedText);
    } catch (err) {
      console.error("Error parsing cleanedText:", cleanedText);
      console.error("JSON.parse error:", err);
      return res.status(500).json({
        message: "Failed to parse AI explanation as JSON. Please try again or check the AI output formatting.",
        error: err.message,
        cleanedTextPreview: cleanedText.substring(0, 500)
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Error generating explanation:", error);
    res.status(500).json({
      message: "Failed to generate explanation",
      error: error.message,
    });
  }
};

// @desc    Analyze and refine interview transcript
// @route   POST /api/ai/analyze-transcript
// @access  Private
const analyzeTranscript = async (req, res) => {
  try {
    console.log("Transcript analysis request received:", req.body);
    const { question, transcript } = req.body;

    if (!question || !transcript) {
      console.log("Missing required fields:", { question: !!question, transcript: !!transcript });
      return res.status(400).json({ message: "Missing required fields: question and transcript" });
    }

    if (transcript.trim().length < 10) {
      return res.status(400).json({ message: "Transcript too short for meaningful analysis" });
    }

    const prompt = transcriptAnalysisPrompt(question, transcript);

    console.log("About to call Gemini API for transcript analysis...");

    // Create a new instance for each request to avoid any caching issues
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate content with error handling and retry logic
    const result = await generateContentWithRetry(model, prompt);

    if (!result || !result.response) {
      throw new Error("Invalid response from Gemini API");
    }

    const response = result.response;
    let rawText = response.text();

    console.log("Gemini API transcript analysis response received, length:", rawText.length);
    console.log("Raw response preview:", rawText.substring(0, 200) + "...");

    // Clean it: Remove ```json and ``` from beginning and end, and handle extra content
    let cleanedText = rawText
      .replace(/^```json\s*/, "") // remove starting ```json
      .replace(/```.*$/, "") // remove ending ``` and anything after it
      .trim(); // remove extra spaces

    // Find the end of the JSON object and cut off any extra content
    let jsonEndIndex = -1;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < cleanedText.length; i++) {
      const char = cleanedText[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '[' || char === '{') {
          bracketCount++;
        } else if (char === ']' || char === '}') {
          bracketCount--;
          if (bracketCount === 0) {
            jsonEndIndex = i;
            break;
          }
        }
      }
    }

    if (jsonEndIndex > -1) {
      cleanedText = cleanedText.substring(0, jsonEndIndex + 1);
    }

    console.log("Cleaned transcript analysis text preview:", cleanedText.substring(0, 200) + "...");

    // Now safe to parse
    const data = JSON.parse(cleanedText);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error analyzing transcript:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Failed to analyze transcript",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Clean and improve transcript using AI
// @route   POST /api/ai/cleanup-transcript
// @access  Private
const cleanupTranscript = async (req, res) => {
  try {
    console.log("Transcript cleanup request received:", req.body);
    const { transcript } = req.body;

    if (!transcript) {
      console.log("Missing transcript");
      return res.status(400).json({ message: "Missing required field: transcript" });
    }

    if (transcript.trim().length < 5) {
      return res.status(400).json({ message: "Transcript too short for cleanup" });
    }

    const prompt = transcriptCleanupPrompt(transcript);

    console.log("About to call Gemini API for transcript cleanup...");

    // Create a new instance for each request to avoid any caching issues
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate content with error handling and retry logic
    const result = await generateContentWithRetry(model, prompt);

    if (!result || !result.response) {
      throw new Error("Invalid response from Gemini API");
    }

    const response = result.response;
    let rawText = response.text();

    console.log("Gemini API transcript cleanup response received, length:", rawText.length);
    console.log("Raw response preview:", rawText.substring(0, 200) + "...");

    // Clean it: Remove ```json and ``` from beginning and end, and handle extra content
    let cleanedText = rawText
      .replace(/^```json\s*/, "") // remove starting ```json
      .replace(/```.*$/, "") // remove ending ``` and anything after it
      .trim(); // remove extra spaces

    // Find the end of the JSON object and cut off any extra content
    let jsonEndIndex = -1;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < cleanedText.length; i++) {
      const char = cleanedText[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '[' || char === '{') {
          bracketCount++;
        } else if (char === ']' || char === '}') {
          bracketCount--;
          if (bracketCount === 0) {
            jsonEndIndex = i;
            break;
          }
        }
      }
    }

    if (jsonEndIndex > -1) {
      cleanedText = cleanedText.substring(0, jsonEndIndex + 1);
    }

    console.log("Cleaned transcript cleanup text preview:", cleanedText.substring(0, 200) + "...");

    // Now safe to parse
    const data = JSON.parse(cleanedText);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error cleaning up transcript:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Failed to cleanup transcript",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Generate PDF report data
// @route   POST /api/ai/generate-pdf-data
// @access  Private
const generatePDFData = async (req, res) => {
  try {
    console.log("PDF data generation request received:", req.body);
    const { analysis, question, transcript, userInfo } = req.body;

    if (!analysis || !question || !transcript) {
      console.log("Missing required fields for PDF generation");
      return res.status(400).json({ message: "Missing required fields: analysis, question, transcript" });
    }

    // Prepare structured data for PDF generation
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const pdfData = {
      metadata: {
        title: "Interview Analysis Report",
        generatedDate: currentDate,
        candidate: userInfo?.name || "Anonymous",
        role: userInfo?.role || "N/A",
        sessionId: Date.now().toString()
      },
      interview: {
        question: question,
        transcript: transcript,
        wordCount: transcript.split(' ').length,
        estimatedDuration: Math.ceil(transcript.split(' ').length / 150) // 150 words per minute average
      },
      analysis: {
        overallScore: analysis.score,
        grade: getScoreGrade(analysis.score),
        performance: getScoreLabel(analysis.score),
        refinedAnswer: analysis.refinedAnswer,
        strengths: analysis.strengths || [],
        improvements: analysis.improvements || [],
        keyTakeaways: analysis.keyTakeaways || [],
        overallFeedback: analysis.overallFeedback
      },
      metrics: {
        clarity: Math.min(analysis.score + Math.random() * 2, 10),
        structure: Math.min(analysis.score + Math.random() * 1.5, 10),
        confidence: Math.min(analysis.score + Math.random() * 1, 10),
        relevance: Math.min(analysis.score + Math.random() * 0.5, 10)
      }
    };

    function getScoreGrade(score) {
      if (score >= 9) return 'A+';
      if (score >= 8) return 'A';
      if (score >= 7) return 'B+';
      if (score >= 6) return 'B';
      if (score >= 5) return 'C+';
      if (score >= 4) return 'C';
      return 'D';
    }

    function getScoreLabel(score) {
      if (score >= 8) return 'Excellent';
      if (score >= 6) return 'Good';
      if (score >= 4) return 'Fair';
      return 'Needs Improvement';
    }

    res.status(200).json({
      success: true,
      data: pdfData
    });
  } catch (error) {
    console.error("Error generating PDF data:", error);
    res.status(500).json({
      message: "Failed to generate PDF data",
      error: error.message
    });
  }
};

// @desc    Generate a single interview question based on job role
// @route   POST /api/ai/generate-question
// @access  Private
const generateInterviewQuestion = async (req, res) => {
  try {
    const { job_id } = req.body;

    if (!job_id) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    // Get job details
    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const jobTitle = job.title;
    const requiredSkills = Array.isArray(job.required_skills) ? job.required_skills.join(', ') : '';

    console.log(`Generating singular question for: ${jobTitle}`);

    const prompt = `You are a world-class technical interviewer. Generate ONE high-quality coding question for:
Job Position: ${jobTitle}
Skills to focus on: ${requiredSkills}

The question should:
1. Be a practical coding problem matching the level of the job.
2. Be solveable within a 30-40 minute window.
3. Require the candidate to write code.

CRITICAL: Return ONLY a raw JSON object. NO markdown, NO code blocks, NO preamble.
Example Format:
{
  "question": "Reverse a linked list without using extra space...",
  "hint": "Think about using three pointers..."
}`;

    // Fresh model instance
    const freshGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const freshModel = freshGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await generateContentWithRetry(freshModel, prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini singular response length:", text.length);

    try {
      const questionData = parseAIJSON(text);
      console.log("Successfully parsed singular question");
      res.status(200).json({
        success: true,
        question: questionData.question,
        hint: questionData.hint || '',
      });
    } catch (parseError) {
      console.log("Parse failed, using extraction logic...");
      // If JSON parse fails, try to extract the question manually
      const questionMatch = text.match(/"question":\s*"([^"]+)"/);
      const hintMatch = text.match(/"hint":\s*"([^"]+)"/);

      if (questionMatch) {
        res.status(200).json({
          success: true,
          question: questionMatch[1],
          hint: hintMatch ? hintMatch[1] : '',
        });
      } else {
        console.error("Failed to extract question from text:", text);
        throw new Error('Failed to parse question from AI response');
      }
    }
  } catch (error) {
    console.error("Error generating question:", error);

    // Attempt fallback
    try {
      const job = await Job.findById(req.body.job_id);
      const fallback = getFallbackQuestion(job?.title || 'technical');
      return res.status(200).json({
        success: true,
        question: fallback.question,
        hint: fallback.hint,
        isFallback: true
      });
    } catch (fallbackError) {
      res.status(500).json({
        message: "Failed to generate question",
        error: error.message,
      });
    }
  }
};

module.exports = {
  generateInterviewQuestions,
  generateInterviewQuestion,
  generateConceptExplanation,
  analyzeTranscript,
  cleanupTranscript,
  generatePDFData
};
