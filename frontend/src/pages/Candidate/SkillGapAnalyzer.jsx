import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { FileText, Briefcase, Search, UploadCloud, ArrowRight, Zap, Target } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const SkillGapAnalyzer = () => {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const handleAnalyze = async () => {
    if (!resumeText || !jobDescription) {
      alert("Please paste both your resume text and the job description.");
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    try {
      const res = await axiosInstance.post('/api/ai/skill-gap', {
        resumeText,
        jobDescription
      });

      if (res.data.success) {
        setResults(res.data.evaluation);
      }
    } catch (err) {
      alert("Failed to analyze skill gap: " + (err.response?.data?.message || err.message));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
             <h1 className="text-3xl font-black mb-3 flex items-center gap-3">
                <Target className="text-blue-400" />
                AI Skill Gap Analyzer
             </h1>
             <p className="text-blue-100/80 text-lg leading-relaxed">
                Paste your resume and the target job description below. Our AI recruiter will identify exactly which skills and keywords you're missing to beat the ATS and land the interview.
             </p>
          </div>
          <div className="hidden md:flex items-center justify-center bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-md">
             <div className="text-center">
                <Search size={32} className="text-blue-300 mx-auto mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest text-blue-200">ATS Bypass</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Inputs Level */}
           <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <FileText className="text-blue-500" /> 1. Your Resume Context
              </h2>
              <p className="text-xs text-gray-500 mb-4 font-medium italic">Paste the raw text of your resume or paste the link to your portfolio.</p>
              <textarea 
                 className="flex-1 w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl resize-none outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-700 placeholder-gray-400 min-h-[300px]"
                 placeholder="e.g. Senior Frontend Engineer with 5 years of experience in React, TypeScript, and Node.js..."
                 value={resumeText}
                 onChange={(e) => setResumeText(e.target.value)}
              />
           </div>
           
           <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <Briefcase className="text-indigo-500" /> 2. Target Job Description
              </h2>
              <p className="text-xs text-gray-500 mb-4 font-medium italic">Paste the full job description you are aiming for.</p>
              <textarea 
                 className="flex-1 w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl resize-none outline-none focus:ring-4 focus:indigo-500/10 focus:border-indigo-500 transition-all font-medium text-gray-700 placeholder-gray-400 min-h-[300px]"
                 placeholder="e.g. Looking for a Full-Stack developer proficient in React, MongoDB, AWS, and Docker..."
                 value={jobDescription}
                 onChange={(e) => setJobDescription(e.target.value)}
              />
           </div>
        </div>

        {/* Analyze Action */}
        <div className="flex justify-center">
           <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !resumeText || !jobDescription}
              className="group flex items-center gap-3 px-10 py-5 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
           >
              {isAnalyzing ? (
                 <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing Gap...
                 </>
              ) : (
                 <>
                    <Zap size={20} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                    Reveal Missing Skills
                 </>
              )}
           </button>
        </div>

        {/* Results Level */}
        {results && (
           <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 sm:p-10 animate-in slide-in-from-bottom-8 mt-10">
              <div className="flex flex-col md:flex-row gap-10">
                 {/* Match Score */}
                 <div className="md:w-1/3 flex flex-col items-center justify-center p-6 sm:p-8 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">ATS Match Rate</p>
                    <div className="relative w-40 h-40 flex items-center justify-center">
                       <svg className="w-full h-full transform -rotate-90">
                          <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-200" />
                          <circle 
                             cx="80" 
                             cy="80" 
                             r="70" 
                             stroke="currentColor" 
                             strokeWidth="12" 
                             fill="transparent" 
                             strokeDasharray={440} 
                             strokeDashoffset={440 - (440 * results.match_percentage) / 100} 
                             className={`${results.match_percentage > 75 ? 'text-green-500' : results.match_percentage > 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-out`} 
                          />
                       </svg>
                       <div className="absolute flex flex-col items-center justify-center text-center">
                          <span className={`text-4xl font-black ${results.match_percentage > 75 ? 'text-green-600' : results.match_percentage > 50 ? 'text-amber-600' : 'text-red-600'}`}>{results.match_percentage}%</span>
                       </div>
                    </div>
                    
                    <p className="mt-6 text-sm font-bold text-gray-700 text-center">
                       {results.match_percentage > 75 ? "Excellent fit! You're highly likely to pass the ATS filter." :
                        results.match_percentage > 50 ? "Moderate fit. Bridging a few minor gaps will strengthen your profile." :
                        "Low fit. Consider upskilling in the critical missing areas below."}
                    </p>
                 </div>

                 {/* Granular Feedback */}
                 <div className="md:w-2/3 space-y-8">
                    <div>
                       <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500" /> Missing Hard/Soft Skills
                       </h3>
                       <div className="flex flex-wrap gap-2">
                          {results.missing_skills?.map((skill, idx) => (
                             <span key={idx} className="px-4 py-2 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-bold">
                                - {skill}
                             </span>
                          ))}
                          {(!results.missing_skills || results.missing_skills.length === 0) && (
                             <span className="text-gray-400 italic text-sm">No major skills missing!</span>
                          )}
                       </div>
                    </div>
                    
                    <div>
                       <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500" /> Missing Keywords (ATS Drops)
                       </h3>
                       <div className="flex flex-wrap gap-2">
                          {results.missing_keywords?.map((keyword, idx) => (
                             <span key={idx} className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-sm font-bold">
                                {keyword}
                             </span>
                          ))}
                          {(!results.missing_keywords || results.missing_keywords.length === 0) && (
                             <span className="text-gray-400 italic text-sm">No major keywords missing!</span>
                          )}
                       </div>
                    </div>
                    
                    <div>
                       <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" /> AI Game Plan
                       </h3>
                       <p className="text-gray-700 leading-relaxed font-medium bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                          {results.recommendation}
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default SkillGapAnalyzer;
