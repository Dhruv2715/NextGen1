import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    RotateCcw,
    Sparkles,
    Eye,
    Palette,
    LayoutTemplate,
    FileText,
    ChevronDown,
    Check,
    Printer,
    Trash2,
    BookOpen,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { UserContext } from '../../context/userContext';
import ResumeFormSections from './ResumeBuilder/ResumeFormSections';
import ResumePreview from './ResumeBuilder/ResumeTemplates';
import {
    saveResumeToLocalStorage,
    loadResumeFromLocalStorage,
    clearResumeFromLocalStorage,
    exportToPDF,
    getDefaultResumeData,
    getSampleResumeData,
    ACCENT_COLORS,
    TEMPLATES,
} from './ResumeBuilder/resumeUtils';
import toast from 'react-hot-toast';

const CandidateResume = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const previewRef = useRef(null);

    // ─── State ────────────────────────────────────────────────────────────────
    const [resumeData, setResumeData] = useState(() => {
        const saved = loadResumeFromLocalStorage();
        return saved || getDefaultResumeData(user);
    });
    const [activeView, setActiveView] = useState('editor'); // 'editor' | 'preview' (mobile toggle)
    const [showTemplateMenu, setShowTemplateMenu] = useState(false);
    const [showColorMenu, setShowColorMenu] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // ─── Auto-save to localStorage ────────────────────────────────────────────
    useEffect(() => {
        const timeout = setTimeout(() => {
            saveResumeToLocalStorage(resumeData);
        }, 500);
        return () => clearTimeout(timeout);
    }, [resumeData]);

    // ─── Export handler ───────────────────────────────────────────────────────
    const handleExportPDF = useCallback(async () => {
        if (!previewRef.current) {
            toast.error('Preview not available');
            return;
        }
        setIsExporting(true);
        try {
            const name = resumeData.personalInfo.fullName || 'Resume';
            await exportToPDF(previewRef.current, `${name.replace(/\s+/g, '_')}_Resume.pdf`);
            toast.success('PDF downloaded successfully!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to export PDF');
        } finally {
            setIsExporting(false);
        }
    }, [resumeData.personalInfo.fullName]);

    // ─── Print handler ────────────────────────────────────────────────────────
    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    // ─── Load sample resume ───────────────────────────────────────────────────
    const handleLoadSample = useCallback(() => {
        const sample = getSampleResumeData();
        setResumeData(sample);
        toast.success('Sample resume loaded! Feel free to edit it.');
    }, []);

    // ─── Reset ────────────────────────────────────────────────────────────────
    const handleReset = useCallback(() => {
        if (window.confirm('Are you sure? This will clear all resume data.')) {
            clearResumeFromLocalStorage();
            setResumeData(getDefaultResumeData(user));
            toast.success('Resume cleared');
        }
    }, [user]);

    // ─── Template & color handlers ────────────────────────────────────────────
    const setTemplate = (id) => {
        setResumeData((prev) => ({ ...prev, template: id }));
        setShowTemplateMenu(false);
    };

    const setAccentColor = (color) => {
        setResumeData((prev) => ({ ...prev, accentColor: color }));
        setShowColorMenu(false);
    };

    const currentTemplate = TEMPLATES.find((t) => t.id === resumeData.template) || TEMPLATES[1];

    return (
        <DashboardLayout>
            {/* ─── Top Header ────────────────────────────────────────────── */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/candidate/dashboard')}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4 font-medium text-sm"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="w-full xl:w-auto">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                            <FileText size={28} className="text-blue-600" />
                            Resume Builder
                        </h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400 font-medium text-xs sm:text-sm">
                            Craft a professional resume that stands out. Auto-saved as you type.
                        </p>
                    </div>

                    {/* ─── Action Buttons ────────────────────────────────── */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                        {/* Load Sample */}
                        <button
                            onClick={handleLoadSample}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                        >
                            <BookOpen size={16} /> Load Sample
                        </button>

                        {/* Template Selector */}
                        <div className="relative flex-1 sm:flex-none">
                            <button
                                onClick={() => { setShowTemplateMenu(!showTemplateMenu); setShowColorMenu(false); }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/15 transition-all"
                            >
                                <LayoutTemplate size={16} />
                                <span className="truncate max-w-[80px]">{currentTemplate.name}</span>
                                <ChevronDown size={14} />
                            </button>
                            {/* ... (Menu logic remains same) */}
                            {showTemplateMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 shadow-xl z-50 overflow-hidden">
                                    {TEMPLATES.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTemplate(t.id)}
                                            className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                                                t.id === resumeData.template ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                            }`}
                                        >
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white">{t.name}</div>
                                                <div className="text-[10px] text-gray-500">{t.description}</div>
                                            </div>
                                            {t.id === resumeData.template && <Check size={16} className="text-blue-600" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Color Picker */}
                        <div className="relative">
                            <button
                                onClick={() => { setShowColorMenu(!showColorMenu); setShowTemplateMenu(false); }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/15 transition-all"
                            >
                                <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: resumeData.accentColor }} />
                                <Palette size={16} />
                            </button>
                            {showColorMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 shadow-xl z-50 p-3">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Accent Color</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {ACCENT_COLORS.map((c) => (
                                            <button
                                                key={c.value}
                                                onClick={() => setAccentColor(c.value)}
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${
                                                    c.value === resumeData.accentColor ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                                                }`}
                                                style={{ backgroundColor: c.value }}
                                                title={c.name}
                                            >
                                                {c.value === resumeData.accentColor && <Check size={14} className="text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Print */}
                        <button
                            onClick={handlePrint}
                            className="p-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-white/15 transition-all"
                            title="Print"
                        >
                            <Printer size={16} />
                        </button>

                        {/* Reset */}
                        <button
                            onClick={handleReset}
                            className="p-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 transition-all"
                            title="Clear All"
                        >
                            <Trash2 size={16} />
                        </button>

                        {/* Download PDF */}
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs sm:text-sm font-bold rounded-xl hover:bg-black dark:hover:bg-gray-100 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            <Download size={16} />
                            <span className="whitespace-nowrap">{isExporting ? 'Exporting…' : 'Download PDF'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Mobile View Toggle ────────────────────────────────────── */}
            <div className="flex lg:hidden mb-4 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
                <button
                    onClick={() => setActiveView('editor')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        activeView === 'editor'
                            ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500'
                    }`}
                >
                    <FileText size={16} /> Editor
                </button>
                <button
                    onClick={() => setActiveView('preview')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        activeView === 'preview'
                            ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500'
                    }`}
                >
                    <Eye size={16} /> Preview
                </button>
            </div>

            {/* ─── Main Content: Editor + Preview ────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-6 pb-8">
                {/* Left: Section Editor */}
                <div className={`w-full lg:w-[48%] xl:w-[45%] flex-shrink-0 ${activeView === 'preview' ? 'hidden lg:block' : ''}`}>
                    <ResumeFormSections
                        resumeData={resumeData}
                        setResumeData={setResumeData}
                    />
                </div>

                {/* Right: Live Preview */}
                <div className={`w-full lg:flex-1 ${activeView === 'editor' ? 'hidden lg:block' : ''}`}>
                    <div className="sticky top-20">
                        {/* Preview label */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Eye size={14} className="text-gray-400" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Preview</span>
                            </div>
                            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles size={10} /> Auto-saved
                            </span>
                        </div>

                        {/* A4 Preview Container */}
                        <div className="bg-gray-100 dark:bg-white/5 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-white/10">
                            <div
                                className="bg-white shadow-2xl rounded-lg overflow-hidden mx-auto"
                                style={{
                                    width: '100%',
                                    maxWidth: '595px', // A4 width at 72 DPI
                                    aspectRatio: '1 / 1.414', // A4 ratio
                                }}
                            >
                                <div
                                    className="w-full h-full overflow-y-auto custom-scrollbar"
                                    style={{ transformOrigin: 'top left' }}
                                >
                                    <div className="p-6" ref={previewRef}>
                                        <ResumePreview
                                            data={resumeData}
                                            template={resumeData.template}
                                            accentColor={resumeData.accentColor}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Close dropdowns on click outside ──────────────────────── */}
            {(showTemplateMenu || showColorMenu) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => { setShowTemplateMenu(false); setShowColorMenu(false); }}
                />
            )}

            {/* ─── Print styles ──────────────────────────────────────────── */}
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    .resume-preview-container, .resume-preview-container * {
                        visibility: visible !important;
                    }
                    .resume-preview-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
                .pdf-export-mode {
                    background: white !important;
                    color: #111827 !important;
                }
                .pdf-export-mode * {
                    color: inherit !important;
                }
                .pdf-page {
                    page-break-after: auto;
                }
            `}</style>
        </DashboardLayout>
    );
};

export default CandidateResume;
