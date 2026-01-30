# 🚀 Server Status Check

## What to Look For

### ✅ Backend Server (First PowerShell Window)

**Good Signs:**
```
> backend@1.0.0 dev
> nodemon server.js

[nodemon] starting `node server.js`
PostgreSQL connected          ← ✅ This means database is working!
Server running on port 5000   ← ✅ Server is ready!
```

**If you see errors:**
- `Error: connect ECONNREFUSED` → Database connection issue
- `Error: relation "users" does not exist` → Schema not run
- `Port 5000 already in use` → Change PORT in .env

### ✅ Frontend Server (Second PowerShell Window)

**Good Signs:**
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/    ← ✅ Ready to use!
➜  Network: use --host to expose
```

**If you see errors:**
- `Failed to resolve import` → Run `npm install` in frontend
- `Port 5173 already in use` → Close other apps using that port

## 🎯 Next Steps

1. **Wait for both servers to start** (about 10-15 seconds)

2. **Open your browser:**
   - Go to: **http://localhost:5173**
   - You should see the NextGen landing page

3. **Test the app:**
   - Click "Get Started"
   - Sign up (choose Candidate or Interviewer role)
   - Start using the app!

## 🐛 Troubleshooting

### Backend won't connect to database?
- Check `POSTGRES_URL` in `backend/.env` is correct
- Verify Supabase project is active
- Make sure you replaced `[YOUR-PASSWORD]` with actual password

### Frontend can't connect to backend?
- Check `VITE_BASE_URL=http://localhost:5000` in `frontend/.env`
- Make sure backend is running on port 5000
- Check for CORS errors in browser console

### Need to stop servers?
- Close the PowerShell windows
- Or press `Ctrl + C` in each window

## 📞 Quick Health Check

**Backend Health:**
- Visit: http://localhost:5000/health
- Should return JSON with status: "OK"

**Frontend:**
- Visit: http://localhost:5173
- Should show NextGen landing page

---

**Servers are running! Open http://localhost:5173 to start using NextGen! 🎉**
