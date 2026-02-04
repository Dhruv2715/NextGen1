# NextGen - AI Technical Assessment Portal

NextGen is a sophisticated, dual-portal technical assessment platform designed to streamline the hiring process for both interviewers and candidates. Built with a modern tech stack, it provides data-driven insights, real-time assessment tracking, and a premium user experience.

## 🚀 Key Features

### For Interviewers
- **Dedicated Job Management**: A centralized hub to create, edit, and track job listings and participant counts.
- **Advanced Analytics**: Visual insights into hiring funnels, skill demand trends, and placement rates.
- **Real-time Status Control**: Easily toggle job postings between Active and Inactive states.
- **Search & Filtering**: Powerful tools to manage large pipelines of applications.

### For Candidates
- **Discovery Dashboard**: A streamlined interface to find relevant job opportunities with real-time search.
- **Application Tracking**: A dedicated workspace to monitor the status of ongoing and completed assessments.
- **Resume Builder**: A personalized profile management tool to highlight technical expertise.
- **Practice Arena**: Integrated tools to sharpen coding skills before live assessments.

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS (for custom visuals), Lucide Icons, React Router.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Authentication**: JWT-based secure role-based access control.

## 📦 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB connection string

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Dhruv2715/NextGen1.git
   ```
2. Install dependencies for both folders:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Set up your `.env` in the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   GEMINI_API_KEY=your_gen_ai_key
   ```
4. Run the development environment:
   ```bash
   # From root
   npm start
   ```

## 🎨 Branding & Design
NextGen features a premium "Glassmorphism" aesthetic with vibrant gradients and smooth micro-animations, ensuring a state-of-the-art feel for both recruiters and talent.

---
*Developed with focus on visual excellence and scalability.*
