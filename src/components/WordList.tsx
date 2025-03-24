"use client";

import React from 'react';
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
    activeHintLetters 
  } = useGame();
  
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
  
  // Highlight the hint letters in a found word
  const highlightHintLetters = (word: string): React.ReactNode => {
    if (activeHintLetters.length === 0) return word;
    
    // Create a set of active hint letters for faster lookups
    const hintLetterSet = new Set(activeHintLetters);
    
    // Split the word into individual characters for rendering
    return (
      <div className="flex justify-center">
        {word.split('').map((letter, index) => {
          if (hintLetterSet.has(letter)) {
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
    if (activeHintLetters.length === 0 || !wordContainsHintLetters(word)) {
      return '?';
    }
    
    // Create a set of active hint letters for faster lookups
    const hintLetterSet = new Set(activeHintLetters);
    
    // Create spacing between letters for better readability
    return (
      <div className="flex justify-center space-x-1">
        {word.split('').map((letter, index) => {
          if (hintLetterSet.has(letter)) {
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