import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { Mic, MicOff, CheckCircle, Bot, BrainCircuit, Activity, FileText } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const MockInterview = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('');
  const [sessionState, setSessionState] = useState('setup'); // setup, in-progress, evaluating, results
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Audio & Transcript State
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentTranscriptBatch, setCurrentTranscriptBatch] = useState([]);
  
  const recognitionRef = useRef(null);
  
  // Results State
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    // Setup Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let currentIterim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + event.results[i][0].transcript + ' ');
          } else {
             currentIterim += event.results[i][0].transcript;
          }
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          alert("Microphone access is required for mock interviews.");
          setIsRecording(false);
        }
      };
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleStartSession = async () => {
    if (!mode) return alert("Select an interview mode first");
    setSessionState('evaluating'); // temporary loading state
    
    try {
      const res = await axiosInstance.post('/api/ai/mock-interview/start', { mode });
      if (res.data.success) {
         setQuestions(res.data.questions);
         setSessionState('in-progress');
         setCurrentTranscriptBatch([]);
      }
    } catch (err) {
      alert("Failed to start mock session: " + err.message);
      setSessionState('setup');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };
  
  const handleNextQuestion = () => {
    // Save transcript batch for current question
    setCurrentTranscriptBatch(prev => [
       ...prev, 
       { q: questions[currentQuestionIdx], a: transcript }
    ]);
    
    setTranscript('');
    setIsRecording(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    
    if (currentQuestionIdx < questions.length - 1) {
       setCurrentQuestionIdx(prev => prev + 1);
    } else {
       handleSubmitSession();
    }
  };
  
  const handleSubmitSession = async () => {
    setSessionState('evaluating');
    try {
      // Gather final batch if needed
      const finalTranscripts = [...currentTranscriptBatch, { q: questions[currentQuestionIdx], text_content: transcript }];
      
      const res = await axiosInstance.post('/api/ai/mock-interview/submit', {
        mode,
        transcripts: finalTranscripts
      });
      
      if (res.data.success) {
         setEvaluation(res.data.evaluation);
         setSessionState('results');
      }
    } catch (err) {
      alert("Evaluation failed.");
      setSessionState('setup');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
               <h1 className="text-2xl font-bold flex items-center gap-3">
                 <Bot className="text-blue-500" />
                 AI Mock Interview Simulator
               </h1>
               <p className="text-gray-500 mt-1">Practice specific rounds, train your pacing, and drop filler words.</p>
            </div>
            {sessionState === 'in-progress' && (
               <div className="px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200">
                  Question {currentQuestionIdx + 1} of {questions.length}
               </div>
            )}
        </div>

        {/* Setup Screen */}
        {sessionState === 'setup' && (
           <div className="bg-white rounded-2xl p-6 sm:p-10 text-center border border-gray-100 shadow-sm">
              <BrainCircuit size={64} className="text-indigo-400 mx-auto mb-6" />
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-8">Choose your Mock Interview Mode</h2>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10">
                 {['HR', 'Technical', 'Case Study', 'Behavioral'].map(m => (
                    <button 
                       key={m}
                       onClick={() => setMode(m)}
                       className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 font-bold transition-all text-sm sm:text-base flex-1 sm:flex-none min-w-[45%] sm:min-w-0 ${mode === m ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-500/20 scale-105' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                    >
                       {m}
                    </button>
                 ))}
              </div>
              <button 
                 onClick={handleStartSession}
                 className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl text-sm sm:text-base"
              >
                 Start Practice Session
              </button>
           </div>
        )}
        
        {/* Loading Evaluator */}
        {sessionState === 'evaluating' && (
           <div className="bg-white rounded-2xl p-20 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
               <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6" />
               <h3 className="text-xl font-bold text-gray-900">AI is processing...</h3>
               <p className="text-gray-500">Evaluating your tone, pace, filler words, and answer format.</p>
           </div>
        )}

        {/* Real-time Session */}
        {sessionState === 'in-progress' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                 {/* Question Card */}
                 <div className="bg-indigo-600 text-white rounded-2xl p-8 shadow-xl shadow-indigo-600/20">
                    <h3 className="text-indigo-200 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Bot size={14} /> AI Interviewer Asked:
                    </h3>
                    <p className="text-2xl font-medium leading-relaxed">
                       "{questions[currentQuestionIdx]}"
                    </p>
                 </div>
                 
                 {/* Transcription / Audio */}
                 <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[300px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <Activity className={isRecording ? 'text-red-500' : 'text-gray-400'} />
                          Your Answer Transcript
                       </h3>
                       <button 
                          onClick={toggleRecording}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${isRecording ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                       >
                          {isRecording ? <><MicOff size={16} /> Stop Listening</> : <><Mic size={16} /> Read Aloud</>}
                       </button>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-4 overflow-y-auto">
                       {transcript ? (
                          <p className="text-gray-700 leading-relaxed">{transcript}</p>
                       ) : (
                          <div className="h-full flex items-center justify-center text-gray-400 italic text-sm text-center px-10">
                             Hit 'Read Aloud' and speak clearly into your microphone to record your answer. Note: Make sure to allow microphone permissions in the browser!
                          </div>
                       )}
                    </div>
                 </div>
              </div>
              
              {/* Controls */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-end">
                 <button 
                    onClick={handleNextQuestion}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-2 mt-4"
                 >
                    {currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'Complete Session'} <CheckCircle size={18} />
                 </button>
              </div>
           </div>
        )}

        {/* Results Page */}
        {sessionState === 'results' && evaluation && (
           <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px]" />
              <div className="relative">
                 <h2 className="text-3xl font-black mb-8">Performance Report</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
                       <p className="text-xs uppercase font-black text-blue-500 tracking-widest mb-2">Overall Score</p>
                       <p className="text-5xl font-black text-blue-700">{evaluation.score}<span className="text-xl text-blue-300">/10</span></p>
                    </div>
                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 text-center">
                       <p className="text-xs uppercase font-black text-amber-500 tracking-widest mb-2">Pacing</p>
                       <p className="text-2xl font-bold text-amber-700 mt-3">{evaluation.pace}</p>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 text-center">
                       <p className="text-xs uppercase font-black text-purple-500 tracking-widest mb-2">Tone</p>
                       <p className="text-2xl font-bold text-purple-700 mt-3">{evaluation.tone}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-green-600 font-black text-xs uppercase tracking-widest mb-3 border-b pb-2">Strengths</h3>
                        <ul className="space-y-2">
                          {evaluation.strengths.map((str, idx) => (
                             <li key={idx} className="flex gap-2 text-gray-700 text-sm">
                                <span className="text-green-500 mt-1">✓</span> {str}
                             </li>
                          ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-red-500 font-black text-xs uppercase tracking-widest mb-3 border-b pb-2">Areas for Improvement</h3>
                        <ul className="space-y-2">
                          {evaluation.improvements.map((imp, idx) => (
                             <li key={idx} className="flex gap-2 text-gray-700 text-sm">
                                <span className="text-red-400 mt-1">!</span> {imp}
                             </li>
                          ))}
                        </ul>
                    </div>
                 </div>
                 
                 <div className="mb-10">
                    <h3 className="text-gray-400 font-black text-xs uppercase tracking-widest mb-3">Feedback Summary</h3>
                    <p className="text-gray-700 leading-relaxed p-6 bg-gray-50 rounded-2xl border border-gray-100">
                       {evaluation.feedback}
                    </p>
                 </div>

                 {evaluation.filler_words && evaluation.filler_words.length > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                       <h3 className="text-red-600 font-black text-xs uppercase tracking-widest mb-3">⚠️ Filler Word Crutches Detected</h3>
                       <div className="flex flex-wrap gap-2">
                          {evaluation.filler_words.map((word, idx) => (
                             <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 font-bold rounded-lg text-sm border border-red-200">
                                "{word}"
                             </span>
                          ))}
                       </div>
                       <p className="text-xs text-red-500 mt-3 font-medium">Try to replace these with short pauses to sound more confident and prepared.</p>
                    </div>
                 )}

                 <div className="mt-10 text-center">
                    <button 
                       onClick={() => setSessionState('setup')}
                       className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all border border-gray-200"
                    >
                       Practice Another Round
                    </button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MockInterview;
