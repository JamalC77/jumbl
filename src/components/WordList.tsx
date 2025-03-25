"use client";

import React, { useState, useEffect } from 'react';
import { useGame } from '@/utils/gameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { WordDifficulty } from '@/utils/openAiService';

// Component for difficulty badge
const DifficultyBadge: React.FC<{ difficulty: WordDifficulty }> = ({ difficulty }) => {
  let bgColor = '';
  let textColor = '';
  let label = '';
  
  switch (difficulty) {
    case 'easy':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      label = 'Easy';
      break;
    case 'medium':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      label = 'Medium';
      break;
    case 'hard':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      label = 'Hard';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      label = 'Unknown';
  }
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${bgColor} ${textColor} font-semibold mt-1 inline-block`}>
      {label}
    </span>
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
    
    if (activeHintLetters.length === 0 || !wordContainsHintLetters(word)) {
      // Display placeholders for each letter
      return (
        <div className="flex justify-center space-x-1">
          {Array(wordLength).fill('?').map((_, index) => (
            <span key={index} className="text-gray-400">?</span>
          ))}
        </div>
      );
    }
    
    // Create spacing between letters for better readability
    return (
      <div className="flex justify-center space-x-1">
        {word.split('').map((letter, index) => {
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
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-indigo-700">Words to Find</h3>
        <div className="text-sm font-medium bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
          {foundWords.length} / {totalWords}
        </div>
      </div>
      
      {gameCompleted && !gameActive && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
          <p className="text-amber-700 font-medium">
            {foundWords.length === totalWords 
              ? "Congratulations, you found all the words!" 
              : gaveUp 
                ? `You gave up with ${foundWords.length} of ${totalWords} words found.`
                : `Time's up! You found ${foundWords.length} of ${totalWords} words.`}
          </p>
          {foundWords.length !== totalWords && (
            <p className="text-sm text-amber-600 mt-1">
              The missed words are displayed below with strikethrough.
            </p>
          )}
        </div>
      )}
      
      <motion.div 
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5"
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
                className={`border rounded-lg p-3 text-center 
                          font-medium shadow-sm ${getWordColor(index, isFound, containsHint)}
                          ${containsHint && activeHintLetters.length > 0 ? 'ring-2 ring-yellow-400' : ''}`}
                layout
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg mb-1">
                    {isFound ? highlightHintLetters(word) : displayUnfoundWord(word)}
                  </span>
                  <DifficultyBadge difficulty={difficulty || "medium"} />
                </div>
              </motion.div>
            );
          })}
          
          {/* If we don't have all words loaded yet, show placeholders */}
          {allWords.length === 0 && Array(10).fill(null).map((_, index) => (
            <motion.div
              key={`placeholder-${index}`}
              className="border border-dashed border-gray-300 rounded-lg p-3 text-center 
                      text-gray-400 italic"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0.7 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
            >
              <div className="flex flex-col items-center">
                <span className="text-lg mb-1">?</span>
                <div className="text-xs px-2 py-1 opacity-30 rounded-full bg-gray-200 inline-block">
                  Loading...
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