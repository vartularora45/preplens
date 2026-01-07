import axios from "axios";
import { getDashboard } from "./analysis.controller.js";
import dotenv from "dotenv";
dotenv.config();

const normalizeTopic = (topic) => topic?.toLowerCase().trim();

export const getAiSuggestions = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { globalStats, weaknesses, recentSubmissions } = await getDashboard(userId);

    const topicMap = {};
    (weaknesses || []).forEach(w => {
      const topic = normalizeTopic(w.topicId);
      if (!topic) return;

      if (!topicMap[topic]) {
        topicMap[topic] = {
          topic,
          issues: new Set(),
          severities: [],
          speeds: [],
          accuracies: []
        };
      }

      topicMap[topic].issues.add(w.rootCause);
      topicMap[topic].severities.push(w.severity);
      if (w.evidence?.recentSpeed)
        topicMap[topic].speeds.push(w.evidence.recentSpeed);
      if (typeof w.evidence?.recentAccuracy === "number")
        topicMap[topic].accuracies.push(w.evidence.recentAccuracy);
    });

    const topics = Object.values(topicMap).map(t => ({
      topic: t.topic,
      issues: [...t.issues],
      severity: t.severities.includes("critical") ? "critical" 
        : t.severities.includes("high") ? "high" : "medium",
      avgSpeed: t.speeds.length
        ? Math.round(t.speeds.reduce((a, b) => a + b, 0) / t.speeds.length)
        : null,
      avgAccuracy: t.accuracies.length
        ? Math.round(t.accuracies.reduce((a, b) => a + b, 0) / t.accuracies.length)
        : null
    })).sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    const recentTopic = normalizeTopic(recentSubmissions?.[0]?.topic || "unknown");

    const prompt = `
You are an AI coding interview mentor. Analyze this performance and provide structured advice.

PERFORMANCE SUMMARY:
- Problems solved: ${globalStats.totalProblems}
- Overall accuracy: ${globalStats.avgAccuracy}%

CRITICAL WEAKNESSES (sorted by severity):
${topics.slice(0, 3).map((t, i) => `
${i + 1}. ${t.topic.toUpperCase()}
   - Accuracy: ${t.avgAccuracy}% (${t.severity} priority)
   - Issues: ${t.issues.join(", ")}
   - Avg time: ${t.avgSpeed || "N/A"}s
`).join("")}

RECENT FOCUS: ${recentTopic}

Provide:
1. ONE SENTENCE summary of biggest problem
2. THREE actionable tips (each 1-2 sentences max)
3. ONE recommended focus area for this week

Keep it brief and direct. No fluff.
`;

    const aiResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are a direct, no-nonsense coding interview mentor. Be concise and actionable." },
          { role: "user", content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.5,
        top_p: 0.9
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let aiInsights = aiResponse.data.choices[0].message.content;
    aiInsights = aiInsights.replace(/\n{3,}/g, "\n\n").trim();

    return res.json({
      success: true,
      summary: {
        totalProblems: globalStats.totalProblems,
        avgAccuracy: globalStats.avgAccuracy,
        criticalTopics: topics.slice(0, 3).map(t => t.topic)
      },
      aiInsights,
      weakTopics: topics.slice(0, 3).map(t => ({
        topic: t.topic,
        accuracy: t.avgAccuracy,
        severity: t.severity,
        issues: t.issues
      })),
      metadata: {
        model: "llama-3.1-8b-instant",
        generatedAt: new Date().toISOString()
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "AI suggestion generation failed",
      error: err.response?.data?.error?.message || err.message
    });
  }
};