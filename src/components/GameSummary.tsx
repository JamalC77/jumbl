"use client";

import React from 'react';
import { useGame } from '@/utils/gameContext';
import { motion } from 'framer-motion';
import { WordDifficulty } from '@/utils/openAiService';

const GameSummary: React.FC = () => {
  const {
    gameCompleted,
    foundWords,
    totalWords,
    currentWordSet,
    hintsRemaining,
    getWordDifficulty,
    gameDifficulty,
  } = useGame();

  if (!gameCompleted || !currentWordSet) {
    return null;
  }

  // Group the words by difficulty
  const wordsByDifficulty: Record<WordDifficulty, string[]> = {
    easy: [],
    medium: [],
    hard: []
  };

  // Count how many were found for each difficulty
  const foundByDifficulty: Record<WordDifficulty, number> = {
    easy: 0,
    medium: 0,
    hard: 0
  };

  // Calculate difficulty distribution
  currentWordSet.words.forEach(word => {
    const difficulty = getWordDifficulty(word);
    wordsByDifficulty[difficulty].push(word);
    
    if (foundWords.includes(word)) {
      foundByDifficulty[difficulty]++;
    }
  });

  // Format percentages
  const easyPercent = Math.round((wordsByDifficulty.easy.length / totalWords) * 100);
  const mediumPercent = Math.round((wordsByDifficulty.medium.length / totalWords) * 100);
  const hardPercent = Math.round((wordsByDifficulty.hard.length / totalWords) * 100);

  // Format difficulty names for display
  const getDifficultyName = (difficulty: string): string => {
    if (difficulty === 'easy') return 'Easy';
    if (difficulty === 'medium') return 'Medium';
    if (difficulty === 'hard') return 'Hard';
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };
  
  // Calculate remaining hints
  const totalHints = 5; // Default number of hints
  const hintsUsed = totalHints - hintsRemaining;

  return (
    <motion.div
      className="w-full bg-white rounded-xl p-6 shadow-md border border-indigo-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">Game Summary</h2>
      
      {/* Words found section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-indigo-600">Words Found</h3>
          <div className="text-xl font-bold text-indigo-600">
            {foundWords.length} / {totalWords}
          </div>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500" 
            style={{ width: `${(foundWords.length / totalWords) * 100}%` }} 
          />
        </div>
      </div>

      {/* Hint usage */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-indigo-600">Hints Used</h3>
          <div className="text-xl font-bold text-indigo-600">
            {hintsUsed} / {totalHints}
          </div>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-500" 
            style={{ width: `${(hintsUsed / totalHints) * 100}%` }} 
          />
        </div>
      </div>
      
      {/* Game difficulty */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-indigo-600 mb-2">Game Difficulty</h3>
        <div className="px-4 py-2 bg-indigo-100 rounded-lg inline-block">
          <span className="font-bold text-indigo-700">
            {getDifficultyName(gameDifficulty)}
          </span>
        </div>
      </div>
      
      {/* Word difficulty breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-indigo-600 mb-2">Word Difficulty Breakdown</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
            <div className="text-green-700 font-semibold">Easy</div>
            <div className="text-xl font-bold text-green-800">
              {foundByDifficulty.easy} / {wordsByDifficulty.easy.length}
            </div>
            <div className="text-sm text-green-600">{easyPercent}% of words</div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-center">
            <div className="text-yellow-700 font-semibold">Medium</div>
            <div className="text-xl font-bold text-yellow-800">
              {foundByDifficulty.medium} / {wordsByDifficulty.medium.length}
            </div>
            <div className="text-sm text-yellow-600">{mediumPercent}% of words</div>
          </div>
          
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
            <div className="text-red-700 font-semibold">Hard</div>
            <div className="text-xl font-bold text-red-800">
              {foundByDifficulty.hard} / {wordsByDifficulty.hard.length}
            </div>
            <div className="text-sm text-red-600">{hardPercent}% of words</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameSummary; 