import React, { useState } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Plus,
    Trash2,
    GripVertical,
    User,
    AlignLeft,
    Briefcase,
    GraduationCap,
    Code2,
    FolderKanban,
    Award,
    Globe,
    X,
} from 'lucide-react';

/* ─── Shared helpers ────────────────────────────────────────────────────────── */

const SectionWrapper = ({ title, icon: Icon, isOpen, onToggle, children, count }) => (
    <div className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden transition-all">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
            <div className="flex items-center gap-3">
                <Icon size={18} className="text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-sm text-gray-900 dark:text-white">{title}</span>
                {count !== undefined && count > 0 && (
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {count}
                    </span>
                )}
            </div>
            {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {isOpen && <div className="px-5 py-4 space-y-4">{children}</div>}
    </div>
);

const InputField = ({ label, value, onChange, placeholder, type = 'text' }) => (
    <div>
        <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
        <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
        />
    </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows = 3 }) => (
    <div>
        <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
        <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all resize-none"
        />
    </div>
);

const AddButton = ({ onClick, label }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-all"
    >
        <Plus size={16} /> {label}
    </button>
);

const RemoveButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
        title="Remove"
    >
        <Trash2 size={14} />
    </button>
);

/* ─── 1. Personal Info ──────────────────────────────────────────────────────── */

export const PersonalInfoForm = ({ data, onChange }) => {
    const update = (field, value) => onChange({ ...data, [field]: value });

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label="Full Name" value={data.fullName} onChange={(v) => update('fullName', v)} placeholder="John Doe" />
                <InputField label="Email" value={data.email} onChange={(v) => update('email', v)} placeholder="john@example.com" type="email" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label="Phone" value={data.phone} onChange={(v) => update('phone', v)} placeholder="+91 98765 43210" />
                <InputField label="Location" value={data.location} onChange={(v) => update('location', v)} placeholder="Bangalore, India" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label="LinkedIn" value={data.linkedin} onChange={(v) => update('linkedin', v)} placeholder="linkedin.com/in/johndoe" />
                <InputField label="Portfolio / Website" value={data.portfolio} onChange={(v) => update('portfolio', v)} placeholder="johndoe.dev" />
            </div>
        </div>
    );
};

/* ─── 2. Summary ────────────────────────────────────────────────────────────── */

export const SummaryForm = ({ data, onChange }) => (
    <TextArea
        label="Professional Summary"
        value={data}
        onChange={onChange}
        placeholder="Results-driven software engineer with 4+ years of experience…"
        rows={4}
    />
);

/* ─── 3. Experience ─────────────────────────────────────────────────────────── */

export const ExperienceForm = ({ data, onChange }) => {
    const addExperience = () => {
        onChange([
            ...data,
            {
                id: crypto.randomUUID(),
                company: '',
                title: '',
                startDate: '',
                endDate: '',
                current: false,
                location: '',
                description: [''],
            },
        ]);
    };

    const updateItem = (idx, field, value) => {
        const updated = [...data];
        updated[idx] = { ...updated[idx], [field]: value };
        onChange(updated);
    };

    const removeItem = (idx) => onChange(data.filter((_, i) => i !== idx));

    const addBullet = (idx) => {
        const updated = [...data];
        updated[idx] = { ...updated[idx], description: [...updated[idx].description, ''] };
        onChange(updated);
    };

    const updateBullet = (expIdx, bulletIdx, value) => {
        const updated = [...data];
        const bullets = [...updated[expIdx].description];
        bullets[bulletIdx] = value;
        updated[expIdx] = { ...updated[expIdx], description: bullets };
        onChange(updated);
    };

    const removeBullet = (expIdx, bulletIdx) => {
        const updated = [...data];
        updated[expIdx] = {
            ...updated[expIdx],
            description: updated[expIdx].description.filter((_, i) => i !== bulletIdx),
        };
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            {data.map((exp, idx) => (
                <div key={exp.id} className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                            <GripVertical size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">
                                Experience #{idx + 1}
                            </span>
                        </div>
                        <RemoveButton onClick={() => removeItem(idx)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InputField label="Job Title" value={exp.title} onChange={(v) => updateItem(idx, 'title', v)} placeholder="Senior Software Engineer" />
                        <InputField label="Company" value={exp.company} onChange={(v) => updateItem(idx, 'company', v)} placeholder="Google" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <InputField label="Start Date" value={exp.startDate} onChange={(v) => updateItem(idx, 'startDate', v)} placeholder="2022-01" />
                        <InputField
                            label="End Date"
                            value={exp.current ? '' : exp.endDate}
                            onChange={(v) => updateItem(idx, 'endDate', v)}
                            placeholder={exp.current ? 'Present' : '2024-01'}
                        />
                        <div className="flex items-end pb-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={exp.current}
                                    onChange={(e) => updateItem(idx, 'current', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Current</span>
                            </label>
                        </div>
                    </div>
                    <InputField label="Location" value={exp.location} onChange={(v) => updateItem(idx, 'location', v)} placeholder="Bangalore, India" />

                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Key Achievements</label>
                        <div className="space-y-2">
                            {exp.description.map((bullet, bIdx) => (
                                <div key={bIdx} className="flex items-start gap-2">
                                    <span className="text-gray-400 mt-2.5 text-xs">•</span>
                                    <input
                                        type="text"
                                        value={bullet}
                                        onChange={(e) => updateBullet(idx, bIdx, e.target.value)}
                                        placeholder="Describe achievement or responsibility…"
                                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                                    />
                                    {exp.description.length > 1 && (
                                        <button onClick={() => removeBullet(idx, bIdx)} className="mt-1.5 text-gray-400 hover:text-red-500 transition-colors">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={() => addBullet(idx)} className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            <Plus size={12} /> Add bullet point
                        </button>
                    </div>
                </div>
            ))}
            <AddButton onClick={addExperience} label="Add Experience" />
        </div>
    );
};

/* ─── 4. Education ──────────────────────────────────────────────────────────── */

export const EducationForm = ({ data, onChange }) => {
    const addEducation = () => {
        onChange([
            ...data,
            { id: crypto.randomUUID(), institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' },
        ]);
    };

    const updateItem = (idx, field, value) => {
        const updated = [...data];
        updated[idx] = { ...updated[idx], [field]: value };
        onChange(updated);
    };

    const removeItem = (idx) => onChange(data.filter((_, i) => i !== idx));

    return (
        <div className="space-y-4">
            {data.map((edu, idx) => (
                <div key={edu.id} className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Education #{idx + 1}</span>
                        <RemoveButton onClick={() => removeItem(idx)} />
                    </div>
                    <InputField label="Institution" value={edu.institution} onChange={(v) => updateItem(idx, 'institution', v)} placeholder="Indian Institute of Technology, Delhi" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InputField label="Degree" value={edu.degree} onChange={(v) => updateItem(idx, 'degree', v)} placeholder="B.Tech" />
                        <InputField label="Field of Study" value={edu.field} onChange={(v) => updateItem(idx, 'field', v)} placeholder="Computer Science" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <InputField label="Start Date" value={edu.startDate} onChange={(v) => updateItem(idx, 'startDate', v)} placeholder="2018-08" />
                        <InputField label="End Date" value={edu.endDate} onChange={(v) => updateItem(idx, 'endDate', v)} placeholder="2022-05" />
                        <InputField label="GPA / Score" value={edu.gpa} onChange={(v) => updateItem(idx, 'gpa', v)} placeholder="8.7 / 10" />
                    </div>
                </div>
            ))}
            <AddButton onClick={addEducation} label="Add Education" />
        </div>
    );
};

/* ─── 5. Skills ─────────────────────────────────────────────────────────────── */

export const SkillsForm = ({ data, onChange }) => {
    const [input, setInput] = useState('');

    const addSkill = () => {
        const trimmed = input.trim();
        if (trimmed && !data.includes(trimmed)) {
            onChange([...data, trimmed]);
            setInput('');
        }
    };

    const removeSkill = (idx) => onChange(data.filter((_, i) => i !== idx));

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Type a skill and press Enter…"
                    className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                />
                <button
                    onClick={addSkill}
                    className="px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95"
                >
                    Add
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {data.map((skill, idx) => (
                    <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full border border-blue-100 dark:border-blue-800/30"
                    >
                        {skill}
                        <button onClick={() => removeSkill(idx)} className="hover:text-red-500 transition-colors">
                            <X size={12} />
                        </button>
                    </span>
                ))}
            </div>
            {data.length === 0 && (
                <p className="text-xs text-gray-400 italic">No skills added yet. Type a skill and press Enter.</p>
            )}
        </div>
    );
};

/* ─── 6. Projects ───────────────────────────────────────────────────────────── */

export const ProjectsForm = ({ data, onChange }) => {
    const addProject = () => {
        onChange([...data, { id: crypto.randomUUID(), name: '', description: '', techStack: '', link: '' }]);
    };

    const updateItem = (idx, field, value) => {
        const updated = [...data];
        updated[idx] = { ...updated[idx], [field]: value };
        onChange(updated);
    };

    const removeItem = (idx) => onChange(data.filter((_, i) => i !== idx));

    return (
        <div className="space-y-4">
            {data.map((proj, idx) => (
                <div key={proj.id} className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project #{idx + 1}</span>
                        <RemoveButton onClick={() => removeItem(idx)} />
                    </div>
                    <InputField label="Project Name" value={proj.name} onChange={(v) => updateItem(idx, 'name', v)} placeholder="DevFlow – Productivity Platform" />
                    <TextArea label="Description" value={proj.description} onChange={(v) => updateItem(idx, 'description', v)} placeholder="Describe what the project does…" rows={2} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InputField label="Tech Stack" value={proj.techStack} onChange={(v) => updateItem(idx, 'techStack', v)} placeholder="React, Node.js, MongoDB" />
                        <InputField label="Link" value={proj.link} onChange={(v) => updateItem(idx, 'link', v)} placeholder="github.com/user/project" />
                    </div>
                </div>
            ))}
            <AddButton onClick={addProject} label="Add Project" />
        </div>
    );
};

/* ─── 7. Certifications ─────────────────────────────────────────────────────── */

export const CertificationsForm = ({ data, onChange }) => {
    const addCert = () => {
        onChange([...data, { id: crypto.randomUUID(), name: '', issuer: '', date: '', link: '' }]);
    };

    const updateItem = (idx, field, value) => {
        const updated = [...data];
        updated[idx] = { ...updated[idx], [field]: value };
        onChange(updated);
    };

    const removeItem = (idx) => onChange(data.filter((_, i) => i !== idx));

    return (
        <div className="space-y-4">
            {data.map((cert, idx) => (
                <div key={cert.id} className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Certification #{idx + 1}</span>
                        <RemoveButton onClick={() => removeItem(idx)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InputField label="Certification Name" value={cert.name} onChange={(v) => updateItem(idx, 'name', v)} placeholder="AWS Certified Solutions Architect" />
                        <InputField label="Issuer" value={cert.issuer} onChange={(v) => updateItem(idx, 'issuer', v)} placeholder="Amazon Web Services" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InputField label="Date" value={cert.date} onChange={(v) => updateItem(idx, 'date', v)} placeholder="2024-06" />
                        <InputField label="Credential Link" value={cert.link} onChange={(v) => updateItem(idx, 'link', v)} placeholder="credly.com/badges/…" />
                    </div>
                </div>
            ))}
            <AddButton onClick={addCert} label="Add Certification" />
        </div>
    );
};

/* ─── 8. Languages ──────────────────────────────────────────────────────────── */

export const LanguagesForm = ({ data, onChange }) => {
    const addLanguage = () => {
        onChange([...data, { id: crypto.randomUUID(), language: '', proficiency: 'Intermediate' }]);
    };

    const updateItem = (idx, field, value) => {
        const updated = [...data];
        updated[idx] = { ...updated[idx], [field]: value };
        onChange(updated);
    };

    const removeItem = (idx) => onChange(data.filter((_, i) => i !== idx));

    const proficiencyLevels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native / Bilingual'];

    return (
        <div className="space-y-4">
            {data.map((lang, idx) => (
                <div key={lang.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                    <input
                        type="text"
                        value={lang.language}
                        onChange={(e) => updateItem(idx, 'language', e.target.value)}
                        placeholder="English"
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                    />
                    <select
                        value={lang.proficiency}
                        onChange={(e) => updateItem(idx, 'proficiency', e.target.value)}
                        className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                    >
                        {proficiencyLevels.map((level) => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                    <RemoveButton onClick={() => removeItem(idx)} />
                </div>
            ))}
            <AddButton onClick={addLanguage} label="Add Language" />
        </div>
    );
};

/* ─── Main Accordion Container ──────────────────────────────────────────────── */

const ResumeFormSections = ({ resumeData, setResumeData }) => {
    const [openSections, setOpenSections] = useState({
        personal: true,
        summary: false,
        experience: false,
        education: false,
        skills: false,
        projects: false,
        certifications: false,
        languages: false,
    });

    const toggleSection = (key) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const updateField = (field, value) => {
        setResumeData((prev) => ({ ...prev, [field]: value }));
    };

    const sections = [
        {
            key: 'personal',
            title: 'Personal Information',
            icon: User,
            content: (
                <PersonalInfoForm
                    data={resumeData.personalInfo}
                    onChange={(v) => updateField('personalInfo', v)}
                />
            ),
        },
        {
            key: 'summary',
            title: 'Professional Summary',
            icon: AlignLeft,
            content: (
                <SummaryForm
                    data={resumeData.summary}
                    onChange={(v) => updateField('summary', v)}
                />
            ),
        },
        {
            key: 'experience',
            title: 'Work Experience',
            icon: Briefcase,
            count: resumeData.experience.length,
            content: (
                <ExperienceForm
                    data={resumeData.experience}
                    onChange={(v) => updateField('experience', v)}
                />
            ),
        },
        {
            key: 'education',
            title: 'Education',
            icon: GraduationCap,
            count: resumeData.education.length,
            content: (
                <EducationForm
                    data={resumeData.education}
                    onChange={(v) => updateField('education', v)}
                />
            ),
        },
        {
            key: 'skills',
            title: 'Skills',
            icon: Code2,
            count: resumeData.skills.length,
            content: (
                <SkillsForm
                    data={resumeData.skills}
                    onChange={(v) => updateField('skills', v)}
                />
            ),
        },
        {
            key: 'projects',
            title: 'Projects',
            icon: FolderKanban,
            count: resumeData.projects.length,
            content: (
                <ProjectsForm
                    data={resumeData.projects}
                    onChange={(v) => updateField('projects', v)}
                />
            ),
        },
        {
            key: 'certifications',
            title: 'Certifications',
            icon: Award,
            count: resumeData.certifications.length,
            content: (
                <CertificationsForm
                    data={resumeData.certifications}
                    onChange={(v) => updateField('certifications', v)}
                />
            ),
        },
        {
            key: 'languages',
            title: 'Languages',
            icon: Globe,
            count: resumeData.languages.length,
            content: (
                <LanguagesForm
                    data={resumeData.languages}
                    onChange={(v) => updateField('languages', v)}
                />
            ),
        },
    ];

    return (
        <div className="space-y-3">
            {sections.map((section) => (
                <SectionWrapper
                    key={section.key}
                    title={section.title}
                    icon={section.icon}
                    isOpen={openSections[section.key]}
                    onToggle={() => toggleSection(section.key)}
                    count={section.count}
                >
                    {section.content}
                </SectionWrapper>
            ))}
        </div>
    );
};

export default ResumeFormSections;
