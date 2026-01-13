"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/utils/gameContext';
import {
  getDailyStats,
  hasPlayedToday,
  getDayNumber,
  getTimeUntilNextDaily,
  isStreakAtRisk,
  DailyStats,
} from '@/utils/dailyChallenge';

interface DailyChallengeProps {
  onOpenStats: () => void;
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({ onOpenStats }) => {
  const { startDailyChallenge, isLoading, gameActive, gameCompleted } = useGame();
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [playedToday, setPlayedToday] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [streakAtRisk, setStreakAtRisk] = useState(false);

  // Load stats on mount
  useEffect(() => {
    setStats(getDailyStats());
    setPlayedToday(hasPlayedToday());
    setStreakAtRisk(isStreakAtRisk());
  }, [gameCompleted]);

  // Countdown timer for next daily
  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getTimeUntilNextDaily());
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const dayNumber = getDayNumber();

  if (gameActive) return null;

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Daily Challenge Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border-2 border-amber-200 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <div>
              <h3 className="font-bold text-amber-800">Daily Challenge</h3>
              <p className="text-xs text-amber-600">Jumbl #{dayNumber}</p>
            </div>
          </div>

          {/* Streak display */}
          {stats && stats.currentStreak > 0 && (
            <motion.div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold
                ${streakAtRisk && !playedToday
                  ? 'bg-red-100 text-red-600 animate-pulse'
                  : 'bg-orange-100 text-orange-600'}`}
              whileHover={{ scale: 1.05 }}
            >
              <span>🔥</span>
              <span>{stats.currentStreak}</span>
            </motion.div>
          )}
        </div>

        {/* Streak at risk warning */}
        <AnimatePresence>
          {streakAtRisk && !playedToday && stats && stats.currentStreak > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-2 bg-red-100 border border-red-200 rounded-lg text-center"
            >
              <p className="text-red-700 text-sm font-medium">
                ⚠️ Play today to keep your {stats.currentStreak}-day streak!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action area */}
        {playedToday ? (
          <div className="text-center">
            <div className="mb-3 p-3 bg-green-100 border border-green-200 rounded-xl">
              <p className="text-green-700 font-semibold">✓ Completed today!</p>
              {stats && stats.dailyHistory.length > 0 && (
                <p className="text-green-600 text-sm mt-1">
                  Found {stats.dailyHistory[stats.dailyHistory.length - 1].wordsFound}/8 words
                </p>
              )}
            </div>

            <div className="text-amber-700 text-sm mb-3">
              <p className="font-medium">Next puzzle in:</p>
              <p className="font-mono text-lg">
                {countdown.hours.toString().padStart(2, '0')}:
                {countdown.minutes.toString().padStart(2, '0')}:
                {countdown.seconds.toString().padStart(2, '0')}
              </p>
            </div>

            <button
              onClick={onOpenStats}
              className="text-amber-600 hover:text-amber-800 font-medium text-sm underline underline-offset-2"
            >
              View your stats
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-amber-700 text-sm text-center">
              Same puzzle for everyone. One chance per day.
            </p>

            <motion.button
              onClick={() => startDailyChallenge()}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg
                       hover:shadow-xl transition-all disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? 'Loading...' : 'Play Daily Challenge'}
            </motion.button>

            {/* Stats preview */}
            {stats && stats.gamesPlayed > 0 && (
              <div className="flex justify-center gap-4 text-center text-xs">
                <div>
                  <p className="font-bold text-amber-800">{stats.gamesPlayed}</p>
                  <p className="text-amber-600">Played</p>
                </div>
                <div>
                  <p className="font-bold text-amber-800">{Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%</p>
                  <p className="text-amber-600">Win Rate</p>
                </div>
                <div>
                  <p className="font-bold text-amber-800">{stats.maxStreak}</p>
                  <p className="text-amber-600">Max Streak</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DailyChallenge;
