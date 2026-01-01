import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';


export default function SubmitProblemPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    problemId: '',
    topic: '',
    difficulty: '',
    timeTaken: '',
    result: '',
    attemptNumber: ''
  });
const token = localStorage.getItem('token');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        problemId: formData.problemId,
        topic: formData.topic,
        difficulty: formData.difficulty,
        timeTakenSeconds: Number(formData.timeTaken),
        correct: formData.result === 'Correct',
        attemptNumber: Number(formData.attemptNumber)
      };

      const response = await axios.post(
        'http://localhost:5000/api/submission',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      console.log('Submission response:', response.data);
      if(response.status === 201){
        toast.success('Problem submitted successfully!');

      }
      else if(response.status === 500){
        toast.error('Server error. Please try again later.');
      }
      else if(response.status === 400){
        toast.error('Bad request. Please check your input.');
      }
      else{
        toast.error('Submission failed. Please try again.');
      }


      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      console.error('Submission error:', err.response?.data || err.message);
      alert('Submission failed. Backend check kar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderToggleButton = (options, keyName, colors = {}) =>
    options.map((option) => {
      const selected = formData[keyName] === option;

      return (
        <button
          key={option}
          type="button"
          onClick={() =>
            setFormData((prev) => ({ ...prev, [keyName]: option }))
          }
          className={`py-3 text-xs tracking-widest font-mono rounded-md border transition-all duration-300
            ${
              selected
                ? colors.selected
                : `${colors.default} hover:scale-105 hover:shadow-[0_0_10px_rgba(0,255,128,0.4)]`
            }`}
        >
          {option.toUpperCase()}
        </button>
      );
    });

  return (
  

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
            AI will analyze your weakness. No mercy.
          </p>
        </div>

        {/* Form */}
        <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-2xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Problem ID */}
            <div>
              <label className="text-[10px] text-zinc-500 tracking-widest">
                PROBLEM ID
              </label>
              <input
                type="text"
                name="problemId"
                value={formData.problemId}
                onChange={handleChange}
                required
                placeholder="LC-123 / CF-456"
                className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-zinc-300 rounded-md focus:border-green-500 focus:outline-none"
              />
            </div>

            {/* Topic */}
            <div>
              <label className="text-[10px] text-zinc-500 tracking-widest">
                TOPIC
              </label>
              <select
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                required
                className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-zinc-300 rounded-md focus:border-green-500 focus:outline-none"
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

            {/* Difficulty */}
            <div>
              <label className="text-[10px] text-zinc-500 tracking-widest">
                DIFFICULTY
              </label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {renderToggleButton(['easy', 'medium', 'hard'], 'difficulty', {
                  selected:
                    'bg-green-600 text-white border-green-500 shadow-[0_0_10px_rgba(0,255,128,0.7)]',
                  default:
                    'bg-zinc-900 text-zinc-500 border-zinc-800'
                })}
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="text-[10px] text-zinc-500 tracking-widest">
                TIME TAKEN (sec)
              </label>
              <input
                type="number"
                name="timeTaken"
                value={formData.timeTaken}
                onChange={handleChange}
                required
                className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-zinc-300 rounded-md"
              />
            </div>

            {/* Result */}
            <div>
              <label className="text-[10px] text-zinc-500 tracking-widest">
                RESULT
              </label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {renderToggleButton(['Correct', 'Wrong'], 'result', {
                  selected:
                    formData.result === 'Correct'
                      ? 'bg-green-950/40 text-green-400 border-green-800'
                      : 'bg-red-950/40 text-red-400 border-red-800',
                  default:
                    'bg-zinc-900 text-zinc-500 border-zinc-800'
                })}
              </div>
            </div>

            {/* Attempt */}
            <div>
              <label className="text-[10px] text-zinc-500 tracking-widest">
                ATTEMPT NUMBER
              </label>
              <input
                type="number"
                min="1"
                name="attemptNumber"
                value={formData.attemptNumber}
                onChange={handleChange}
                required
                className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-zinc-300 rounded-md"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-zinc-800 border border-zinc-700 text-xs tracking-widest rounded-md hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,128,0.5)] transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'ANALYZING...' : (
                <span className="flex justify-center items-center gap-2">
                  <Zap className="w-4 h-4" /> SUBMIT & ANALYZE
                </span>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
