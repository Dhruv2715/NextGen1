# NextGen Project Gantt Chart

This chart outlines the development timeline for the **NextGen AI Technical Assessment Portal**, starting from the internship commencement on **January 1st, 2026**, through to completion in **April 2026**.

## Team Responsibilities

| Name | Role | Focus Areas |
| :--- | :--- | :--- |
| **Dhruv** | Fullstack & Backend Lead | Backend Architecture, DB Design, AI Logic, Authentication |
| **Ankit** | Frontend Developer | UI/UX Design, Dashboards, Client-side Components |

---

## Project Timeline (Detailed)

```mermaid
gantt
    title NextGen Project Development Roadmap (2026)
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d
    
    section Foundation
    Project Initialization (Dhruv)     :done, f1, 2026-01-01, 2026-01-05
    Infrastructure Setup (Dhruv)       :done, f2, 2026-01-06, 2026-01-10
    UI/UX Design Systems (Ankit)       :done, f3, 2026-01-01, 2026-01-15
    Component Library Setup (Ankit)    :done, f4, 2026-01-10, 2026-01-20

    section Phase 1: Core Systems (Jan 31)
    Database Architecture (Dhruv)      :done, a1, 2026-01-11, 2026-01-18
    Security & JWT Integration (Dhruv) :done, a2, 2026-01-19, 2026-01-25
    Interviewer API Endpoints (Dhruv) :done, a3, 2026-01-26, 2026-01-30
    Registration & Login UI (Ankit)    :done, a4, 2026-01-16, 2026-01-25
    Public Landing Pages (Ankit)       :done, a5, 2026-01-26, 2026-01-31
    *Reporting Milestone 1*: milestone, 2026-01-31, 0d
    
    section Phase 2: Management (Feb 7)
    Job Persistence Layer (Dhruv)      :active, b1, 2026-02-01, 2026-02-04
    Assessment Logic Controller (Dhruv):active, b2, 2026-02-04, 2026-02-07
    Job Creation Dashboard (Ankit)    :active, b3, 2026-02-01, 2026-02-05
    Search & Filter Modules (Ankit)   :active, b4, 2026-02-05, 2026-02-07
    *Reporting Milestone 2*: milestone, 2026-02-07, 0d
    
    section Phase 3: Advanced Portals
    Interviewer CRM Backend (Dhruv)    : c1, 2026-02-08, 2026-02-28
    AI Scoring Engine (Dhruv)          : c2, 2026-03-01, 2026-03-20
    Analytics Middleware (Dhruv)       : c3, 2026-03-21, 2026-03-31
    Dashboard Visualizations (Ankit)   : c4, 2026-02-08, 2026-03-10
    Resume Parsing UI (Ankit)         : c5, 2026-03-11, 2026-03-25
    Candidate Practice Arena (Ankit)  : c6, 2026-03-26, 2026-04-10
    
    section Phase 4: Finalization
    System Integration (Both)          : d1, 2026-04-11, 2026-04-20
    Beta Testing & Debugging (Both)    : d2, 2026-04-21, 2026-04-25
    Final Presentation Prep (Both)     : d3, 2026-04-26, 2026-04-30
    *Project Launch*: milestone, 2026-04-30, 0d
```

## � How to add this to Google Sheets or Google Slides

Since Google Sheets and Slides have limited support for SVG, use the **PNG** format for the best results:

1.  **Generate High-Quality PNG**:
    *   Go to [Mermaid.live](https://mermaid.live).
    *   Paste the code from this file.
    *   Click **Actions** > **Download PNG**.
2.  **Insert into Google Sheets**:
    *   Go to **Insert** > **Image** > **Image over cells**.
    *   Upload the PNG you just downloaded.
3.  **Insert into Google Slides**:
    *   Go to **Insert** > **Image** > **Upload from computer**.
    *   Select your PNG file.
4.  **Quickest Way (Copy/Paste)**:
    *   In the Mermaid Live editor, right-click the rendered chart image.
    *   Select **Copy Image**.
    *   Go to your Google Sheet or Slide and press **Ctrl + V** to paste it directly.

> [!NOTE]
> The timeline highlights key reporting milestones on **January 31st** and **February 7th** as assigned by your mentor.
