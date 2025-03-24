"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { WordSet, getRandomWordSet, logGameDataForTesting } from "./gameData";
import { WordDifficulty } from "./openAiService";

// Default game duration in seconds (5 minutes)
const DEFAULT_GAME_DURATION = 300;

interface GameContextType {
  letters: string;
  foundWords: string[];
  remainingTime: number;
  totalWords: number;
  gameActive: boolean;
  gameCompleted: boolean;
  wordLength: number;
  currentWordSet: WordSet | null;
  addFoundWord: (word: string) => boolean;
  startGame: (duration?: number) => void;
  endGame: () => void;
  resetGame: () => void;
  shuffleLetters: () => void;
  currentScore: number;
  isLoading: boolean;
  getWordDifficulty: (word: string) => WordDifficulty;
  hintsRemaining: number;
  activeHintLetters: string[];
  useHint: (letter: string) => boolean;
  clearHints: () => void;
  gameDifficulty: string;
  setGameDifficulty: (difficulty: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentWordSet, setCurrentWordSet] = useState<WordSet | null>(null);
  const [letters, setLetters] = useState<string>("JUMBL");
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [remainingTime, setRemainingTime] = useState<number>(DEFAULT_GAME_DURATION);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hintsRemaining, setHintsRemaining] = useState<number>(2);
  const [activeHintLetters, setActiveHintLetters] = useState<string[]>([]);
  const [gameDifficulty, setGameDifficulty] = useState<string>("normal");

  // Effect to reset to JUMBL when game is not active
  useEffect(() => {
    if (!gameActive && !gameCompleted) {
      setLetters("JUMBL");
    }
  }, [gameActive, gameCompleted]);

  // Fetch a random word set
  const fetchRandomWordSet = async (): Promise<WordSet> => {
    setIsLoading(true);
    try {
      const wordSet = await getRandomWordSet(gameDifficulty);
      return wordSet;
    } catch (error) {
      console.error("Error fetching random word set:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get the difficulty of a word
  const getWordDifficulty = (word: string): WordDifficulty => {
    if (!currentWordSet || !currentWordSet.wordDifficulties) {
      return "medium";
    }
    
    return (currentWordSet.wordDifficulties.get(word) || "medium") as WordDifficulty;
  };

  // Shuffle the letters
  const shuffleLetters = () => {
    if (!gameActive) {
      // If no game is active, just shuffle JUMBL
      const jumblShuffled = "JUMBL".split("").sort(() => Math.random() - 0.5).join("");
      setLetters(jumblShuffled);
    } else {
      // If game is active, shuffle the game letters
      const shuffled = letters.split("").sort(() => Math.random() - 0.5).join("");
      setLetters(shuffled);
    }
  };

  // Start the game with optional custom duration
  const startGame = async (duration = DEFAULT_GAME_DURATION) => {
    // Get a new word set
    try {
      const newWordSet = await fetchRandomWordSet();
      setCurrentWordSet(newWordSet);
      
      // Log game data for testing in dev console
      logGameDataForTesting(newWordSet);
      
      // Set up game state
      setLetters(newWordSet.letters);
      setRemainingTime(duration);
      setFoundWords([]);
      setGameActive(true);
      setGameCompleted(false);
      setHintsRemaining(2);
      setActiveHintLetters([]);
      
      // Shuffle letters on start
      const shuffled = newWordSet.letters.split("").sort(() => Math.random() - 0.5).join("");
      setLetters(shuffled);
      
      // Clear any existing interval
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      
      // Set up the timer
      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameActive(false);
            setGameCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setTimerInterval(interval);
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  // End the game
  const endGame = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    setGameActive(false);
    setGameCompleted(true);
    // Return to JUMBL
    setLetters("JUMBL");
  };

  // Reset the game
  const resetGame = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    setFoundWords([]);
    setRemainingTime(DEFAULT_GAME_DURATION);
    setGameActive(false);
    setGameCompleted(false);
    setHintsRemaining(2);
    setActiveHintLetters([]);
    // Return to JUMBL
    setLetters("JUMBL");
  };

  // Add a found word if it's valid
  const addFoundWord = (word: string): boolean => {
    if (!currentWordSet) return false;
    
    const normalizedWord = word.toUpperCase();
    
    // Check if the word length matches the required length
    if (normalizedWord.length !== currentWordSet.wordLength) {
      return false;
    }
    
    // Check if the word has already been found
    if (foundWords.includes(normalizedWord)) {
      return false;
    }
    
    // Check if the word is in the current word set
    if (currentWordSet.words.includes(normalizedWord)) {
      setFoundWords((prev) => [...prev, normalizedWord]);
      
      // Check if all words are found
      if (foundWords.length + 1 === currentWordSet.words.length) {
        endGame();
      }
      
      return true;
    }
    
    return false;
  };

  // Use a hint by clicking on a letter
  const useHint = (letter: string): boolean => {
    // Can only use hints during active game and if hints are remaining
    if (!gameActive || hintsRemaining <= 0) {
      return false;
    }
    
    // Check if letter is already active as a hint
    if (activeHintLetters.includes(letter)) {
      // Remove this hint letter (toggle behavior)
      setActiveHintLetters(prev => prev.filter(l => l !== letter));
      return true;
    }
    
    // Decrement hint count and add to active hint letters
    setHintsRemaining(prev => prev - 1);
    setActiveHintLetters(prev => [...prev, letter]);
    return true;
  };
  
  // Clear all active hints
  const clearHints = () => {
    setActiveHintLetters([]);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const contextValue: GameContextType = {
    letters,
    foundWords,
    remainingTime,
    totalWords: currentWordSet?.words.length || 0,
    gameActive,
    gameCompleted,
    wordLength: currentWordSet?.wordLength || 5,
    currentWordSet,
    addFoundWord,
    startGame,
    endGame,
    resetGame,
    shuffleLetters,
    currentScore: foundWords.length,
    isLoading,
    getWordDifficulty,
    hintsRemaining,
    activeHintLetters,
    useHint,
    clearHints,
    gameDifficulty,
    setGameDifficulty,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}; 