import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { BeatLoader } from 'react-spinners';
import { ArrowLeft, Star, Mic, Code } from 'lucide-react';
import Editor from '@monaco-editor/react';
import DashboardLayout from '../../components/DashboardLayout';

const ReviewInterview = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullTranscript, setFullTranscript] = useState('');

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/interviews/${interviewId}`);
        setInterview(response.data);

        // Combine transcript snippets into a single string
        if (response.data.transcripts && Array.isArray(response.data.transcripts)) {
          const text = response.data.transcripts
            .map(t => t.text_content)
            .join(' ');
          setFullTranscript(text);
        }
      } catch (err) {
        console.error('Error fetching interview:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600">
        <BeatLoader color="currentColor" size={10} />
      </div>
    );
  }

  if (!interview) {
    return (
      <DashboardLayout>
        <div className="text-center p-12">
          <p className="text-gray-500">Interview report not found.</p>
          <button
            onClick={() => navigate('/interviewer/dashboard')}
            className="mt-4 text-blue-600 font-bold"
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/interviewer/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 font-medium transition-colors group"
        >
          <div className="p-1.5 rounded-lg bg-white border border-gray-200 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
            <ArrowLeft size={18} />
          </div>
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{interview?.job_title || 'Technical Assessment'}</p>
              <h1 className="text-3xl font-bold text-gray-900">Technical Interview Review</h1>
              <p className="text-gray-500 mt-1 font-medium italic">for {interview?.candidate_name || interview?.candidate_email || 'Candidate'}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-black">Overall Score</p>
                <p className="text-3xl font-black text-blue-600">{interview?.score || 'N/A'}<span className="text-sm text-gray-400">/10</span></p>
              </div>
              <div className="h-10 w-px bg-gray-100 mx-2" />
              <span className={`px-4 py-1.5 text-xs font-black uppercase rounded-xl ${interview?.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                {interview?.status || 'unknown'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Code Submission */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                Code Implementation
              </h2>
            </div>
            <div className="flex-1">
              {interview.code_submission ? (
                <Editor
                  height="450px"
                  defaultLanguage="javascript"
                  value={interview.code_submission}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    padding: { top: 20 },
                  }}
                />
              ) : (
                <div className="h-[450px] flex items-center justify-center text-gray-400 bg-gray-50 italic">
                  No code submission provided by candidate
                </div>
              )}
            </div>
          </div>

          {/* Transcript */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                Audio Transcript
              </h2>
            </div>
            <div className="p-6 overflow-y-auto max-h-[450px] bg-gray-50/30 flex-1">
              {fullTranscript ? (
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">
                  "{fullTranscript}"
                </p>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic">
                  No audio transcript available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        {interview?.feedback_json && (
          <div className="bg-gray-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px]" />
            <div className="relative">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Star className="text-blue-400 fill-blue-400" />
                AI-Powered Insight
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-blue-400 font-black text-xs uppercase tracking-widest mb-3">Key Feedback</h3>
                    <p className="text-gray-300 leading-relaxed font-medium">
                      {typeof interview.feedback_json === 'string'
                        ? interview.feedback_json
                        : (interview.feedback_json.feedback || 'No summary available.')}
                    </p>
                  </div>
                  {Array.isArray(interview.feedback_json.strengths) && interview.feedback_json.strengths.length > 0 && (
                    <div>
                      <h3 className="text-green-400 font-black text-xs uppercase tracking-widest mb-3">Strengths</h3>
                      <ul className="space-y-2">
                        {interview.feedback_json.strengths.map((s, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {Array.isArray(interview.feedback_json.improvements) && interview.feedback_json.improvements.length > 0 && (
                  <div>
                    <h3 className="text-amber-400 font-black text-xs uppercase tracking-widest mb-3">Areas for Growth</h3>
                    <ul className="space-y-3">
                      {interview.feedback_json.improvements.map((imp, i) => (
                        <li key={i} className="bg-white/5 p-3 rounded-xl border border-white/10 text-sm text-gray-300">
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReviewInterview;
