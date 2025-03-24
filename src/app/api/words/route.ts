import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// API route that reads words.txt and returns 10 random words
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
    
    // Apply difficulty filter if specified (just a simple demo implementation)
    let filteredWords = shuffled;
    if (difficulty) {
      // For this example, we'll use word length and common letter frequency as a proxy for difficulty
      const commonLetters = 'etaoinshrdlu';
      
      if (difficulty === 'easy') {
        // Easy words have more common letters
        filteredWords = shuffled.filter(word => {
          const commonLetterCount = word.split('').filter(c => commonLetters.includes(c)).length;
          return commonLetterCount >= 3; // At least 3 common letters
        });
      } else if (difficulty === 'hard') {
        // Hard words have fewer common letters
        filteredWords = shuffled.filter(word => {
          const commonLetterCount = word.split('').filter(c => commonLetters.includes(c)).length;
          return commonLetterCount <= 2; // No more than 2 common letters
        });
      }
      
      // If filtering removed too many words, fall back to the full list
      if (filteredWords.length < 10) {
        filteredWords = shuffled;
      }
    }
    
    // Select 10 random words
    const selectedWords = filteredWords.slice(0, 10).map(word => word.toUpperCase());
    
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