import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axiosInstance from '../../utils/axiosInstance';
import { BeatLoader } from 'react-spinners';
import { Mic, MicOff, Square, Play, Send } from 'lucide-react';

const InterviewRoom = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [question, setQuestion] = useState('');
  const [code, setCode] = useState('// Write your code here\n');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('scheduled'); // scheduled, in-progress, completed
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const speechRecognitionRef = useRef(null);

  useEffect(() => {
    fetchInterview();
    return () => {
      // Cleanup
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
        transcripts: transcriptData,
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
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold">Technical Interview</h1>
        {interview && (
          <p className="text-gray-400 mt-1">Job: {interview.job_title}</p>
        )}
      </div>

      {/* Main Content - Split Screen */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Side - Webcam */}
        <div className="w-1/2 bg-gray-800 border-r border-gray-700 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            {status === 'in-progress' ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain rounded-lg bg-black"
              />
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
          {/* Question Section */}
          {status === 'in-progress' && question && (
            <div className="border-b border-gray-700 p-4 bg-gray-800">
              <h2 className="text-lg font-semibold mb-2">Interview Question</h2>
              <p className="text-gray-300">{question}</p>
            </div>
          )}

          {/* Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={(value) => setCode(value || '')}
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

          {/* Submit Button */}
          {status === 'in-progress' && (
            <div className="border-t border-gray-700 p-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-medium"
              >
                {isSubmitting ? (
                  <>
                    <BeatLoader color="white" size={8} />
                    Submitting...
                  </>
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
    </div>
  );
};

export default InterviewRoom;
