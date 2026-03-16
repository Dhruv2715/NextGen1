import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axiosInstance from '../../utils/axiosInstance';
import { BeatLoader } from 'react-spinners';
import { Mic, MicOff, Square, Play, Send, MessageSquare, AlertTriangle, QrCode, X, Smartphone, CheckCircle2 } from 'lucide-react';
import io from 'socket.io-client';
import useMobilePairing from '../../hooks/useMobilePairing';
import { toast } from 'react-hot-toast';

const InterviewRoom = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [question, setQuestion] = useState('');
  const [code, setCode] = useState('// Write your code here\n');
  const [language, setLanguage] = useState('javascript');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('scheduled'); // scheduled, in-progress, completed

  // New Collaboration & Chat state
  const [socket, setSocket] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [showQrModal, setShowQrModal] = useState(false);

  // Proctoring State
  const [proctoringLogs, setProctoringLogs] = useState([]);

  const logProctoringEvent = (type) => {
    const event = { event: type, timestamp: new Date() };
    setProctoringLogs(prev => [...prev, event]);
    // Also broadcast to interviewer in real-time
    if (socket) {
      socket.emit("proctoring_flag", {
        room: interviewId,
        type,
        timestamp: new Date()
      });
    }
  };

  // Secondary Mobile Camera Hook
  const { remoteStream: mobileStream, isMobileConnected } = useMobilePairing(interviewId, true);
  const mobileVideoRef = useRef(null);

  // Sync mobile stream to its video element
  useEffect(() => {
    if (mobileVideoRef.current && mobileStream) {
      mobileVideoRef.current.srcObject = mobileStream;
    }
  }, [mobileStream]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);

  useEffect(() => {
    fetchInterview();

    // Socket Setup - route through Vite proxy in development to fix mobile mixed-content limits
    const socketUrl = import.meta.env.PROD ? (import.meta.env.VITE_API_URL || "https://api.myapp.com") : "/";
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.emit("join_room", interviewId);

    newSocket.on("receive_message", (data) => {
      setChatHistory(prev => [...prev, data]);
    });

    // Proctoring: Detect tab switches, mouse leave, and copy/paste
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && status === 'in-progress') {
        logProctoringEvent('TAB_SWITCH');
      }
    };

    const handleMouseLeave = (e) => {
      if (status === 'in-progress' && e.clientY <= 0) {
        logProctoringEvent('MOUSE_LEFT_WINDOW');
      }
    };

    const handlePaste = (e) => {
      if (status === 'in-progress') {
        e.preventDefault();
        logProctoringEvent('PASTE_ATTEMPT_BLOCKED');
        alert('Pasting is disabled during the interview for proctoring purposes.');
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("paste", handlePaste);

    return () => {
      // Cleanup
      newSocket.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("paste", handlePaste);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, [interviewId]);

  const fetchInterview = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/api/interviews/${interviewId}`);
      setInterview(response.data);
      setStatus(response.data.status);

      // If interview is in progress, start webcam and fetch question
      if (response.data.status === 'in-progress') {
        startWebcam();
        const jId = response.data.job_id?._id || response.data.job_id?.id || response.data.job_id;
        fetchQuestion(jId);
      }
    } catch (err) {
      console.error('Error fetching interview:', err);
      const msg = err.response?.data?.message || 'Failed to load interview';
      alert(msg);
      navigate('/candidate/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestion = async (jobId) => {
    try {
      console.log('Fetching question for jobId:', jobId);
      if (!jobId) {
        console.warn('No jobId provided to fetchQuestion');
        setQuestion('Please provide more details about your experience while we load the technical challenge.');
        return;
      }

      const response = await axiosInstance.post('/api/ai/generate-question', {
        job_id: jobId,
      });
      console.log('Question response received:', response.data);
      setQuestion(response.data.question);
    } catch (err) {
      console.error('Error fetching question:', err);
      console.log('Error details:', err.response?.data);
      setQuestion('Please explain your approach to solving this coding challenge.');
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      alert('Unable to access webcam. Please check permissions.');
    }
  };

  const startInterview = async () => {
    try {
      // Update interview status to in_progress
      await axiosInstance.put(`/api/interviews/${interviewId}`, {
        status: 'in-progress',
      });
      setStatus('in-progress');

      // Start webcam
      await startWebcam();
      
      // Initialize MediaRecorder
      if (streamRef.current) {
        const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
        // Reset the array
        videoChunksRef.current = [];
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            videoChunksRef.current.push(event.data);
          }
        };
        recorder.start(1000); // collect 1s chunks
        mediaRecorderRef.current = recorder;
      }

      // Fetch question
      const jId = interview.job_id?._id || interview.job_id?.id || interview.job_id;
      await fetchQuestion(jId);
    } catch (err) {
      console.error('Error starting interview:', err);
      alert('Failed to start interview');
    }
  };

  const startSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = transcript;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        if (isRecording) {
          recognition.start(); // Restart if still recording
        }
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } else {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
    }
  };

  const stopSpeechRecognition = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit your interview? This cannot be undone.')) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      let recordingUrl = '';
      
      // Stop MediaRecorder and wait a moment for the final chunks
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        // Wait briefly for the last ondataavailable to fire
        await new Promise(r => setTimeout(r, 500));
      }

      // Upload Video if we have chunks
      if (videoChunksRef.current.length > 0) {
        try {
          const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
          const formData = new FormData();
          formData.append('video', videoBlob, 'interview.webm');
          
          const uploadRes = await axiosInstance.post('/api/upload/video', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          recordingUrl = uploadRes.data.url;
        } catch (uploadErr) {
          console.error('Failed to upload video:', uploadErr);
          toast.error('Video upload failed, submitting without video.');
        }
      }

      // Prepare transcript data
      const transcriptData = transcript
        .split('.')
        .filter(t => t.trim().length > 0)
        .map(text => ({
          text_content: text.trim() + '.',
          timestamp: new Date(),
        }));

      // Submit interview
      await axiosInstance.post(`/api/interviews/${interviewId}/submit`, {
        code_submission: code,
        language,
        transcripts: transcriptData,
        proctoringLog: proctoringLogs,
        recording_url: recordingUrl,
      });

      // Stop recording and webcam
      stopSpeechRecognition();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      alert('Interview submitted successfully!');
      navigate('/candidate/dashboard');
    } catch (err) {
      console.error('Error submitting interview:', err);
      alert('Failed to submit interview. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeChange = (newCode) => {
    const safeCode = newCode || '';
    setCode(safeCode);
    if (socket && status === 'in-progress') {
      socket.emit("code_change", {
        room: interviewId,
        code: safeCode
      });
    }
  };

  const sendChatMessage = () => {
    if (chatMessage.trim() && socket) {
      const msgData = {
        room: interviewId,
        author: 'Candidate',
        message: chatMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      socket.emit("send_message", msgData);
      setChatHistory(prev => [...prev, msgData]);
      setChatMessage("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <BeatLoader color="#3b82f6" size={10} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Technical Interview</h1>
          {interview && (
            <p className="text-gray-400 mt-1">Job: {interview.job_title}</p>
          )}
        </div>
        {status === 'in-progress' && (
          <button
            onClick={() => setShowQrModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              isMobileConnected
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
            }`}
          >
            {isMobileConnected ? (
             <>
               <CheckCircle2 size={16} />
               Mobile Cam Linked
             </>
            ) : (
             <>
               <QrCode size={16} />
               Link Mobile Camera
             </>
            )}
          </button>
        )}
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Side - Webcam */}
        <div className="w-1/2 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4 relative">
            {status === 'in-progress' ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain rounded-lg bg-black"
                />
                
                {/* Secondary Mobile Camera Viewport (PIP) */}
                {isMobileConnected && (
                  <div className="absolute top-8 left-8 w-40 h-56 bg-black rounded-xl border-2 border-green-500/50 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in duration-300">
                    <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center px-2">
                       <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider flex items-center gap-1">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Mobile View
                       </span>
                    </div>
                    <video
                      ref={mobileVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </>
            ) : status === 'completed' ? (
              <div className="text-center text-gray-400 p-8">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  <Play size={32} />
                </div>
                <p className="text-xl font-bold mb-2 text-white">Interview Completed</p>
                <p className="mb-6 text-gray-400">You have already submitted this interview.</p>
                <button
                  onClick={() => navigate('/candidate/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition-all active:scale-95"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <p className="text-lg mb-4">Webcam will start when you begin the interview</p>
                <button
                  onClick={startInterview}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all text-white mx-auto"
                >
                  <Play size={20} />
                  Begin Interview
                </button>
              </div>
            )}
          </div>

          {/* Speech Recognition Controls */}
          {status === 'in-progress' && (
            <div className="border-t border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Voice Transcription</span>
                <button
                  onClick={isRecording ? stopSpeechRecognition : startSpeechRecognition}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${isRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff size={18} />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic size={18} />
                      Start Recording
                    </>
                  )}
                </button>
              </div>
              {transcript && (
                <div className="mt-2 p-3 bg-gray-700 rounded-lg max-h-32 overflow-y-auto">
                  <p className="text-sm text-gray-300">{transcript}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Code Editor */}
        <div className="w-1/2 bg-gray-900 flex flex-col">
          {/* Question & Language Controls Section */}
          <div className="border-b border-gray-700 p-4 bg-gray-800 flex justify-between items-start gap-4">
            <div className="flex-1">
              {status === 'in-progress' && question ? (
                <>
                  <h2 className="text-lg font-semibold mb-2">Interview Question</h2>
                  <p className="text-gray-300">{question}</p>
                </>
              ) : (
                <p className="text-gray-500 italic">Awaiting question...</p>
              )}
            </div>
            {status === 'in-progress' && (
              <div className="w-48 flex-shrink-0">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="flex-1 relative flex overflow-hidden">
            <div className="flex-1">
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Chat Sidebar Overlay */}
            {showChat && (
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-gray-800 border-l border-gray-700 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                  <h3 className="font-bold flex items-center gap-2">
                    <MessageSquare size={16} className="text-blue-400" /> Live Chat
                  </h3>
                  <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatHistory.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-500 italic text-xs">No messages yet...</div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.author === 'Candidate' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-3 py-2 rounded-xl text-xs max-w-[90%] ${msg.author === 'Candidate' ? 'bg-blue-600' : 'bg-gray-700 text-gray-200'}`}>
                        {msg.message}
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1">{msg.time}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none text-white"
                      placeholder="Type a message..."
                    />
                    <button onClick={sendChatMessage} className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 text-white">
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button & Chat Toggle */}
          {status === 'in-progress' && (
            <div className="border-t border-gray-700 p-4 flex gap-3">
              <button
                onClick={() => setShowChat(!showChat)}
                className={`px-4 py-3 rounded-lg border font-bold transition-all flex items-center gap-2 ${showChat ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'}`}
              >
                <MessageSquare size={18} />
                {chatHistory.some(m => m.author !== 'Candidate') && !showChat && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-bold shadow-lg shadow-green-900/10 transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <BeatLoader color="white" size={8} />
                ) : (
                  <>
                    <Send size={18} />
                    Submit Interview
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Proctoring Notice Overlay (Only for candidate awareness) */}
      {status === 'in-progress' && (
        <div className="fixed bottom-4 left-4 bg-gray-900/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 pointer-events-none z-50">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Proctoring Active: Tab switches are monitored
        </div>
      )}

      {/* QR Code Modal for Mobile Pairing */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowQrModal(false)} />
          <div className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-w-sm w-full p-6 text-center animate-in zoom-in duration-200">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="text-blue-400" size={24} />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">Connect Mobile Camera</h2>
            
            {isMobileConnected ? (
              <div className="py-8">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                  <CheckCircle2 className="text-green-500" size={40} />
                </div>
                <h3 className="text-lg font-bold text-green-400">Successfully Linked</h3>
                <p className="text-sm text-gray-400 mt-2">Your phone is now streaming the side-view.</p>
                <button 
                  onClick={() => setShowQrModal(false)}
                  className="mt-6 bg-gray-800 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all w-full"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-6">
                  Scan this QR code with your phone. Position your phone to your side to show your desk and hands to prevent cheating flags.
                </p>
                <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-6">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      window.location.origin.replace('localhost', window.location.hostname === 'localhost' ? '192.168.1.2' : window.location.hostname) + '/mobile-camera/' + interviewId
                    )}`} 
                    alt="Scan to pair mobile camera"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Waiting for connection...
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewRoom;
