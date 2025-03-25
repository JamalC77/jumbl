import { WordSet } from "./gameData";

/**
 * Generates a seed string from a WordSet
 * The seed is a base64 encoded string that contains the game data
 */
export const generateSeed = (wordSet: WordSet): string => {
  try {
    // Create a simple object with the essential data
    const seedData = {
      words: wordSet.words,
      letters: wordSet.letters,
      wordLength: wordSet.wordLength,
      difficulties: wordSet.wordDifficulties ? 
        Array.from(wordSet.wordDifficulties.entries()) : [],
      gameDifficulty: wordSet.gameDifficulty || "normal"
    };
    
    // Convert to JSON and encode to base64
    const jsonString = JSON.stringify(seedData);
    if (typeof window !== 'undefined') {
      return btoa(jsonString);
    }
    
    // For Node.js environments
    return Buffer.from(jsonString).toString('base64');
  } catch (error) {
    console.error("Error generating seed:", error);
    return "";
  }
};

/**
 * Loads a game from a seed string
 * @param seed The base64 encoded seed string
 * @returns A WordSet or null if the seed is invalid
 */
export const loadGameFromSeed = async (seed: string): Promise<WordSet | null> => {
  try {
    // Decode the base64 string
    let jsonString: string;
    
    if (typeof window !== 'undefined') {
      // Browser environment
      jsonString = atob(seed);
    } else {
      // Node.js environment
      jsonString = Buffer.from(seed, 'base64').toString();
    }
    
    // Parse the JSON
    const seedData = JSON.parse(jsonString);
    
    // Validate the seed data
    if (!seedData.words || !Array.isArray(seedData.words) || seedData.words.length === 0) {
      throw new Error("Invalid seed: missing words array");
    }
    
    if (!seedData.letters || typeof seedData.letters !== 'string') {
      throw new Error("Invalid seed: missing letters");
    }
    
    // Convert difficulties array back to a Map
    const wordDifficulties = new Map<string, string>();
    if (seedData.difficulties && Array.isArray(seedData.difficulties)) {
      seedData.difficulties.forEach(([word, difficulty]) => {
        wordDifficulties.set(word, difficulty);
      });
    }
    
    // Return the reconstructed WordSet
    return {
      words: seedData.words,
      letters: seedData.letters,
      wordLength: seedData.wordLength || seedData.words[0].length,
      wordDifficulties,
      gameDifficulty: seedData.gameDifficulty || "normal"
    };
  } catch (error) {
    console.error("Error loading game from seed:", error);
    return null;
  }
}; 