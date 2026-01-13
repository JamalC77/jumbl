"use client";

import React, { useState } from 'react';
import { useGame } from '@/utils/gameContext';
import { motion, AnimatePresence } from 'framer-motion';

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

  const [seedInput, setSeedInput] = useState<string>("");
  const [showSeedInput, setShowSeedInput] = useState<boolean>(false);
  const [seedError, setSeedError] = useState<string>("");

  const shareResults = () => {
    const seed = generateGameSeed();
    const shareUrl = `${window.location.origin}${window.location.pathname}?seed=${seed}`;
    const hintsUsed = 5 - hintsRemaining;

    // Create emoji progress bar
    const filledBlocks = Math.round((currentScore / totalWords) * 8);
    const emptyBlocks = 8 - filledBlocks;
    const progressBar = '🟩'.repeat(filledBlocks) + '⬜'.repeat(emptyBlocks);

    const text = `🔤 JUMBL

${progressBar}
${currentScore}/${totalWords} words | ${hintsUsed}/5 hints

Can you beat my score?`;

    if (navigator.share) {
      navigator.share({
        title: 'Jumbl Challenge',
        text: text,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${text}\n${shareUrl}`)
        .then(() => alert('Copied to clipboard!'))
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
      {/* Pre-game state */}
      {!gameActive && !gameCompleted && (
        <div className="flex flex-col items-center gap-4">
          {/* Main CTA */}
          <motion.button
            className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-2xl shadow-lg
                     hover:shadow-xl transition-all disabled:opacity-50"
            onClick={() => startGame(300)}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : (
              "Start Game"
            )}
          </motion.button>

          {/* Secondary action */}
          <motion.button
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2"
            onClick={() => setShowSeedInput(!showSeedInput)}
            whileTap={{ scale: 0.97 }}
          >
            {showSeedInput ? "Cancel" : "Play a specific puzzle"}
          </motion.button>

          {/* Seed input panel */}
          <AnimatePresence>
            {showSeedInput && (
              <motion.div
                className="w-full max-w-sm p-4 bg-indigo-50 rounded-xl border border-indigo-200"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label htmlFor="seedInput" className="block text-sm font-medium text-indigo-700 mb-2">
                  Paste puzzle code:
                </label>
                <input
                  id="seedInput"
                  type="text"
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="Paste code here..."
                />
                {seedError && (
                  <p className="text-red-500 text-xs mt-1">{seedError}</p>
                )}
                <button
                  className="w-full mt-3 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  onClick={handlePlayWithSeed}
                  disabled={isLoading}
                >
                  Play This Puzzle
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Active game state */}
      {gameActive && (
        <div className="flex justify-center">
          <motion.button
            className="px-6 py-2 bg-gray-200 text-gray-600 text-sm font-medium rounded-full
                     hover:bg-red-100 hover:text-red-600 transition-colors"
            onClick={endGame}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Give Up
          </motion.button>
        </div>
      )}

      {/* Game completed state */}
      {gameCompleted && (
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Score display */}
          <div className={`text-center p-4 rounded-2xl w-full max-w-sm
            ${currentScore === totalWords
              ? 'bg-gradient-to-r from-emerald-100 to-teal-100 border-2 border-emerald-300'
              : 'bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-300'}`}>
            <p className={`text-2xl font-bold ${currentScore === totalWords ? 'text-emerald-700' : 'text-indigo-700'}`}>
              {currentScore === totalWords ? 'Perfect!' : `${currentScore}/${totalWords}`}
            </p>
            <p className={`text-sm ${currentScore === totalWords ? 'text-emerald-600' : 'text-indigo-600'}`}>
              {currentScore === totalWords ? 'You found all the words!' : 'words found'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <motion.button
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl shadow-md"
              onClick={shareResults}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Share
            </motion.button>

            <motion.button
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-md"
              onClick={resetGame}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Play Again
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GameControls;
