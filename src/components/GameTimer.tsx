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

  // Calculate progress percentage (5 minutes = 300 seconds)
  const timeProgress = (remainingTime / 300) * 100;

  // Determine color based on remaining time
  const getColorClass = (): { text: string; bg: string; ring: string } => {
    if (remainingTime > 180) return {
      text: 'text-emerald-600',
      bg: 'bg-emerald-500',
      ring: 'ring-emerald-200'
    };
    if (remainingTime > 60) return {
      text: 'text-amber-600',
      bg: 'bg-amber-500',
      ring: 'ring-amber-200'
    };
    return {
      text: 'text-red-600',
      bg: 'bg-red-500',
      ring: 'ring-red-200'
    };
  };

  const colors = getColorClass();
  const isPulsing = remainingTime <= 60 && remainingTime > 0;
  const isCritical = remainingTime <= 30 && remainingTime > 0;

  // SVG circle properties for circular progress
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (timeProgress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Circular timer */}
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          {gameActive && (
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={remainingTime > 180 ? '#10b981' : remainingTime > 60 ? '#f59e0b' : '#ef4444'}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              initial={{ strokeDashoffset: 0 }}
              animate={{
                strokeDashoffset: offset,
                stroke: remainingTime > 180 ? '#10b981' : remainingTime > 60 ? '#f59e0b' : '#ef4444'
              }}
              transition={{ duration: 0.5 }}
            />
          )}
        </svg>

        {/* Time display in center */}
        <motion.div
          className={`absolute inset-0 flex items-center justify-center font-mono font-bold text-lg
            ${gameActive ? colors.text : 'text-gray-400'}`}
          animate={isPulsing ? {
            scale: [1, 1.05, 1],
          } : {}}
          transition={{ repeat: Infinity, duration: isCritical ? 0.5 : 1 }}
        >
          {formatTime(remainingTime)}
        </motion.div>

        {/* Critical warning ring */}
        {isCritical && gameActive && (
          <motion.div
            className="absolute inset-0 rounded-full ring-4 ring-red-400"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          />
        )}
      </div>

      {/* Status text */}
      {!gameActive && remainingTime === 300 && (
        <p className="text-xs text-gray-500 mt-1 font-medium">5:00 to play</p>
      )}

      {gameActive && remainingTime <= 60 && (
        <motion.p
          className="text-xs text-red-500 mt-1 font-semibold"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          Hurry!
        </motion.p>
      )}
    </div>
  );
};

export default GameTimer;
