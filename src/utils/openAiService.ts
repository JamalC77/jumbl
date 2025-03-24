// Placeholder OpenAI API key for development
const OPENAI_API_KEY = "sk-placeholder-key-replace-with-real-key-in-production";

// Type for word difficulty levels
export type WordDifficulty = "easy" | "medium" | "hard";

export interface WordWithDifficulty {
  word: string;
  difficulty: WordDifficulty;
}

/**
 * Analyze a list of words and rank them by difficulty using OpenAI
 * @param words List of words to analyze
 * @returns Promise with the words and their difficulty ratings
 */
export const analyzeWordDifficulty = async (words: string[]): Promise<WordWithDifficulty[]> => {
  try {
    // Check if we have a valid API key
    if (!OPENAI_API_KEY || OPENAI_API_KEY.includes("placeholder")) {
      console.log("Using mock difficulty analysis as no valid OpenAI API key is configured");
      // For now, we'll use a mock implementation
      return words.map(word => ({
        word,
        difficulty: mockDifficultyAnalysis(word)
      }));
    }
    
    // In a real implementation with a valid API key, we would make an API call to OpenAI
    console.log("Analyzing word difficulty for:", words);
    
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-0125",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that analyzes English words and rates their difficulty as 'easy', 'medium', or 'hard' based on how common they are, their spelling complexity, and how intuitive their meaning is."
            },
            {
              role: "user",
              content: `Please analyze the following words and rate each one as 'easy', 'medium', or 'hard'. Return your answer in a simple JSON format with the word as the key and the difficulty as the value: ${words.join(", ")}`
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API responded with status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error("Unexpected response format from OpenAI API");
      }
      
      const result = JSON.parse(data.choices[0].message.content);
      
      // Transform the response into our expected format
      return words.map(word => ({
        word,
        difficulty: (result[word.toLowerCase()] || "medium") as WordDifficulty
      }));
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      // Fallback to mock implementation
      return words.map(word => ({
        word,
        difficulty: mockDifficultyAnalysis(word)
      }));
    }
  } catch (error) {
    console.error("Error analyzing word difficulty:", error);
    // Fallback: return medium difficulty for all words
    return words.map(word => ({
      word,
      difficulty: "medium" as WordDifficulty
    }));
  }
};

/**
 * Mock implementation of difficulty analysis
 * This is a deterministic algorithm that assigns difficulty based on:
 * - Word length
 * - Presence of uncommon letters
 * - Vowel/consonant patterns
 */
const mockDifficultyAnalysis = (word: string): WordDifficulty => {
  const lowercaseWord = word.toLowerCase();
  
  // Uncommon letters increase difficulty
  const uncommonLetters = ['j', 'k', 'q', 'x', 'z', 'v', 'w', 'y'];
  const hasUncommonLetters = uncommonLetters.some(letter => lowercaseWord.includes(letter));
  
  // Count vowels
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const vowelCount = lowercaseWord.split('').filter(char => vowels.includes(char)).length;
  
  // Determine difficulty based on various factors
  if (hasUncommonLetters && lowercaseWord.length > 5) {
    return "hard";
  } else if (hasUncommonLetters || lowercaseWord.length > 6 || vowelCount <= 1) {
    return "medium";
  } else {
    return "easy";
  }
}; 