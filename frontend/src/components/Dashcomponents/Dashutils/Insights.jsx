import React, { useState, useEffect } from 'react';
import { Brain, Loader2, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';

const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAIInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to view AI insights');
      }

      const response = await axios.get(
        'http://localhost:5000/api/analysis/ai-suggestions',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setInsights(response.data);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to load AI insights'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const parseInsights = (text) => {
    if (!text) return null;

    const sections = {
      summary: '',
      tips: [],
      focusArea: ''
    };

    const summaryMatch = text.match(/\*\*ONE SENTENCE SUMMARY:\*\*\n(.*?)\n\n/s);
    if (summaryMatch) {
      sections.summary = summaryMatch[1].trim();
    }

    const tipsMatch = text.match(/\*\*THREE ACTIONABLE TIPS:\*\*\n(.*?)\n\n\*\*RECOMMENDED/s);
    if (tipsMatch) {
      const tipsText = tipsMatch[1];
      const tipMatches = tipsText.matchAll(/\d+\.\s\*\*(.*?)\*\*:\s(.*?)(?=\n\d+\.|\n\n|$)/gs);
      sections.tips = Array.from(tipMatches).map(match => ({
        title: match[1].trim(),
        description: match[2].trim()
      }));
    }

    const focusMatch = text.match(/\*\*RECOMMENDED FOCUS AREA FOR THIS WEEK:\*\*\n(.*?)$/s);
    if (focusMatch) {
      sections.focusArea = focusMatch[1].trim();
    }

    return sections;
  };

  // 🔥 CHECK IF WE SHOULD SHOW AI INSIGHTS
  const shouldShowInsights = () => {
    if (!insights) return false;
    
    // Don't show if no problems solved
    if (!insights.summary?.totalProblems || insights.summary.totalProblems === 0) {
      return false;
    }

    // Don't show if no weak topics
    if (!insights.weakTopics || insights.weakTopics.length === 0) {
      return false;
    }

    // Don't show if accuracy is perfect (100%)
    if (insights.summary?.avgAccuracy >= 100) {
      return false;
    }

    return true;
  };

  const parsedInsights = insights?.aiInsights ? parseInsights(insights.aiInsights) : null;

  // 🔥 DON'T RENDER IF NOT ENOUGH DATA
  if (!loading && !error && !shouldShowInsights()) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-zinc-100 tracking-widest">
            AI INSIGHTS
          </h2>
          <Brain className="w-4 h-4 text-zinc-600" />
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
          <TrendingUp className="w-12 h-12 mb-4 text-zinc-700" />
          <p className="text-sm font-medium text-zinc-400 mb-1">Great job! 🎉</p>
          <p className="text-xs text-zinc-500 text-center max-w-sm">
            Your performance is excellent. Keep solving more problems to get personalized AI insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-zinc-100 tracking-widest">
          AI INSIGHTS
        </h2>
        <div className="flex items-center gap-2">
          {insights?.metadata?.model && (
            <span className="text-xs text-zinc-500">
              {insights.metadata.model}
            </span>
          )}
          <button
            onClick={fetchAIInsights}
            disabled={loading}
            className="p-1 hover:bg-zinc-800 rounded transition-colors disabled:opacity-50"
            title="Refresh insights"
          >
            <RefreshCw className={`w-4 h-4 text-zinc-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Brain className="w-4 h-4 text-zinc-600" />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <p className="text-sm">Analyzing your performance...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-900/50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400 mb-1">Failed to load insights</p>
            <p className="text-xs text-red-500/80">{error}</p>
            <button
              onClick={fetchAIInsights}
              className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Success State */}
      {insights && !loading && !error && shouldShowInsights() && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="flex gap-4 pb-4 border-b border-zinc-800">
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-zinc-100">
                {insights.summary.totalProblems}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Problems</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-zinc-100">
                {insights.summary.avgAccuracy}%
              </p>
              <p className="text-xs text-zinc-500 mt-1">Accuracy</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-zinc-100">
                {insights.summary.criticalTopics.length}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Weak Areas</p>
            </div>
          </div>

          {/* Parsed Insights */}
          {parsedInsights && (
            <>
              {/* Summary */}
              {parsedInsights.summary && (
                <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                    Key Issue
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {parsedInsights.summary}
                  </p>
                </div>
              )}

              {/* Tips */}
              {parsedInsights.tips.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
                    Action Items
                  </h3>
                  <div className="space-y-3">
                    {parsedInsights.tips.map((tip, index) => (
                      <div
                        key={index}
                        className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4 hover:border-zinc-600/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center text-xs font-bold text-zinc-300">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-zinc-200 mb-1">
                              {tip.title}
                            </h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              {tip.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Focus Area */}
              {parsedInsights.focusArea && (
                <div className="bg-gradient-to-br from-blue-950/30 to-purple-950/30 border border-blue-900/50 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wider">
                    This Week's Focus
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {parsedInsights.focusArea}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Weak Topics */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
              Critical Areas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {insights.weakTopics.map((topic, index) => (
                <div
                  key={index}
                  className={`
                    p-4 rounded-lg border
                    ${topic.severity === 'critical' 
                      ? 'bg-red-950/20 border-red-900/50' 
                      : topic.severity === 'high'
                      ? 'bg-orange-950/20 border-orange-900/50'
                      : 'bg-yellow-950/20 border-yellow-900/50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-zinc-100 capitalize">
                      {topic.topic}
                    </h4>
                    <span className={`
                      text-xs font-bold px-2 py-0.5 rounded
                      ${topic.severity === 'critical'
                        ? 'bg-red-900/50 text-red-400'
                        : topic.severity === 'high'
                        ? 'bg-orange-900/50 text-orange-400'
                        : 'bg-yellow-900/50 text-yellow-400'
                      }
                    `}>
                      {topic.severity}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-zinc-100 mb-2">
                    {topic.accuracy}%
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {topic.issues.map((issue, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-zinc-800/50 text-zinc-400 rounded"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timestamp */}
          {insights.metadata?.generatedAt && (
            <p className="text-xs text-zinc-600 text-center pt-4 border-t border-zinc-800">
              Generated {new Date(insights.metadata.generatedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AIInsights;