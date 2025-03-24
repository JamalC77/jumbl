export interface WordSet {
  letters: string;
  words: string[];
  wordLength: number;
  wordDifficulties?: Map<string, string>; // Map of words to their difficulty
}

import { analyzeWordDifficulty, WordWithDifficulty, WordDifficulty } from './openAiService';

// Define our word list - these are 5-letter words from the provided list
// We're extracting a much larger list of words from the provided word list
const WORD_LIST = [
  // First section (a-c)
  "aback", "abaft", "abase", "abate", "abbey", "abbot", "abhor", "abide", "abler", "abode",
  "about", "above", "abuse", "abyss", "ached", "aches", "acids", "acorn", "acres", "acrid",
  // ... rest of the word list remains the same
];

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

// Generate a random word set by picking 10 random words from our list
export const getRandomWordSet = async (): Promise<WordSet> => {
  // We'll try several times to get a good word set with not too many unique letters
  const MAX_UNIQUE_LETTERS = 12; // Maximum number of unique letters for a playable set
  let bestWordSet: { words: string[], letters: string } | null = null;
  
  // Try several times to find a good set
  for (let attempt = 0; attempt < 5; attempt++) {
    // Shuffle the word list
    const shuffledWords = shuffleArray(WORD_LIST);
    
    // Start by picking the first word
    const selectedWords: string[] = [shuffledWords[0].toUpperCase()];
    
    // Create a set of letters from the first word
    const letterSet = new Set<string>();
    selectedWords[0].split('').forEach(letter => letterSet.add(letter.toLowerCase()));
    
    // Try to find 9 more words that use the same letters when possible
    let wordsFound = 1;
    let index = 1;
    
    // Keep trying words until we have 10 or run out of candidates
    while (wordsFound < 10 && index < shuffledWords.length) {
      const candidate = shuffledWords[index].toUpperCase();
      
      // Check if the candidate word shares at least 2 letters with our letter set
      let sharedLetters = 0;
      const candidateLetters = new Set<string>();
      
      for (const letter of candidate.toLowerCase()) {
        candidateLetters.add(letter);
        if (letterSet.has(letter)) {
          sharedLetters++;
        }
      }
      
      // If adding this word would exceed our letter limit, skip it
      const potentialNewLetters = new Set([...letterSet, ...candidateLetters]);
      
      // Add word if it shares at least 2 letters with our set and won't exceed letter limit
      if (sharedLetters >= 2 && potentialNewLetters.size <= MAX_UNIQUE_LETTERS) {
        selectedWords.push(candidate);
        wordsFound++;
        
        // Update our letter set
        candidateLetters.forEach(letter => letterSet.add(letter));
      }
      
      index++;
    }
    
    // If we couldn't find 10 related words, try to fill out the set
    // while keeping the unique letter count under control
    if (selectedWords.length < 10) {
      for (let i = index; i < shuffledWords.length && selectedWords.length < 10; i++) {
        const candidate = shuffledWords[i].toUpperCase();
        const candidateLetters = new Set<string>();
        
        for (const letter of candidate.toLowerCase()) {
          candidateLetters.add(letter);
        }
        
        // Check if adding this word would keep us under the letter limit
        const potentialNewLetters = new Set([...letterSet, ...candidateLetters]);
        if (potentialNewLetters.size <= MAX_UNIQUE_LETTERS) {
          selectedWords.push(candidate);
          candidateLetters.forEach(letter => letterSet.add(letter));
        }
      }
    }
    
    const letters = Array.from(letterSet).join('').toUpperCase();
    
    // If we got 10 words or this attempt is better than previous ones, save it
    if (selectedWords.length === 10 && 
        (!bestWordSet || letterSet.size < bestWordSet.letters.length)) {
      bestWordSet = {
        words: selectedWords,
        letters: letters
      };
    }
  }
  
  // If we found a good set, use it
  if (bestWordSet && bestWordSet.words.length === 10) {
    const wordLength = bestWordSet.words[0].length;
    
    // Analyze word difficulties using OpenAI
    const wordDifficulties = new Map<string, string>();
    
    try {
      const difficultyAnalysis = await analyzeWordDifficulty(bestWordSet.words);
      
      // Store difficulty ratings
      difficultyAnalysis.forEach(item => {
        wordDifficulties.set(item.word, item.difficulty);
      });
      
      console.log("Word difficulties:", Object.fromEntries(wordDifficulties));
    } catch (error) {
      console.error("Failed to analyze word difficulties:", error);
    }
    
    return {
      letters: shuffleArray(bestWordSet.letters.split('')).join(''),
      words: bestWordSet.words,
      wordLength,
      wordDifficulties
    };
  }
  
  // Fallback: Just pick 10 random words if we couldn't find a good set
  const fallbackWords = shuffleArray(WORD_LIST).slice(0, 10).map(w => w.toUpperCase());
  const allLetters = getUniqueLetters(fallbackWords);
  
  // Analyze word difficulties for fallback words
  const wordDifficulties = new Map<string, string>();
  
  try {
    const difficultyAnalysis = await analyzeWordDifficulty(fallbackWords);
    
    // Store difficulty ratings
    difficultyAnalysis.forEach(item => {
      wordDifficulties.set(item.word, item.difficulty);
    });
  } catch (error) {
    console.error("Failed to analyze fallback word difficulties:", error);
  }
  
  return {
    letters: shuffleArray(allLetters.split('')).join(''),
    words: fallbackWords,
    wordLength: fallbackWords[0].length,
    wordDifficulties
  };
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