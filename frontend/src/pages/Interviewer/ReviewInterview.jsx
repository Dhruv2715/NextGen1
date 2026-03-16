import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { BeatLoader } from 'react-spinners';
import { ArrowLeft, Star, Mic, Code, MessageSquare, AlertTriangle, Radio } from 'lucide-react';
import Editor from '@monaco-editor/react';
import DashboardLayout from '../../components/DashboardLayout';
import io from 'socket.io-client';

const ReviewInterview = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullTranscript, setFullTranscript] = useState('');

  // Live Mode State
  const [socket, setSocket] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [liveCode, setLiveCode] = useState("");
  const [proctoringFlags, setProctoringFlags] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  // New Features State
  const [tab, setTab] = useState('assessment'); // assessment | proctoring | scorecards
  const [scorecards, setScorecards] = useState([]);
  const [myScorecard, setMyScorecard] = useState({
    criteria: [
      { label: 'Technical Skills', score: 0 },
      { label: 'Communication', score: 0 },
      { label: 'Problem Solving', score: 0 }
    ],
    overallScore: 0,
    recommendation: 'Maybe',
    notes: ''
  });
  const [savingScorecard, setSavingScorecard] = useState(false);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/interviews/${interviewId}`);
        setInterview(response.data);
        setLiveCode(response.data.code_submission || "");

        if (response.data.status === 'in-progress') {
          setIsLive(true);
          setupSocket();
        }

        // Combine transcript snippets into a single string
        if (response.data.transcripts && Array.isArray(response.data.transcripts)) {
          const text = response.data.transcripts
            .map(t => t.text_content)
            .join(' ');
          setFullTranscript(text);
        }

        // Fetch scorecards
        const scRes = await axiosInstance.get(`/api/scorecards/${interviewId}`);
        setScorecards(scRes.data || []);
        
        // Find if I have one
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          const mine = scRes.data?.find(s => s.scoredBy?._id === (u._id || u.id));
          if (mine) setMyScorecard(mine);
        }
      } catch (err) {
        console.error('Error fetching interview:', err);
      } finally {
        setLoading(false);
      }
    };

    const setupSocket = () => {
      const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const newSocket = io(socketUrl);
      setSocket(newSocket);

      newSocket.emit("join_room", interviewId);

      newSocket.on("code_update", (code) => {
        setLiveCode(code);
      });

      newSocket.on("receive_proctoring_flag", (flag) => {
        setProctoringFlags(prev => [flag, ...prev]);
        // Optional: notify interviewer? Alert is enough in logs.
      });

      newSocket.on("receive_message", (data) => {
        setChatHistory(prev => [...prev, data]);
      });

      return newSocket;
    };

    fetchInterview();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [interviewId]);

  const sendChatMessage = () => {
    if (chatMessage.trim() && socket) {
      const msgData = {
        room: interviewId,
        author: 'Interviewer',
        message: chatMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      socket.emit("send_message", msgData);
      setChatHistory(prev => [...prev, msgData]);
      setChatMessage("");
    }
  };

  const handleScorecardSave = async () => {
    setSavingScorecard(true);
    try {
      await axiosInstance.post('/api/scorecards', {
        interviewId,
        ...myScorecard
      });
      // Refresh scorecards
      const scRes = await axiosInstance.get(`/api/scorecards/${interviewId}`);
      setScorecards(scRes.data || []);
      alert('Scorecard saved successfully!');
    } catch {
      alert('Failed to save scorecard');
    } finally {
      setSavingScorecard(false);
    }
  };

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
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Technical Interview Review</h1>
                {isLive && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase animate-pulse">
                    <Radio size={12} /> Live Now
                  </div>
                )}
              </div>
              <p className="text-gray-500 mt-1 font-medium italic">for {interview?.candidate_name || interview?.candidate_email || 'Candidate'}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-3 rounded-xl border transition-all ${showChat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-400 hover:text-blue-600'}`}
              >
                <MessageSquare size={20} />
              </button>
              <div className="h-10 w-px bg-gray-100 mx-2" />
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-black">Overall Score</p>
                <p className="text-3xl font-black text-blue-600">{interview?.score || 'N/A'}<span className="text-sm text-gray-400">/10</span></p>
              </div>
              <div className="h-10 w-px bg-gray-100 mx-2" />
              <span className={`px-4 py-1.5 text-xs font-black uppercase rounded-xl ${interview?.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                {interview?.status || 'unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Proctoring Alerts */}
        {isLive && proctoringFlags.length > 0 && (
          <div className="mb-8 space-y-2">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <AlertTriangle size={14} /> Critical Proctoring Flags
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {proctoringFlags.map((flag, i) => (
                <div key={i} className="flex-shrink-0 bg-amber-50 border border-amber-200 px-4 py-3 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-amber-900 uppercase">{flag.type}</p>
                    <p className="text-[10px] text-amber-700 font-medium">Flagged at {new Date(flag.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-6 border-b border-gray-100 pb-2 overflow-x-auto scrollbar-hide">
          {['assessment', 'recording', 'proctoring', 'scorecards'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-2 px-2 text-sm font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {t === 'assessment' ? 'AI Assessment' : t === 'recording' ? 'Recording & AI Summary' : t === 'proctoring' ? `Proctoring (${interview?.proctoringLog?.length || 0})` : 'Scorecards'}
            </button>
          ))}
        </div>

        {tab === 'assessment' && (
          <>
            <div className="flex flex-col lg:flex-row gap-8 mb-8 relative">
              {/* Main Content Area */}
              <div className="flex-1 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Code Submission */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                        {isLive ? 'Live Code Mirror' : 'Code Implementation'}
                        {interview?.language && (
                          <span className="text-[10px] ml-2 px-2 py-1 bg-gray-100 text-gray-500 rounded border border-gray-200 uppercase font-black tracking-widest">
                            {interview.language}
                          </span>
                        )}
                      </h2>
                      {isLive && <div className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" /> Syncing</div>}
                    </div>
                    <div className="flex-1">
                      {(isLive ? liveCode : interview.code_submission) ? (
                        <Editor
                          height="450px"
                          language={interview?.language || 'javascript'}
                          value={isLive ? liveCode : interview.code_submission}
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
                          {isLive ? 'Waiting for candidate to start typing...' : 'No code submission provided by candidate'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transcript / Live Feedback placeholder */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50">
                      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                        {isLive ? 'Live Audio Status' : 'Audio Transcript'}
                      </h2>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[450px] bg-gray-50/30 flex-1">
                      {isLive ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
                          <Mic size={40} className="mb-4 text-blue-500 animate-bounce" />
                          <p className="font-bold text-gray-900 mb-1">Audio Streaming Active</p>
                          <p className="text-xs">Transcript will be generated and analyzed after the session completes.</p>
                        </div>
                      ) : fullTranscript ? (
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
              </div>

              {/* Chat Sidebar */}
              {showChat && (
                <div className="w-80 bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col h-[585px] animate-in slide-in-from-right-4">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-black text-xs uppercase tracking-widest text-gray-900 flex items-center gap-2">
                      <MessageSquare size={14} className="text-blue-600" /> Candidate Chat
                    </h3>
                    <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-red-500 font-bold">&times;</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                    {chatHistory.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                        <MessageSquare size={24} className="mb-2 opacity-20" />
                        <p className="text-[10px] uppercase font-black tracking-tighter">No messages during session</p>
                      </div>
                    )}
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.author === 'Interviewer' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-[11px] font-medium max-w-[90%] ${msg.author === 'Interviewer' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200'}`}>
                          {msg.message}
                        </div>
                        <span className="text-[9px] text-gray-400 mt-1 uppercase font-black">{msg.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                        placeholder="Message transcript..."
                      />
                      <button onClick={sendChatMessage} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Feedback Section */}
            {interview?.feedback_json && (
              <div className="bg-gray-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden mt-8">
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

                      {interview.ai_summary && (
                        <div>
                          <h3 className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-3">AI 5-Point Summary</h3>
                          <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {interview.ai_summary}
                          </div>
                        </div>
                      )}

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

                    {Array.isArray(interview.ai_highlights) && interview.ai_highlights.length > 0 && (
                      <div className="mt-6 md:col-span-2">
                        <h3 className="text-blue-300 font-black text-xs uppercase tracking-widest mb-3">AI Highlights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {interview.ai_highlights.map((highlight, i) => (
                            <div key={i} className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/20 text-sm text-gray-300">
                              <Star className="text-blue-400 mb-2" size={16} />
                              {highlight}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'recording' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
               <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 <Mic className="text-blue-500" /> Session Recording
               </h2>
               {interview.recording_url ? (
                 <video 
                   src={interview.recording_url} 
                   controls 
                   className="w-full rounded-2xl bg-black aspect-video object-contain shadow-lg border border-gray-200"
                 />
               ) : (
                 <div className="w-full aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                   <Mic size={48} className="mb-4 text-gray-300" />
                   <p className="font-bold">No recording available</p>
                   <p className="text-xs">Candidate did not record or upload failed.</p>
                 </div>
               )}
            </div>
            
            <div className="flex flex-col gap-4">
               <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                 <MessageSquare className="text-amber-500" /> Full Transcript
               </h2>
               <div className="bg-gray-50 flex-1 rounded-2xl p-6 overflow-y-auto max-h-[400px] border border-gray-100">
                 {fullTranscript ? (
                   <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                     {fullTranscript}
                   </div>
                 ) : (
                   <div className="h-full flex items-center justify-center text-gray-400 italic">
                     No audio transcript available
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}

        {tab === 'proctoring' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" /> Proctoring Report
            </h2>
            {(!interview.proctoringLog || interview.proctoringLog.length === 0) ? (
              <div className="text-center py-10 bg-green-50/50 rounded-xl border border-green-100">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star size={24} />
                </div>
                <h3 className="font-bold text-green-800">No rule violations detected</h3>
                <p className="text-green-600 text-sm mt-1">Candidate completed the assessment without leaving the window or pasting code.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {interview.proctoringLog.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-amber-200 bg-amber-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-amber-900">{log.event.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-amber-700">Violation logged during assessment</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-amber-800">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'scorecards' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* My Scorecard Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">My Evaluator Scorecard</h2>
              <div className="space-y-6">
                {myScorecard.criteria.map((crit, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-2">
                      <label className="font-bold text-gray-700">{crit.label}</label>
                      <span className="text-gray-500 font-bold">{crit.score} / 10</span>
                    </div>
                    <input type="range" min="0" max="10" value={crit.score}
                      onChange={e => {
                        const newCrit = [...myScorecard.criteria];
                        newCrit[idx].score = parseInt(e.target.value);
                        setMyScorecard({ ...myScorecard, criteria: newCrit });
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                ))}
                
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">Overall Score (/100)</label>
                  <input type="number" min="0" max="100" value={myScorecard.overallScore}
                    onChange={e => setMyScorecard({ ...myScorecard, overallScore: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">Hiring Recommendation</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Strong Hire', 'Hire', 'Maybe', 'No Hire'].map(r => (
                      <button key={r} onClick={() => setMyScorecard({ ...myScorecard, recommendation: r })}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${myScorecard.recommendation === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">Private Notes</label>
                  <textarea rows={3} value={myScorecard.notes}
                    onChange={e => setMyScorecard({ ...myScorecard, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Add your thoughts about the candidate..."
                  />
                </div>

                <button onClick={handleScorecardSave} disabled={savingScorecard}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50">
                  {savingScorecard ? 'Saving...' : 'Save Scorecard'}
                </button>
              </div>
            </div>

            {/* Other Evaluator Scorecards */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">All Evaluator Scores</h2>
              {scorecards.length === 0 ? (
                <div className="text-center p-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500">
                  No scorecards submitted yet.
                </div>
              ) : (
                scorecards.map(sc => (
                  <div key={sc._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900">{sc.scoredBy?.name || 'Unknown Evaluator'}</h4>
                        <p className="text-xs text-gray-400">{new Date(sc.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-blue-600">{sc.overallScore}</span><span className="text-xs text-gray-400">/100</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                        sc.recommendation.includes('Hire') && sc.recommendation !== 'No Hire' ? 'bg-green-100 text-green-700' : 
                        sc.recommendation === 'No Hire' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {sc.recommendation}
                      </span>
                    </div>
                    {sc.notes && <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">"{sc.notes}"</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReviewInterview;
