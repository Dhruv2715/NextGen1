import React from 'react';
import {
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Globe,
    Calendar,
    ExternalLink,
} from 'lucide-react';

/* ─── Shared date formatter ─────────────────────────────────────────────────── */

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return month ? `${months[parseInt(month, 10) - 1]} ${year}` : year;
};

/* ═══════════════════════════════════════════════════════════════════════════════
   CLASSIC TEMPLATE — Traditional, two-column header, serif-inspired
   ═══════════════════════════════════════════════════════════════════════════════ */

export const ClassicTemplate = ({ data, accentColor }) => {
    const p = data.personalInfo || {};
    const hasContact = p.email || p.phone || p.location || p.linkedin || p.portfolio;

    return (
        <div className="pdf-page bg-white text-gray-900 font-[Georgia,serif]" style={{ fontSize: '11px', lineHeight: '1.5' }}>
            {/* Header */}
            <div className="text-center pb-3 mb-4" style={{ borderBottom: `2px solid ${accentColor}` }}>
                <h1 className="text-2xl font-bold tracking-wide" style={{ color: accentColor }}>
                    {p.fullName || 'Your Name'}
                </h1>
                {hasContact && (
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-gray-600" style={{ fontSize: '10px' }}>
                        {p.email && <span>{p.email}</span>}
                        {p.phone && <span>| {p.phone}</span>}
                        {p.location && <span>| {p.location}</span>}
                        {p.linkedin && <span>| {p.linkedin}</span>}
                        {p.portfolio && <span>| {p.portfolio}</span>}
                    </div>
                )}
            </div>

            {/* Summary */}
            {data.summary && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] pb-1 mb-2" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}30` }}>
                        Professional Summary
                    </h2>
                    <p className="text-gray-700">{data.summary}</p>
                </div>
            )}

            {/* Experience */}
            {data.experience?.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] pb-1 mb-2" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}30` }}>
                        Work Experience
                    </h2>
                    {data.experience.map((exp) => (
                        <div key={exp.id} className="mb-3">
                            <div className="flex justify-between items-baseline">
                                <div>
                                    <span className="font-bold">{exp.title}</span>
                                    {exp.company && <span className="text-gray-600"> — {exp.company}</span>}
                                </div>
                                <span className="text-gray-500 whitespace-nowrap" style={{ fontSize: '10px' }}>
                                    {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                                </span>
                            </div>
                            {exp.location && <div className="text-gray-500 italic" style={{ fontSize: '10px' }}>{exp.location}</div>}
                            {exp.description?.filter(Boolean).length > 0 && (
                                <ul className="mt-1 ml-4 list-disc text-gray-700">
                                    {exp.description.filter(Boolean).map((d, i) => <li key={i}>{d}</li>)}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Education */}
            {data.education?.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] pb-1 mb-2" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}30` }}>
                        Education
                    </h2>
                    {data.education.map((edu) => (
                        <div key={edu.id} className="mb-2">
                            <div className="flex justify-between items-baseline">
                                <span className="font-bold">{edu.institution}</span>
                                <span className="text-gray-500 whitespace-nowrap" style={{ fontSize: '10px' }}>
                                    {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                                </span>
                            </div>
                            <div className="text-gray-600">
                                {edu.degree}{edu.field && ` in ${edu.field}`}{edu.gpa && ` • GPA: ${edu.gpa}`}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Skills */}
            {data.skills?.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] pb-1 mb-2" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}30` }}>
                        Skills
                    </h2>
                    <p className="text-gray-700">{data.skills.join('  •  ')}</p>
                </div>
            )}

            {/* Projects */}
            {data.projects?.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] pb-1 mb-2" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}30` }}>
                        Projects
                    </h2>
                    {data.projects.map((proj) => (
                        <div key={proj.id} className="mb-2">
                            <span className="font-bold">{proj.name}</span>
                            {proj.techStack && <span className="text-gray-500 ml-1" style={{ fontSize: '10px' }}>({proj.techStack})</span>}
                            {proj.description && <p className="text-gray-700 mt-0.5">{proj.description}</p>}
                        </div>
                    ))}
                </div>
            )}

            {/* Certifications */}
            {data.certifications?.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] pb-1 mb-2" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}30` }}>
                        Certifications
                    </h2>
                    {data.certifications.map((cert) => (
                        <div key={cert.id} className="mb-1">
                            <span className="font-bold">{cert.name}</span>
                            {cert.issuer && <span className="text-gray-600"> — {cert.issuer}</span>}
                            {cert.date && <span className="text-gray-500 ml-1" style={{ fontSize: '10px' }}>({formatDate(cert.date)})</span>}
                        </div>
                    ))}
                </div>
            )}

            {/* Languages */}
            {data.languages?.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] pb-1 mb-2" style={{ color: accentColor, borderBottom: `1px solid ${accentColor}30` }}>
                        Languages
                    </h2>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-gray-700">
                        {data.languages.map((lang) => (
                            <span key={lang.id}><strong>{lang.language}</strong> — {lang.proficiency}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


/* ═══════════════════════════════════════════════════════════════════════════════
   MODERN TEMPLATE — Bold accent sidebar, clean sans-serif
   ═══════════════════════════════════════════════════════════════════════════════ */

export const ModernTemplate = ({ data, accentColor }) => {
    const p = data.personalInfo || {};

    return (
        <div className="pdf-page bg-white text-gray-900 font-sans" style={{ fontSize: '11px', lineHeight: '1.55' }}>
            {/* Header with accent background */}
            <div className="p-5 rounded-t" style={{ backgroundColor: accentColor }}>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                    {p.fullName || 'Your Name'}
                </h1>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-white/80" style={{ fontSize: '10px' }}>
                    {p.email && (
                        <span className="flex items-center gap-1"><Mail size={10} /> {p.email}</span>
                    )}
                    {p.phone && (
                        <span className="flex items-center gap-1"><Phone size={10} /> {p.phone}</span>
                    )}
                    {p.location && (
                        <span className="flex items-center gap-1"><MapPin size={10} /> {p.location}</span>
                    )}
                    {p.linkedin && (
                        <span className="flex items-center gap-1"><Linkedin size={10} /> {p.linkedin}</span>
                    )}
                    {p.portfolio && (
                        <span className="flex items-center gap-1"><Globe size={10} /> {p.portfolio}</span>
                    )}
                </div>
            </div>

            <div className="p-5 space-y-4">
                {/* Summary */}
                {data.summary && (
                    <div>
                        <h2 className="text-sm font-extrabold uppercase tracking-wider mb-1.5" style={{ color: accentColor }}>Summary</h2>
                        <p className="text-gray-700">{data.summary}</p>
                    </div>
                )}

                {/* Experience */}
                {data.experience?.length > 0 && (
                    <div>
                        <h2 className="text-sm font-extrabold uppercase tracking-wider mb-2" style={{ color: accentColor }}>Experience</h2>
                        {data.experience.map((exp) => (
                            <div key={exp.id} className="mb-3 pl-3" style={{ borderLeft: `3px solid ${accentColor}30` }}>
                                <div className="font-bold text-gray-900">{exp.title}</div>
                                <div className="flex items-center gap-2 text-gray-500" style={{ fontSize: '10px' }}>
                                    {exp.company && <span className="font-semibold">{exp.company}</span>}
                                    {exp.location && <span>• {exp.location}</span>}
                                    <span className="flex items-center gap-1">
                                        <Calendar size={9} />
                                        {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                                    </span>
                                </div>
                                {exp.description?.filter(Boolean).length > 0 && (
                                    <ul className="mt-1 ml-3 list-disc text-gray-700 space-y-0.5">
                                        {exp.description.filter(Boolean).map((d, i) => <li key={i}>{d}</li>)}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Education */}
                {data.education?.length > 0 && (
                    <div>
                        <h2 className="text-sm font-extrabold uppercase tracking-wider mb-2" style={{ color: accentColor }}>Education</h2>
                        {data.education.map((edu) => (
                            <div key={edu.id} className="mb-2 pl-3" style={{ borderLeft: `3px solid ${accentColor}30` }}>
                                <div className="font-bold text-gray-900">{edu.institution}</div>
                                <div className="text-gray-600" style={{ fontSize: '10px' }}>
                                    {edu.degree}{edu.field && ` in ${edu.field}`}{edu.gpa && ` — GPA: ${edu.gpa}`}
                                </div>
                                <div className="text-gray-500 flex items-center gap-1" style={{ fontSize: '10px' }}>
                                    <Calendar size={9} /> {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Skills */}
                {data.skills?.length > 0 && (
                    <div>
                        <h2 className="text-sm font-extrabold uppercase tracking-wider mb-2" style={{ color: accentColor }}>Skills</h2>
                        <div className="flex flex-wrap gap-1.5">
                            {data.skills.map((skill, i) => (
                                <span key={i} className="px-2.5 py-0.5 rounded-full text-white font-semibold" style={{ backgroundColor: accentColor, fontSize: '9px' }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {data.projects?.length > 0 && (
                    <div>
                        <h2 className="text-sm font-extrabold uppercase tracking-wider mb-2" style={{ color: accentColor }}>Projects</h2>
                        {data.projects.map((proj) => (
                            <div key={proj.id} className="mb-2 pl-3" style={{ borderLeft: `3px solid ${accentColor}30` }}>
                                <div className="font-bold text-gray-900 flex items-center gap-1">
                                    {proj.name}
                                    {proj.link && <ExternalLink size={10} className="text-gray-400" />}
                                </div>
                                {proj.techStack && <div className="text-gray-500 italic" style={{ fontSize: '10px' }}>{proj.techStack}</div>}
                                {proj.description && <p className="text-gray-700 mt-0.5">{proj.description}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Certifications & Languages — side by side */}
                <div className="grid grid-cols-2 gap-4">
                    {data.certifications?.length > 0 && (
                        <div>
                            <h2 className="text-sm font-extrabold uppercase tracking-wider mb-2" style={{ color: accentColor }}>Certifications</h2>
                            {data.certifications.map((cert) => (
                                <div key={cert.id} className="mb-1.5">
                                    <div className="font-bold text-gray-900" style={{ fontSize: '10.5px' }}>{cert.name}</div>
                                    <div className="text-gray-500" style={{ fontSize: '9.5px' }}>{cert.issuer}{cert.date && ` • ${formatDate(cert.date)}`}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    {data.languages?.length > 0 && (
                        <div>
                            <h2 className="text-sm font-extrabold uppercase tracking-wider mb-2" style={{ color: accentColor }}>Languages</h2>
                            {data.languages.map((lang) => (
                                <div key={lang.id} className="mb-1 text-gray-700">
                                    <strong>{lang.language}</strong> — {lang.proficiency}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


/* ═══════════════════════════════════════════════════════════════════════════════
   MINIMAL TEMPLATE — Ultra-clean, generous whitespace, no color noise
   ═══════════════════════════════════════════════════════════════════════════════ */

export const MinimalTemplate = ({ data, accentColor }) => {
    const p = data.personalInfo || {};

    return (
        <div className="pdf-page bg-white text-gray-800 font-sans" style={{ fontSize: '11px', lineHeight: '1.6' }}>
            {/* Header */}
            <div className="pb-3 mb-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900">{p.fullName || 'Your Name'}</h1>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-gray-500" style={{ fontSize: '10px' }}>
                    {p.email && <span>{p.email}</span>}
                    {p.phone && <span>• {p.phone}</span>}
                    {p.location && <span>• {p.location}</span>}
                    {p.linkedin && <span>• {p.linkedin}</span>}
                    {p.portfolio && <span>• {p.portfolio}</span>}
                </div>
            </div>

            {/* Summary */}
            {data.summary && (
                <div className="mb-4">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: accentColor }}>About</h2>
                    <p className="text-gray-600">{data.summary}</p>
                </div>
            )}

            {/* Experience */}
            {data.experience?.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: accentColor }}>Experience</h2>
                    {data.experience.map((exp) => (
                        <div key={exp.id} className="mb-3">
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-900">{exp.title}{exp.company && `, ${exp.company}`}</span>
                                <span className="text-gray-400 text-[10px]">{formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                            </div>
                            {exp.location && <div className="text-gray-400" style={{ fontSize: '10px' }}>{exp.location}</div>}
                            {exp.description?.filter(Boolean).length > 0 && (
                                <ul className="mt-1 ml-4 list-disc text-gray-600 space-y-0.5">
                                    {exp.description.filter(Boolean).map((d, i) => <li key={i}>{d}</li>)}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Education */}
            {data.education?.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: accentColor }}>Education</h2>
                    {data.education.map((edu) => (
                        <div key={edu.id} className="mb-2">
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-900">{edu.institution}</span>
                                <span className="text-gray-400 text-[10px]">{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</span>
                            </div>
                            <div className="text-gray-500" style={{ fontSize: '10px' }}>
                                {edu.degree}{edu.field && `, ${edu.field}`}{edu.gpa && ` — ${edu.gpa}`}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Skills */}
            {data.skills?.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: accentColor }}>Skills</h2>
                    <p className="text-gray-600">{data.skills.join('  ·  ')}</p>
                </div>
            )}

            {/* Projects */}
            {data.projects?.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: accentColor }}>Projects</h2>
                    {data.projects.map((proj) => (
                        <div key={proj.id} className="mb-2">
                            <span className="font-semibold text-gray-900">{proj.name}</span>
                            {proj.techStack && <span className="text-gray-400 ml-1" style={{ fontSize: '10px' }}>— {proj.techStack}</span>}
                            {proj.description && <p className="text-gray-600 mt-0.5">{proj.description}</p>}
                        </div>
                    ))}
                </div>
            )}

            {/* Certifications */}
            {data.certifications?.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: accentColor }}>Certifications</h2>
                    {data.certifications.map((cert) => (
                        <div key={cert.id} className="mb-1 text-gray-600">
                            <span className="font-semibold text-gray-900">{cert.name}</span>
                            {cert.issuer && ` — ${cert.issuer}`}
                            {cert.date && <span className="text-gray-400 ml-1">({formatDate(cert.date)})</span>}
                        </div>
                    ))}
                </div>
            )}

            {/* Languages */}
            {data.languages?.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: accentColor }}>Languages</h2>
                    <p className="text-gray-600">
                        {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('  ·  ')}
                    </p>
                </div>
            )}
        </div>
    );
};

/* ─── Template Renderer ─────────────────────────────────────────────────────── */

const ResumePreview = React.forwardRef(({ data, template, accentColor }, ref) => {
    const TemplateComponent = {
        classic: ClassicTemplate,
        modern: ModernTemplate,
        minimal: MinimalTemplate,
    }[template] || ModernTemplate;

    return (
        <div ref={ref} className="resume-preview-container">
            <TemplateComponent data={data} accentColor={accentColor} />
        </div>
    );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;
