const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Analyzes a job application against job requirements
 * @param {string} bio - Candidate's bio
 * @param {string} resumeUrl - URL to candidate's resume
 * @param {string[]} skills - Required skills for the job
 * @param {string} description - Job description
 * @param {string} [language] - Target language for the response
 * @returns {Promise<{score: number, analysis: string}>}
 */
const analyzeApplication = async (bio, resumeUrl, skills, description, language = "English") => {
    try {
        const prompt = `
            You are an expert technical recruiter. Analyze the following candidate application against the job requirements.
            
            JOB DESCRIPTION:
            ${description}
            
            REQUIRED SKILLS:
            ${skills.join(", ")}
            
            CANDIDATE BIO:
            ${bio}
            
            CANDIDATE RESUME URL:
            ${resumeUrl}
            
            Tasks:
            1. Provide a "Match Score" out of 100 based on how well the candidate's bio and skills align with the job.
            2. Provide a 2-3 sentence "Gemini Insight" summary explaining the score.
            
            IMPORTANT RULES:
            - Respond STRICTLY in this language: ${language}
            - Return ONLY a valid JSON object with the following keys:
            {
                "score": number,
                "analysis": "string"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean the response in case of markdown formatting
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(cleanedText);

        return {
            score: data.score || 0,
            analysis: data.analysis || "Could not generate analysis."
        };
    } catch (error) {
        console.error("AI Analysis Error:", error);
        return {
            score: 0,
            analysis: "AI screening failed due to a technical error."
        };
    }
};

/**
 * Generates an in-depth post-interview evaluation report
 */
const generateInterviewFeedback = async (jobTitle, skills, code, transcript, language = "English") => {
    try {
        const prompt = `
            You are an expert technical interviewer. Evaluate the following candidate performance.
            
            JOB ROLE: ${jobTitle}
            REQUIRED SKILLS: ${skills.join(", ")}
            
            CODE SUBMISSION:
            ${code || "No code submitted."}
            
            INTERVIEW TRANSCRIPT:
            ${transcript || "No transcript available."}
            
            Tasks:
            1. Assign an overall score out of 10.
            2. Provide a hiring recommendation: "Strong Yes", "Yes", "Conditional Yes", or "No".
            3. List 3 specific strengths observed.
            4. List 3 specific areas for technical or communication improvement.
            5. Provide a detailed final feedback summary.
            6. Provide "ai_summary": A concise 5-point bulleted summary of the candidate's performance.
            7. Provide "ai_highlights": An array of 3 strings highlighting key moments or impressive things they did/said.
            
            IMPORTANT RULES:
            - Respond STRICTLY in this language: ${language}
            - Return ONLY a valid JSON object:
            {
                "score": number,
                "recommendation": "string",
                "strengths": ["string"],
                "improvements": ["string"],
                "feedback": "string",
                "codeAnalysis": "string",
                "ai_summary": "string",
                "ai_highlights": ["string"]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const data = JSON.parse(response.text().replace(/```json/g, "").replace(/```/g, "").trim());

        return data;
    } catch (error) {
        console.error("AI Evaluation Error:", error);
        return { score: 0, recommendation: "Error", feedback: "AI evaluation failed." };
    }
};

/**
 * Generates technical interview questions based on job description
 */
const generateJobQuestions = async (jobTitle, description, skills, language = "English") => {
    try {
        const prompt = `
            Generate 5 highly relevant technical interview questions for the following job posting.
            
            TITLE: ${jobTitle}
            DESCRIPTION: ${description}
            SKILLS: ${skills.join(", ")}
            
            IMPORTANT RULES:
            - Respond STRICTLY in this language: ${language}
            - Return ONLY a valid JSON array of strings:
            ["Question 1", "Question 2", ...]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text().replace(/```json/g, "").replace(/```/g, "").trim());
    } catch (error) {
        console.error("AI Question Gen Error:", error);
        return ["Describe your experience with the required technical stack."];
    }
};

/**
 * Generates mock interview questions based on mode.
 */
const generateMockInterviewQuestions = async (mode = "Technical", language = "English") => {
    try {
        const prompt = `
            Generate 3 highly relevant mock interview questions for a ${mode} interview round.
            
            IMPORTANT RULES:
            - Respond STRICTLY in this language: ${language}
            - Return ONLY a valid JSON array of strings:
            ["Question 1", "Question 2", "Question 3"]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text().replace(/```json/g, "").replace(/```/g, "").trim());
    } catch (error) {
        console.error("Mock Interview Gen Error:", error);
        return ["Describe a challenging project.", "How do you handle conflict?", "Where do you see yourself in 5 years?"];
    }
};

/**
 * Generates mock interview feedback specifically targeting filler words, pacing, and tone.
 */
const generateMockInterviewFeedback = async (mode, transcript, language = "English") => {
    try {
        const prompt = `
            You are an expert ${mode} Interview Coach. Evaluate the following candidate transcript from a mock practice session.
            
            INTERVIEW TRANSCRIPT:
            ${transcript || "No transcript available."}
            
            Tasks:
            1. Assign an overall overall communication score out of 10.
            2. Extract any "filler_words" used excessively (like "um", "ah", "like", "you know").
            3. Evaluate their "pace" (e.g. "Too fast", "Just right", "Too slow").
            4. Evaluate their "tone" (e.g. "Confident", "Nervous", "Professional").
            5. List 3 specific communication or technical strengths.
            6. List 3 specific areas for improvement.
            7. Provide a detailed summary feedback paragraph.
            
            IMPORTANT RULES:
            - Respond STRICTLY in this language: ${language}
            - Return ONLY a valid JSON object:
            {
                "score": number,
                "pace": "string",
                "tone": "string",
                "filler_words": ["string"],
                "strengths": ["string"],
                "improvements": ["string"],
                "feedback": "string"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const data = JSON.parse(response.text().replace(/```json/g, "").replace(/```/g, "").trim());

        return data;
    } catch (error) {
        console.error("Mock AI Evaluation Error:", error);
        return { 
            score: 0, 
            pace: "Error", 
            tone: "Error", 
            filler_words: [], 
            feedback: "Mock AI evaluation failed due to a server error or rate limit.",
            strengths: ["Review needed"],
            improvements: ["Review needed"]
        };
    }
};

/**
 * Analyzes the gap between a candidate's resume and a job description.
 */
const analyzeSkillGap = async (resumeText, jobDescription, language = "English") => {
    try {
        const prompt = `
            You are an expert Career Coach and Technical Recruiter. Compare the candidate's resume against the target job description.
            
            RESUME TEXT:
            ${resumeText}
            
            JOB DESCRIPTION:
            ${jobDescription}
            
            Tasks:
            1. Calculate a "match_percentage" (0-100).
            2. Identify an array of "missing_skills" - technical or soft skills explicitly asked for that the candidate lacks.
            3. Identify an array of "missing_keywords" - specific industry buzzwords or tools asked for but missing.
            4. Provide a brief "recommendation" on how they can bridge the gap.
            
            IMPORTANT RULES:
            - Respond STRICTLY in this language: ${language}
            - Return ONLY a valid JSON object:
            {
                "match_percentage": number,
                "missing_skills": ["string"],
                "missing_keywords": ["string"],
                "recommendation": "string"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const data = JSON.parse(response.text().replace(/```json/g, "").replace(/```/g, "").trim());

        return data;
    } catch (error) {
        console.error("Skill Gap Analysis Error:", error);
        return { 
            match_percentage: 0, 
            missing_skills: ["Analysis failed"], 
            missing_keywords: ["Analysis failed"], 
            recommendation: "AI evaluation failed due to a server error or rate limit." 
        };
    }
};

module.exports = { analyzeApplication, generateInterviewFeedback, generateJobQuestions, generateMockInterviewQuestions, generateMockInterviewFeedback, analyzeSkillGap };
