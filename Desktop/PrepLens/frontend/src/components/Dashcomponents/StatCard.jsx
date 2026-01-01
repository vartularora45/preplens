// ============= STAT CARD COMPONENT =============
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';


export default function StatCard({ icon: Icon, label, value, trend, trendValue }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 p-6 hover:border-zinc-700 transition-all duration-300 group relative overflow-hidden">
      {/* Decorative corner */}
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

