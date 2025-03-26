export interface WordSet {
  letters: string;
  words: string[];
  wordLength: number;
  wordDifficulties?: Map<string, string>; // Map of words to their difficulty
  gameDifficulty?: string; // Overall game difficulty
}

import { analyzeWordDifficulty } from './openAiService';

// Shuffle an array using Fisher-Yates algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Function to get all unique letters from a set of words
const getUniqueLetters = (words: string[]): string => {
  const letterSet = new Set<string>();
  
  words.forEach(word => {
    word.split('').forEach(letter => {
      letterSet.add(letter.toUpperCase());
    });
  });
  
  return Array.from(letterSet).join('');
};

// Function to fetch random words from our API
const fetchRandomWords = async (difficulty?: string): Promise<{ words: string[], difficulty: string }> => {
  try {
    // Build the URL with optional difficulty parameter
    const url = difficulty 
      ? `/api/words?difficulty=${difficulty}`
      : '/api/words';
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch words: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { 
      words: data.words,
      difficulty: data.difficulty
    };
  } catch (error) {
    console.error('Error fetching words:', error);
    // Return a fallback set of words if the API fails
    return {
      words: [
        "ABOUT", "ABOVE", "ABUSE", "ACTOR", 
        "ADAPT", "ADMIT", "ADOPT", "ADULT"
      ],
      difficulty: difficulty || 'normal'
    };
  }
};

// Generate a random word set by fetching 8 random words from our API
export const getRandomWordSet = async (difficulty?: string): Promise<WordSet> => {
  try {
    // Fetch 8 random words from our API with optional difficulty
    const { words, difficulty: actualDifficulty } = await fetchRandomWords(difficulty);
    
    // Get all unique letters from these words
    const allLetters = getUniqueLetters(words);
    
    // Analyze word difficulties using OpenAI
    const wordDifficulties = new Map<string, string>();
    
    try {
      const difficultyAnalysis = await analyzeWordDifficulty(words);
      
      // Store difficulty ratings
      difficultyAnalysis.forEach(item => {
        wordDifficulties.set(item.word, item.difficulty);
      });
      
      console.log("Word difficulties:", Object.fromEntries(wordDifficulties));
    } catch (error) {
      console.error("Failed to analyze word difficulties:", error);
    }
    
    return {
      letters: shuffleArray(allLetters.split('')).join(''),
      words: words,
      wordLength: words[0].length,
      wordDifficulties,
      gameDifficulty: actualDifficulty
    };
  } catch (error) {
    console.error("Error generating word set:", error);
    
    // Fallback: Use a predefined set of words
    const fallbackWords = [
      "ABOUT", "ABOVE", "ABUSE", "ACTOR", 
      "ADAPT", "ADMIT", "ADOPT", "ADULT"
    ];
    
    const allLetters = getUniqueLetters(fallbackWords);
    
    return {
      letters: shuffleArray(allLetters.split('')).join(''),
      words: fallbackWords,
      wordLength: fallbackWords[0].length,
      wordDifficulties: new Map(),
      gameDifficulty: difficulty || 'normal'
    };
  }
};

// Function to check if a word is valid for the given letter set
export const isValidWord = (word: string, letters: string): boolean => {
  const letterCount: Record<string, number> = {};
  
  // Count letters in the provided set
  for (const char of letters.toLowerCase()) {
    letterCount[char] = (letterCount[char] || 0) + 1;
  }
  
  // Check if the word can be formed with the available letters
  for (const char of word.toLowerCase()) {
    if (!letterCount[char] || letterCount[char] <= 0) {
      return false;
    }
    letterCount[char]--;
  }
  
  return true;
};

// Utility function to expose game data for testing via console
export const logGameDataForTesting = (wordSet: WordSet | null): void => {
  if (!wordSet) {
    console.log("No active word set available");
    return;
  }
  
  console.log("Current Game Data for Testing:");
  console.log("Available letters:", wordSet.letters);
  console.log("Target words:", wordSet.words);
  console.log("Game difficulty:", wordSet.gameDifficulty || "normal");
  console.log("Word difficulties:", wordSet.wordDifficulties ? 
    Object.fromEntries(wordSet.wordDifficulties) : "Not available");
}; 