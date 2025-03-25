"use client";

import React, { useState, useEffect } from 'react';
import { useGame } from '@/utils/gameContext';
import { motion, AnimatePresence } from 'framer-motion';

const LetterTiles: React.FC = () => {
  const { 
    letters, 
    shuffleLetters, 
    gameActive, 
    hintsRemaining,
    activeHintLetters,
    useHint,
    clearHints,
    unusedLetters
  } = useGame();
  
  const [showNoHintsPopup, setShowNoHintsPopup] = useState(false);

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

  // Auto-hide the popup after 3 seconds
  useEffect(() => {
    if (showNoHintsPopup) {
      const timer = setTimeout(() => {
        setShowNoHintsPopup(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showNoHintsPopup]);

  // Handle click on a letter tile for hint
  const handleLetterClick = (letter: string) => {
    if (!gameActive) return;
    
    // If we have unused hints, or this letter is already an active hint, try to use hint
    if (hintsRemaining > 0 || activeHintLetters.includes(letter)) {
      const hintUsed = useHint(letter);
      
      // If hint wasn't used because there are no hints left, show popup
      if (!hintUsed && hintsRemaining <= 0 && !activeHintLetters.includes(letter)) {
        setShowNoHintsPopup(true);
      }
    } else {
      // No hints remaining and trying to use a new letter
      setShowNoHintsPopup(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 relative">
      {/* No Hints Popup */}
      <AnimatePresence>
        {showNoHintsPopup && (
          <motion.div
            className="absolute top-0 left-0 right-0 bg-red-500 text-white p-3 rounded-lg shadow-lg text-center z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">No hints remaining!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex justify-between w-full items-center mb-2">
        <div className="text-sm font-medium bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
          Hints: {hintsRemaining}/5
        </div>
        {activeHintLetters.length > 0 && (
          <div className="text-sm text-indigo-700">
            Showing words with:{' '}
            {activeHintLetters.map((letter, i) => (
              <span key={letter} className="font-bold mx-1">{letter}</span>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
        {letters.split('').map((letter, index) => {
          const color = colors[index % colors.length];
          const isActiveHint = activeHintLetters.includes(letter);
          const isUnusedLetter = unusedLetters.includes(letter);
          
          // Apply different styling for unused letters
          const letterStyle = isUnusedLetter 
            ? 'bg-gray-200 text-gray-400 opacity-60' // Whited out style for unused letters
            : `${color} text-white`;
          
          return (
            <motion.div
              key={`${letter}-${index}`}
              className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center 
                        ${letterStyle} font-bold text-2xl md:text-3xl rounded-lg 
                        shadow-lg cursor-pointer select-none
                        ${isActiveHint ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}
                        ${gameActive && (hintsRemaining > 0 || isActiveHint) ? 'hover:ring-2 hover:ring-yellow-300 hover:ring-offset-1' : ''}`}
              whileHover={{ scale: isUnusedLetter ? 1.05 : 1.15, rotate: isUnusedLetter ? 0 : [0, -3, 3, 0] }}
              whileTap={{ scale: 0.9, backgroundColor: isUnusedLetter ? "#d1d5db" : "#4338ca" }}
              initial={{ opacity: 0, y: 30, rotate: -5 + Math.random() * 10 }}
              animate={{ 
                opacity: isUnusedLetter ? 0.6 : 1, 
                y: 0,
                rotate: 0,
                transition: { 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 15
                } 
              }}
              onClick={() => handleLetterClick(letter)}
              drag={!isUnusedLetter} // Only allow dragging for still-useful letters
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
      
      <div className="flex gap-3">
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
        
        {/* {activeHintLetters.length > 0 && (
          <motion.button
            className="px-5 py-2 bg-yellow-500 text-white font-medium rounded-full 
                      shadow-md hover:bg-yellow-600 transition-colors"
            onClick={clearHints}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Clear Hints
          </motion.button>
        )} */}
      </div>
    </div>
  );
};

export default LetterTiles; 