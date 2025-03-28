"use client";

import React, { useState } from 'react';
import { useGame } from '@/utils/gameContext';
import { motion } from 'framer-motion';

const GameControls: React.FC = () => {
  const { 
    startGame, 
    resetGame,
    endGame,
    gameActive, 
    gameCompleted, 
    currentScore, 
    totalWords,
    isLoading,
    generateGameSeed,
    hintsRemaining,
    gameDifficulty,
    startGameWithSeed
  } = useGame();
  const [customTime, setCustomTime] = useState<number>(300); // Default 5 minutes
  const [showCustomTimeInput, setShowCustomTimeInput] = useState<boolean>(false);
  const [seedInput, setSeedInput] = useState<string>("");
  const [showSeedInput, setShowSeedInput] = useState<boolean>(false);
  const [seedError, setSeedError] = useState<string>("");
  
  const shareResults = () => {
    // Generate a seed from the current game
    const seed = generateGameSeed();
    
    // Create the share URL with the seed
    const shareUrl = `${window.location.origin}${window.location.pathname}?seed=${seed}`;
    
    // Build the text to share
    const hintsUsed = 5 - hintsRemaining;
    const text = `🔤 Jumbl 🔤\nI found ${currentScore} out of ${totalWords} words!\nUsed ${hintsUsed}/5 hints. Difficulty: ${gameDifficulty}\nCan you beat my score? Play the exact same puzzle:`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Jumbl Challenge',
        text: text,
        url: shareUrl,
      }).catch(console.error);
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${text}\n${shareUrl}`)
        .then(() => alert('Result and challenge link copied to clipboard! Share with your friends!'))
        .catch(console.error);
    }
  };
  
  const handlePlayWithSeed = async () => {
    if (!seedInput.trim()) {
      setSeedError("Please enter a valid game seed");
      return;
    }
    
    const success = await startGameWithSeed(seedInput.trim());
    if (!success) {
      setSeedError("Invalid seed or failed to load game");
    } else {
      setSeedError("");
      setShowSeedInput(false);
      setSeedInput("");
    }
  };
  
  return (
    <div className="w-full">
      <div className="flex flex-col space-y-3">
        {!gameActive && !gameCompleted && (
          <>
            <div className="flex justify-center">
              <motion.button
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-full shadow-md"
                onClick={() => startGame(customTime)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Start Game"}
              </motion.button>
            </div>
            
            <div className="flex justify-center mt-2">
              <motion.button
                className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-full shadow-md"
                onClick={() => setShowSeedInput(!showSeedInput)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {showSeedInput ? "Hide Seed Input" : "Play With Seed"}
              </motion.button>
            </div>
            
            {showSeedInput && (
              <motion.div 
                className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col space-y-2">
                  <label htmlFor="seedInput" className="text-blue-700 text-sm font-medium">
                    Enter Game Seed:
                  </label>
                  <input
                    id="seedInput"
                    type="text"
                    value={seedInput}
                    onChange={(e) => setSeedInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-indigo-800 bg-white"
                    placeholder="Paste game seed here..."
                  />
                  {seedError && (
                    <p className="text-red-500 text-xs">{seedError}</p>
                  )}
                  <button
                    className="w-full py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700"
                    onClick={handlePlayWithSeed}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Start Game With Seed"}
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
        
        {gameActive && (
          <>
            <motion.button
              className="px-4 py-1.5 bg-red-500 text-white text-sm font-medium rounded-full shadow-md"
              onClick={endGame}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Give Up
            </motion.button>
            
            <motion.div
              className="mt-1 p-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <span className="font-medium">Hint:</span> First letter of each word is shown to help.
            </motion.div>
          </>
        )}
        
        {gameCompleted && (
          <div className="flex flex-col items-center gap-2">
            <motion.div 
              className="text-base font-bold text-center p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {currentScore === totalWords 
                ? '🎉 Perfect Score! 🎉' 
                : `Found ${currentScore}/${totalWords} words!`}
            </motion.div>
            
            <div className="flex gap-2 flex-wrap justify-center">
              <motion.button
                className="px-3 py-1.5 bg-indigo-500 text-white text-sm font-medium rounded-full shadow-md"
                onClick={shareResults}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Share Results
              </motion.button>
              
              <motion.button
                className="px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-full shadow-md"
                onClick={resetGame}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                New Game
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameControls; 