# 🚀 Running NextGen - Step by Step

## Current Status ✅
- ✅ Dependencies installed (backend & frontend)
- ✅ Environment files exist

## Next Steps to Run:

### 1. Verify Environment Variables

Make sure your `.env` files are configured:

**Backend (`backend/.env`):**
- `DATABASE_URL` or `POSTGRES_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - A secret key for JWT tokens
- `GEMINI_API_KEY` - Your Google Gemini API key

**Frontend (`frontend/.env`):**
- `VITE_BASE_URL` - Backend URL (usually `http://localhost:5000`)
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- Other Firebase config variables

### 2. Ensure Database is Set Up

If you haven't already:
1. Set up PostgreSQL database (local or Supabase)
2. Run the schema: `backend/database/schema.sql`
3. Verify connection string in `backend/.env`

### 3. Start the Backend Server

Open **Terminal 1** and run:
```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 5000
PostgreSQL connected
```

### 4. Start the Frontend Server

Open **Terminal 2** and run:
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v6.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### 5. Open in Browser

Visit: **http://localhost:5173**

### 6. Test the App

1. **Sign Up** - Create an account (choose Candidate or Interviewer role)
2. **If Candidate:** Browse jobs and start an interview
3. **If Interviewer:** Create a job posting

## Troubleshooting

**Backend won't start?**
- Check database connection in `backend/.env`
- Verify PostgreSQL is running
- Check if port 5000 is available

**Frontend won't start?**
- Check `VITE_BASE_URL` points to correct backend URL
- Verify Firebase credentials are correct

**Can't connect to database?**
- Verify DATABASE_URL/POSTGRES_URL is correct
- Make sure database exists and schema is applied
- Check firewall/network settings

**Authentication errors?**
- Verify all Firebase env variables are set
- Check Firebase console - enable Email/Password auth
- Ensure Google sign-in is enabled if using it

## Need Help?

See `QUICKSTART.md` for detailed setup instructions.
