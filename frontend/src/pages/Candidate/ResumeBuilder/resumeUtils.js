import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const STORAGE_KEY = 'nextgen_resume_data';

// ─── localStorage helpers ──────────────────────────────────────────────────────

export const saveResumeToLocalStorage = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Failed to save resume data:', e);
    }
};

export const loadResumeFromLocalStorage = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.warn('Failed to load resume data:', e);
        return null;
    }
};

export const clearResumeFromLocalStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
};

// ─── PDF Export ─────────────────────────────────────────────────────────────────

export const exportToPDF = async (elementRef, fileName = 'Resume.pdf') => {
    if (!elementRef) return;
    const el = elementRef;

    // Temporarily force light styling for PDF
    el.classList.add('pdf-export-mode');

    const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: el.scrollWidth,
        height: el.scrollHeight,
    });

    el.classList.remove('pdf-export-mode');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
    }

    pdf.save(fileName);
};

// ─── Default resume data (pre-filled from user context) ────────────────────────

export const getDefaultResumeData = (user) => ({
    personalInfo: {
        fullName: user?.name || '',
        email: user?.email || '',
        phone: '',
        location: '',
        linkedin: '',
        portfolio: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    template: 'modern',
    accentColor: '#2563eb',
});

// ─── Professional Sample Resume ────────────────────────────────────────────────

export const getSampleResumeData = () => ({
    personalInfo: {
        fullName: 'Aditya Sharma',
        email: 'aditya.sharma@email.com',
        phone: '+91 98765 43210',
        location: 'Bangalore, India',
        linkedin: 'linkedin.com/in/adityasharma',
        portfolio: 'adityasharma.dev',
    },
    summary:
        'Results-driven Full-Stack Software Engineer with 4+ years of experience designing and delivering scalable web applications. Passionate about clean architecture, developer experience, and building products that solve real-world problems. Proven track record of reducing page load times by 40% and leading cross-functional teams of 6+ engineers.',
    experience: [
        {
            id: crypto.randomUUID(),
            company: 'Flipkart',
            title: 'Senior Software Engineer',
            startDate: '2024-01',
            endDate: '',
            current: true,
            location: 'Bangalore, India',
            description: [
                'Architected and launched a real-time order tracking microservice handling 50K+ concurrent WebSocket connections',
                'Reduced checkout page load time by 40% through code-splitting, lazy loading, and CDN optimisation',
                'Mentored a team of 4 junior engineers, conducting weekly code reviews and design discussions',
                'Built an internal A/B testing dashboard using React and D3.js, adopted by 3 product teams',
            ],
        },
        {
            id: crypto.randomUUID(),
            company: 'Razorpay',
            title: 'Software Engineer',
            startDate: '2022-03',
            endDate: '2023-12',
            current: false,
            location: 'Bangalore, India',
            description: [
                'Developed and maintained payment gateway APIs processing ₹200Cr+ in monthly transactions',
                'Implemented PCI-DSS compliant tokenization service, reducing data-breach risk surface by 60%',
                'Collaborated with designers to rebuild the merchant dashboard using Next.js and Tailwind CSS',
                'Wrote comprehensive integration tests achieving 92% code coverage across 3 core services',
            ],
        },
        {
            id: crypto.randomUUID(),
            company: 'TCS Digital',
            title: 'Software Developer Intern',
            startDate: '2021-06',
            endDate: '2022-02',
            current: false,
            location: 'Hyderabad, India',
            description: [
                'Built an internal employee analytics dashboard using React, Node.js, and PostgreSQL',
                'Automated weekly reporting pipeline, saving 10+ hours/week of manual data processing',
            ],
        },
    ],
    education: [
        {
            id: crypto.randomUUID(),
            institution: 'Indian Institute of Technology, Delhi',
            degree: "Bachelor of Technology",
            field: 'Computer Science & Engineering',
            startDate: '2018-08',
            endDate: '2022-05',
            gpa: '8.7 / 10',
        },
        {
            id: crypto.randomUUID(),
            institution: 'Delhi Public School, R.K. Puram',
            degree: 'Senior Secondary (XII)',
            field: 'PCM with Computer Science',
            startDate: '2016-04',
            endDate: '2018-03',
            gpa: '96.4%',
        },
    ],
    skills: [
        'JavaScript', 'TypeScript', 'React.js', 'Next.js', 'Node.js',
        'Express.js', 'Python', 'MongoDB', 'PostgreSQL', 'Redis',
        'Docker', 'Kubernetes', 'AWS (EC2, S3, Lambda)', 'Git',
        'REST APIs', 'GraphQL', 'CI/CD', 'System Design',
        'Tailwind CSS', 'Figma',
    ],
    projects: [
        {
            id: crypto.randomUUID(),
            name: 'DevFlow — Developer Productivity Platform',
            description:
                'A full-stack SaaS platform for engineering teams to track code velocity, PR review times, and sprint burndown charts. Features real-time dashboards, Slack integration, and GitHub webhook processing.',
            techStack: 'Next.js, TypeScript, Prisma, PostgreSQL, Redis, Chart.js',
            link: 'github.com/adityasharma/devflow',
        },
        {
            id: crypto.randomUUID(),
            name: 'SnapTranslate — Real-Time Image Translator',
            description:
                'Mobile-first PWA that captures text from images using OCR and translates it to 40+ languages in real-time. Achieved 95% accuracy on handwritten text using fine-tuned Tesseract models.',
            techStack: 'React Native, TensorFlow.js, Google Cloud Vision API, Firebase',
            link: 'github.com/adityasharma/snaptranslate',
        },
    ],
    certifications: [
        {
            id: crypto.randomUUID(),
            name: 'AWS Certified Solutions Architect – Associate',
            issuer: 'Amazon Web Services',
            date: '2024-06',
            link: 'credly.com/badges/aws-sa-aditya',
        },
        {
            id: crypto.randomUUID(),
            name: 'Meta Front-End Developer Professional Certificate',
            issuer: 'Meta (Coursera)',
            date: '2023-09',
            link: 'coursera.org/verify/meta-fed-aditya',
        },
    ],
    languages: [
        { id: crypto.randomUUID(), language: 'English', proficiency: 'Native / Bilingual' },
        { id: crypto.randomUUID(), language: 'Hindi', proficiency: 'Native' },
        { id: crypto.randomUUID(), language: 'Japanese', proficiency: 'Beginner (JLPT N5)' },
    ],
    template: 'modern',
    accentColor: '#2563eb',
});

// ─── Accent color palette ──────────────────────────────────────────────────────

export const ACCENT_COLORS = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Violet', value: '#7c3aed' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Amber', value: '#d97706' },
    { name: 'Slate', value: '#475569' },
    { name: 'Teal', value: '#0d9488' },
];

// ─── Template list ─────────────────────────────────────────────────────────────

export const TEMPLATES = [
    { id: 'classic', name: 'Classic', description: 'Traditional and clean' },
    { id: 'modern', name: 'Modern', description: 'Bold and contemporary' },
    { id: 'minimal', name: 'Minimal', description: 'Sleek and subtle' },
];
