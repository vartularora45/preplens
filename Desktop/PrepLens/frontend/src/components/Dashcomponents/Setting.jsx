import React, { useEffect, useState } from "react";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("balanced");
  const [dailyReminder, setDailyReminder] = useState(true);
  const [difficultyBias, setDifficultyBias] = useState("adaptive");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`max-w-5xl mx-auto transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="bg-zinc-950 border border-zinc-800 p-10 relative">
        {/* Corners */}
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-zinc-600" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-zinc-600" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-zinc-600" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zinc-600" />

        {/* Header */}
        <div className="mb-10">
          <h2 className="text-xl font-mono text-zinc-200">Settings</h2>
          <p className="text-xs text-zinc-500 tracking-wider mt-1">
            Control how PrepLens trains you
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">

          {/* Practice Preferences */}
          <section className="border border-zinc-800 p-6">
            <p className="text-xs text-zinc-500 mb-4 tracking-wider">
              PRACTICE PREFERENCES
            </p>

            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-zinc-300">
                Adaptive Difficulty
              </span>
              <select
                value={difficultyBias}
                onChange={(e) => setDifficultyBias(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm px-3 py-1"
              >
                <option value="easy">Easy-biased</option>
                <option value="adaptive">Adaptive (Recommended)</option>
                <option value="hard">Hard-biased</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">
                Daily Practice Reminder
              </span>
              <button
                onClick={() => setDailyReminder(!dailyReminder)}
                className={`px-4 py-1 text-xs border ${
                  dailyReminder
                    ? "border-green-500 text-green-400"
                    : "border-zinc-700 text-zinc-400"
                }`}
              >
                {dailyReminder ? "ENABLED" : "DISABLED"}
              </button>
            </div>
          </section>

          {/* AI Feedback */}
          <section className="border border-zinc-800 p-6">
            <p className="text-xs text-zinc-500 mb-4 tracking-wider">
              AI FEEDBACK BEHAVIOR
            </p>

            <div className="flex gap-4">
              {["strict", "balanced", "lenient"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAiFeedback(mode)}
                  className={`px-4 py-2 text-xs font-mono border transition ${
                    aiFeedback === mode
                      ? "border-blue-500 text-blue-400"
                      : "border-zinc-700 text-zinc-400"
                  }`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>

            <p className="text-xs text-zinc-600 mt-4 max-w-md">
              {aiFeedback === "strict" &&
                "Har mistake highlight hogi. No mercy."}
              {aiFeedback === "balanced" &&
                "Balanced feedback with actionable tips."}
              {aiFeedback === "lenient" &&
                "Only critical issues will be flagged."}
            </p>
          </section>

          {/* Danger Zone */}
          <section className="border border-red-900 p-6">
            <p className="text-xs text-red-500 mb-4 tracking-wider">
              DANGER ZONE
            </p>

            <button className="px-4 py-2 text-xs font-mono border border-red-700 text-red-400 hover:bg-red-950 transition">
              RESET ALL PROGRESS
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}
