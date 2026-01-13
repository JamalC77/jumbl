"use client";

import React, { useState, useEffect } from 'react';
import { useGame } from '@/utils/gameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { WordDifficulty } from '@/utils/openAiService';

// Component for displaying first letter hint
const FirstLetterHint: React.FC<{ letter: string }> = ({ letter }) => {
  return (
    <motion.span
      className="text-indigo-600 font-bold"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      {letter}
    </motion.span>
  );
};

// Component for difficulty badge
const DifficultyBadge: React.FC<{ difficulty: WordDifficulty }> = ({ difficulty }) => {
  const config = {
    easy: { label: "Common", color: "bg-emerald-100 text-emerald-700", dots: 1 },
    medium: { label: "Uncommon", color: "bg-amber-100 text-amber-700", dots: 2 },
    hard: { label: "Rare", color: "bg-rose-100 text-rose-700", dots: 3 },
  };

  const { label, color, dots } = config[difficulty];

  return (
    <div className={`text-xs px-2 py-0.5 rounded-full ${color} flex items-center gap-1`}>
      <span className="font-medium">{label}</span>
      <span className="opacity-60">{'●'.repeat(dots)}</span>
    </div>
  );
};

// Progress bar component
const ProgressBar: React.FC<{ found: number; total: number }> = ({ found, total }) => {
  const percentage = total > 0 ? (found / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-700">Progress</span>
        <span className="text-sm font-bold text-indigo-600">{found} / {total}</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {/* Milestone markers */}
      <div className="flex justify-between mt-1 px-1">
        {[0, 25, 50, 75, 100].map((mark) => (
          <div
            key={mark}
            className={`w-1 h-1 rounded-full ${percentage >= mark ? 'bg-indigo-400' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
};

const WordList: React.FC = () => {
  const {
    foundWords,
    totalWords,
    getWordDifficulty,
    currentWordSet,
    activeHintLetters,
    activeHintPositions,
    gameCompleted,
    gameActive,
    remainingTime,
  } = useGame();

  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (gameCompleted && !gameActive) {
      setGaveUp(remainingTime > 0);
    } else if (!gameCompleted) {
      setGaveUp(false);
    }
  }, [gameCompleted, gameActive, remainingTime]);

  const allWords = currentWordSet?.words || [];

  // Check if a specific position in a word matches any of the hint letter positions
  const isHintPosition = (letter: string, position: number): boolean => {
    if (activeHintLetters.length === 0) return false;
    return activeHintLetters.includes(letter) &&
      activeHintPositions.has(letter) &&
      (activeHintPositions.get(letter)?.includes(position) || false);
  };

  // Display unfound word with hint letters revealed
  const displayUnfoundWord = (word: string): React.ReactNode => {
    if (gameCompleted && !gameActive) {
      return (
        <span className="text-gray-500 line-through decoration-red-400 decoration-2">
          {word}
        </span>
      );
    }

    return (
      <div className="flex justify-center gap-0.5">
        {word.split('').map((letter, index) => {
          if (index === 0) {
            return <FirstLetterHint key={index} letter={letter} />;
          }

          if (isHintPosition(letter, index)) {
            return (
              <motion.span
                key={index}
                className="text-amber-500 font-bold"
                animate={{
                  textShadow: ["0 0 0px #f59e0b", "0 0 8px #f59e0b", "0 0 0px #f59e0b"],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {letter}
              </motion.span>
            );
          }

          return <span key={index} className="text-gray-400">?</span>;
        })}
      </div>
    );
  };

  // Highlight hint letters in found words
  const displayFoundWord = (word: string): React.ReactNode => {
    return (
      <div className="flex justify-center">
        {word.split('').map((letter, index) => {
          if (isHintPosition(letter, index)) {
            return (
              <span key={index} className="text-amber-500 font-bold underline">
                {letter}
              </span>
            );
          }
          return <span key={index}>{letter}</span>;
        })}
      </div>
    );
  };

  // Get color for found word card
  const getFoundWordColor = (index: number) => {
    const colors = [
      'bg-gradient-to-br from-pink-100 to-rose-100 border-pink-200',
      'bg-gradient-to-br from-orange-100 to-amber-100 border-orange-200',
      'bg-gradient-to-br from-yellow-100 to-lime-100 border-yellow-200',
      'bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-200',
      'bg-gradient-to-br from-cyan-100 to-sky-100 border-cyan-200',
      'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200',
      'bg-gradient-to-br from-violet-100 to-purple-100 border-violet-200',
      'bg-gradient-to-br from-fuchsia-100 to-pink-100 border-fuchsia-200',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="mb-4">
        <ProgressBar found={foundWords.length} total={totalWords} />
      </div>

      {/* Game end message */}
      {gameCompleted && !gameActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-3 rounded-xl text-center ${
            foundWords.length === totalWords
              ? 'bg-emerald-100 border border-emerald-200'
              : 'bg-amber-50 border border-amber-200'
          }`}
        >
          <p className={`font-semibold ${
            foundWords.length === totalWords ? 'text-emerald-700' : 'text-amber-700'
          }`}>
            {foundWords.length === totalWords
              ? "You found all the words!"
              : gaveUp
                ? `You gave up with ${foundWords.length} of ${totalWords} words.`
                : `Time's up! You found ${foundWords.length} of ${totalWords} words.`}
          </p>
        </motion.div>
      )}

      {/* Word grid */}
      <motion.div
        className="grid grid-cols-4 gap-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 1 },
          visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
        }}
      >
        <AnimatePresence>
          {allWords.map((word: string, index: number) => {
            const isFound = foundWords.includes(word);
            const difficulty = getWordDifficulty(word);
            const containsHint = activeHintLetters.some(l => word.includes(l));

            return (
              <motion.div
                key={word}
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 }
                }}
                className={`relative border rounded-xl p-2 text-center shadow-sm transition-all
                  ${isFound
                    ? `${getFoundWordColor(index)} text-gray-800`
                    : gameCompleted
                      ? 'bg-red-50 border-red-200 text-gray-600'
                      : containsHint
                        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                        : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                whileHover={{ scale: 1.02 }}
                layout
              >
                {isFound && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-semibold">
                    {isFound ? displayFoundWord(word) : displayUnfoundWord(word)}
                  </span>
                  <DifficultyBadge difficulty={difficulty || "medium"} />
                </div>
              </motion.div>
            );
          })}

          {/* Placeholder cards when no words loaded */}
          {allWords.length === 0 && Array(8).fill(null).map((_, index) => (
            <motion.div
              key={`placeholder-${index}`}
              className="border border-dashed border-gray-300 rounded-xl p-2 text-center"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm text-gray-400">?????</span>
                <div className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                  ...
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default WordList;
