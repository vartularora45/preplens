import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, FileText, User, Bell, TrendingUp, TrendingDown, Clock, Target, AlertCircle, CheckCircle, XCircle, ArrowRight, Zap, Brain, X } from 'lucide-react';
import AIInsights from './Dashutils/AIInsights';
const API_BASE_URL = 'http://localhost:5000/api';

// ============================================================================
// UTILITY FUNCTIONS - Pure logic, no side effects
// ============================================================================

/**
 * Calculate accuracy from submissions array
 * @param {Array} submissions - Array of submission objects with result.correct
 * @returns {number} Accuracy percentage (0-100)
 */
function calculateAccuracy(submissions) {
  if (!submissions || submissions.length === 0) return null;
  const correctCount = submissions.filter(s => s.result?.correct).length;
  return Math.round((correctCount / submissions.length) * 100);
}

/**
 * Classify topic status based on accuracy
 * @param {number} accuracy - Accuracy percentage
 * @returns {object} Classification with severity, color, reason
 */
function classifyTopicStatus(accuracy) {
  if (accuracy === null || accuracy === undefined) {
    return { severity: 'unknown', color: 'gray', reason: 'Insufficient Data', isWeakness: false };
  }
  
  if (accuracy >= 80) {
    return { severity: 'strong', color: 'green', reason: 'Strong Performance', isWeakness: false };
  } else if (accuracy >= 60) {
    return { severity: 'medium', color: 'yellow', reason: 'Inconsistent', isWeakness: true };
  } else {
    return { severity: 'critical', color: 'red', reason: 'Low Accuracy', isWeakness: true };
  }
}

/**
 * Get weakest topic from processed topics
 * @param {Array} topics - Array of processed topic objects with accuracy
 * @returns {string} Topic name with lowest accuracy
 */
function getWeakestTopic(topics) {
  if (!topics || topics.length === 0) return 'N/A';
  
  // Filter topics with valid accuracy and sort by accuracy ascending
  const validTopics = topics.filter(t => typeof t.accuracy === 'number');
  if (validTopics.length === 0) return 'N/A';
  
  const sorted = [...validTopics].sort((a, b) => a.accuracy - b.accuracy);
  return sorted[0].topic;
}

/**
 * Process raw backend data into structured topics
 * @param {object} dashboardData - Raw API response
 * @returns {object} { weaknesses: [], strengths: [], allTopics: [] }
 */
function processTopicsData(dashboardData) {
  if (!dashboardData) return { weaknesses: [], strengths: [], allTopics: [] };
  
  const { recentSubmissions = [], weaknesses: rawWeaknesses = [] } = dashboardData;
  const topicMap = new Map();
  
  // Group submissions by topic (case-insensitive)
  recentSubmissions.forEach(sub => {
    const topicKey = sub.topic.toLowerCase();
    if (!topicMap.has(topicKey)) {
      topicMap.set(topicKey, {
        topic: sub.topic,
        submissions: []
      });
    }
    topicMap.get(topicKey).submissions.push(sub);
  });
  
  // Process each unique topic
  const allTopics = [];
  
  topicMap.forEach((data, topicKey) => {
    const { topic, submissions } = data;
    
    // Calculate accuracy from actual submissions
    const accuracy = calculateAccuracy(submissions);
    
    // Skip if insufficient data
    if (accuracy === null || submissions.length < 3) {
      return;
    }
    
    // Classify topic
    const classification = classifyTopicStatus(accuracy);
    
    // Calculate stats
    const correctCount = submissions.filter(s => s.result?.correct).length;
    const avgTime = submissions.length > 0
      ? Math.round(submissions.reduce((sum, s) => sum + (s.result?.timeTakenSeconds || 0), 0) / submissions.length)
      : 0;
    
    const topicData = {
      id: `${topicKey}-${Date.now()}`,
      topic: topic,
      accuracy: accuracy,
      totalAttempts: submissions.length,
      correctAttempts: correctCount,
      avgTime: avgTime,
      ...classification,
      commonMistakes: ['Review recent incorrect submissions', 'Focus on edge cases'],
      recommendedProblems: ['Practice similar problems', 'Review topic fundamentals']
    };
    
    allTopics.push(topicData);
  });
  
  // Separate weaknesses and strengths
  const weaknesses = allTopics.filter(t => t.isWeakness);
  const strengths = allTopics.filter(t => !t.isWeakness && t.severity === 'strong');
  
  return { weaknesses, strengths, allTopics };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const api = {
  dashboard: async (token) => {
    const res = await fetch(`${API_BASE_URL}/analysis/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  }
};

// ============================================================================
// COMPONENTS
// ============================================================================

function SkeletonCard() {
  return (
    <div className="bg-zinc-950 border border-zinc-800 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-zinc-800"></div>
        <div className="w-16 h-4 bg-zinc-800"></div>
      </div>
      <div className="w-24 h-8 bg-zinc-800 mb-2"></div>
      <div className="w-32 h-3 bg-zinc-800"></div>
    </div>
  );
}

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-zinc-950 border border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 p-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Topic Details</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-900 transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TopicCard({ topic, onClick, showAsStrength = false }) {
  const colorClasses = {
    red: 'border-red-900/50 bg-red-950/20 hover:border-red-800',
    yellow: 'border-yellow-900/50 bg-yellow-950/20 hover:border-yellow-800',
    green: 'border-green-900/50 bg-green-950/20 hover:border-green-800',
    gray: 'border-zinc-800 bg-zinc-900/20 hover:border-zinc-700'
  };

  const iconColorClasses = {
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
    gray: 'text-zinc-500'
  };

  const progressColorClasses = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    gray: 'bg-zinc-600'
  };

  const Icon = showAsStrength ? CheckCircle : AlertCircle;

  return (
    <div className={`border p-6 transition-all duration-300 relative cursor-pointer ${colorClasses[topic.color]}`} onClick={onClick}>
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-zinc-700"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-zinc-700"></div>
      
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-100 mb-1 tracking-tight">{topic.topic}</h3>
          <p className={`text-[10px] tracking-widest uppercase ${iconColorClasses[topic.color]}`}>{topic.reason}</p>
        </div>
        <Icon className={`w-5 h-5 ${iconColorClasses[topic.color]}`} />
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-zinc-500 mb-2 font-mono tracking-wider">
          <span>ACCURACY</span>
          <span>{topic.accuracy}%</span>
        </div>
        <div className="h-1.5 bg-zinc-900 overflow-hidden border border-zinc-800">
          <div 
            className={`h-full ${progressColorClasses[topic.color]} transition-all duration-1000`}
            style={{ width: `${Math.min(topic.accuracy, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mb-4">
        <span>{topic.totalAttempts} attempts</span>
        <span>{topic.avgTime}s avg</span>
      </div>
      
      <button className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center space-x-2 transition-colors font-mono tracking-wide">
        <span>VIEW DETAILS</span>
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}

function TopicDetail({ topic }) {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 p-4">
          <div className="text-2xl font-bold text-zinc-100 mb-1">{topic.accuracy}%</div>
          <div className="text-[10px] text-zinc-600 tracking-widest">ACCURACY</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4">
          <div className="text-2xl font-bold text-zinc-100 mb-1">{topic.totalAttempts}</div>
          <div className="text-[10px] text-zinc-600 tracking-widest">ATTEMPTS</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4">
          <div className="text-2xl font-bold text-zinc-100 mb-1">{topic.avgTime}s</div>
          <div className="text-[10px] text-zinc-600 tracking-widest">AVG TIME</div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-zinc-100 tracking-widest mb-3">PERFORMANCE SUMMARY</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">
          You've completed {topic.totalAttempts} problems in this topic with a {topic.accuracy}% accuracy rate.
          {topic.accuracy < 60 && " Focus on understanding fundamental concepts and practice more problems."}
          {topic.accuracy >= 60 && topic.accuracy < 80 && " You're making progress! Work on consistency and edge cases."}
          {topic.accuracy >= 80 && " Excellent work! Keep maintaining this level of performance."}
        </p>
      </div>

      <div>
        <h3 className="text-xs font-bold text-zinc-100 tracking-widest mb-3">RECOMMENDED ACTIONS</h3>
        <ul className="space-y-2">
          {topic.commonMistakes.map((action, idx) => (
            <li key={idx} className="flex items-start space-x-2 text-xs text-zinc-400">
              <ArrowRight className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, trendValue, loading }) {
  if (loading) return <SkeletonCard />;

  return (
    <div className="bg-zinc-950 border border-zinc-800 p-6 hover:border-zinc-700 transition-all duration-300 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-zinc-700 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-zinc-700 opacity-50"></div>
      
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700 transition-colors">
          <Icon className="w-5 h-5 text-zinc-500" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-xs font-mono ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-zinc-100 mb-2 font-mono">{value}</div>
      <div className="text-[10px] text-zinc-600 tracking-widest uppercase">{label}</div>
    </div>
  );
}

function InsightItem({ insight }) {
  const typeConfig = {
    warning: { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-950/30', border: 'border-red-900/50' },
    success: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-950/30', border: 'border-green-900/50' },
    alert: { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-950/30', border: 'border-yellow-900/50' }
  };

  const config = typeConfig[insight.type] || typeConfig.alert;
  const Icon = config.icon;

  return (
    <div className={`flex space-x-3 p-4 border ${config.border} ${config.bg} hover:border-zinc-700 transition-all duration-200`}>
      <Icon className={`w-4 h-4 ${config.color} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-300 leading-relaxed mb-2">{insight.text}</p>
        <p className="text-[9px] text-zinc-600 tracking-wider font-mono">{insight.time}</p>
      </div>
    </div>
  );
}

function NotificationDropdown({ insights, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-12 right-0 w-80 bg-zinc-950 border border-zinc-800 shadow-2xl z-50 max-h-96 overflow-y-auto">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-950">
        <h3 className="text-xs font-bold text-zinc-100 tracking-widest">NOTIFICATIONS</h3>
        <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="divide-y divide-zinc-800">
        {insights.length > 0 ? (
          insights.slice(0, 5).map((insight) => (
            <div key={insight.id} className="p-4 hover:bg-zinc-900/50 transition-colors">
              <InsightItem insight={insight} />
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-xs text-zinc-500">No notifications</div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function DashPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [dashboardData, setDashboardData] = useState(null);
  
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [filterInsightType, setFilterInsightType] = useState('all');

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login.');
        setLoading(false);
        return;
      }

      try {
        const data = await api.dashboard(token);
        setDashboardData(data);
        setLoading(false);
        setMounted(true);
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process topics with memoization
  const { weaknesses, strengths, allTopics } = useMemo(() => {
    return processTopicsData(dashboardData);
  }, [dashboardData]);

  // Calculate aggregated stats
  const stats = useMemo(() => {
    if (!dashboardData?.globalStats) {
      return {
        totalSubmissions: 0,
        accuracy: 0,
        avgTime: 0,
        weakestTopic: 'N/A'
      };
    }

    const { globalStats, recentSubmissions = [] } = dashboardData;
    
    const avgTime = recentSubmissions.length > 0
      ? Math.round(recentSubmissions.reduce((sum, s) => sum + (s.result?.timeTakenSeconds || 0), 0) / recentSubmissions.length)
      : 0;
    
    const weakestTopic = getWeakestTopic(allTopics);

    return {
      totalSubmissions: globalStats.totalProblems || 0,
      accuracy: globalStats.avgAccuracy || 0,
      avgTime: avgTime,
      weakestTopic: weakestTopic
    };
  }, [dashboardData, allTopics]);

  // Generate insights from weaknesses
  const insights = useMemo(() => {
    const generated = weaknesses.map((w) => {
      let type = 'alert';
      let message = `${w.topic}: Review needed - Current accuracy is ${w.accuracy}%`;
      
      if (w.accuracy < 60) {
        type = 'warning';
        message = `${w.topic}: Critical - Low accuracy at ${w.accuracy}%. Focus on fundamentals.`;
      } else if (w.accuracy >= 60 && w.accuracy < 80) {
        type = 'alert';
        message = `${w.topic}: Inconsistent performance at ${w.accuracy}%. Work on consistency.`;
      }
      
      return {
        id: w.id,
        type: type,
        text: message,
        time: 'Recent',
        timestamp: Date.now()
      };
    });

    return generated;
  }, [weaknesses]);

  const filteredInsights = useMemo(() => {
    if (filterInsightType === 'all') return insights;
    return insights.filter(i => i.type === filterInsightType);
  }, [insights, filterInsightType]);

  const unreadCount = insights.length;

  if (error) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-zinc-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6">
      <div className={`max-w-7xl mx-auto transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 mb-1 tracking-tight">PrepLens Dashboard</h1>
            <p className="text-[10px] text-zinc-600 tracking-wider">Real-time analytics of your preparation journey</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button 
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-zinc-700 transition-all relative"
              >
                <Bell className="w-4 h-4 text-zinc-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <NotificationDropdown 
                insights={insights} 
                isOpen={notificationOpen} 
                onClose={() => setNotificationOpen(false)} 
              />
            </div>
            <button className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-zinc-700 transition-all">
              <User className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FileText} label="Total Submissions" value={stats.totalSubmissions} loading={loading} />
          <StatCard icon={Target} label="Accuracy" value={`${stats.accuracy}%`} loading={loading} />
          <StatCard icon={Clock} label="Avg Time / Question" value={`${stats.avgTime}s`} loading={loading} />
          <StatCard icon={AlertCircle} label="Weakest Topic" value={stats.weakestTopic} loading={loading} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weaknesses & Strengths */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weaknesses Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-zinc-100 tracking-widest">AREAS TO IMPROVE</h2>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
                  <span className="text-[9px] text-zinc-600 tracking-wider font-mono">AI POWERED</span>
                </div>
              </div>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : weaknesses.length > 0 ? (
                <div className="grid gap-4">
                  {weaknesses.map(topic => (
                    <TopicCard key={topic.id} topic={topic} onClick={() => setSelectedTopic(topic)} />
                  ))}
                </div>
              ) : (
                <div className="border border-zinc-800 p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-zinc-400 mb-2">No weaknesses detected!</p>
                  <p className="text-xs text-zinc-600">You're performing well across all topics. Keep it up!</p>
                </div>
              )}
            </div>

            {/* Strengths Section */}
            {!loading && strengths.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-zinc-100 tracking-widest">YOUR STRENGTHS</h2>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="grid gap-4">
                  {strengths.map(topic => (
                    <TopicCard 
                      key={topic.id} 
                      topic={topic} 
                      onClick={() => setSelectedTopic(topic)} 
                      showAsStrength={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Insights */}
          <div>
           
            
           
          {/* <AIInsights /> */}
          </div>
        </div>

        {/* Topic Detail Modal */}
        <Modal isOpen={!!selectedTopic} onClose={() => setSelectedTopic(null)}>
          {selectedTopic && <TopicDetail topic={selectedTopic} />}
        </Modal>
      </div>
    </div>
  );
}