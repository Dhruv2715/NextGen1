# 🗄️ Detailed Supabase Setup Guide for NextGen

## Step-by-Step Instructions

### Step 1: Create a Supabase Account

1. **Go to Supabase**
   - Open your web browser
   - Navigate to: **https://supabase.com**
   - Click **"Start your project"** or **"Sign in"** (top right)

2. **Sign Up / Sign In**
   - If you don't have an account:
     - Click **"Sign Up"**
     - You can sign up with:
       - GitHub account (recommended - easiest)
       - Google account
       - Email and password
   - If you already have an account:
     - Click **"Sign In"**
     - Enter your credentials

### Step 2: Create a New Project

1. **Access Your Dashboard**
   - After signing in, you'll see your Supabase dashboard
   - If you don't have any projects, you'll see a welcome screen

2. **Create New Project**
   - Click the **"New Project"** button (usually a green button)
   - Or click **"Create a new project"** from the dashboard

3. **Fill in Project Details**
   
   **Organization:**
   - Select an organization (or create one if needed)
   - Organization name can be anything (e.g., "My Projects")

   **Project Details:**
   - **Name:** Enter a name for your project
     - Example: `nextgen-app` or `nextgen-dev`
   - **Database Password:** 
     - **IMPORTANT:** Create a strong password (12+ characters)
     - **WRITE THIS DOWN** - you'll need it for the connection string
     - Example: `MySecurePass123!@#`
   - **Region:** 
     - Choose the region closest to you for better performance
     - Examples: `US East`, `US West`, `Europe West`, `Asia Southeast`
   - **Pricing Plan:** 
     - Select **"Free"** (more than enough for development)
   
4. **Create Project**
   - Click **"Create new project"** button
   - ⏳ **Wait 2-3 minutes** - Supabase is setting up your database
   - You'll see a loading screen with progress

### Step 3: Access SQL Editor

1. **Navigate to SQL Editor**
   - Once your project is ready, you'll be in the project dashboard
   - In the left sidebar, look for **"SQL Editor"** (usually has a database icon)
   - Click on **"SQL Editor"**

2. **Create New Query**
   - In the SQL Editor page, you'll see:
     - Left side: List of saved queries (if any)
     - Right side: SQL query editor
   - Click **"+ New query"** button (top right)

### Step 4: Run the Database Schema

1. **Open the Schema File**
   - On your computer, navigate to: `D:\NextGen1\backend\database\`
   - Open the file: `schema.sql`
   - You can open it with:
     - Notepad
     - VS Code
     - Any text editor

2. **Copy the Entire Schema**
   - Press `Ctrl + A` to select all
   - Press `Ctrl + C` to copy
   - The file should be about 70-80 lines long

3. **Paste into Supabase SQL Editor**
   - Go back to your Supabase SQL Editor (in browser)
   - Click in the query editor area (the big text box)
   - Press `Ctrl + V` to paste the entire schema
   
   **You should see SQL commands like:**
   ```sql
   CREATE TABLE IF NOT EXISTS users (
       id SERIAL PRIMARY KEY,
       email VARCHAR(255) UNIQUE NOT NULL,
       ...
   ```

4. **Run the Schema**
   - Look for the **"Run"** button (usually in the bottom right)
   - Or press `Ctrl + Enter` (Windows) or `Cmd + Enter` (Mac)
   - Wait a few seconds for it to execute

5. **Verify Success**
   - You should see a success message like:
     - ✅ "Success. No rows returned"
     - ✅ "Query executed successfully"
   - If you see errors, don't worry - some tables might already exist, that's okay

### Step 5: Get Your Connection String

1. **Navigate to Settings**
   - In the left sidebar, click on the **"Settings"** icon (gear icon ⚙️)
   - Click on **"Database"** (under Project Settings)

2. **Find Connection String**
   - Scroll down to the section **"Connection string"**
   - You'll see different connection string formats
   - Look for the tab that says **"URI"** (not "JDBC" or "Golang")

3. **Copy the Connection String**
   - Click on the **"URI"** tab
   - You'll see a connection string that looks like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```
   - Click the **copy icon** (📋) next to it
   - **OR** select the entire string and press `Ctrl + C`

4. **Replace Password in Connection String**
   - The connection string will have `[YOUR-PASSWORD]` placeholder
   - Replace `[YOUR-PASSWORD]` with the **actual password** you set in Step 2
   - Example:
     ```
     Before: postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     After:  postgresql://postgres:MySecurePass123!@#@db.xxxxx.supabase.co:5432/postgres
     ```
   - Make sure there are **no spaces** in the password when pasting

### Step 6: Add to Your .env File

1. **Open backend/.env File**
   - Navigate to: `D:\NextGen1\backend\`
   - Open the file: `.env`
   - Use Notepad, VS Code, or any text editor

2. **Add the Connection String**
   - Scroll to the bottom of the file (or find an empty line)
   - Add this line:
     ```
     POSTGRES_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xxxxx.supabase.co:5432/postgres
     ```
   - **Replace** `YOUR_ACTUAL_PASSWORD` with your actual Supabase password
   - **Replace** `db.xxxxx.supabase.co` with your actual Supabase database host
   
   **Example:**
   ```
   POSTGRES_URL=postgresql://postgres:MySecurePass123!@#@db.abcdefghijk.supabase.co:5432/postgres
   ```

3. **Important Notes:**
   - Make sure there are **no quotes** around the connection string
   - Make sure there's **no space** before or after the `=`
   - If your password has special characters (like `!@#`), they should be included as-is
   - Save the file (`Ctrl + S`)

4. **Your backend/.env should now look something like:**
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=qwertyuiopasdfghjklzxcvbnm
   GEMINI_API_KEY=AIzaSyA7-qGLSIpR6Jj2RNUMKDlHvDqCz0FvvqA
   CLOUDINARY_CLOUD_NAME=ddduz1ore
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   
   # Add this new line:
   POSTGRES_URL=postgresql://postgres:YourPassword@db.xxxxx.supabase.co:5432/postgres
   ```

### Step 7: Verify the Setup

1. **Test the Connection**
   - Let's verify everything is working
   - We'll test when we start the backend server

2. **Check Your .env File Format**
   - Make sure there are no syntax errors
   - Each line should have `KEY=value` format
   - No extra spaces or characters

### Step 8: Verify Tables Were Created

1. **Go Back to Supabase Dashboard**
   - In the left sidebar, click **"Table Editor"**

2. **Check for Tables**
   - You should see these tables listed:
     - ✅ `users`
     - ✅ `jobs`
     - ✅ `interviews`
     - ✅ `transcripts`

3. **If Tables Don't Appear:**
   - Go back to SQL Editor
   - Click the "Refresh" button
   - Or re-run the schema.sql file

## ✅ Completion Checklist

Before proceeding, make sure:

- [ ] ✅ Created Supabase account
- [ ] ✅ Created new project
- [ ] ✅ Ran `schema.sql` in SQL Editor
- [ ] ✅ Copied connection string from Settings → Database
- [ ] ✅ Added `POSTGRES_URL=...` to `backend/.env`
- [ ] ✅ Verified tables exist in Table Editor
- [ ] ✅ Saved the `.env` file

## 🚀 Next Steps

Once you've completed the above steps:

1. **Start the Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Look for this message:**
   ```
   PostgreSQL connected
   Server running on port 5000
   ```

3. **If you see "PostgreSQL connected"** → ✅ Success!
4. **If you see connection errors** → Check the connection string format

## 🐛 Troubleshooting

### Problem: "Connection string not found"
**Solution:** Make sure you're on the "URI" tab in Settings → Database

### Problem: "Password authentication failed"
**Solution:** 
- Check that you replaced `[YOUR-PASSWORD]` with your actual password
- Make sure there are no extra spaces
- Try copying the connection string again

### Problem: "Tables already exist" error
**Solution:** This is okay! The `IF NOT EXISTS` clause prevents errors. Your tables should still be created.

### Problem: "Connection refused" or timeout
**Solution:**
- Check your internet connection
- Verify the database host address is correct
- Make sure your project status is "Active" in Supabase

### Problem: "relation does not exist"
**Solution:**
- Go back to SQL Editor and re-run the schema.sql
- Make sure all SQL statements executed successfully

## 📝 Quick Reference

**Supabase Dashboard:** https://supabase.com/dashboard

**Your Project URL:** `https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]`

**SQL Editor:** Left sidebar → SQL Editor

**Database Settings:** Left sidebar → Settings → Database

**Connection String Format:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

---

**Once you've completed these steps, you're ready to run NextGen! 🎉**
