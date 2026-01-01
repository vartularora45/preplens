import { ChevronUp, ChevronDown, CheckCircle, XCircle, X, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Separate Modal Component
function SubmissionModal({ submission, onClose }) {
  if (!submission) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal Content - Centered */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-sm font-mono tracking-wider text-zinc-300">
            SUBMISSION DETAILS
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-center">
            {submission.result?.correct ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-xs font-mono tracking-wider text-green-400">
                  PASSED
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full">
                <XCircle size={16} className="text-red-400" />
                <span className="text-xs font-mono tracking-wider text-red-400">
                  FAILED
                </span>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="space-y-3">
            <DetailRow label="Problem ID" value={submission.problemId} />
            <DetailRow label="Topic" value={submission.topic} />
            <DetailRow label="Difficulty" value={submission.difficulty?.toUpperCase() || 'N/A'} />
            <DetailRow label="Time Taken" value={`${submission.result?.timeTakenSeconds || 0}s`} />
            <DetailRow 
              label="Submitted" 
              value={new Date(submission.result?.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono tracking-wider rounded transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for detail rows
function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
      <span className="text-xs text-zinc-500 font-mono tracking-wide">
        {label}
      </span>
      <span className="text-xs text-zinc-300 font-mono">
        {value}
      </span>
    </div>
  );
}

// Main Table Component
export default function SubmissionsTable() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Built-in state for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const userRaw = localStorage.getItem('user');
        
        if (!userRaw) return;
        
        const user = JSON.parse(userRaw);
        const userId = user.id;

        const response = await axios.get(`http://localhost:5000/api/submission/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });

        console.log('Fetched submissions:', response.data);
        setSubmissions(response.data.submissions || []);
      } catch (err) {
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (column) => {
    if (sortConfig?.key !== column) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  // Filter and sort submissions
  const filteredAndSortedSubmissions = React.useMemo(() => {
    let filtered = [...submissions];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(sub =>
        sub.problemId?.toLowerCase().includes(search) ||
        sub.topic?.toLowerCase().includes(search) ||
        sub.difficulty?.toLowerCase().includes(search)
      );
    }

    // Apply result filter
    if (filterResult === 'pass') {
      filtered = filtered.filter(sub => sub.result?.correct === true);
    } else if (filterResult === 'fail') {
      filtered = filtered.filter(sub => sub.result?.correct === false);
    }

    // Apply sorting
    if (sortConfig?.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case 'id':
            aValue = a.problemId || '';
            bValue = b.problemId || '';
            break;
          case 'topic':
            aValue = (a.topic || '').toLowerCase();
            bValue = (b.topic || '').toLowerCase();
            break;
          case 'difficulty':
            const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
            aValue = difficultyOrder[(a.difficulty || '').toLowerCase()] || 0;
            bValue = difficultyOrder[(b.difficulty || '').toLowerCase()] || 0;
            break;
          case 'time':
            aValue = a.result?.timeTakenSeconds || 0;
            bValue = b.result?.timeTakenSeconds || 0;
            break;
          case 'result':
            aValue = a.result?.correct ? 1 : 0;
            bValue = b.result?.correct ? 1 : 0;
            break;
          case 'date':
            aValue = new Date(a.result?.timestamp || 0).getTime();
            bValue = new Date(b.result?.timestamp || 0).getTime();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [submissions, searchTerm, filterResult, sortConfig]);

  if (loading) {
    return (
      <div className="bg-black min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-zinc-900 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-black min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header with filters */}
          <div className="mb-6 space-y-4">
            <h1 className="text-2xl font-mono tracking-wider text-zinc-100">
              RECENT SUBMISSIONS
            </h1>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Search problems, topics, difficulty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                />
              </div>

              {/* Result Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterResult('all')}
                  className={`px-3 py-2 text-xs font-mono tracking-wider rounded transition-colors ${
                    filterResult === 'all'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  ALL
                </button>
                <button
                  onClick={() => setFilterResult('pass')}
                  className={`px-3 py-2 text-xs font-mono tracking-wider rounded transition-colors ${
                    filterResult === 'pass'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  PASS
                </button>
                <button
                  onClick={() => setFilterResult('fail')}
                  className={`px-3 py-2 text-xs font-mono tracking-wider rounded transition-colors ${
                    filterResult === 'fail'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  FAIL
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800">
                  {['id', 'topic', 'difficulty', 'time', 'result', 'date'].map(col => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-[10px] font-mono tracking-wider text-zinc-500 uppercase cursor-pointer hover:text-zinc-300 transition-colors"
                      onClick={() => handleSort(col)}
                    >
                      <div className="flex items-center gap-1">
                        {col.toUpperCase()}
                        {getSortIcon(col)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-zinc-600">
                      {searchTerm || filterResult !== 'all' ? 'No submissions found matching your filters' : 'No submissions yet'}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedSubmissions.map((sub, index) => (
                    <tr
                      key={index}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group"
                    >
                      <td className="px-4 py-3 text-xs font-mono text-zinc-400">
                        {sub.problemId}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-300">
                        {sub.topic}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-400">
                        {sub.difficulty?.toUpperCase() || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-400">
                        {sub.result?.timeTakenSeconds || 0}s
                      </td>
                      <td className="px-4 py-3">
                        {sub.result?.correct ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-green-400" />
                            <span className="text-[10px] font-mono tracking-wider text-green-400">
                              PASS
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle size={14} className="text-red-400" />
                            <span className="text-[10px] font-mono tracking-wider text-red-400">
                              FAIL
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-400">
                            {new Date(sub.result?.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <button
                            onClick={() => setSelectedSubmission(sub)}
                            className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline font-mono tracking-wide transition-colors opacity-0 group-hover:opacity-100"
                          >
                            DETAILS
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <SubmissionModal 
        submission={selectedSubmission} 
        onClose={() => setSelectedSubmission(null)} 
      />
    </>
  );
}