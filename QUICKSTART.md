# Quick Start Guide - NextGen

## 🚀 Run the App in 5 Steps

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Set Up Database

**Option A: Using Supabase (Easiest - Recommended)**
1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to SQL Editor
4. Copy and paste the contents of `backend/database/schema.sql`
5. Click "Run"
6. Go to Settings > Database and copy your connection string

**Option B: Local PostgreSQL**
1. Install PostgreSQL if not already installed
2. Create database: `createdb nextgen`
3. Run schema: `psql -d nextgen -f backend/database/schema.sql`

### Step 3: Set Up Firebase

1. Go to https://console.firebase.google.com
2. Create a new project (or use existing)
3. Enable Authentication > Email/Password and Google sign-in
4. Go to Project Settings > General
5. Copy your Firebase config values

### Step 4: Get API Keys

1. **Google Gemini API Key:**
   - Go to https://makersuite.google.com/app/apikey
   - Create a new API key
   - Copy the key

2. **JWT Secret:**
   - Generate a random string (e.g., use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

### Step 5: Create Environment Files

**Create `backend/.env`:**
```env
PORT=5000
DATABASE_URL=your-postgres-connection-string-here
# OR
POSTGRES_URL=your-supabase-connection-string-here
JWT_SECRET=your-generated-jwt-secret-here
GEMINI_API_KEY=your-gemini-api-key-here
```

**Create `frontend/.env`:**
```env
VITE_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
```

### Step 6: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 7: Open Your Browser

Visit: **http://localhost:5173**

## 🎯 First Use

1. **Sign Up** with email/password or Google
2. **Choose your role:**
   - **Candidate**: Browse jobs and take interviews
   - **Interviewer**: Create jobs and review interviews
3. Start using the app!

## 🔧 Troubleshooting

**Database Connection Error:**
- Verify your DATABASE_URL or POSTGRES_URL is correct
- Make sure PostgreSQL is running (if using local)
- Check that the schema has been applied

**Firebase Auth Error:**
- Verify all Firebase env variables are set correctly
- Make sure Email/Password and Google auth are enabled in Firebase console

**Port Already in Use:**
- Change PORT in `backend/.env` to a different port (e.g., 5001)
- Update `VITE_BASE_URL` in `frontend/.env` accordingly

## 📝 Quick Test

After setup, test the flow:

1. **As Interviewer:**
   - Sign up as "Interviewer"
   - Create a job posting
   - Note the job ID or check dashboard

2. **As Candidate:**
   - Sign up as "Candidate" (or use another browser/incognito)
   - Browse jobs
   - Apply to a job (this creates an interview)
   - Start the interview
   - Complete and submit

3. **Back as Interviewer:**
   - View the completed interview
   - Review code and transcript
   - See AI-generated feedback

## 🆘 Need Help?

Check `SETUP.md` for detailed documentation.
