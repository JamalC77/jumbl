"use client";

import React from 'react';
import { useGame } from '@/utils/gameContext';
import { motion } from 'framer-motion';

const LetterTiles: React.FC = () => {
  const { letters, shuffleLetters } = useGame();

  // Random pastel colors for letter tiles
  const colors = [
    'bg-purple-500',
    'bg-indigo-500',
    'bg-blue-500',
    'bg-sky-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-lime-500',
    'bg-amber-500'
  ];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
        {letters.split('').map((letter, index) => {
          const color = colors[index % colors.length];
          return (
            <motion.div
              key={`${letter}-${index}`}
              className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center 
                        ${color} text-white font-bold text-2xl md:text-3xl rounded-lg 
                        shadow-lg cursor-pointer select-none`}
              whileHover={{ scale: 1.15, rotate: [0, -3, 3, 0] }}
              whileTap={{ scale: 0.9, backgroundColor: "#4338ca" }}
              initial={{ opacity: 0, y: 30, rotate: -5 + Math.random() * 10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                rotate: 0,
                transition: { 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 15
                } 
              }}
              drag
              dragConstraints={{
                top: -5,
                left: -5,
                right: 5,
                bottom: 5,
              }}
            >
              {letter}
            </motion.div>
          );
        })}
      </div>
      
      <motion.button
        className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-full 
                   shadow-md hover:bg-indigo-700 transition-colors"
        onClick={shuffleLetters}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Shuffle Letters
      </motion.button>
    </div>
  );
};

export default LetterTiles; 