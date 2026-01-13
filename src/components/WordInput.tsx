"use client";

import React, { useEffect, useRef } from 'react';
import { useGame } from '@/utils/gameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { celebrateWordFound, celebrateWin } from '@/utils/confetti';

const WordInput: React.FC = () => {
  const {
    addFoundWord,
    gameActive,
    wordLength,
    inputValue,
    setInputValue,
    removeLastLetter,
    clearInput,
    triggerCelebration,
    foundWords,
    totalWords,
    gameCompleted,
  } = useGame();

  const [feedback, setFeedback] = React.useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [isShaking, setIsShaking] = React.useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger confetti when a word is found
  useEffect(() => {
    if (triggerCelebration) {
      celebrateWordFound();
      setFeedback({ message: "Nice!", type: 'success' });

      // Check if all words found (win condition)
      if (foundWords.length + 1 === totalWords) {
        setTimeout(() => celebrateWin(), 300);
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setFeedback(null), 1500);
    }
  }, [triggerCelebration, foundWords.length, totalWords]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!gameActive) {
      setFeedback({ message: "Start the game first!", type: 'warning' });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setFeedback(null), 2000);
      return;
    }

    const word = inputValue.trim().toUpperCase();

    if (word.length !== wordLength) {
      setFeedback({ message: `Need ${wordLength} letters`, type: 'warning' });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setFeedback(null), 2000);
      return;
    }

    const success = addFoundWord(word);

    if (!success) {
      setFeedback({ message: "Not in word list", type: 'error' });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      clearInput();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setFeedback(null), 2000);
    }
    // Success feedback is handled by the triggerCelebration effect
  };

  // Handle keyboard input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      removeLastLetter();
    } else if (e.key === 'Escape') {
      clearInput();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Feedback message */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`text-center py-2 px-4 rounded-full font-semibold text-sm
                ${feedback.type === 'success' ? 'bg-emerald-100 text-emerald-700' :
                  feedback.type === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'}`}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden input for keyboard capture */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          className="sr-only"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          disabled={!gameActive}
        />

        {/* Action buttons */}
        <motion.div
          className="flex gap-2 justify-center"
          animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {/* Backspace button */}
          <motion.button
            type="button"
            onClick={removeLastLetter}
            disabled={!gameActive || inputValue.length === 0}
            className="px-4 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-xl
                     disabled:opacity-40 disabled:cursor-not-allowed
                     hover:bg-gray-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Delete
          </motion.button>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={!gameActive || inputValue.length !== wordLength}
            className={`px-8 py-2.5 font-bold rounded-xl transition-all
              ${inputValue.length === wordLength && gameActive
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            whileHover={inputValue.length === wordLength && gameActive ? { scale: 1.05 } : {}}
            whileTap={inputValue.length === wordLength && gameActive ? { scale: 0.95 } : {}}
          >
            {inputValue.length === wordLength ? 'Submit' : `${inputValue.length}/${wordLength}`}
          </motion.button>

          {/* Clear button */}
          <motion.button
            type="button"
            onClick={clearInput}
            disabled={!gameActive || inputValue.length === 0}
            className="px-4 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-xl
                     disabled:opacity-40 disabled:cursor-not-allowed
                     hover:bg-gray-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
};

export default WordInput;
