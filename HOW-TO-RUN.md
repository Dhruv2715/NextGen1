# 🚀 How to Run NextGen - Quick Guide

## ✅ Your Current Status
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed  
- ✅ Backend .env file exists
- ✅ Frontend .env file exists
- ⚠️  **Action Required:** Add PostgreSQL connection to `backend/.env`

## 🔧 Required Setup Before Running

### 1. Add PostgreSQL Database Connection

You need to add one of these to your `backend/.env` file:

**Option A: Using Supabase (Recommended - Free)**
1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to **SQL Editor** → Paste contents of `backend/database/schema.sql` → Run
4. Go to **Settings → Database** → Copy connection string
5. Add to `backend/.env`:
   ```
   POSTGRES_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

**Option B: Local PostgreSQL**
1. Install PostgreSQL if needed
2. Create database: `createdb nextgen`
3. Run schema: `psql -d nextgen -f backend/database/schema.sql`
4. Add to `backend/.env`:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/nextgen
   ```

### 2. Verify Your .env Files

**Backend (`backend/.env`) should have:**
```env
PORT=5000
DATABASE_URL=your-postgres-connection-here
# OR
POSTGRES_URL=your-supabase-connection-here
JWT_SECRET=your-jwt-secret-here
GEMINI_API_KEY=your-gemini-key-here
```

**Frontend (`frontend/.env`) should have:**
```env
VITE_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
```

## 🎯 Run the Application

### Method 1: Use the Batch Script (Windows)

Simply double-click:
- **`check-env.bat`** - Check if everything is configured
- **`start-app.bat`** - Start both servers

### Method 2: Manual Start (Any OS)

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

### Method 3: PowerShell Commands

```powershell
# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\NextGen1\backend; npm run dev"

# Start Frontend (wait 3 seconds first)
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\NextGen1\frontend; npm run dev"
```

## 🌐 Access the Application

Once both servers are running:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## ✅ Verify It's Working

1. Open http://localhost:5173
2. You should see the NextGen landing page
3. Click "Get Started" → Sign Up
4. Choose your role (Candidate or Interviewer)
5. Start using the app!

## 🐛 Troubleshooting

**"PostgreSQL connection error"**
- Make sure you added `DATABASE_URL` or `POSTGRES_URL` to `backend/.env`
- Verify the connection string is correct
- Check that PostgreSQL/Supabase is accessible

**"Port 5000 already in use"**
- Change `PORT=5000` to `PORT=5001` in `backend/.env`
- Update `VITE_BASE_URL=http://localhost:5001` in `frontend/.env`

**"Firebase auth error"**
- Verify all Firebase variables in `frontend/.env` are correct
- Check Firebase console → Authentication is enabled
- Ensure Email/Password and Google sign-in are enabled

**Backend won't start?**
- Check `backend/.env` has all required variables
- Verify Node.js version: `node --version` (should be 18+)
- Check for errors in terminal

## 📚 Need More Help?

- **Detailed Setup:** See `SETUP.md`
- **Quick Start:** See `QUICKSTART.md`
- **Troubleshooting:** Check the error messages in terminal

---

**Ready to start?** Add PostgreSQL connection to `backend/.env` and run `start-app.bat` or use the manual commands above!
