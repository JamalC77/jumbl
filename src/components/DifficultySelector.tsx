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
    <div className="flex flex-col items-center mb-6">
      <div className="flex items-center space-x-2">
        <label htmlFor="difficulty" className="font-medium text-indigo-800">
          Difficulty:
        </label>
        <select
          id="difficulty"
          value={gameDifficulty}
          onChange={handleDifficultyChange}
          className="px-4 py-2 border border-indigo-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-indigo-800 bg-white"
        >
          <option value="easy">Easy</option>
          <option value="normal">Normal</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <p className="mt-2 text-sm text-indigo-600">
        {gameDifficulty === 'easy' && "Words with common letters - great for beginners!"}
        {gameDifficulty === 'normal' && "A balanced mix of words - the standard challenge."}
        {gameDifficulty === 'hard' && "Words with uncommon letters - for word game experts!"}
      </p>
    </div>
  );
};

export default DifficultySelector; 