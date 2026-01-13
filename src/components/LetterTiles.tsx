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
    unusedLetters,
    addLetterToInput,
    inputValue,
    wordLength,
  } = useGame();

  const [showNoHintsPopup, setShowNoHintsPopup] = useState(false);
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  // Vibrant, distinct colors for letter tiles
  const colors = [
    'from-pink-500 to-rose-500',
    'from-orange-500 to-amber-500',
    'from-yellow-500 to-lime-500',
    'from-emerald-500 to-teal-500',
    'from-cyan-500 to-sky-500',
    'from-blue-500 to-indigo-500',
    'from-violet-500 to-purple-500',
    'from-fuchsia-500 to-pink-500',
  ];

  // Auto-hide the popup after 2 seconds
  useEffect(() => {
    if (showNoHintsPopup) {
      const timer = setTimeout(() => {
        setShowNoHintsPopup(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showNoHintsPopup]);

  // Handle click on a letter tile
  const handleLetterClick = (letter: string, index: number) => {
    if (!gameActive) return;

    // Visual feedback
    setLastClickedIndex(index);
    setTimeout(() => setLastClickedIndex(null), 150);

    // Add letter to input (click-to-type)
    addLetterToInput(letter);
  };

  // Handle long press for hint (or right click)
  const handleHintClick = (e: React.MouseEvent, letter: string) => {
    e.preventDefault();
    if (!gameActive) return;

    if (hintsRemaining > 0 || activeHintLetters.includes(letter)) {
      const hintUsed = useHint(letter);

      if (!hintUsed && hintsRemaining <= 0 && !activeHintLetters.includes(letter)) {
        setShowNoHintsPopup(true);
      }
    } else {
      setShowNoHintsPopup(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 relative">
      {/* No Hints Popup */}
      <AnimatePresence>
        {showNoHintsPopup && (
          <motion.div
            className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium z-10 whitespace-nowrap"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            No hints remaining!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current word being typed - preview */}
      {gameActive && (
        <div className="flex items-center gap-1 h-12 mb-2">
          {Array.from({ length: wordLength }).map((_, index) => (
            <motion.div
              key={index}
              className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg font-bold text-lg md:text-xl
                ${inputValue[index]
                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                  : 'bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400'}`}
              initial={inputValue[index] ? { scale: 0.8 } : {}}
              animate={inputValue[index] ? { scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              {inputValue[index] || ''}
            </motion.div>
          ))}
        </div>
      )}

      {/* Letter tiles - HERO element */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {letters.split('').map((letter, index) => {
          const colorGradient = colors[index % colors.length];
          const isActiveHint = activeHintLetters.includes(letter);
          const isUnusedLetter = unusedLetters.includes(letter);
          const isClicked = lastClickedIndex === index;

          return (
            <motion.button
              key={`${letter}-${index}`}
              type="button"
              className={`relative w-14 h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 flex items-center justify-center
                        font-bold text-xl md:text-2xl lg:text-3xl rounded-xl
                        shadow-lg cursor-pointer select-none transition-all
                        ${isUnusedLetter
                          ? 'bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed shadow-none'
                          : `bg-gradient-to-br ${colorGradient} text-white shadow-lg hover:shadow-xl`}
                        ${isActiveHint ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}
                        ${gameActive && !isUnusedLetter ? 'hover:scale-105 active:scale-95' : ''}`}
              onClick={() => handleLetterClick(letter, index)}
              onContextMenu={(e) => handleHintClick(e, letter)}
              disabled={!gameActive || isUnusedLetter}
              whileHover={!isUnusedLetter && gameActive ? {
                y: -4,
                transition: { duration: 0.2 }
              } : {}}
              whileTap={!isUnusedLetter && gameActive ? {
                scale: 0.9,
                transition: { duration: 0.1 }
              } : {}}
              animate={isClicked ? {
                scale: [1, 0.85, 1.05, 1],
                transition: { duration: 0.2 }
              } : {}}
              initial={{ opacity: 0, y: 30, rotate: -10 + Math.random() * 20 }}
              transition={{
                delay: index * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              style={{
                // Add 3D effect
                boxShadow: isUnusedLetter
                  ? 'none'
                  : '0 4px 0 rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.15)',
              }}
            >
              {letter}
              {/* Shine effect */}
              {!isUnusedLetter && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-4 mt-2">
        {/* Hints badge */}
        <div className={`text-sm font-semibold px-4 py-2 rounded-full transition-all
          ${hintsRemaining > 0
            ? 'bg-amber-100 text-amber-700 border border-amber-200'
            : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
          Hints: {hintsRemaining}/5
        </div>

        {/* Shuffle button */}
        <motion.button
          type="button"
          className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold rounded-full
                     shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={shuffleLetters}
          disabled={!gameActive}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Shuffle
        </motion.button>
      </div>

      {/* Hint instruction */}
      {gameActive && hintsRemaining > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          Right-click a tile to use a hint
        </p>
      )}

      {/* Active hints display */}
      {activeHintLetters.length > 0 && (
        <motion.div
          className="text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Showing positions for:{' '}
          {activeHintLetters.map((letter, i) => (
            <span key={letter} className="font-bold text-yellow-600 mx-1">{letter}</span>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default LetterTiles;
