"use client";

import React, { useState, useEffect } from 'react';
import { useGame } from '@/utils/gameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { WordDifficulty } from '@/utils/openAiService';

// Component for displaying first letter hint
const FirstLetterHint: React.FC<{ letter: string }> = ({ letter }) => {
  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.2 }}
    >
      <motion.span 
        className="text-blue-600 font-bold"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
        }}
        transition={{ 
          duration: 0.5,
          type: "spring",
          stiffness: 300,
          damping: 15
        }}
      >
        {letter}
      </motion.span>

    </motion.div>
  );
};

// Component for difficulty badge
const DifficultyBadge: React.FC<{ difficulty: WordDifficulty }> = ({ difficulty }) => {
  // Map difficulty to human-readable descriptions
  const difficultyLabels = {
    easy: "Common",
    medium: "Uncommon",
    hard: "Rare"
  };
  
  // Map difficulty to different color schemes
  const difficultyColors = {
    easy: "bg-green-100 text-green-800 border-green-300",
    medium: "bg-amber-100 text-amber-800 border-amber-300",
    hard: "bg-red-100 text-red-800 border-red-300"
  };
  
  // Map difficulty to indicators for visual clarity
  const difficultyIndicators = {
    easy: "●",
    medium: "●●",
    hard: "●●●"
  };
  
  // Add tooltips based on difficulty
  const difficultyTooltips = {
    easy: "A frequently used English word",
    medium: "A less common but recognizable word",
    hard: "A rare or specialized word"
  };
  
  return (
    <div 
      className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColors[difficulty]} 
                 flex items-center gap-1 transition-all hover:shadow-md`}
      title={difficultyTooltips[difficulty]} // Add tooltip on hover
    >
      <span className="font-medium">{difficultyLabels[difficulty]}</span>
      <span className="text-xs opacity-80">{difficultyIndicators[difficulty]}</span>
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
    wordLength
  } = useGame();
  
  // Track if the user gave up or time ran out
  const [gaveUp, setGaveUp] = useState(false);
  
  // Check if the game just ended to determine if user gave up
  useEffect(() => {
    if (gameCompleted && !gameActive) {
      // If time is 0, then the timer ran out
      // Otherwise, the user gave up (used endGame directly)
      setGaveUp(remainingTime > 0);
    } else if (!gameCompleted) {
      // Reset when game is not completed
      setGaveUp(false);
    }
  }, [gameCompleted, gameActive, remainingTime]);
  
  const container = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };
  
  // All words from the current word set (if available)
  const allWords = currentWordSet?.words || [];
  
  // Colors for word boxes (gradient from yellow to green)
  const getWordColor = (index: number, isFound: boolean, containsHint: boolean) => {
    if (isFound) {
      const colors = [
        'bg-yellow-100 border-yellow-300 text-yellow-800',
        'bg-lime-100 border-lime-300 text-lime-800',
        'bg-green-100 border-green-300 text-green-800',
        'bg-emerald-100 border-emerald-300 text-emerald-800',
        'bg-teal-100 border-teal-300 text-teal-800',
        'bg-cyan-100 border-cyan-300 text-cyan-800',
        'bg-sky-100 border-sky-300 text-sky-800',
        'bg-blue-100 border-blue-300 text-blue-800',
        'bg-indigo-100 border-indigo-300 text-indigo-800',
        'bg-violet-100 border-violet-300 text-violet-800',
      ];
      return colors[index % colors.length];
    }
    
    // Game over, show unfound words with special styling
    if (gameCompleted && !gameActive) {
      return 'bg-red-50 border-red-200 text-gray-700';
    }
    
    // Unfound word with hint - slightly highlighted bg
    if (containsHint && activeHintLetters.length > 0) {
      return 'bg-yellow-50 border-yellow-200 text-gray-600';
    }
    
    // Regular unfound word
    return 'bg-gray-50 border-gray-200 text-gray-400';
  };
  
  // Check if a word contains any of the active hint letters
  const wordContainsHintLetters = (word: string): boolean => {
    if (activeHintLetters.length === 0) return false;
    return activeHintLetters.some(letter => word.includes(letter));
  };
  
  // Check if a specific position in a word matches any of the hint letter positions
  const isHintPosition = (letter: string, position: number): boolean => {
    if (activeHintLetters.length === 0) return false;
    
    // Check if this letter is in activeHintLetters and if this position is in the positions for this letter
    return activeHintLetters.includes(letter) && 
           activeHintPositions.has(letter) && 
           activeHintPositions.get(letter)?.includes(position) || false;
  };
  
  // Highlight the hint letters in a found word
  const highlightHintLetters = (word: string): React.ReactNode => {
    if (activeHintLetters.length === 0) return word;
    
    // Split the word into individual characters for rendering
    return (
      <div className="flex justify-center">
        {word.split('').map((letter, index) => {
          if (isHintPosition(letter, index)) {
            return (
              <span key={index} className="text-yellow-500 font-bold underline">
                {letter}
              </span>
            );
          }
          return <span key={index}>{letter}</span>;
        })}
      </div>
    );
  };
  
  // Display unfound word with hint letters revealed
  const displayUnfoundWord = (word: string): React.ReactNode => {
    // Show the actual word if game completed (time ran out or user gave up)
    if (gameCompleted && !gameActive) {
      return (
        <div className="flex justify-center">
          <div className="text-gray-600 font-medium line-through decoration-red-300 decoration-2">
            {word}
          </div>
        </div>
      );
    }
    
    // Create spacing between letters for better readability
    return (
      <div className="flex justify-center space-x-1">
        {word.split('').map((letter, index) => {
          // Always show the first letter as a hint
          if (index === 0) {
            return (
              <FirstLetterHint key={index} letter={letter} />
            );
          }
          
          // Check if this exact position is a hint
          if (isHintPosition(letter, index)) {
            return (
              <motion.span 
                key={index} 
                className="text-yellow-500 font-bold"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  boxShadow: ["0px 0px 0px rgba(255, 215, 0, 0)", "0px 0px 8px rgba(255, 215, 0, 0.5)", "0px 0px 0px rgba(255, 215, 0, 0)"],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                {letter}
              </motion.span>
            );
          }
          
          // For positions where we know there are hints but not which letters
          return <span key={index} className="text-gray-400">?</span>;
        })}
      </div>
    );
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-bold text-indigo-700">Words Found</h3>
        <div className="text-xs font-medium bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
          {foundWords.length} / {totalWords}
        </div>
      </div>
      
      {gameCompleted && !gameActive && (
        <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-center text-sm">
          <p className="text-amber-700 font-medium">
            {foundWords.length === totalWords 
              ? "Congratulations, you found all the words!" 
              : gaveUp 
                ? `You gave up with ${foundWords.length} of ${totalWords} words found.`
                : `Time's up! You found ${foundWords.length} of ${totalWords} words.`}
          </p>
          {foundWords.length !== totalWords && (
            <p className="text-xs text-amber-600 mt-1">
              The missed words are displayed below with strikethrough.
            </p>
          )}
        </div>
      )}
      
      <motion.div 
        className="grid grid-cols-4 gap-1.5 sm:grid-cols-4 md:grid-cols-4"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {allWords.map((word: string, index: number) => {
            const isFound = foundWords.includes(word);
            const difficulty = getWordDifficulty(word);
            const containsHint = wordContainsHintLetters(word);
            
            return (
              <motion.div
                key={word}
                variants={item}
                className={`border rounded-lg p-1.5 text-center 
                          font-medium shadow-sm ${getWordColor(index, isFound, containsHint)}
                          ${containsHint && activeHintLetters.length > 0 ? 'ring-1 ring-yellow-400' : ''}`}
                layout
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm mb-1">
                    {isFound ? highlightHintLetters(word) : displayUnfoundWord(word)}
                  </span>
                  <DifficultyBadge difficulty={difficulty || "medium"} />
                </div>
              </motion.div>
            );
          })}
          
          {/* If we don't have all words loaded yet, show placeholders */}
          {allWords.length === 0 && Array(8).fill(null).map((_, index) => (
            <motion.div
              key={`placeholder-${index}`}
              className="border border-dashed border-gray-300 rounded-lg p-1.5 text-center 
                      text-gray-400 italic"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0.7 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm mb-1">?</span>
                <div className="text-xs px-2 py-0.5 opacity-30 rounded-full bg-gray-200 inline-block">
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