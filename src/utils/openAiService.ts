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
 * - Word frequency in English
 * - Presence of uncommon letters
 * - Word structure complexity
 * - Reference to common word databases
 */
const mockDifficultyAnalysis = (word: string): WordDifficulty => {
  const lowercaseWord = word.toLowerCase();
  
  // Common high-frequency words that should always be easy (top 5000 in English)
  const commonWords = [
    'about', 'above', 'after', 'again', 'heart', 'house', 'water', 'under', 
    'happy', 'woman', 'world', 'thing', 'child', 'stand', 'night', 'money',
    'table', 'brown', 'think', 'white', 'black', 'green', 'little', 'small',
    'every', 'never', 'place', 'point', 'right', 'great', 'group', 'often',
    'build', 'earth', 'light', 'story', 'power', 'paper', 'class', 'heard',
    'asset', 'alien', 'lobby', 'brain', 'beach', 'plant', 'movie', 'basic',
    'start', 'level', 'young', 'large', 'today', 'major', 'speak', 'music',
    'early', 'share', 'staff', 'style', 'space', 'field', 'price', 'north',
    'check', 'south', 'board', 'party', 'study', 'model', 'watch', 'color',
    // Additional common words
    'chair', 'floor', 'hotel', 'human', 'phone', 'river', 'sleep', 'smile',
    'speak', 'stand', 'teeth', 'train', 'woman', 'write', 'month', 'media',
    'radio', 'video', 'visit', 'voice', 'cover', 'check', 'drive', 'front',
    'glass', 'guide', 'heavy', 'horse', 'judge', 'knife', 'laugh', 'leave',
    'limit', 'lobby', 'local', 'major', 'match', 'metal', 'model', 'mouth',
    'needs', 'nurse', 'offer', 'order', 'other', 'owner', 'panel', 'paper'
  ];
  
  // Uncommon words that should always be hard (outside top 50,000 in English)
  const rareWords = [
    // Original rare words list
    'abaft', 'aback', 'addle', 'aerie', 'affix', 'antic', 'balmy', 'bawdy',
    'briar', 'canny', 'caulk', 'crass', 'deign', 'elide', 'fecal', 'feign',
    'hoary', 'hyena', 'jerky', 'knack', 'lacey', 'mourn', 'navel', 'olden',
    'parch', 'quail', 'quark', 'quirk', 'reedy', 'rusty', 'shirk', 'sulky',
    'tryst', 'twine', 'vague', 'vouch', 'wacky', 'wharf', 'whelp', 'zesty',
    
    // Additional rare/archaic words
    'yarns', 'hares', 'abaft', 'azoth', 'blain', 'carom', 'clave', 'dixit',
    'duroc', 'ergot', 'fumet', 'galax', 'groat', 'gloze', 'hadal', 'ictus',
    'japer', 'kench', 'livor', 'marse', 'nadir', 'oxter', 'pavis', 'quoin',
    'rhumb', 'scree', 'terce', 'umiac', 'volar', 'whelk', 'xeric', 'yobbo',
    'ziram', 'cozen', 'demit', 'fusil', 'gault', 'imido', 'jorum', 'kerfs',
    'limbi', 'murex', 'nertz', 'oasts', 'proke', 'quire', 'reles', 'souse',
    'thrum', 'unset', 'virtu', 'witan', 'xebec', 'yogic', 'zoist', 'aboon'
  ];
  
  // Moderately uncommon words (outside top 15,000 in English)
  const uncommonWords = [
    'aback', 'abide', 'abort', 'abuzz', 'acrid', 'acute', 'adept', 'admit',
    'adobe', 'adopt', 'adore', 'agile', 'aglow', 'agony', 'ahead', 'aisle',
    'alarm', 'album', 'alert', 'algae', 'alibi', 'align', 'alley', 'allot',
    'alloy', 'aloft', 'alone', 'along', 'aloof', 'amble', 'amend', 'amidst',
    'amiss', 'amuse', 'angel', 'anger', 'angle', 'angry', 'anime', 'ankle',
    'annex', 'annoy', 'annul', 'anode', 'antic', 'anvil', 'aorta', 'apart',
    'aphid', 'apple', 'apply', 'apron', 'aptly', 'arbor', 'ardor', 'areas'
  ];
  
  // Uncommon letters (with Q, X, Z being the most uncommon)
  const uncommonLetters = {
    'q': 10, 'z': 10, 'x': 8, 'j': 8, 'k': 6, 'v': 5, 'w': 4, 'y': 3, 
    'f': 2, 'b': 2, 'g': 2, 'h': 1, 'p': 1
  };
  
  // Check if the word is in our predefined lists
  if (commonWords.includes(lowercaseWord)) {
    return "easy";
  }
  
  if (rareWords.includes(lowercaseWord)) {
    return "hard";
  }
  
  if (uncommonWords.includes(lowercaseWord)) {
    return "medium";
  }
  
  // Calculate a difficulty score based on several factors
  let difficultyScore = 0;
  
  // Score based on uncommon letters
  for (const letter of lowercaseWord) {
    difficultyScore += uncommonLetters[letter] || 0;
  }
  
  // Count vowels
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const vowelCount = lowercaseWord.split('').filter(char => vowels.includes(char)).length;
  
  // Words with very few vowels are harder
  if (vowelCount <= 1) {
    difficultyScore += 5;
  } else if (vowelCount === 2) {
    difficultyScore += 2;
  }
  
  // Words with unusual consonant clusters are harder
  const clusters = [
    'sch', 'tch', 'thm', 'spr', 'str', 'ngth', 'phth', 'rld', 'rn', 'mn', 
    'kn', 'gh', 'bt', 'ft', 'mb', 'ght', 'dth', 'pth', 'lch', 'xt'
  ];
  
  for (const cluster of clusters) {
    if (lowercaseWord.includes(cluster)) {
      difficultyScore += 3;
    }
  }
  
  // Check for rare bigrams (letter pairs)
  const rareBigrams = [
    'bk', 'bq', 'bx', 'bz', 'cf', 'cj', 'cp', 'cv', 'cx', 'dx', 'fq', 'fx', 
    'fz', 'gq', 'gx', 'hx', 'jb', 'jc', 'jd', 'jf', 'jg', 'jh', 'jl', 'jm', 
    'jn', 'jp', 'jq', 'jr', 'js', 'jt', 'jv', 'jw', 'jx', 'jy', 'jz', 'kq', 
    'kx', 'kz', 'mx', 'px', 'qb', 'qc', 'qd', 'qe', 'qf', 'qg', 'qh', 'qi', 
    'qj', 'qk', 'ql', 'qm', 'qn', 'qo', 'qp', 'qq', 'qr', 'qs', 'qt', 'qv', 
    'qw', 'qx', 'qy', 'qz', 'sx', 'sz', 'tx', 'vb', 'vf', 'vh', 'vj', 'vk', 
    'vm', 'vp', 'vq', 'vw', 'vx', 'wq', 'wx', 'xj', 'xk', 'xz', 'yq', 'yj', 
    'zb', 'zc', 'zd', 'zf', 'zg', 'zj', 'zl', 'zm', 'zn', 'zp', 'zq', 'zr', 
    'zs', 'zt', 'zv', 'zw', 'zx'
  ];
  
  // Check for rare bigrams
  for (let i = 0; i < lowercaseWord.length - 1; i++) {
    const bigram = lowercaseWord.substring(i, i + 2);
    if (rareBigrams.includes(bigram)) {
      difficultyScore += 4;
    }
  }
  
  // Words with many consonants in sequence are harder
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  let maxConsecutiveConsonants = 0;
  let currentConsecutiveConsonants = 0;
  
  for (const letter of lowercaseWord) {
    if (consonants.includes(letter)) {
      currentConsecutiveConsonants++;
      maxConsecutiveConsonants = Math.max(maxConsecutiveConsonants, currentConsecutiveConsonants);
    } else {
      currentConsecutiveConsonants = 0;
    }
  }
  
  if (maxConsecutiveConsonants >= 3) {
    difficultyScore += (maxConsecutiveConsonants - 2) * 3;
  }
  
  // Determine difficulty based on the score
  if (difficultyScore >= 10) {
    return "hard";
  } else if (difficultyScore >= 4) {
    return "medium";
  } else {
    return "easy";
  }
}; 