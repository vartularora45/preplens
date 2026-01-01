import React, { useEffect, useState } from "react";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";

export default function SubmissionsChart() {
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  
  const ITEMS_PER_PAGE = 14;

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const userRaw = localStorage.getItem("user");
        if (!userRaw) {
          setLoading(false);
          return;
        }

        const user = JSON.parse(userRaw);
        const userId = user.id;

        const response = await axios.get(
          `http://localhost:5000/api/submission/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        const submissions = response.data.submissions || [];

        const chartMap = {};
        submissions.forEach((sub) => {
          const ts = sub.result?.timestamp || 
                     sub.createdAt || 
                     sub.timestamp || 
                     sub.submittedAt ||
                     sub.result?.submittedAt;
          
          if (!ts) return;
          
          const date = new Date(ts);
          const day = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          
          if (!chartMap[day]) {
            chartMap[day] = { count: 0, fullDate: date };
          }
          chartMap[day].count += 1;
        });

        const chartData = Object.entries(chartMap)
          .map(([day, { count, fullDate }]) => ({ day, count, fullDate }))
          .sort((a, b) => a.fullDate - b.fullDate)
          .map(({ day, count, fullDate }) => ({ day, count, fullDate }));

        calculateStreaks(chartData);

        setAllData(chartData);
        
        if (!showAll) {
          setDisplayData(chartData.slice(-ITEMS_PER_PAGE));
        } else {
          updateDisplayData(chartData, currentPage);
        }
      } catch (err) {
        console.error("Error fetching submissions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const calculateStreaks = (data) => {
    if (data.length === 0) return;
    
    let currentStreak = 0;
    let maxStreakCount = 0;
    let tempStreak = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.fullDate || a.day);
      const dateB = new Date(b.fullDate || b.day);
      return dateB - dateA;
    });
    
    for (let i = 0; i < sortedData.length; i++) {
      const date = new Date(sortedData[i].fullDate || sortedData[i].day);
      date.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      
      if (i === 0 && diffDays <= 1) {
        currentStreak = 1;
      } else if (i > 0) {
        const prevDate = new Date(sortedData[i - 1].fullDate || sortedData[i - 1].day);
        prevDate.setHours(0, 0, 0, 0);
        const dayDiff = Math.floor((prevDate - date) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    for (let i = 0; i < sortedData.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const currentDate = new Date(sortedData[i].fullDate || sortedData[i].day);
        const prevDate = new Date(sortedData[i - 1].fullDate || sortedData[i - 1].day);
        currentDate.setHours(0, 0, 0, 0);
        prevDate.setHours(0, 0, 0, 0);
        
        const dayDiff = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          maxStreakCount = Math.max(maxStreakCount, tempStreak);
          tempStreak = 1;
        }
      }
    }
    maxStreakCount = Math.max(maxStreakCount, tempStreak);
    
    setStreak(currentStreak);
    setMaxStreak(maxStreakCount);
  };

  useEffect(() => {
    if (showAll) {
      updateDisplayData(allData, currentPage);
    } else {
      setDisplayData(allData.slice(-ITEMS_PER_PAGE));
      setCurrentPage(0);
    }
  }, [showAll, currentPage, allData]);

  const updateDisplayData = (data, page) => {
    const start = page * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    setDisplayData(data.slice(start, end));
  };

  const totalPages = Math.ceil(allData.length / ITEMS_PER_PAGE);

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
          <div className="h-48 bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (allData.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-5 h-5 text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Submission Activity</h3>
        </div>
        <div className="h-48 flex flex-col items-center justify-center gap-2 border border-zinc-800 rounded">
          <p className="text-sm text-zinc-500">No submissions yet</p>
          <p className="text-xs text-zinc-600">Start solving problems to see your activity</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...displayData.map((d) => d.count));
  const totalSubmissions = allData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Activity Dashboard</h3>
            <p className="text-xs text-zinc-400">
              {showAll 
                ? `Page ${currentPage + 1} of ${totalPages}` 
                : `Last ${Math.min(ITEMS_PER_PAGE, allData.length)} days`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-400">{totalSubmissions}</p>
          <p className="text-xs text-zinc-400">total submissions</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-400 mb-1">Current Streak</p>
          <p className="text-2xl font-bold text-zinc-100">{streak}</p>
          <p className="text-xs text-zinc-500">day{streak !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-400 mb-1">Best Streak</p>
          <p className="text-2xl font-bold text-zinc-100">{maxStreak}</p>
          <p className="text-xs text-zinc-500">day{maxStreak !== 1 ? 's' : ''}</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4">
          <p className="text-xs text-zinc-400 mb-1">Daily Average</p>
          <p className="text-2xl font-bold text-zinc-100">{(totalSubmissions / allData.length).toFixed(1)}</p>
          <p className="text-xs text-zinc-500">submissions</p>
        </div>
      </div>

      {allData.length > ITEMS_PER_PAGE && (
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            {showAll ? "Show Recent" : `View All (${allData.length} days)`}
          </button>
          
          {showAll && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className={`p-1 rounded ${
                  currentPage === 0
                    ? "text-zinc-600 cursor-not-allowed"
                    : "text-zinc-400 hover:text-emerald-400"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-zinc-400">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className={`p-1 rounded ${
                  currentPage === totalPages - 1
                    ? "text-zinc-600 cursor-not-allowed"
                    : "text-zinc-400 hover:text-emerald-400"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-zinc-800" />
          ))}
        </div>

        <div className="relative flex items-end justify-between h-52 gap-1">
          {displayData.map((item, index) => {
            const barHeight = maxValue > 0 
              ? Math.max((item.count / maxValue) * 100, 8) 
              : 8;
            const isHovered = hoveredDay === item.day;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2"
                onMouseEnter={() => setHoveredDay(item.day)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                  <div
                    className={`w-full rounded-t transition-all ${
                      isHovered
                        ? "bg-emerald-500 scale-105"
                        : "bg-zinc-700 hover:bg-emerald-600"
                    }`}
                    style={{ height: `${barHeight}%` }}
                  >
                    {isHovered && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded shadow-lg">
                          <p className="text-sm font-bold text-zinc-100">{item.count}</p>
                          <p className="text-xs text-zinc-400">submission{item.count !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <p className={`text-xs font-medium ${
                    isHovered ? "text-emerald-400" : "text-zinc-500"
                  }`}>
                    {item.day.split(" ")[0]}
                  </p>
                  <p className={`text-xs ${
                    isHovered ? "text-emerald-400" : "text-zinc-400"
                  }`}>
                    {item.day.split(" ")[1]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <span>Most active: <span className="text-zinc-200 font-medium">{allData.reduce((max, d) => d.count > max.count ? d : max).day}</span></span>
        <span>Peak: <span className="text-zinc-200 font-medium">{Math.max(...allData.map(d => d.count))}</span> in a day</span>
      </div>
    </div>
  );
}