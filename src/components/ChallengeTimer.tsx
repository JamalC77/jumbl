"use client";

import React from 'react';
import { useGame } from '@/utils/gameContext';
import { motion } from 'framer-motion';

const ChallengeTimer: React.FC = () => {
  const { isChallenge, challengeTimeRemaining } = useGame();

  if (!isChallenge || !challengeTimeRemaining) {
    return null;
  }

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="w-full bg-blue-50 p-4 rounded-lg border border-blue-200 text-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold text-blue-700 mb-2">
        Challenge Starting Soon
      </h3>
      <div className="text-3xl font-mono font-bold text-blue-800">
        {formatTime(challengeTimeRemaining)}
      </div>
      <p className="mt-2 text-blue-600">
        The game will automatically begin when the timer reaches zero. Both players will get the same puzzle!
      </p>
    </motion.div>
  );
};

export default ChallengeTimer; 