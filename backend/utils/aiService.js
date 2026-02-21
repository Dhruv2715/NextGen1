const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Analyzes a job application against job requirements
 * @param {string} bio - Candidate's bio
 * @param {string} resumeUrl - URL to candidate's resume
 * @param {string[]} skills - Required skills for the job
 * @param {string} description - Job description
 * @returns {Promise<{score: number, analysis: string}>}
 */
const analyzeApplication = async (bio, resumeUrl, skills, description) => {
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
            
            IMPORTANT: Return ONLY a valid JSON object with the following keys:
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
const generateInterviewFeedback = async (jobTitle, skills, code, transcript) => {
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
            
            IMPORTANT: Return ONLY a valid JSON object:
            {
                "score": number,
                "recommendation": "string",
                "strengths": ["string"],
                "improvements": ["string"],
                "feedback": "string",
                "codeAnalysis": "string"
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
const generateJobQuestions = async (jobTitle, description, skills) => {
    try {
        const prompt = `
            Generate 5 highly relevant technical interview questions for the following job posting.
            
            TITLE: ${jobTitle}
            DESCRIPTION: ${description}
            SKILLS: ${skills.join(", ")}
            
            Return ONLY a valid JSON array of strings:
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

module.exports = { analyzeApplication, generateInterviewFeedback, generateJobQuestions };
