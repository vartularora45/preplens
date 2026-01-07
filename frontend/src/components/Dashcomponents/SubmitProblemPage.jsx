import { useState, useEffect } from 'react';
import { Zap, Clock, ExternalLink, CheckCircle, XCircle, Link2, FileText } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function SubmitProblemPage() {
  // UI state
  const [mounted, setMounted] = useState(false);
  
  // Mode selection: 'link' or 'manual'
  const [mode, setMode] = useState(null);
  
  // Flow phases: 'input' | 'solving' | 'confirming'
  const [phase, setPhase] = useState('input');
  
  // Problem data extracted from URL (for link mode)
  const [problemData, setProblemData] = useState({
    url: '',
    platform: '',
    problemId: '',
    isValidUrl: false
  });
  
  // Manual form data (for manual mode)
  const [manualData, setManualData] = useState({
    problemId: '',
    topic: '',
    difficulty: '',
    timeTaken: '',
    result: '',
    attemptNumber: ''
  });
  
  // Timer state (for link mode)
  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Confirmation data (for link mode)
  const [result, setResult] = useState('');
  const [attemptNumber, setAttemptNumber] = useState(1);
  
  // Loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mount animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Timer tick - updates every second while solving
  useEffect(() => {
    let interval;
    if (phase === 'solving' && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase, startTime]);

  /**
   * Extracts platform and problem ID from URL
   */
  const parseUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      if (hostname.includes('leetcode.com')) {
        const match = urlObj.pathname.match(/\/problems\/([^\/]+)/);
        if (match) {
          return {
            platform: 'leetcode',
            problemId: match[1],
            isValidUrl: true
          };
        }
      }
      
      if (hostname.includes('codeforces.com')) {
        const match = urlObj.pathname.match(/\/problemset\/problem\/(\d+)\/([A-Z]\d?)/i);
        if (match) {
          return {
            platform: 'codeforces',
            problemId: `${match[1]}${match[2]}`,
            isValidUrl: true
          };
        }
      }
      
      return { platform: '', problemId: '', isValidUrl: false };
    } catch {
      return { platform: '', problemId: '', isValidUrl: false };
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    const parsed = parseUrl(url);
    setProblemData({ url, ...parsed });
  };

  const handleStartProblem = () => {
    setStartTime(Date.now());
    setPhase('solving');
    toast.success('Timer started! Good luck');
  };

  const handleMarkSolved = () => {
    const finalTime = Math.floor((Date.now() - startTime) / 1000);
    setElapsedSeconds(finalTime);
    setPhase('confirming');
  };

  /**
   * LINK MODE - Final submission
   */
  const handleLinkSubmit = async () => {
    if (!result) {
      toast.error('Please select Correct or Wrong');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      problemId: problemData.problemId,
      platform: problemData.platform,
      problemUrl: problemData.url,
      topic: 'General',
      difficulty: 'medium',
      timeTakenSeconds: elapsedSeconds,
      correct: result === 'Correct',
      attemptNumber: attemptNumber
    };

    console.log('LINK MODE PAYLOAD:', payload);

   
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/submission`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      
      if (response.status === 201) {
        toast.success('Problem tracked successfully!');
        // navigate('/dashboard');
      }
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
    

    setTimeout(() => {
      toast.success('Link mode: Problem submitted!');
      setIsSubmitting(false);
      handleReset();
    }, 1500);
  };

  /**
   * MANUAL MODE - Direct submission
   */
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      problemId: manualData.problemId,
      topic: manualData.topic,
      difficulty: manualData.difficulty,
      timeTakenSeconds: Number(manualData.timeTaken),
      correct: manualData.result === 'Correct',
      attemptNumber: Number(manualData.attemptNumber)
    };

    console.log('MANUAL MODE PAYLOAD:', payload);

    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/submission`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      if (response.status === 201) {
        toast.success('Problem submitted successfully!');
        // navigate('/dashboard');
      }
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
    

    setTimeout(() => {
      toast.success('Manual mode: Problem submitted!');
      setIsSubmitting(false);
      handleReset();
    }, 1500);
  };

  const handleManualChange = (e) => {
    setManualData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleReset = () => {
    setMode(null);
    setProblemData({ url: '', platform: '', problemId: '', isValidUrl: false });
    setManualData({
      problemId: '',
      topic: '',
      difficulty: '',
      timeTaken: '',
      result: '',
      attemptNumber: ''
    });
    setPhase('input');
    setStartTime(null);
    setElapsedSeconds(0);
    setResult('');
    setAttemptNumber(1);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderToggleButton = (options, keyName, colors = {}) =>
    options.map((option) => {
      const selected = manualData[keyName] === option;
      return (
        <button
          key={option}
          type="button"
          onClick={() =>
            setManualData((prev) => ({ ...prev, [keyName]: option }))
          }
          className={`py-3 text-xs tracking-widest font-mono rounded-md border transition-all duration-300
            ${
              selected
                ? colors.selected
                : `${colors.default} hover:scale-105`
            }`}
        >
          {option.toUpperCase()}
        </button>
      );
    });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#f4f4f5',
            border: '1px solid #3f3f46',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#18181b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#18181b',
            },
          },
        }}
      />
      <div
        className={`transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-zinc-800">
            <h1 className="text-3xl font-bold text-zinc-100">
              Submit Problem
            </h1>
            <p className="text-[10px] text-zinc-500 tracking-wider">
              {mode === null && 'CHOOSE YOUR INPUT METHOD'}
              {mode === 'link' && 'SMART MODE: PASTE > START > SOLVE > SUBMIT'}
              {mode === 'manual' && 'MANUAL MODE: FILL DETAILS > SUBMIT'}
            </p>
          </div>

          {/* MODE SELECTION */}
          {mode === null && (
            <div className="grid grid-cols-2 gap-4">
              {/* Link Mode */}
              <button
                onClick={() => setMode('link')}
                className="bg-gradient-to-br from-green-950/30 to-zinc-900 border border-green-800/50 p-8 rounded-2xl hover:scale-105 hover:shadow-[0_0_30px_rgba(0,255,128,0.3)] transition-all group"
              >
                <Link2 className="w-12 h-12 text-green-400 mx-auto mb-4 group-hover:rotate-12 transition-transform" />
                <h3 className="text-lg font-bold text-zinc-100 mb-2">Smart Link Mode</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Auto-track time, extract problem ID. Just paste URL and solve.
                </p>
                <div className="mt-4 text-[10px] text-green-400 tracking-widest">
                  RECOMMENDED
                </div>
              </button>

              {/* Manual Mode */}
              <button
                onClick={() => setMode('manual')}
                className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-8 rounded-2xl hover:scale-105 hover:border-zinc-700 transition-all group"
              >
                <FileText className="w-12 h-12 text-zinc-500 mx-auto mb-4 group-hover:text-zinc-400 transition-colors" />
                <h3 className="text-lg font-bold text-zinc-100 mb-2">Manual Entry</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Traditional form. Fill all details manually.
                </p>
                <div className="mt-4 text-[10px] text-zinc-600 tracking-widest">
                  CLASSIC MODE
                </div>
              </button>
            </div>
          )}

          {/* LINK MODE FLOW */}
          {mode === 'link' && (
            <>
              {/* PHASE 1: URL INPUT */}
              {phase === 'input' && (
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-lg">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] text-zinc-500 tracking-widest block mb-2">
                        PASTE PROBLEM URL
                      </label>
                      <input
                        type="text"
                        value={problemData.url}
                        onChange={handleUrlChange}
                        placeholder="https://leetcode.com/problems/two-sum/"
                        className="w-full bg-zinc-950 border border-zinc-700 px-4 py-3 text-sm text-zinc-300 rounded-md focus:border-green-500 focus:outline-none"
                      />
                    </div>

                    {problemData.url && (
                      <div
                        className={`p-4 rounded-lg border ${
                          problemData.isValidUrl
                            ? 'bg-green-950/20 border-green-800/50'
                            : 'bg-red-950/20 border-red-800/50'
                        }`}
                      >
                        {problemData.isValidUrl ? (
                          <div className="space-y-2">
                            <p className="text-xs text-green-400 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              Valid URL detected
                            </p>
                            <div className="text-[10px] text-zinc-400 space-y-1">
                              <p>Platform: <span className="text-green-400 font-mono">{problemData.platform.toUpperCase()}</span></p>
                              <p>Problem ID: <span className="text-green-400 font-mono">{problemData.problemId}</span></p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-red-400 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Invalid URL. Supported: LeetCode, Codeforces
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      onClick={handleStartProblem}
                      disabled={!problemData.isValidUrl}
                      className="w-full py-4 bg-green-600 text-white text-xs tracking-widest rounded-md hover:bg-green-500 hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="flex justify-center items-center gap-2">
                        <Zap className="w-4 h-4" /> START PROBLEM
                      </span>
                    </button>

                    <button
                      onClick={handleReset}
                      className="w-full py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      Back to mode selection
                    </button>
                  </div>
                </div>
              )}

              {/* PHASE 2: SOLVING */}
              {phase === 'solving' && (
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-lg">
                  <div className="space-y-6">
                    <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-zinc-500 tracking-widest">SOLVING</p>
                          <p className="text-sm text-zinc-300 font-mono mt-1">{problemData.problemId}</p>
                          <p className="text-[10px] text-zinc-600 mt-1">{problemData.platform.toUpperCase()}</p>
                        </div>
                        <a
                          href={problemData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-950/30 to-zinc-950 border border-green-800/50 p-8 rounded-xl">
                      <div className="text-center space-y-4">
                        <Clock className="w-8 h-8 text-green-400 mx-auto animate-pulse" />
                        <div>
                          <p className="text-[10px] text-zinc-500 tracking-widest">TIME ELAPSED</p>
                          <p className="text-5xl font-bold text-green-400 font-mono mt-2">
                            {formatTime(elapsedSeconds)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleMarkSolved}
                      className="w-full py-4 bg-zinc-800 border border-zinc-700 text-white text-xs tracking-widest rounded-md hover:scale-105 transition-all"
                    >
                      <span className="flex justify-center items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> MARK AS SOLVED
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* PHASE 3: CONFIRMATION */}
              {phase === 'confirming' && (
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-lg">
                  <div className="space-y-6">
                    <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-700">
                      <p className="text-[10px] text-zinc-500 tracking-widest">COMPLETED</p>
                      <p className="text-lg text-zinc-300 font-mono mt-1">{problemData.problemId}</p>
                      <p className="text-sm text-zinc-500 mt-2">
                        Time: <span className="text-green-400 font-mono">{formatTime(elapsedSeconds)}</span>
                      </p>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-500 tracking-widest block mb-2">
                        RESULT
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Correct', 'Wrong'].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setResult(option)}
                            className={`py-3 text-xs tracking-widest font-mono rounded-md border transition-all duration-300
                              ${
                                result === option
                                  ? option === 'Correct'
                                    ? 'bg-green-950/40 text-green-400 border-green-800'
                                    : 'bg-red-950/40 text-red-400 border-red-800'
                                  : 'bg-zinc-950 text-zinc-500 border-zinc-700 hover:scale-105'
                              }`}
                          >
                            {option.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-500 tracking-widest block mb-2">
                        ATTEMPT NUMBER
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={attemptNumber}
                        onChange={(e) => setAttemptNumber(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-700 px-4 py-3 text-sm text-zinc-300 rounded-md focus:border-green-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleReset}
                        className="flex-1 py-3 bg-zinc-950 border border-zinc-700 text-zinc-400 text-xs tracking-widest rounded-md hover:bg-zinc-800 transition-all"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={handleLinkSubmit}
                        disabled={isSubmitting || !result}
                        className="flex-1 py-3 bg-green-600 text-white text-xs tracking-widest rounded-md hover:bg-green-500 hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'SUBMITTING...' : 'SUBMIT & ANALYZE'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* MANUAL MODE FORM */}
          {mode === 'manual' && (
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-lg">
              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] text-zinc-500 tracking-widest">
                    PROBLEM ID
                  </label>
                  <input
                    type="text"
                    name="problemId"
                    value={manualData.problemId}
                    onChange={handleManualChange}
                    required
                    placeholder="LC-123 / CF-456"
                    className="w-full bg-zinc-950 border border-zinc-700 px-4 py-3 text-sm text-zinc-300 rounded-md focus:border-green-500 focus:outline-none mt-2"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 tracking-widest">
                    TOPIC
                  </label>
                  <select
                    name="topic"
                    value={manualData.topic}
                    onChange={handleManualChange}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 px-4 py-3 text-sm text-zinc-300 rounded-md focus:border-green-500 focus:outline-none mt-2"
                  >
                    <option value="">Select topic</option>
                    <option>Arrays</option>
                    <option>Strings</option>
                    <option>LinkedList</option>
                    <option>Trees</option>
                    <option>Graphs</option>
                    <option>DP</option>
                    <option>Greedy</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 tracking-widest">
                    DIFFICULTY
                  </label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {renderToggleButton(['easy', 'medium', 'hard'], 'difficulty', {
                      selected: 'bg-green-600 text-white border-green-500',
                      default: 'bg-zinc-950 text-zinc-500 border-zinc-700'
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 tracking-widest">
                    TIME TAKEN (sec)
                  </label>
                  <input
                    type="number"
                    name="timeTaken"
                    value={manualData.timeTaken}
                    onChange={handleManualChange}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 px-4 py-3 text-sm text-zinc-300 rounded-md mt-2"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 tracking-widest">
                    RESULT
                  </label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {renderToggleButton(['Correct', 'Wrong'], 'result', {
                      selected:
                        manualData.result === 'Correct'
                          ? 'bg-green-950/40 text-green-400 border-green-800'
                          : 'bg-red-950/40 text-red-400 border-red-800',
                      default: 'bg-zinc-950 text-zinc-500 border-zinc-700'
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 tracking-widest">
                    ATTEMPT NUMBER
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="attemptNumber"
                    value={manualData.attemptNumber}
                    onChange={handleManualChange}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 px-4 py-3 text-sm text-zinc-300 rounded-md mt-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-zinc-800 border border-zinc-700 text-xs tracking-widest rounded-md hover:scale-105 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'ANALYZING...' : (
                    <span className="flex justify-center items-center gap-2">
                      <Zap className="w-4 h-4" /> SUBMIT & ANALYZE
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  Back to mode selection
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}