# Professional Demo Guide: NextGen Portal

Follow these steps for a perfect 5-10 minute project demo during your internal review.

---

### Phase 1: Authentication & Entry (1 min)
1.  **Start at the Landing Page**: Show the sleek "Glassmorphism" landing page. Mention it's built with **React & Tailwind CSS**.
2.  **Login as Interviewer**: 
    - Log in using an interviewer account.
    - **Highlight**: Mention that the system uses **JWT-based sessions** and role-based redirection.

### Phase 2: The Interviewer Portal (2 mins)
1.  **Dashboard Overview**: Show the job management dashboard.
2.  **Create a New Job**: 
    - Click "Create Job".
    - Enter a title (e.g., "Frontend Developer") and skill tags (e.g., "React, CSS").
    - **Highlight**: Explain that these **Skill Tags** are stored in **MongoDB** and will be used by **Gemini AI** to pick relevant questions later.
3.  **Active/Inactive Toggle**: Quickly flip a job status to show the real-time update.

### Phase 3: The Candidate Portal (2 mins)
1.  **Switch to Candidate**: Log out and log back in as a Candidate (or use a different browser).
2.  **Browse Jobs**: Show the candidate dashboard.
3.  **Search Feature**: Type "Frontend" in the search bar to show the instant filtering.
4.  **Start Assessment**: Find the job you just created and click "Start Interview".

### Phase 4: The AI Interview Room (3-4 mins)
*This is the most important part of the demo!*
1.  **Room Setup**: Show the webcam feed (left) and the Monaco Editor (right).
2.  **Coding Activity**: 
    - Type a small piece of code in the **Monaco Editor**. 
    - **Highlight**: Mention this is the same engine that powers **VS Code**.
3.  **Voice Interaction**: 
    - Speak a few sentences (e.g., "I am using React for this UI because it is component-based").
    - **Highlight**: Show the **Live Transcript** appearing on the screen. Mention the **Web Speech API**.
4.  **AI Questioning**: 
    - Trigger an AI question (if your logic supports it) or simply click **Submit**.
    - **Highlight**: Explain that the code + transcript are being sent to the **Gemini API** for scoring.

### Phase 5: The Final Review (1 min)
1.  **Back to Interviewer**: Switch back to the Interviewer account.
2.  **View Review**: Go to the "Review Applications" section for that job.
3.  **Show the Result**: 
    - Open the candidate's submission.
    - Show the panel: **The Candidate's Code**, **The Transcript**, and **The AI-Generated Score/Feedback**.
    - **Closing Statement**: "And that is the complete end-to-end flow of NextGen—from job creation to automated AI evaluation."

---

### 💡 Demo Tips
- **Pre-fill Data**: Have a couple of jobs already in the database so the dashboard doesn't look empty.
- **Check Audio/Video**: Ensure your browser has camera/mic permissions enabled before you start.
- **Explain the "Why"**: Throughout the demo, keep saying *why* you built a feature (e.g., "This saves the recruiter 30 minutes of screening").
- **Mention MongoDB**: Remind them that all this data is efficiently stored in a flexible **MongoDB** schema.
