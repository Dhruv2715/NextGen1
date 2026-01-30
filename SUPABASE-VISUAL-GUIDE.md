# 📸 Supabase Setup - Visual Guide

This guide shows you exactly where to click in Supabase.

## Navigation Map

```
Supabase Dashboard
│
├── 📊 Dashboard (home page)
├── 🗄️ Table Editor (see your tables)
├── 📝 SQL Editor (run SQL commands) ← YOU NEED THIS
├── ⚙️ Settings
│   ├── General
│   ├── API
│   └── Database ← YOU NEED THIS (for connection string)
├── 🔐 Authentication
└── ... other options
```

## Step-by-Step Visual Guide

### 1️⃣ Sign Up / Sign In
**Location:** Top right corner of https://supabase.com

**What you'll see:**
- Button: "Start your project" or "Sign in"
- Click it

---

### 2️⃣ Create Project
**After signing in, you'll see:**

**On Dashboard:**
- Big green button: **"+ New Project"**
- OR text link: "Create a new project"
- Click it

**Project Creation Form:**
```
┌─────────────────────────────────────┐
│ Create a new project                │
├─────────────────────────────────────┤
│ Organization: [Select/Create]       │
│ Name: [Enter: nextgen-app]          │
│ Database Password: [Create strong]  │ ← IMPORTANT!
│ Region: [Choose closest]            │
│ Pricing Plan: [Free]                │
│                                     │
│ [Cancel]  [Create new project]     │ ← Click here
└─────────────────────────────────────┘
```

---

### 3️⃣ SQL Editor Location
**After project is created:**

**Left Sidebar:**
```
Dashboard
Table Editor
SQL Editor  ← CLICK HERE
Settings
Authentication
Storage
...
```

**What SQL Editor looks like:**
```
┌────────────────────────────────────────────┐
│ SQL Editor                    [+ New query]│
├──────────────────────┬─────────────────────┤
│ Saved Queries        │ Query Editor        │
│ (empty at first)     │                     │
│                      │ [Empty text area]   │
│                      │                     │
│                      │                     │
│                      │ [Run] [Save]        │
└──────────────────────┴─────────────────────┘
```

**Click: "+ New query"** button

---

### 4️⃣ Run Schema
**In SQL Editor:**

**Step A:** Paste the entire content of `backend/database/schema.sql`

**You should see:**
```sql
-- NextGen Database Schema for PostgreSQL/Supabase

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    ...
```

**Step B:** Click the **"Run"** button (bottom right)
- OR press `Ctrl + Enter`

**Success Message:**
```
✅ Success. No rows returned
Query executed in 234ms
```

---

### 5️⃣ Get Connection String
**Location:** Settings → Database

**Navigation:**
```
Left Sidebar
└── ⚙️ Settings (gear icon)
    └── Database (under "Project Settings")
```

**What you'll see:**
```
┌────────────────────────────────────────────┐
│ Database                                   │
├────────────────────────────────────────────┤
│ Connection string                          │
│                                            │
│ [URI] [JDBC] [Golang] [Node.js] [Python]  │ ← Click "URI"
│                                            │
│ postgresql://postgres:                     │
│ [YOUR-PASSWORD]@db.xxxxx.supabase.co:     │
│ 5432/postgres                              │
│                                            │
│ [Copy]  📋                                 │ ← Click copy icon
└────────────────────────────────────────────┘
```

**Action:**
1. Click **"URI"** tab
2. Click the **copy icon** (📋) next to the connection string
3. The string will look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

**Important:** Replace `[YOUR-PASSWORD]` with your actual database password!

---

### 6️⃣ Verify Tables
**Location:** Table Editor

**Navigation:**
```
Left Sidebar
└── 🗄️ Table Editor
```

**What you should see:**
```
┌────────────────────────────────────────────┐
│ Table Editor                               │
├────────────────────────────────────────────┤
│ 📋 users          [3 columns] [View table] │
│ 📋 jobs           [6 columns] [View table] │
│ 📋 interviews     [10 columns] [View table]│
│ 📋 transcripts    [5 columns] [View table] │
└────────────────────────────────────────────┘
```

If you see these 4 tables, ✅ **Success!**

---

## 🎯 Quick Actions Checklist

**Do this in order:**

1. [ ] Go to https://supabase.com
2. [ ] Sign in / Sign up
3. [ ] Click "+ New Project"
4. [ ] Fill form → Click "Create new project"
5. [ ] Wait for project to finish loading
6. [ ] Click "SQL Editor" in left sidebar
7. [ ] Click "+ New query"
8. [ ] Open `D:\NextGen1\backend\database\schema.sql` on your computer
9. [ ] Copy ALL content (Ctrl+A, Ctrl+C)
10. [ ] Paste into Supabase SQL Editor (Ctrl+V)
11. [ ] Click "Run" button (or Ctrl+Enter)
12. [ ] See ✅ Success message
13. [ ] Click "Settings" → "Database" in left sidebar
14. [ ] Click "URI" tab
15. [ ] Copy the connection string (click 📋 icon)
16. [ ] Replace `[YOUR-PASSWORD]` with your actual password
17. [ ] Open `D:\NextGen1\backend\.env`
18. [ ] Add line: `POSTGRES_URL=your-connection-string-here`
19. [ ] Save the file
20. [ ] Click "Table Editor" → Verify 4 tables exist
21. [ ] ✅ Done!

---

## 🔍 Finding Your Connection String Again

**If you need to get the connection string again:**

1. Supabase Dashboard → Your Project
2. Left Sidebar → ⚙️ Settings
3. Click "Database" (under Project Settings)
4. Scroll to "Connection string"
5. Click "URI" tab
6. Copy the string

**Remember:** Always replace `[YOUR-PASSWORD]` with your actual password!

---

## ⚠️ Common Mistakes to Avoid

❌ **Don't:**
- Use quotes around the connection string in .env
- Leave `[YOUR-PASSWORD]` as-is (must replace with actual password)
- Add spaces before/after the `=` in .env
- Copy from wrong tab (must be "URI" tab)

✅ **Do:**
- Copy the connection string exactly as shown
- Replace `[YOUR-PASSWORD]` with your real password
- Add `POSTGRES_URL=` directly in .env (no quotes)
- Test the connection after adding to .env

---

**Need help?** Check `SUPABASE-SETUP.md` for detailed text instructions.
