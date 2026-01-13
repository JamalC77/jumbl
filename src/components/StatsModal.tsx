"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyStats, DailyStats, DailyResult } from '@/utils/dailyChallenge';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<DailyStats | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStats(getDailyStats());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const winRate = stats && stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  // Generate distribution data for chart
  const getDistribution = () => {
    if (!stats || stats.dailyHistory.length === 0) return [];

    const dist = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // 0-8 words found

    stats.dailyHistory.forEach((result: DailyResult) => {
      dist[result.wordsFound]++;
    });

    return dist;
  };

  const distribution = getDistribution();
  const maxDistribution = Math.max(...distribution, 1);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Statistics</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Main stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{stats?.gamesPlayed || 0}</p>
                    <p className="text-xs text-gray-500">Played</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{winRate}%</p>
                    <p className="text-xs text-gray-500">Win Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{stats?.currentStreak || 0}</p>
                    <p className="text-xs text-gray-500">Current Streak</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{stats?.maxStreak || 0}</p>
                    <p className="text-xs text-gray-500">Max Streak</p>
                  </div>
                </div>

                {/* Streak display */}
                {stats && stats.currentStreak > 0 && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl text-center">
                    <div className="text-4xl mb-1">🔥</div>
                    <p className="text-2xl font-bold text-orange-600">{stats.currentStreak} Day Streak!</p>
                    <p className="text-sm text-orange-500">Keep it going!</p>
                  </div>
                )}

                {/* Distribution chart */}
                {stats && stats.dailyHistory.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-3">Words Found Distribution</h3>
                    <div className="space-y-2">
                      {distribution.map((count, words) => (
                        <div key={words} className="flex items-center gap-2">
                          <span className="w-4 text-xs text-gray-500 text-right">{words}</span>
                          <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                            <motion.div
                              className={`h-full ${words === 8 ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(count / maxDistribution) * 100}%` }}
                              transition={{ duration: 0.5, delay: words * 0.05 }}
                            />
                          </div>
                          <span className="w-6 text-xs text-gray-500">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent games */}
                {stats && stats.dailyHistory.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Recent Games</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {[...stats.dailyHistory].reverse().slice(0, 7).map((result: DailyResult, index) => (
                        <div
                          key={result.date}
                          className={`flex items-center justify-between p-2 rounded-lg text-sm
                            ${result.completed ? 'bg-emerald-50' : 'bg-gray-50'}`}
                        >
                          <span className="text-gray-600">{result.date}</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${result.completed ? 'text-emerald-600' : 'text-gray-600'}`}>
                              {result.wordsFound}/8
                            </span>
                            {result.completed && <span>✓</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {(!stats || stats.gamesPlayed === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-4xl mb-2">📊</p>
                    <p>No games played yet!</p>
                    <p className="text-sm">Play the Daily Challenge to see your stats.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={onClose}
                  className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StatsModal;
