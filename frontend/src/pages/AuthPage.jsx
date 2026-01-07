import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from '../utils/Loading';
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRedirectLoading, setShowRedirectLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    setMounted(true);
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin 
        ? `${API_BASE_URL}/users/login`
        : `${API_BASE_URL}/users/register`;

      const response = await axios.post(endpoint, {
        email,
        password
      });

      // Success
      setSuccess(isLogin ? 'Login successful!' : 'Account created successfully!');
    
      // Store token if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Set default authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }

      // Store user data if provided
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      console.log('Success:', response.data);
      
      // Example: Redirect after 1.5 seconds
      // show loading before redirect
setShowRedirectLoading(true);

setTimeout(() => {
  navigate('/dashboard');
}, 2500);


    } catch (err) {
      if (err.response) {
        // Server responded with error
        setError(err.response.data.message || 'An error occurred');
      } else if (err.request) {
        // Request made but no response
        setError('Unable to connect to server. Please check if the backend is running.');
      } else {
        // Something else went wrong
        setError(err.message || 'An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsTransitioning(true);
    setError('');
    setSuccess('');
    setTimeout(() => {
      setIsLogin(!isLogin);
      setPassword('');
      setConfirmPassword('');
      setIsTransitioning(false);
    }, 200);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (showRedirectLoading) {
  return <Loading text="Initializing your dashboard..." />;
}

if (isLoading) {
  return <Loading text={isLogin ? "Authenticating..." : "Creating your account..."} />;
}

  return (
    <div className="min-h-screen min-w-screen bg-black text-zinc-300 font-mono relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(39, 39, 42, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(39, 39, 42, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}
        />
      </div>

      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-zinc-600 rounded-full opacity-30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `float ${particle.duration}s ease-in-out infinite ${particle.delay}s`
          }}
        />
      ))}

      {/* Mouse gradient effect */}
      <div 
        className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl transition-all duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(161, 161, 170, 0.4) 0%, transparent 70%)',
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* Scanline effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(161, 161, 170, 0.05) 2px, rgba(161, 161, 170, 0.05) 4px)'
        }}
      />

      {/* Main content container */}
      <div className={`relative z-10 w-full max-w-6xl grid md:grid-cols-2 gap-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Left side - Branding */}
        <div className="flex flex-col justify-center space-y-8 p-8">
          <div className="space-y-2">
            <div className="text-[10px] text-zinc-600 tracking-widest mb-4">System v2.1.4</div>
            <h1 className="text-5xl font-bold tracking-tight text-zinc-100 mb-4">
              PrepLens
            </h1>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
              Advanced interview performance analytics. Diagnose weaknesses with precision. Elevate your preparation.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Diagnostic Insights', value: '98%' },
              { label: 'Pattern Recognition', value: '2.4s' },
              { label: 'Success Rate', value: '94%' }
            ].map((stat, i) => (
              <div key={i} className="border border-zinc-800 p-4 bg-zinc-950/50 backdrop-blur-sm hover:border-zinc-700 transition-all duration-300">
                <div className="text-[10px] text-zinc-600 mb-2">{stat.label}</div>
                <div className="text-xl font-bold text-zinc-300">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="relative border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl p-8 shadow-2xl">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-zinc-600"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-zinc-600"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-zinc-600"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zinc-600"></div>

          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-zinc-100">PrepLens</h2>
              <p className="text-xs text-zinc-600">Interview Performance Analytics</p>
            </div>

            {/* Tab switcher */}
            <div className="flex border border-zinc-800 overflow-hidden">
              <button
                onClick={() => isLogin || switchMode()}
                className={`flex-1 py-3 text-xs font-mono transition-all duration-300 tracking-wider ${
                  isLogin ? 'bg-zinc-800 text-zinc-300' : 'text-zinc-600 hover:text-zinc-500'
                }`}
              >
                LOGIN
              </button>
              <button
                onClick={() => !isLogin || switchMode()}
                className={`flex-1 py-3 text-xs font-mono transition-all duration-300 tracking-wider ${
                  !isLogin ? 'bg-zinc-800 text-zinc-300' : 'text-zinc-600 hover:text-zinc-500'
                }`}
              >
                SIGNUP
              </button>
            </div>

            {/* Error/Success messages */}
            {error && (
              <div className="bg-red-950/30 border border-red-800 text-red-400 px-4 py-3 text-xs">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-950/30 border border-green-800 text-green-400 px-4 py-3 text-xs">
                {success}
              </div>
            )}

            {/* Form fields */}
            <div className={`space-y-4 transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <div className="space-y-2">
                <label className="text-xs text-zinc-500 tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="your.email@domain.com"
                  disabled={isLoading}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 transition-all duration-300 font-mono placeholder:text-zinc-700 hover:border-zinc-700 hover:bg-zinc-900 disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-500 tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 transition-all duration-300 font-mono placeholder:text-zinc-700 hover:border-zinc-700 hover:bg-zinc-900 disabled:opacity-50"
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 tracking-wider">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="••••••••••••"
                    disabled={isLoading}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 transition-all duration-300 font-mono placeholder:text-zinc-700 hover:border-zinc-700 hover:bg-zinc-900 disabled:opacity-50"
                  />
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 text-xs tracking-widest transition-all duration-300 border border-zinc-700 hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '⟳ PROCESSING...' : (isLogin ? '→ ENTER SYSTEM' : '→ CREATE ACCOUNT')}
              </button>

              {/* Switch mode link */}
              <button
                onClick={switchMode}
                disabled={isLoading}
                className="w-full text-center text-xs text-zinc-600 hover:text-zinc-500 transition-colors duration-200 disabled:opacity-50"
              >
                {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
              </button>

              {/* Signup info */}
              {!isLogin && (
                <p className="text-[10px] text-zinc-700 leading-relaxed text-center">
                  By creating an account, you gain access to diagnostic insights that reveal why you struggle in coding interviews—not just which topics you miss.
                </p>
              )}
            </div>
          </div>

          {/* Bottom decorative line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
}