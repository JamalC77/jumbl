"use client";

import React, { useState, useEffect } from 'react';
import { useGame } from '@/utils/gameContext';
import { motion, AnimatePresence } from 'framer-motion';

// Virtual keyboard component in QWERTY layout
const VirtualKeyboard: React.FC<{ 
  letters: string; 
  onLetterClick: (letter: string) => void;
  gameActive: boolean;
}> = ({ letters, onLetterClick, gameActive }) => {
  // Standard QWERTY layout
  const qwertyLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  // Filter the keyboard to only show letters that are in the game
  const filteredLayout = qwertyLayout.map(row => 
    row.filter(key => letters.includes(key))
  ).filter(row => row.length > 0);

  // Add backspace and enter keys
  if (filteredLayout.length > 0) {
    filteredLayout[filteredLayout.length - 1].push('⌫');
  }

  return (
    <div className="md:hidden mt-4 w-full">
      {filteredLayout.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex justify-center gap-1 mb-2">
          {row.map((key) => (
            <motion.button
              key={key}
              className={`w-10 h-12 flex items-center justify-center 
                        bg-indigo-600 text-white font-bold rounded-lg 
                        shadow-md ${!gameActive ? 'opacity-50' : ''}`}
              whileTap={{ scale: 0.95 }}
              disabled={!gameActive}
              onClick={() => onLetterClick(key)}
            >
              {key}
            </motion.button>
          ))}
        </div>
      ))}
    </div>
  );
};

const WordInput: React.FC = () => {
  const { addFoundWord, gameActive, wordLength, letters } = useGame();
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; isSuccess: boolean; isWarning?: boolean } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile on component mount
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameActive) {
      setFeedback({ message: "Game is not active! Press Start to play", isSuccess: false });
      setTimeout(() => setFeedback(null), 2000);
      return;
    }
    
    const word = inputValue.trim();
    
    if (word.length !== wordLength) {
      setFeedback({ message: `Word must be exactly ${wordLength} letters!`, isSuccess: false });
      setTimeout(() => setFeedback(null), 2000);
      return;
    }
    
    const success = addFoundWord(word);
    
    if (success) {
      setFeedback({ message: "✨ Great job! Word found! ✨", isSuccess: true });
    } else {
      setFeedback({ 
        message: "This word isn't in our list for this puzzle", 
        isSuccess: false,
        isWarning: true 
      });
    }
    
    setInputValue('');
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleVirtualKeyPress = (key: string) => {
    if (!gameActive) return;
    
    if (key === '⌫') {
      // Handle backspace
      setInputValue(prev => prev.slice(0, -1));
    } else {
      // Add letter if we haven't reached max length
      if (inputValue.length < wordLength) {
        setInputValue(prev => prev + key);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="wordInput" className="text-sm font-medium text-indigo-700">
            Enter a {wordLength}-letter word:
          </label>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
            {wordLength} letters required
          </span>
        </div>
        
        <div className="relative">
          <input
            id="wordInput"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            disabled={!gameActive}
            placeholder={gameActive ? `Enter a ${wordLength}-letter word...` : "Start game to play"}
            className="w-full px-4 py-3 text-xl rounded-lg border-2 border-indigo-300 
                     focus:border-indigo-500 focus:outline-none disabled:bg-gray-100
                     disabled:text-gray-400 text-indigo-800 font-medium transition-all bg-white"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            maxLength={wordLength}
          />
          
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`absolute left-0 right-0 -top-10 p-2 text-center text-sm rounded-lg shadow-md ${
                  feedback.isSuccess 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : feedback.isWarning
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                }`}
              >
                {feedback.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <motion.button
          type="submit"
          disabled={!gameActive || inputValue.trim().length !== wordLength}
          className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-medium
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   hover:bg-indigo-700 transition-colors"
          whileHover={gameActive ? { scale: 1.02 } : {}}
          whileTap={gameActive ? { scale: 0.98 } : {}}
        >
          Submit
        </motion.button>
        
        {/* Virtual keyboard for mobile */}
        {gameActive && isMobile && (
          <VirtualKeyboard 
            letters={letters} 
            onLetterClick={handleVirtualKeyPress}
            gameActive={gameActive}
          />
        )}
      </form>
    </div>
  );
};

export default WordInput; 