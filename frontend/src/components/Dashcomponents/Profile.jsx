import React, { useEffect, useState } from "react";
import { Activity, Target, TrendingUp, AlertTriangle, CheckCircle, Clock, Brain, Zap, BarChart3 } from "lucide-react";

const API_URL = "http://localhost:5000/api/analysis/dashboard";

const difficultyColors = {
  easy: "text-green-400",
  medium: "text-yellow-400",
  hard: "text-red-400"
};

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [weaknesses, setWeaknesses] = useState([]);
  const [topicStats, setTopicStats] = useState({});
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setMounted(true);
    fetchDashboard();
    const userRaw = localStorage.getItem("user");
    if (userRaw) setUser(JSON.parse(userRaw));
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return setLoading(false);
      const res = await fetch(API_URL, { 
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });
      const data = await res.json();
      setStats(data.globalStats);
      setWeaknesses(data.weaknesses || []);
      setTopicStats(data.topicStats || {});
      setRecentSubmissions(data.recentSubmissions || []);
    } catch (err) {
      console.error("Dashboard API error", err);
    } finally {
      setLoading(false);
    }
  };

  // Group weaknesses by topic to get count and create topic list
  const topicWeaknessCount = weaknesses.reduce((acc, w) => {
    const normalizedTopic = w.topicId.toLowerCase();
    acc[normalizedTopic] = (acc[normalizedTopic] || 0) + 1;
    return acc;
  }, {});

  // Merge topics from topicStats and weaknesses
  const allTopics = {};
  
  // Add topics from topicStats
  Object.entries(topicStats).forEach(([topic, data]) => {
    allTopics[topic.toLowerCase()] = { name: topic, ...data };
  });
  
  // Add topics from weaknesses if not already present
  weaknesses.forEach(w => {
    const normalizedTopic = w.topicId.toLowerCase();
    if (!allTopics[normalizedTopic]) {
      allTopics[normalizedTopic] = { name: w.topicId };
    }
  });

  const getSystemLevel = () => {
    if (!stats) return "Developing";
    if (stats.avgAccuracy >= 80) return "Advanced";
    if (stats.avgAccuracy >= 60) return "Intermediate";
    return "Developing";
  };

  const getRiskIndex = () => {
    if (!stats) return "LOW";
    if (stats.avgAccuracy < 40) return "HIGH";
    if (stats.avgAccuracy < 60) return "MODERATE";
    return "LOW";
  };

  const getRiskColor = () => {
    const risk = getRiskIndex();
    return risk === "HIGH" ? "text-red-400" : risk === "MODERATE" ? "text-orange-400" : "text-green-400";
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-400 mx-auto mb-3"></div>
        <p className="text-zinc-500 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  if (!stats) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <Brain className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-500">No data available</p>
        <p className="text-zinc-600 text-sm mt-1">Start solving to see your profile</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 py-6 px-4">
      <div className={`max-w-6xl mx-auto transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-zinc-100">Performance Dashboard</h1>
          </div>
          <p className="text-xs text-zinc-500">AI-powered analytics</p>
        </div>

        {/* Profile + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Profile */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-xs text-zinc-500">USERNAME</p>
                <h3 className="text-sm font-bold text-zinc-100">{user?.username || "User"}</h3>
              </div>
            </div>

            <div className="space-y-2">
              <div className="bg-zinc-800/50 rounded p-2 border border-zinc-700/50">
                <div className="flex items-center gap-1 mb-1">
                  <Target className="w-3 h-3 text-emerald-400"/>
                  <p className="text-xs text-zinc-500">LEVEL</p>
                </div>
                <p className="text-sm font-bold text-emerald-400">{getSystemLevel()}</p>
              </div>

              <div className="bg-zinc-800/50 rounded p-2 border border-zinc-700/50">
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3 h-3 text-orange-400"/>
                  <p className="text-xs text-zinc-500">RISK INDEX</p>
                </div>
                <p className={`text-sm font-bold ${getRiskColor()}`}>{getRiskIndex()}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            {[
              { icon: <Activity className="w-4 h-4 text-blue-400"/>, label: "Problems", value: stats.totalProblems },
              { icon: <CheckCircle className="w-4 h-4 text-emerald-400"/>, label: "Correct", value: stats.correctCount, color: "text-emerald-400" },
              { icon: <TrendingUp className="w-4 h-4 text-purple-400"/>, label: "Accuracy", value: `${stats.avgAccuracy}%`, color: stats.avgAccuracy >= 80 ? "text-emerald-400" : stats.avgAccuracy >= 60 ? "text-yellow-400" : "text-red-400" },
              { icon: <Target className="w-4 h-4 text-orange-400"/>, label: "Success", value: stats.totalProblems > 0 ? `${Math.round((stats.correctCount/stats.totalProblems)*100)}%` : "0%", color: "text-orange-400" }
            ].map((card, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center gap-1 mb-2">
                  {card.icon}
                  <p className="text-xs text-zinc-500">{card.label}</p>
                </div>
                <p className={`text-2xl font-bold ${card.color || "text-zinc-100"}`}>{card.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Topics Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-emerald-400"/>
            <h3 className="text-base font-bold text-zinc-200">Topics</h3>
          </div>
          
          {Object.keys(allTopics).length === 0 ? (
            <p className="text-zinc-500 text-sm">No topics available yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(allTopics).map(([normalizedTopic, data]) => {
                const weaknessCount = topicWeaknessCount[normalizedTopic] || 0;
                
                return (
                  <button
                    key={normalizedTopic}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="text-sm text-zinc-200 capitalize">{data.name}</span>
                  
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        {recentSubmissions.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-yellow-400"/>
              <h3 className="text-sm font-bold text-zinc-300">Recent Activity</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-2 px-3 text-xs text-zinc-500">Problem</th>
                    <th className="text-left py-2 px-3 text-xs text-zinc-500">Topic</th>
                    <th className="text-left py-2 px-3 text-xs text-zinc-500">Difficulty</th>
                    <th className="text-left py-2 px-3 text-xs text-zinc-500">Result</th>
                    <th className="text-left py-2 px-3 text-xs text-zinc-500">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.slice(0, 10).map((sub, idx) => (
                    <tr key={idx} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-2 px-3 text-xs text-zinc-300">{sub.problemId || 'N/A'}</td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400 capitalize">
                          {sub.topic || 'N/A'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`text-xs font-bold capitalize ${difficultyColors[sub.difficulty] || 'text-zinc-400'}`}>
                          {sub.difficulty || 'N/A'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {sub.isCorrect ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400"/>
                            <span className="text-xs text-emerald-400">Correct</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-400"/>
                            <span className="text-xs text-red-400">Wrong</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-xs text-zinc-400">{sub.timeTaken || 0}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}