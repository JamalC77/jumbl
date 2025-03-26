'use client';

import React from 'react';
import { useGame } from '../utils/gameContext';

const DifficultySelector: React.FC = () => {
  const { gameActive, gameCompleted, gameDifficulty, setGameDifficulty } = useGame();

  // Only show when not in an active game
  if (gameActive || gameCompleted) {
    return null;
  }

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGameDifficulty(e.target.value);
  };

  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center space-x-2">
        <label htmlFor="difficulty" className="text-sm font-medium text-indigo-800">
          Difficulty:
        </label>
        <select
          id="difficulty"
          value={gameDifficulty}
          onChange={handleDifficultyChange}
          className="px-2 py-1 text-sm border border-indigo-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-indigo-800 bg-white"
        >
          <option value="easy">Easy</option>
          <option value="normal">Normal</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <p className="mt-1 text-xs text-indigo-600 max-w-xs">
        {gameDifficulty === 'easy' && "Common words for beginners"}
        {gameDifficulty === 'normal' && "Balanced mix - standard challenge"}
        {gameDifficulty === 'hard' && "Uncommon words for experts"}
      </p>
    </div>
  );
};

export default DifficultySelector; 