"use client";

import { GameProvider } from '@/utils/gameContext';
import { useGame } from '@/utils/gameContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDayNumber, getDailyStats, hasPlayedToday } from '@/utils/dailyChallenge';
import { celebrateWordFound, celebrateWin } from '@/utils/confetti';
import StatsModal from '@/components/StatsModal';

// Simple Word Progress Grid with first letter shown
const WordProgress = () => {
  const { foundWords, currentWordSet, gameCompleted } = useGame();
  const allWords = currentWordSet?.words || [];

  return (
    <div className="space-y-3">
      {allWords.map((word, index) => {
        const isFound = foundWords.includes(word);
        return (
          <motion.div
            key={word}
            className={`flex justify-center gap-1.5`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {word.split('').map((letter, letterIndex) => (
              <div
                key={letterIndex}
                className={`w-11 h-11 md:w-12 md:h-12 flex items-center justify-center
                  text-lg md:text-xl font-bold rounded-lg border-2 transition-all
                  ${isFound
                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                    : gameCompleted
                      ? 'bg-gray-300 border-gray-400 text-gray-600'
                      : letterIndex === 0
                        ? 'bg-amber-100 border-amber-400 text-amber-700'
                        : 'bg-white border-gray-300'
                  }`}
              >
                {isFound || gameCompleted ? (
                  letter
                ) : letterIndex === 0 ? (
                  letter
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
                )}
              </div>
            ))}
          </motion.div>
        );
      })}

      {/* Placeholder when no game - show 3 words */}
      {allWords.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map((row) => (
            <div key={row} className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((col) => (
                <div
                  key={col}
                  className={`w-11 h-11 md:w-12 md:h-12 border-2 rounded-lg flex items-center justify-center
                    ${col === 1
                      ? 'bg-amber-100 border-amber-300'
                      : 'bg-gray-100 border-gray-200'
                    }`}
                >
                  {col === 1 ? (
                    <span className="text-amber-400 font-bold">?</span>
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Letter Keyboard with Shuffle
const LetterKeyboard = () => {
  const { letters, gameActive, addLetterToInput, inputValue, wordLength, shuffleLetters } = useGame();

  const colors = [
    'bg-pink-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500',
    'bg-cyan-500', 'bg-blue-500', 'bg-violet-500', 'bg-fuchsia-500',
    'bg-rose-500', 'bg-amber-500', 'bg-lime-500', 'bg-teal-500',
  ];

  const handleClick = (letter: string) => {
    if (gameActive && inputValue.length < wordLength) {
      addLetterToInput(letter);
    }
  };

  if (!letters || letters === 'JUMBL') {
    return (
      <div className="flex flex-wrap justify-center gap-2">
        {'JUMBL'.split('').map((letter, index) => (
          <div
            key={index}
            className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center
              text-xl md:text-2xl font-bold text-white rounded-lg ${colors[index % colors.length]}
              opacity-50`}
          >
            {letter}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Letter tiles */}
      <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
        {letters.split('').map((letter, index) => (
          <motion.button
            key={`${letter}-${index}`}
            onClick={() => handleClick(letter)}
            disabled={!gameActive}
            className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center
              text-xl md:text-2xl font-bold text-white rounded-xl shadow-lg
              ${colors[index % colors.length]}
              ${gameActive ? 'hover:scale-110 active:scale-95' : 'opacity-50'}
              transition-transform`}
            whileTap={gameActive ? { scale: 0.9 } : {}}
          >
            {letter}
          </motion.button>
        ))}
      </div>

      {/* Shuffle button */}
      {gameActive && (
        <div className="flex justify-center">
          <motion.button
            onClick={shuffleLetters}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30
              text-gray-600 font-medium rounded-full transition-colors border border-gray-200"
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Shuffle
          </motion.button>
        </div>
      )}
    </div>
  );
};

// Current Input Display
const CurrentInput = () => {
  const { inputValue, wordLength, gameActive } = useGame();

  if (!gameActive) return null;

  return (
    <div className="flex justify-center gap-1 mb-4">
      {Array.from({ length: wordLength }).map((_, index) => (
        <motion.div
          key={index}
          className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center
            text-lg md:text-xl font-bold rounded border-2
            ${inputValue[index]
              ? 'bg-indigo-100 border-indigo-400 text-indigo-700'
              : 'bg-white border-gray-300'
            }`}
          animate={inputValue[index] ? { scale: [0.8, 1] } : {}}
        >
          {inputValue[index] || ''}
        </motion.div>
      ))}
    </div>
  );
};

// Action Buttons
const ActionButtons = () => {
  const {
    gameActive, inputValue, wordLength, addFoundWord,
    removeLastLetter, clearInput, triggerCelebration,
    foundWords, totalWords, currentWordSet
  } = useGame();

  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (triggerCelebration) {
      celebrateWordFound();
      setFeedback('Nice!');
      setTimeout(() => setFeedback(null), 1000);

      if (foundWords.length + 1 === totalWords) {
        setTimeout(() => celebrateWin(), 300);
      }
    }
  }, [triggerCelebration, foundWords.length, totalWords]);

  // Check if input is an anagram of any unfound word
  const isAlmostCorrect = (input: string): boolean => {
    if (!currentWordSet) return false;
    const sortedInput = input.toUpperCase().split('').sort().join('');
    const unfoundWords = currentWordSet.words.filter(w => !foundWords.includes(w));
    return unfoundWords.some(word => {
      const sortedWord = word.split('').sort().join('');
      return sortedInput === sortedWord;
    });
  };

  const handleSubmit = () => {
    if (inputValue.length !== wordLength) {
      setFeedback(`Need ${wordLength} letters`);
      setTimeout(() => setFeedback(null), 1500);
      return;
    }

    const success = addFoundWord(inputValue);
    if (!success) {
      // Check if it's an anagram of a target word
      if (isAlmostCorrect(inputValue)) {
        setFeedback('Almost! Try rearranging');
      } else {
        setFeedback('Not a valid word');
      }
      clearInput();
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  if (!gameActive) return null;

  return (
    <div className="space-y-3">
      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center py-2 px-4 rounded-full font-semibold text-sm mx-auto w-fit
              ${feedback === 'Nice!'
                ? 'bg-emerald-100 text-emerald-700'
                : feedback.startsWith('Almost')
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div className="flex justify-center gap-3">
        <button
          onClick={removeLastLetter}
          disabled={inputValue.length === 0}
          className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg
            disabled:opacity-40 hover:bg-gray-300 transition-colors"
        >
          ← Delete
        </button>

        <button
          onClick={handleSubmit}
          disabled={inputValue.length !== wordLength}
          className={`px-6 py-2 font-bold rounded-lg transition-all
            ${inputValue.length === wordLength
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-gray-200 text-gray-500'
            }`}
        >
          Enter
        </button>

        <button
          onClick={clearInput}
          disabled={inputValue.length === 0}
          className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg
            disabled:opacity-40 hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

// Progress indicator (words found)
const ProgressIndicator = () => {
  const { foundWords, totalWords, gameActive } = useGame();

  if (!gameActive) return null;

  return (
    <div className="text-lg font-bold text-emerald-600">
      {foundWords.length}/{totalWords}
    </div>
  );
};

// Main Game Component
const GameContent = () => {
  const { gameActive, gameCompleted, startGame, startDailyChallenge, resetGame, isLoading, foundWords, totalWords } = useGame();
  const [showStats, setShowStats] = useState(false);
  const playedToday = hasPlayedToday();
  const stats = getDailyStats();

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Game Card */}
      <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setShowStats(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>

          <ProgressIndicator />

          {stats.currentStreak > 0 && (
            <div className="flex items-center gap-1 text-orange-500 font-bold">
              🔥 {stats.currentStreak}
            </div>
          )}
        </div>

        {/* Word Progress Grid */}
        <div className="mb-6">
          <WordProgress />
        </div>

        {/* Current Input */}
        <CurrentInput />

        {/* Letter Keyboard */}
        <div className="mb-4">
          <LetterKeyboard />
        </div>

        {/* Action Buttons */}
        <ActionButtons />

        {/* Start/End Game Buttons */}
        {!gameActive && !gameCompleted && (
          <div className="space-y-3 mt-6">
            {/* Daily Challenge */}
            <button
              onClick={() => startDailyChallenge()}
              disabled={isLoading || playedToday}
              className={`w-full py-3 font-bold rounded-xl transition-all
                ${playedToday
                  ? 'bg-gray-200 text-gray-500'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg'
                }`}
            >
              {isLoading ? 'Loading...' : playedToday ? '✓ Daily Complete' : `📅 Daily #${getDayNumber()}`}
            </button>

            {/* Practice Game */}
            <button
              onClick={() => startGame()}
              disabled={isLoading}
              className="w-full py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors"
            >
              {isLoading ? 'Loading...' : 'Practice Game'}
            </button>
          </div>
        )}

        {/* Game Over */}
        {gameCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center space-y-4"
          >
            <div className={`text-2xl font-bold
              ${foundWords.length === totalWords ? 'text-emerald-600' : 'text-gray-600'}`}>
              {foundWords.length === totalWords ? '🎉 Perfect!' : `${foundWords.length}/${totalWords} Found`}
            </div>

            <button
              onClick={resetGame}
              className="px-6 py-2 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600"
            >
              Play Again
            </button>
          </motion.div>
        )}

        {/* Give Up (during game) */}
        {gameActive && (
          <div className="mt-4 text-center">
            <button
              onClick={resetGame}
              className="text-sm text-gray-500 hover:text-red-500"
            >
              Give Up
            </button>
          </div>
        )}
      </div>

      {/* How to Play */}
      <div className="mt-4 text-center text-white/80 text-sm">
        <p>Find 3 words using the letters • Tap to spell • Shuffle if stuck!</p>
      </div>

      <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} />
    </div>
  );
};

export default function Home() {
  return (
    <GameProvider>
      <main className="min-h-screen bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-4 flex flex-col">
        {/* Header */}
        <header className="text-center py-4">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Jumbl
          </h1>
        </header>

        {/* Game */}
        <div className="flex-1 flex items-start justify-center">
          <GameContent />
        </div>
      </main>
    </GameProvider>
  );
}
