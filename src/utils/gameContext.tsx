"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { WordSet, getRandomWordSet, logGameDataForTesting } from "./gameData";
import { WordDifficulty } from "./openAiService";
import { generateSeed, loadGameFromSeed } from "./seedUtils";

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
  activeHintPositions: Map<string, number[]>;
  useHint: (letter: string) => boolean;
  clearHints: () => void;
  gameDifficulty: string;
  setGameDifficulty: (difficulty: string) => void;
  generateGameSeed: () => string;
  startGameWithSeed: (seed: string, duration?: number) => Promise<boolean>;
  isChallenge: boolean;
  challengeStartTime: number | null;
  unusedLetters: string[];
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
  const [hintsRemaining, setHintsRemaining] = useState<number>(5);
  const [activeHintLetters, setActiveHintLetters] = useState<string[]>([]);
  const [activeHintPositions, setActiveHintPositions] = useState<Map<string, number[]>>(new Map());
  const [gameDifficulty, setGameDifficulty] = useState<string>("normal");
  const [isChallenge, setIsChallenge] = useState<boolean>(false);
  const [challengeStartTime, setChallengeStartTime] = useState<number | null>(null);
  const [unusedLetters, setUnusedLetters] = useState<string[]>([]);

  // Effect to reset to JUMBL when game is not active
  useEffect(() => {
    if (!gameActive && !gameCompleted) {
      setLetters("JUMBL");
    }
  }, [gameActive, gameCompleted]);

  // Check URL for seed parameter on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const seed = params.get('seed');
      const challenge = params.get('challenge') === 'true';
      
      if (seed) {
        if (challenge) {
          // This is a challenge game
          setIsChallenge(true);
          // Start the game immediately
          startGameWithSeed(seed);
        } else {
          // Just a regular seed, not a challenge
          startGameWithSeed(seed);
        }
      }
    }
  }, []);

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

  // Clean URL by removing seed parameters
  const cleanUrlParams = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('seed');
      url.searchParams.delete('challenge');
      window.history.replaceState({}, document.title, url.toString());
    }
  };

  // Generate a seed from the current game
  const generateGameSeed = (): string => {
    if (!currentWordSet) return "";
    
    return generateSeed(currentWordSet);
  };

  // Start a game with a specific seed
  const startGameWithSeed = async (seed: string, duration = DEFAULT_GAME_DURATION): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const wordSet = await loadGameFromSeed(seed);
      
      if (!wordSet) {
        console.error("Invalid seed or failed to load game");
        setIsLoading(false);
        return false;
      }
      
      setCurrentWordSet(wordSet);
      
      // Log game data for testing in dev console
      logGameDataForTesting(wordSet);
      
      // Set up game state
      setLetters(wordSet.letters);
      setRemainingTime(duration);
      setFoundWords([]);
      setGameActive(true);
      setGameCompleted(false);
      setHintsRemaining(5);
      setActiveHintLetters([]);
      setActiveHintPositions(new Map());
      setGameDifficulty(wordSet.gameDifficulty || "normal");
      
      // Shuffle letters on start
      const shuffled = wordSet.letters.split("").sort(() => Math.random() - 0.5).join("");
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
            // Clean URL params when game ends automatically
            cleanUrlParams();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setTimerInterval(interval);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Failed to start game with seed:", error);
      setIsLoading(false);
      return false;
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
      setHintsRemaining(5);
      setActiveHintLetters([]);
      setActiveHintPositions(new Map());
      
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
            // Clean URL params when game ends automatically
            cleanUrlParams();
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
    // Clean URL params when game ends manually
    cleanUrlParams();
  };

  // Reset the game
  const resetGame = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    setCurrentWordSet(null);
    setLetters("JUMBL");
    setRemainingTime(DEFAULT_GAME_DURATION);
    setFoundWords([]);
    setGameActive(false);
    setGameCompleted(false);
    setHintsRemaining(5);
    setActiveHintLetters([]);
    setActiveHintPositions(new Map());
    setIsChallenge(false);
    setChallengeStartTime(null);
    // Return to JUMBL
    setLetters("JUMBL");
    // Clean URL params
    cleanUrlParams();
  };

  // Helper function to identify letters that are no longer needed for remaining words
  const updateUnusedLetters = () => {
    if (!currentWordSet || !gameActive) {
      setUnusedLetters([]);
      return;
    }

    // Get all unfound words
    const unfoundWords = currentWordSet.words.filter(word => !foundWords.includes(word));
    
    // If all words are found, there are no unused letters
    if (unfoundWords.length === 0) {
      setUnusedLetters([]);
      return;
    }

    // Count letter usage in all unfound words
    const letterUsage: Record<string, number> = {};
    unfoundWords.forEach(word => {
      word.split('').forEach(letter => {
        letterUsage[letter] = (letterUsage[letter] || 0) + 1;
      });
    });

    // Find letters in the game that aren't used in any remaining words
    const unused = letters.split('').filter(letter => !letterUsage[letter]);
    setUnusedLetters(unused);
  };

  // Call updateUnusedLetters when foundWords or letters change
  useEffect(() => {
    updateUnusedLetters();
  }, [foundWords, letters, gameActive]);

  // Add found word if it's valid
  const addFoundWord = (word: string): boolean => {
    if (!gameActive || !currentWordSet) return false;
    
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
      const updatedWords = [...foundWords, normalizedWord];
      setFoundWords(updatedWords);
      
      // Check if all words are found
      if (updatedWords.length === currentWordSet.words.length) {
        endGame();
      }
      
      // Update unused letters after finding a word
      updateUnusedLetters();
      
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
      // Remove this hint letter and its positions (toggle behavior)
      setActiveHintLetters(prev => prev.filter(l => l !== letter));
      
      // Create a new map without this letter's positions
      const newPositions = new Map(activeHintPositions);
      newPositions.delete(letter);
      setActiveHintPositions(newPositions);
      
      return true;
    }
    
    // Find positions of this letter in all words
    if (currentWordSet) {
      const letterPositions: number[] = [];
      
      // Check each word in the word set
      currentWordSet.words.forEach(word => {
        // For each letter in the word
        for (let i = 0; i < word.length; i++) {
          // If the letter matches our hint letter, record its position
          if (word[i] === letter) {
            letterPositions.push(i);
          }
        }
      });
      
      // Create a new map with existing positions plus this letter's positions
      const newPositions = new Map(activeHintPositions);
      // Use a Set to ensure unique positions
      newPositions.set(letter, [...new Set(letterPositions)]);
      setActiveHintPositions(newPositions);
    }
    
    // Decrement hint count and add to active hint letters
    setHintsRemaining(prev => prev - 1);
    setActiveHintLetters(prev => [...prev, letter]);
    return true;
  };
  
  // Clear all active hints
  const clearHints = () => {
    setActiveHintLetters([]);
    setActiveHintPositions(new Map());
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  return (
    <GameContext.Provider
      value={{
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
        activeHintPositions,
        useHint,
        clearHints,
        gameDifficulty,
        setGameDifficulty,
        generateGameSeed,
        startGameWithSeed,
        isChallenge,
        challengeStartTime,
        unusedLetters,
      }}
    >
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