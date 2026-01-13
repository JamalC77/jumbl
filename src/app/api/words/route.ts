import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// API route that reads words.txt and returns 8 random words
export async function GET(request: Request) {
  try {
    // Get the URL to parse query parameters
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    
    // Path to the words.txt file in the public directory
    const filePath = path.join(process.cwd(), 'public', 'words.txt');
    
    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Clean and filter the content to get valid 5-letter words
    const words = fileContent.split('\n')
      .map(line => {
        // Extract potential word, ignoring any line numbers or other text
        const match = line.trim().match(/^[a-z]{5}$/);
        return match ? match[0] : null;
      })
      .filter(Boolean) as string[]; // Filter out nulls and cast to string[]
    
    // Log how many words were found for debugging
    console.log(`Found ${words.length} valid 5-letter words in words.txt`);
    
    // If no words were found, return an error
    if (!words.length) {
      return NextResponse.json(
        { error: 'No valid words found in the file' },
        { status: 500 }
      );
    }
    
    // Shuffle the entire array of words
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    
    // More sophisticated difficulty filtering
    let filteredWords = shuffled;
    
    if (difficulty) {
      // Most common letters in English by frequency
      const commonLetters = 'etaoinsrhldcumfpgwybvkxjqz';
      
      // Very common 5-letter words (high frequency, top 1000-2000)
      const veryCommonWords = [
        'about', 'after', 'again', 'below', 'could', 'every', 'first', 'found', 
        'great', 'house', 'large', 'learn', 'never', 'other', 'place', 'plant', 
        'point', 'right', 'small', 'sound', 'spell', 'still', 'study', 'their', 
        'there', 'these', 'thing', 'think', 'three', 'water', 'where', 'which', 
        'world', 'would', 'write', 'heart', 'money', 'music', 'party', 'earth',
        'light', 'night', 'white', 'black', 'green', 'brown', 'young', 'story',
        'today', 'paper', 'class', 'group', 'table', 'phone', 'woman', 'level',
        'lobby', 'hotel', 'speak', 'cover', 'order', 'human', 'floor', 'river',
        'watch', 'stand', 'mouth', 'front', 'sleep', 'smile', 'media', 'board',
        'field', 'voice', 'model', 'space', 'train', 'glass', 'judge', 'happy'
      ];
      
      // Common 5-letter words (top 5000-10000)
      const commonWords = [
        'happy', 'beach', 'brain', 'bread', 'chair', 'chest', 'child', 'clear',
        'clock', 'cloud', 'color', 'dance', 'dream', 'drink', 'drive', 'early',
        'enjoy', 'enter', 'field', 'floor', 'flower', 'fresh', 'front', 'fruit',
        'glass', 'grass', 'heavy', 'honey', 'horse', 'hotel', 'human', 'image',
        'knife', 'laugh', 'legal', 'lemon', 'light', 'limit', 'local', 'lucky',
        'lunch', 'metal', 'model', 'movie', 'music', 'nurse', 'ocean', 'paint',
        'panel', 'pizza', 'plane', 'plate', 'price', 'queen', 'quiet', 'radio'
      ];
      
      // Uncommon 5-letter words (from our first analysis)
      const uncommonWords = [
        'abide', 'abort', 'abuzz', 'acrid', 'acute', 'adept', 'admit', 'adobe', 
        'adopt', 'adore', 'agile', 'aglow', 'agony', 'ahead', 'aisle', 'alarm', 
        'album', 'alert', 'algae', 'alibi', 'align', 'alley', 'allot', 'alloy', 
        'aloft', 'alone', 'along', 'aloof', 'altar', 'amble', 'amend', 'amidst', 
        'amiss', 'amuse', 'angle', 'angry', 'ankle', 'annex', 'annoy', 'annul', 
        'anode', 'anvil', 'aorta', 'apart', 'aphid', 'apron', 'aptly', 'arbor', 
        'arson', 'ashen', 'askew', 'asset', 'aster', 'atoll', 'attic', 'audio', 
        'audit', 'augur', 'avail', 'avert', 'avian', 'avoid', 'await', 'awake'
      ];
      
      // Rare or very uncommon 5-letter words (outside common vocabulary)
      const rareWords = [
        'abaft', 'aback', 'addle', 'agley', 'ambit', 'askew', 'bairn', 'biddy',
        'briar', 'caulk', 'crwth', 'dixit', 'dweeb', 'elute', 'epact', 'extol',
        'fubar', 'gadjo', 'gizmo', 'hoary', 'hyena', 'imbue', 'junta', 'kapok',
        'kudzu', 'lysis', 'monad', 'nares', 'obeah', 'parch', 'phlox', 'qophs',
        'quern', 'recks', 'sylph', 'twerp', 'uvula', 'vizor', 'xebec', 'yarns',
        'hares', 'abaft', 'azoth', 'blain', 'carom', 'clave', 'livor', 'marse',
        'nadir', 'oxter', 'pavis', 'quoin', 'rhumb', 'scree', 'terce', 'umiac',
        'volar', 'whelk', 'xeric', 'yobbo', 'ziram', 'cozen', 'demit', 'fusil'
      ];
      
      const calculateWordScore = (word: string): number => {
        let score = 0;
        
        // Check predefined word lists first
        if (veryCommonWords.includes(word)) return -15; // Extremely easy
        if (commonWords.includes(word)) return -5;     // Very easy
        if (uncommonWords.includes(word)) return 5;    // Moderately difficult
        if (rareWords.includes(word)) return 15;       // Very hard
        
        // Calculate score based on letter frequency
        // Lower index in commonLetters = more common letter = lower score
        for (const letter of word) {
          const index = commonLetters.indexOf(letter);
          if (index === -1) score += 5; // Very uncommon letter
          else score += index / 4;      // Score based on position in frequency list
        }
        
        // Check for uncommon letter pairs
        const uncommonPairs = ['zz', 'qw', 'qa', 'xj', 'vx', 'jq', 'wq', 'xz', 
                               'bx', 'cx', 'dx', 'fx', 'gx', 'hx', 'jx', 'kx',
                               'mx', 'px', 'qx', 'sx', 'vx', 'wx', 'xx', 'zx'];
        for (const pair of uncommonPairs) {
          if (word.includes(pair)) score += 3;
        }
        
        // Words with repeated letters are generally easier
        const uniqueLetters = new Set(word.split('')).size;
        if (uniqueLetters < 5) score -= (5 - uniqueLetters) * 2;
        
        // Words with many consonants in a row are harder
        const consonants = 'bcdfghjklmnpqrstvwxyz';
        let maxConsecutiveConsonants = 0;
        let currentConsecutiveConsonants = 0;
        
        for (const letter of word) {
          if (consonants.includes(letter)) {
            currentConsecutiveConsonants++;
            maxConsecutiveConsonants = Math.max(maxConsecutiveConsonants, currentConsecutiveConsonants);
          } else {
            currentConsecutiveConsonants = 0;
          }
        }
        
        if (maxConsecutiveConsonants >= 3) {
          score += (maxConsecutiveConsonants - 2) * 3;
        }
        
        return score;
      };
      
      console.log(`Filtering words by difficulty: ${difficulty}`);
      
      if (difficulty === 'easy') {
        // Select words that are likely to be more common/familiar
        filteredWords = shuffled.filter(word => {
          const score = calculateWordScore(word);
          return score < 0; // Negative scores are easier words
        });
      } else if (difficulty === 'hard') {
        // Select words that are likely to be less common/familiar
        filteredWords = shuffled.filter(word => {
          const score = calculateWordScore(word);
          return score > 7; // Higher scores are harder words (increased threshold)
        });
      } else {
        // 'normal' difficulty - select words of moderate difficulty
        filteredWords = shuffled.filter(word => {
          const score = calculateWordScore(word);
          return score >= 0 && score <= 7; // Adjusted range
        });
      }
      
      console.log(`Filtered to ${filteredWords.length} words for difficulty ${difficulty}`);
      
      // If filtering removed too many words, fall back to the full list
      if (filteredWords.length < 20) {
        console.log(`Difficulty filter for '${difficulty}' returned too few words (${filteredWords.length}), using full list`);
        filteredWords = shuffled;
      }
    }
    
    // Select 5 random words (simplified gameplay)
    const selectedWords = filteredWords.slice(0, 5).map(word => word.toUpperCase());
    
    // Return the selected words
    return NextResponse.json({ 
      words: selectedWords,
      totalWordsAvailable: words.length,
      difficulty: difficulty || 'normal'
    });
  } catch (error) {
    console.error('Error reading words file:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to read words file',
        details: errorMessage
      },
      { status: 500 }
    );
  }
} 