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
    isLoading
  } = useGame();
  const [customTime, setCustomTime] = useState<number>(300); // Default 5 minutes
  const [showCustomTimeInput, setShowCustomTimeInput] = useState<boolean>(false);
  
  const shareResults = () => {
    const text = `🔤 Jumbl 🔤\nI found ${currentScore} out of ${totalWords} words!\nCan you beat my score? Play now!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Jumbl Challenge',
        text: text,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(text)
        .then(() => alert('Result copied to clipboard! Share with your friends!'))
        .catch(console.error);
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      {!gameActive && !gameCompleted && (
        <>
          <div className="flex gap-3">
            <motion.button
              className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => startGame()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.3 } }}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading Word Sets...
                </div>
              ) : (
                'Start Game (5:00)'
              )}
            </motion.button>
            
            <motion.button
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-full shadow-md"
              onClick={() => setShowCustomTimeInput(!showCustomTimeInput)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.4 } }}
            >
              {showCustomTimeInput ? 'Hide' : 'Custom Time'}
            </motion.button>
          </div>
          
          {showCustomTimeInput && (
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <input 
                type="number" 
                min="30"
                max="600"
                value={customTime}
                onChange={(e) => setCustomTime(Number(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 rounded text-center"
              />
              <span className="text-gray-600">seconds</span>
              <motion.button
                className="px-3 py-2 bg-indigo-600 text-white font-medium rounded shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => startGame(customTime)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </div>
                ) : (
                  'Start'
                )}
              </motion.button>
            </motion.div>
          )}
        </>
      )}
      
      {gameActive && (
        <motion.button
          className="px-5 py-2 bg-red-500 text-white font-medium rounded-full shadow-md"
          onClick={endGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Give Up
        </motion.button>
      )}
      
      {gameCompleted && (
        <div className="flex flex-col items-center gap-3">
          <motion.div 
            className="text-2xl font-bold text-center p-4 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 w-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {currentScore === totalWords 
              ? '🎉 Perfect Score! 🎉' 
              : `You found ${currentScore} out of ${totalWords} words!`}
          </motion.div>
          
          <div className="flex gap-3">
            <motion.button
              className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={resetGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </div>
              ) : (
                'Play Again'
              )}
            </motion.button>
            
            <motion.button
              className="px-5 py-2 bg-green-600 text-white font-medium rounded-full shadow-md"
              onClick={shareResults}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
            >
              Share Results
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControls; 