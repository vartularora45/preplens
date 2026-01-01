import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, User, Settings, LogOut, TrendingUp, TrendingDown, Clock, Target, AlertCircle, CheckCircle, XCircle, ArrowRight, Zap, Brain, Activity, Bell, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import SubmissionsTable from './Dashutils/SubmissionTable';
import SubmissionsChart from './Dashutils/SubmissionChart';
// Mock API functions
const mockAPI = {
  stats: () => new Promise(resolve => setTimeout(() => resolve({
    totalSubmissions: 247,
    totalSubmissionsLastWeek: 220,
    accuracy: 73.2,
    accuracyLastWeek: 75.4,
    avgTime: 18.5,
    avgTimeLastWeek: 17.6,
    weakestTopic: 'Arrays'
  }), 800)),
  
  weaknesses: () => new Promise(resolve => setTimeout(() => resolve([
    {
      id: 1,
      topic: 'Arrays',
      reason: 'Low Accuracy',
      suggestion: 'Focus on two-pointer and sliding window patterns',
      color: 'red',
      accuracy: 45,
      totalAttempts: 67,
      correctAttempts: 30,
      avgTime: 25,
      commonMistakes: ['Off-by-one errors', 'Not handling edge cases', 'Inefficient nested loops'],
      recommendedProblems: ['Two Sum', 'Container With Most Water', 'Sliding Window Maximum']
    },
    {
      id: 2,
      topic: 'Graphs',
      reason: 'Prerequisite Gap',
      suggestion: 'Review BFS/DFS fundamentals before advanced problems',
      color: 'orange',
      accuracy: 58,
      totalAttempts: 42,
      correctAttempts: 24,
      avgTime: 32,
      commonMistakes: ['Incorrect visited tracking', 'Missing base cases', 'Stack overflow in DFS'],
      recommendedProblems: ['Number of Islands', 'Clone Graph', 'Course Schedule']
    },
    {
      id: 3,
      topic: 'Dynamic Programming',
      reason: 'Slow Speed',
      suggestion: 'Practice identifying overlapping subproblems faster',
      color: 'yellow',
      accuracy: 62,
      totalAttempts: 51,
      correctAttempts: 32,
      avgTime: 42,
      commonMistakes: ['Not memoizing results', 'Wrong recurrence relation', 'Inefficient state representation'],
      recommendedProblems: ['Climbing Stairs', 'House Robber', 'Longest Common Subsequence']
    }
  ]), 600)),
  
  insights: () => new Promise(resolve => setTimeout(() => resolve([
    { id: 1, text: 'Accuracy dropped 12% in Arrays over last 2 weeks', type: 'warning', time: '2h ago', timestamp: Date.now() - 2 * 3600000 },
    { id: 2, text: 'Speed improved 23% in String problems', type: 'success', time: '1d ago', timestamp: Date.now() - 24 * 3600000 },
    { id: 3, text: 'Prerequisite gap detected in Graph traversal', type: 'alert', time: '3d ago', timestamp: Date.now() - 3 * 24 * 3600000 },
    { id: 4, text: 'Consistency improved - 5 day streak maintained', type: 'success', time: '5d ago', timestamp: Date.now() - 5 * 24 * 3600000 },
    { id: 5, text: 'Consider revisiting Linked List basics', type: 'alert', time: '1w ago', timestamp: Date.now() - 7 * 24 * 3600000 }
  ]), 500)),
  
  submissions: () => new Promise(resolve => setTimeout(() => resolve([
    { id: 'LC-001', topic: 'Arrays', difficulty: 'Medium', time: 22, result: 'Wrong', date: '2024-12-28', day: 'Sat' },
    { id: 'LC-042', topic: 'DP', difficulty: 'Hard', time: 45, result: 'Correct', date: '2024-12-27', day: 'Fri' },
    { id: 'LC-153', topic: 'Strings', difficulty: 'Easy', time: 8, result: 'Correct', date: '2024-12-27', day: 'Fri' },
    { id: 'LC-287', topic: 'Graphs', difficulty: 'Medium', time: 35, result: 'Wrong', date: '2024-12-26', day: 'Thu' },
    { id: 'LC-015', topic: 'Arrays', difficulty: 'Medium', time: 28, result: 'Wrong', date: '2024-12-26', day: 'Thu' },
    { id: 'LC-102', topic: 'Trees', difficulty: 'Medium', time: 18, result: 'Correct', date: '2024-12-25', day: 'Wed' },
    { id: 'LC-206', topic: 'Linked Lists', difficulty: 'Easy', time: 12, result: 'Correct', date: '2024-12-24', day: 'Tue' },
    { id: 'LC-300', topic: 'DP', difficulty: 'Medium', time: 38, result: 'Correct', date: '2024-12-23', day: 'Mon' }
  ]), 700)),
  
  chartData: () => new Promise(resolve => setTimeout(() => resolve([
    { day: 'Mon', count: 8, fullDay: 'Monday' },
    { day: 'Tue', count: 12, fullDay: 'Tuesday' },
    { day: 'Wed', count: 7, fullDay: 'Wednesday' },
    { day: 'Thu', count: 15, fullDay: 'Thursday' },
    { day: 'Fri', count: 10, fullDay: 'Friday' },
    { day: 'Sat', count: 14, fullDay: 'Saturday' },
    { day: 'Sun', count: 9, fullDay: 'Sunday' }
  ]), 600))
};

// Skeleton Loader Component
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

// Modal Component
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

// Weakness Card Component
function WeaknessCard({ weakness, onClick }) {
  const colorClasses = {
    red: 'border-red-900/50 bg-red-950/20 hover:border-red-800',
    orange: 'border-orange-900/50 bg-orange-950/20 hover:border-orange-800',
    yellow: 'border-yellow-900/50 bg-yellow-950/20 hover:border-yellow-800'
  };

  const iconColorClasses = {
    red: 'text-red-400',
    orange: 'text-orange-400',
    yellow: 'text-yellow-400'
  };

  const progressColorClasses = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className={`border p-6 transition-all duration-300 relative cursor-pointer ${colorClasses[weakness.color]}`} onClick={onClick}>
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-zinc-700"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-zinc-700"></div>
      
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-100 mb-1 tracking-tight">{weakness.topic}</h3>
          <p className={`text-[10px] tracking-widest uppercase ${iconColorClasses[weakness.color]}`}>{weakness.reason}</p>
        </div>
        <AlertCircle className={`w-5 h-5 ${iconColorClasses[weakness.color]}`} />
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-zinc-500 mb-2 font-mono tracking-wider">
          <span>ACCURACY</span>
          <span>{weakness.accuracy}%</span>
        </div>
        <div className="h-1.5 bg-zinc-900 overflow-hidden border border-zinc-800">
          <div 
            className={`h-full ${progressColorClasses[weakness.color]} transition-all duration-1000`}
            style={{ width: `${weakness.accuracy}%` }}
          ></div>
        </div>
      </div>

      <p className="text-xs text-zinc-400 leading-relaxed mb-4">{weakness.suggestion}</p>
      
      <button className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center space-x-2 transition-colors font-mono tracking-wide">
        <span>VIEW DETAILS</span>
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}

// Weakness Detail Modal Content
function WeaknessDetail({ weakness }) {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 p-4">
          <div className="text-2xl font-bold text-zinc-100 mb-1">{weakness.accuracy}%</div>
          <div className="text-[10px] text-zinc-600 tracking-widest">ACCURACY</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4">
          <div className="text-2xl font-bold text-zinc-100 mb-1">{weakness.totalAttempts}</div>
          <div className="text-[10px] text-zinc-600 tracking-widest">ATTEMPTS</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4">
          <div className="text-2xl font-bold text-zinc-100 mb-1">{weakness.avgTime}s</div>
          <div className="text-[10px] text-zinc-600 tracking-widest">AVG TIME</div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-zinc-100 tracking-widest mb-3">COMMON MISTAKES</h3>
        <ul className="space-y-2">
          {weakness.commonMistakes.map((mistake, idx) => (
            <li key={idx} className="flex items-start space-x-2 text-xs text-zinc-400">
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{mistake}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-bold text-zinc-100 tracking-widest mb-3">RECOMMENDED PROBLEMS</h3>
        <div className="space-y-2">
          {weakness.recommendedProblems.map((problem, idx) => (
            <div key={idx} className="bg-zinc-900/50 border border-zinc-800 p-3 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">{problem}</span>
                <ArrowRight className="w-4 h-4 text-zinc-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
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

// Insight Item Component
function InsightItem({ insight }) {
  const typeConfig = {
    warning: { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-950/30', border: 'border-red-900/50' },
    success: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-950/30', border: 'border-green-900/50' },
    alert: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-950/30', border: 'border-orange-900/50' }
  };

  const config = typeConfig[insight.type];
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

// Notification Dropdown Component
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
        {insights.slice(0, 5).map(insight => (
          <div key={insight.id} className="p-4 hover:bg-zinc-900/50 transition-colors">
            <InsightItem insight={insight} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Submissions Table Component


// Submissions Chart Component
// import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import { Activity } from 'lucide-react';

//  import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Activity } from "lucide-react"; // optional icon



// Main Dashboard Component
export default function DashPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data state
  const [stats, setStats] = useState(null);
  const [weaknesses, setWeaknesses] = useState([]);
  const [insights, setInsights] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [chartData, setChartData] = useState([]);
  
  // UI state
  const [selectedWeakness, setSelectedWeakness] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState('all');
  const [filterInsightType, setFilterInsightType] = useState('all');
  const [selectedDay, setSelectedDay] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, weaknessData, insightData, submissionData, chartDataRes] = await Promise.all([
          mockAPI.stats(),
          mockAPI.weaknesses(),
          mockAPI.insights(),
          mockAPI.submissions(),
          mockAPI.chartData()
        ]);
        
        setStats(statsData);
        setWeaknesses(weaknessData);
        setInsights(insightData);
        setSubmissions(submissionData);
        setChartData(chartDataRes);
        setLoading(false);
        setMounted(true);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate trends
  const getTrend = (current, previous) => {
    if (!previous) return null;
    const diff = current - previous;
    const percent = Math.abs((diff / previous) * 100).toFixed(0);
    return {
      direction: diff > 0 ? 'up' : 'down',
      value: `${diff > 0 ? '+' : ''}${percent}%`
    };
  };

  // Sorting function
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter and sort submissions
  const getFilteredSubmissions = () => {
    let filtered = [...submissions];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by result
    if (filterResult !== 'all') {
      filtered = filtered.filter(sub => sub.result === filterResult);
    }

    // Filter by selected day
    if (selectedDay) {
      filtered = filtered.filter(sub => sub.day === selectedDay);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'time') {
        aVal = parseInt(aVal);
        bVal = parseInt(bVal);
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  // Filter insights
  const getFilteredInsights = () => {
    if (filterInsightType === 'all') return insights;
    return insights.filter(insight => insight.type === filterInsightType);
  };

  const unreadCount = insights.filter(i => Date.now() - i.timestamp < 24 * 3600000).length;

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
          <StatCard
            icon={FileText}
            label="Total Submissions"
            value={stats?.totalSubmissions || 0}
            trend={stats ? getTrend(stats.totalSubmissions, stats.totalSubmissionsLastWeek)?.direction : null}
            trendValue={stats ? getTrend(stats.totalSubmissions, stats.totalSubmissionsLastWeek)?.value : null}
            loading={loading}
          />
          <StatCard
            icon={Target}
            label="Accuracy"
            value={stats ? `${stats.accuracy}%` : '0%'}
            trend={stats ? getTrend(stats.accuracy, stats.accuracyLastWeek)?.direction : null}
            trendValue={stats ? getTrend(stats.accuracy, stats.accuracyLastWeek)?.value : null}
            loading={loading}
          />
          <StatCard
            icon={Clock}
            label="Avg Time / Question"
            value={stats ? `${stats.avgTime}s` : '0s'}
            trend={stats ? getTrend(stats.avgTime, stats.avgTimeLastWeek)?.direction : null}
            trendValue={stats ? getTrend(stats.avgTime, stats.avgTimeLastWeek)?.value : null}
            loading={loading}
          />
          <StatCard
            icon={AlertCircle}
            label="Weakest Topic"
            value={stats?.weakestTopic || 'N/A'}
            loading={loading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weakness Analysis */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-zinc-100 tracking-widest">WEAKNESS ANALYSIS</h2>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span className="text-[9px] text-zinc-600 tracking-wider font-mono">AI POWERED</span>
              </div>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="grid gap-4">
                {weaknesses.map(weakness => (
                  <WeaknessCard 
                    key={weakness.id} 
                    weakness={weakness} 
                    onClick={() => setSelectedWeakness(weakness)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* AI Insights */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-zinc-100 tracking-widest">AI INSIGHTS</h2>
              <Brain className="w-4 h-4 text-zinc-600" />
            </div>
            
            {/* Insight Type Filter */}
            <div className="flex items-center space-x-2 mb-4">
              {['all', 'warning', 'success', 'alert'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterInsightType(type)}
                  className={`text-[10px] px-3 py-1.5 border tracking-wider font-mono transition-colors ${
                    filterInsightType === type
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-4 animate-pulse">
                      <div className="h-4 bg-zinc-800 mb-2"></div>
                      <div className="h-3 bg-zinc-800 w-20"></div>
                    </div>
                  ))}
                </div>
              ) : (
                getFilteredInsights().map(insight => (
                  <InsightItem key={insight.id} insight={insight} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chart */}
        

        {/* Search and Filter Controls */}
    

        {/* Recent Submissions Table */}
      

        {/* Weakness Detail Modal */}
        <Modal isOpen={!!selectedWeakness} onClose={() => setSelectedWeakness(null)}>
          {selectedWeakness && <WeaknessDetail weakness={selectedWeakness} />}
        </Modal>
      </div>
    </div>
  );
}