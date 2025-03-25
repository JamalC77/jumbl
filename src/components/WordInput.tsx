"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/utils/gameContext';
import { motion, AnimatePresence } from 'framer-motion';

// Virtual keyboard component in QWERTY layout
const VirtualKeyboard: React.FC<{ 
  letters: string; 
  onLetterClick: (letter: string) => void;
  gameActive: boolean;
  isValidating: boolean;
}> = ({ letters, onLetterClick, gameActive, isValidating }) => {
  // Standard QWERTY layout
  const qwertyLayout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Filter the keyboard to only show letters that are in the game
  const filteredLayout = qwertyLayout.map(row => 
    row.filter(key => letters.includes(key))
  ).filter(row => row.length > 0);

  // Add backspace and enter keys
  if (filteredLayout.length > 0) {
    filteredLayout[filteredLayout.length - 1].push('⌫');
  }

  const handleKeyPress = (key: string) => {
    if (!gameActive || isValidating) return;
    
    // Visual feedback
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 150);
    
    // Pass the click to parent
    onLetterClick(key);
  };

  return (
    <div className="md:hidden mt-4 w-full">
      {filteredLayout.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex justify-center gap-1 mb-2">
          {row.map((key) => (
            <motion.button
              key={key}
              className={`w-10 h-12 flex items-center justify-center 
                        ${activeKey === key ? 'bg-indigo-800' : 'bg-indigo-600'} 
                        text-white font-bold rounded-lg 
                        shadow-md ${(!gameActive || isValidating) ? 'opacity-50' : ''}`}
              whileTap={{ scale: 0.95 }}
              disabled={!gameActive || isValidating}
              onClick={() => handleKeyPress(key)}
              type="button" // Explicitly prevent form submission
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
  const [isValidating, setIsValidating] = useState(false);
  const [wasSubmitted, setWasSubmitted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check if we're on mobile on component mount
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Effect to clear feedback when input changes
  useEffect(() => {
    if (!wasSubmitted && feedback) {
      setFeedback(null);
    }
  }, [inputValue, wasSubmitted, feedback]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWasSubmitted(true);
    
    if (!gameActive) {
      setFeedback({ message: "Game is not active! Press Start to play", isSuccess: false });
      timeoutRef.current = setTimeout(() => {
        setFeedback(null);
        setWasSubmitted(false);
      }, 2000);
      return;
    }
    
    const word = inputValue.trim();
    
    if (word.length !== wordLength) {
      setFeedback({ message: `Word must be exactly ${wordLength} letters!`, isSuccess: false });
      timeoutRef.current = setTimeout(() => {
        setFeedback(null);
        setWasSubmitted(false);
      }, 2000);
      return;
    }
    
    setIsValidating(true);
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
    setIsValidating(false);
    timeoutRef.current = setTimeout(() => {
      setFeedback(null);
      setWasSubmitted(false);
    }, 2000);
  };

  const handleVirtualKeyPress = (key: string) => {
    if (!gameActive || isValidating) return;
    
    // Clear any existing validation state
    setWasSubmitted(false);
    
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
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col gap-2"
      >
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
            onChange={(e) => {
              setWasSubmitted(false);
              setInputValue(e.target.value.toUpperCase());
            }}
            disabled={!gameActive || isValidating}
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
            {feedback && wasSubmitted && (
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
          disabled={!gameActive || isValidating}
          className="bg-indigo-600 text-white py-2 px-6 rounded-lg font-medium
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   hover:bg-indigo-700 transition-colors"
          whileHover={gameActive ? { scale: 1.02 } : {}}
          whileTap={gameActive ? { scale: 0.98 } : {}}
        >
          {isValidating ? "Checking..." : inputValue.length === wordLength ? "Submit" : `Enter ${wordLength} Letters`}
        </motion.button>
        
        {/* Virtual keyboard for mobile */}
        {gameActive && isMobile && (
          <VirtualKeyboard 
            letters={letters} 
            onLetterClick={handleVirtualKeyPress}
            gameActive={gameActive}
            isValidating={isValidating}
          />
        )}
      </form>
    </div>
  );
};

export default WordInput; 