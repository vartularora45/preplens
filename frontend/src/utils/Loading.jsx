// Loading.jsx
import React, { useEffect, useState } from "react";

export default function Loading({ text = "Analyzing your preparation…" }) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden font-mono">
      
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(39,39,42,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(39,39,42,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "gridMove 20s linear infinite",
          }}
        />
      </div>

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(161,161,170,0.05) 2px, rgba(161,161,170,0.05) 4px)",
        }}
      />

      {/* Core loader */}
      <div className="relative z-10 flex flex-col items-center space-y-6 border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl px-10 py-8">
        
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-zinc-600"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-zinc-600"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-zinc-600"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zinc-600"></div>

        {/* Spinner */}
        <div className="relative">
          <div className="w-14 h-14 border border-zinc-700 animate-spin"></div>
          <div className="absolute inset-2 border border-zinc-600 animate-pulse"></div>
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <p className="text-xs tracking-widest text-zinc-500 uppercase">
            PrepLens Engine
          </p>
          <p className="text-sm text-zinc-300">
            {text}
            <span className="tracking-widest">{dots}</span>
          </p>
        </div>

        {/* Fake system logs (vibe check) */}
        <div className="text-[10px] text-zinc-600 space-y-1 text-left w-full">
          <p>&gt; Aggregating submissions</p>
          <p>&gt; Running diagnostic rules</p>
          <p>&gt; Detecting weakness patterns</p>
        </div>
      </div>

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0,0); }
          100% { transform: translate(50px,50px); }
        }
      `}</style>
    </div>
  );
}
