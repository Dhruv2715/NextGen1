# NextGen - Setup Guide

## Overview
NextGen is a technical proficiency & interview evaluation platform with dual portals:
- **Candidate Portal**: Browse jobs, take interviews with live coding
- **Interviewer Portal**: Create jobs, review candidate interviews

## Prerequisites
- Node.js v18.0.0 or higher
- npm v8.0.0 or higher
- PostgreSQL database (or Supabase)
- Firebase project for authentication
- Google Gemini API key

## Database Setup

### Option 1: Supabase (Recommended)
1. Create a Supabase project
2. Go to SQL Editor
3. Run the schema file: `backend/database/schema.sql`
4. Copy the connection string from Settings > Database

### Option 2: PostgreSQL
1. Install PostgreSQL locally
2. Create a database: `CREATE DATABASE nextgen;`
3. Run the schema file: `psql -d nextgen -f backend/database/schema.sql`

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/database
# OR use POSTGRES_URL for Supabase
POSTGRES_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-here
GEMINI_API_KEY=your-gemini-api-key

# Optional (for backward compatibility with existing features)
MONGO_URI=mongodb://your-mongo-connection-string
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### Frontend (`frontend/.env`)
```env
VITE_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
```

## Installation

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## Running the Application

### Development Mode

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## User Roles

### Creating Users

1. **Via Sign Up**: Default role is `candidate`
2. **Via Google OAuth**: Default role is `candidate`
3. **Manual Database Update**: 
   ```sql
   UPDATE users SET role = 'interviewer' WHERE email = 'interviewer@example.com';
   ```

### Role-Based Access

- **Candidates** (`role: 'candidate'`):
  - Access: `/candidate/dashboard`
  - Can browse jobs, apply, and take interviews

- **Interviewers** (`role: 'interviewer'`):
  - Access: `/interviewer/dashboard`
  - Can create jobs, view applications, review interviews

## Features

### Candidate Portal
- Browse available jobs
- Apply to jobs (creates interview)
- Live interview with:
  - Webcam feed
  - Monaco Code Editor
  - Voice transcription (Browser Speech Recognition API)
  - Real-time question from Gemini AI

### Interviewer Portal
- Create job postings with required skills
- View candidate applications
- Review completed interviews:
  - View submitted code
  - Read interview transcripts
  - See AI-generated scores and feedback

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/profile` - Get user profile (protected)

### Jobs
- `GET /api/jobs` - Get all jobs (public)
- `GET /api/jobs/my-jobs` - Get interviewer's jobs (protected)
- `POST /api/jobs` - Create job (protected, interviewer only)
- `GET /api/jobs/:id` - Get job by ID
- `PUT /api/jobs/:id` - Update job (protected, owner only)
- `DELETE /api/jobs/:id` - Delete job (protected, owner only)

### Interviews
- `POST /api/interviews` - Apply to job / Create interview (protected, candidate)
- `GET /api/interviews` - Get user's interviews (protected)
- `GET /api/interviews/:id` - Get interview details (protected)
- `PUT /api/interviews/:id` - Update interview status (protected)
- `POST /api/interviews/:id/submit` - Submit interview (protected, candidate)
- `GET /api/interviews/:id/transcripts` - Get interview transcripts (protected)

### AI
- `POST /api/ai/generate-question` - Generate interview question (protected)
- `POST /api/ai/generate-questions` - Generate multiple questions (legacy)
- `POST /api/ai/analyze-transcript` - Analyze transcript (legacy)

## Notes

### Speech Recognition
The Interview Room currently uses the Browser Speech Recognition API (Web Speech API), which works in:
- Chrome/Chromium browsers
- Edge
- Safari (with limitations)

For Azure Speech SDK integration (if needed), you can:
1. Install: `npm install microsoft-cognitiveservices-speech-sdk`
2. Update `frontend/src/pages/Candidate/InterviewRoom.jsx` to use Azure SDK
3. Add Azure credentials to frontend `.env`

### Database
- The app supports both MongoDB (for legacy features) and PostgreSQL (for new features)
- PostgreSQL is the primary database for jobs, interviews, and transcripts
- MongoDB can be removed if not using legacy features

## Troubleshooting

1. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check PostgreSQL is running
   - Ensure database exists and schema is applied

2. **Authentication Issues**
   - Verify Firebase credentials
   - Check CORS settings in backend
   - Ensure JWT_SECRET is set

3. **AI Generation Fails**
   - Verify GEMINI_API_KEY is set
   - Check API quota/limits
   - Review server logs for errors

## Deployment

### Backend
- Can be deployed to AWS Lambda, Heroku, or any Node.js hosting
- Ensure PostgreSQL connection is accessible
- Set all environment variables

### Frontend
- Build: `npm run build`
- Deploy to Vercel, Netlify, or any static hosting
- Update `VITE_BASE_URL` to production backend URL

## Support

For issues or questions, please check the codebase documentation or create an issue.
