import { NextResponse } from 'next/server';
import { COMMON_WORDS } from '@/data/commonWords';

// API route that returns 3 random common words
export async function GET() {
  try {
    // Use our curated common words list
    const words = COMMON_WORDS;

    // Log how many words available
    console.log(`Using ${words.length} curated common words`);

    // Shuffle the array
    const shuffled = [...words].sort(() => 0.5 - Math.random());

    // Select 3 random words (simple, achievable gameplay)
    const selectedWords = shuffled.slice(0, 3).map(word => word.toUpperCase());

    // Return the selected words
    return NextResponse.json({
      words: selectedWords,
      totalWordsAvailable: words.length,
    });
  } catch (error) {
    console.error('Error getting words:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to get words',
        details: errorMessage
      },
      { status: 500 }
    );
  }
} 