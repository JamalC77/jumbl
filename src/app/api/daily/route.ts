import { NextResponse } from 'next/server';
import { COMMON_WORDS } from '@/data/commonWords';

// Seeded random number generator (deterministic)
class SeededRandom {
  private seed: number;

  constructor(seedStr: string) {
    this.seed = 0;
    for (let i = 0; i < seedStr.length; i++) {
      this.seed = ((this.seed << 5) - this.seed) + seedStr.charCodeAt(i);
      this.seed = this.seed & this.seed;
    }
    this.seed = Math.abs(this.seed);
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Get today's date in YYYY-MM-DD format (UTC)
const getTodayDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Calculate the day number since a fixed start date
const getDayNumber = (): number => {
  const startDate = new Date('2024-01-01');
  const today = new Date(getTodayDate());
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

// Generate a deterministic seed based on the date
const generateDailySeed = (date: string): string => {
  let hash = 0;
  const str = `jumbl-daily-${date}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `daily-${Math.abs(hash).toString(36)}-${date}`;
};

// API route for daily challenge
export async function GET() {
  try {
    const today = getTodayDate();
    const dayNumber = getDayNumber();
    const seed = generateDailySeed(today);
    const rng = new SeededRandom(seed);

    // Use curated common words list
    const words = COMMON_WORDS;

    // Shuffle words using seeded RNG (deterministic for the day)
    const shuffled = rng.shuffle(words);

    // Select 3 words (simple, achievable gameplay)
    const selectedWords = shuffled.slice(0, 3).map(w => w.toUpperCase());

    // Create unique letter set
    const allLetters = selectedWords.join('');
    const uniqueLetters = [...new Set(allLetters.split(''))].join('');

    return NextResponse.json({
      words: selectedWords,
      letters: uniqueLetters,
      date: today,
      dayNumber,
      seed,
      isDaily: true,
    });
  } catch (error) {
    console.error('Error generating daily challenge:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily challenge' },
      { status: 500 }
    );
  }
}
