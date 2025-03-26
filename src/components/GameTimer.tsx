"use client";

import React from 'react';
import { useGame } from '@/utils/gameContext';
import { motion } from 'framer-motion';

const GameTimer: React.FC = () => {
  const { remainingTime, gameActive } = useGame();
  
  // Format the time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const timeProgress = (remainingTime / 300) * 100; // assuming 5 minutes (300 seconds)
  
  // Determine color based on remaining time
  const getColorClass = (): string => {
    if (remainingTime > 180) return 'text-green-600'; // More than 3 minutes
    if (remainingTime > 60) return 'text-amber-500'; // Between 1-3 minutes
    return 'text-red-600'; // Less than 1 minute
  };

  // Get progress bar color
  const getProgressColor = (): string => {
    if (remainingTime > 180) return 'bg-green-500'; // More than 3 minutes
    if (remainingTime > 60) return 'bg-amber-500'; // Between 1-3 minutes
    return 'bg-red-500'; // Less than 1 minute
  };

  // Pulse animation for last minute
  const isPulsing = remainingTime <= 60;
  
  return (
    <div className="flex flex-col items-end">
      <motion.div 
        className={`text-xl md:text-2xl font-bold mb-1 font-mono ${gameActive ? getColorClass() : 'text-gray-500'}`}
        animate={isPulsing && gameActive ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        {formatTime(remainingTime)}
      </motion.div>
      
      {gameActive && (
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getProgressColor()}`}
            initial={{ width: `${timeProgress}%` }}
            animate={{ width: `${timeProgress}%` }}
            transition={{ duration: 0.5 }}
            style={{ 
              boxShadow: isPulsing ? '0 0 6px rgba(239, 68, 68, 0.7)' : 'none' 
            }}
          />
        </div>
      )}

      {!gameActive && !timeProgress && (
        <div className="text-xs text-indigo-500 font-medium">
          Start to begin!
        </div>
      )}
    </div>
  );
};

export default GameTimer; 