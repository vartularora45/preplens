import React, { useEffect, useState } from "react";
import axios from "axios";
import { Activity, Target, TrendingUp, AlertTriangle, CheckCircle, Clock, Brain } from "lucide-react";

const API_URL = "http://localhost:5000/api/analysis/dashboard";

const severityStyles = {
  critical: {
    border: "border-red-600",
    text: "text-red-400",
    bg: "bg-red-500/10",
  },
  high: {
    border: "border-orange-500",
    text: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  medium: {
    border: "border-yellow-500",
    text: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  low: {
    border: "border-green-500",
    text: "text-green-400",
    bg: "bg-green-500/10",
  },
};

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState(null);
  const [weaknesses, setWeaknesses] = useState([]);
  const [topicStats, setTopicStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setMounted(true);
    fetchDashboard();
    
    // Get user info
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      setUser(JSON.parse(userRaw));
    }
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No auth token found");
        setLoading(false);
        return;
      }
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log("Dashboard API response", res.data);
      setStats(res.data.globalStats);
      setWeaknesses(res.data.weaknesses);
      setTopicStats(res.data.topicStats || {});
    } catch (err) {
      console.error("Dashboard API error", err);
    } finally {
      setLoading(false);
    }
  };

  const groupedWeaknesses = weaknesses.reduce((acc, w) => {
    if (!acc[w.topicId]) acc[w.topicId] = [];
    acc[w.topicId].push(w);
    return acc;
  }, {});

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
    if (risk === "HIGH") return "text-red-400";
    if (risk === "MODERATE") return "text-orange-400";
    return "text-green-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-zinc-500 font-mono text-sm">Running AI diagnostics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">No performance data available</p>
          <p className="text-zinc-600 text-sm mt-2">Start solving problems to see your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-8 px-4">
      <div
        className={`max-w-7xl mx-auto transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          {/* HEADER */}
          <div className="mb-8 pb-6 border-b border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-6 h-6 text-emerald-400" />
              <h1 className="text-2xl font-mono text-zinc-100">
                Performance Intelligence Report
              </h1>
            </div>
            <p className="text-sm text-zinc-500 tracking-wide">
              AI-generated weakness & risk analysis
            </p>
          </div>

          {/* PROFILE + GLOBAL STATS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* PROFILE CARD */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">USERNAME</p>
                  <h3 className="text-lg font-mono text-zinc-100">
                    {user?.username || "User"}
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1 flex items-center gap-2">
                    <Target className="w-3 h-3" />
                    SYSTEM LEVEL
                  </p>
                  <p className="text-zinc-200 font-mono text-sm">
                    {getSystemLevel()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-zinc-500 mb-1 flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    FOCUS MODE
                  </p>
                  <p className="text-zinc-400 text-sm">
                    Accuracy & Speed Stabilization
                  </p>
                </div>

                <div>
                  <p className="text-xs text-zinc-500 mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" />
                    RISK INDEX
                  </p>
                  <p className={`font-mono text-sm font-bold ${getRiskColor()}`}>
                    {getRiskIndex()}
                  </p>
                </div>
              </div>
            </div>

            {/* STATS GRID */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-5 hover:border-zinc-600 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-zinc-500" />
                  <p className="text-xs text-zinc-500 uppercase">Total Problems</p>
                </div>
                <p className="text-3xl font-mono text-zinc-100 font-bold">
                  {stats.totalProblems}
                </p>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-5 hover:border-zinc-600 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-zinc-500" />
                  <p className="text-xs text-zinc-500 uppercase">Correct Solutions</p>
                </div>
                <p className="text-3xl font-mono text-emerald-400 font-bold">
                  {stats.correctCount}
                </p>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-5 hover:border-zinc-600 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-zinc-500" />
                  <p className="text-xs text-zinc-500 uppercase">Average Accuracy</p>
                </div>
                <p className="text-3xl font-mono text-zinc-100 font-bold">
                  {stats.avgAccuracy}%
                </p>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-5 hover:border-zinc-600 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-zinc-500" />
                  <p className="text-xs text-zinc-500 uppercase">Success Rate</p>
                </div>
                <p className="text-3xl font-mono text-zinc-100 font-bold">
                  {stats.totalProblems > 0 
                    ? Math.round((stats.correctCount / stats.totalProblems) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* TOPIC PROFICIENCY */}
          {Object.keys(topicStats).length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-zinc-500" />
                <h3 className="text-sm font-mono text-zinc-300 uppercase tracking-wider">
                  Topic Proficiency
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(topicStats).map(([topic, data]) => (
                  <div
                    key={topic}
                    className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4"
                  >
                    <h4 className="text-sm font-mono text-zinc-200 uppercase mb-3">
                      {topic}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Proficiency</span>
                        <span className="text-zinc-300 font-mono">
                          {data.proficiency}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all"
                          style={{ width: `${data.proficiency}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs mt-2">
                        <span className="text-zinc-500">
                          {data.correctAttempts}/{data.totalAttempts} correct
                        </span>
                        {data.mastered && (
                          <span className="text-emerald-400 font-mono">MASTERED</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI WEAKNESSES */}
          {weaknesses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="w-4 h-4 text-zinc-500" />
                <h3 className="text-sm font-mono text-zinc-300 uppercase tracking-wider">
                  AI-Identified Weaknesses
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(groupedWeaknesses).map(([topic, issues]) => (
                  <div
                    key={topic}
                    className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-6"
                  >
                    <h4 className="font-mono text-base text-zinc-200 uppercase mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-400" />
                      {topic}
                    </h4>

                    <div className="space-y-3">
                      {issues.map((w) => {
                        const style = severityStyles[w.severity];
                        return (
                          <div
                            key={w._id}
                            className={`border ${style.border} ${style.bg} rounded p-4`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <p className={`text-xs font-mono uppercase font-bold ${style.text}`}>
                                {w.severity}
                              </p>
                              <Clock className={`w-3 h-3 ${style.text}`} />
                            </div>

                            <p className="text-sm text-zinc-300 font-medium mb-2">
                              Root Cause: {w.rootCause}
                            </p>

                            <div className="flex gap-4 text-xs text-zinc-400 mb-2">
                              <span>Accuracy: {w.evidence.recentAccuracy}%</span>
                              <span>Speed: {w.evidence.recentSpeed}s</span>
                              <span>Sample: {w.evidence.sampleSize}</span>
                            </div>

                            <div className="text-xs text-zinc-500">
                              Review Due:{" "}
                              {new Date(w.reviewDueAt).toLocaleDateString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {weaknesses.length === 0 && (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <p className="text-zinc-400 font-mono">No critical weaknesses detected</p>
              <p className="text-zinc-600 text-sm mt-1">Keep up the great work!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}