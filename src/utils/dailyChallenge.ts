// Daily Challenge System
// Generates the same puzzle for everyone on a given day

export interface DailyStats {
  lastPlayedDate: string;
  currentStreak: number;
  maxStreak: number;
  gamesPlayed: number;
  gamesWon: number;
  totalWordsFound: number;
  averageWordsFound: number;
  dailyHistory: DailyResult[];
}

export interface DailyResult {
  date: string;
  wordsFound: number;
  totalWords: number;
  timeRemaining: number;
  hintsUsed: number;
  completed: boolean;
}

const STORAGE_KEY = 'jumbl_daily_stats';
const DAILY_SEED_KEY = 'jumbl_daily_seed';

// Get today's date in YYYY-MM-DD format (UTC)
export const getTodayDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Calculate the day number since a fixed start date (for display like "Jumbl #123")
export const getDayNumber = (): number => {
  const startDate = new Date('2024-01-01');
  const today = new Date(getTodayDate());
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

// Generate a deterministic seed based on the date
export const generateDailySeed = (date: string = getTodayDate()): string => {
  // Create a hash from the date string
  let hash = 0;
  const str = `jumbl-daily-${date}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to base64-ish string for use as seed
  return btoa(Math.abs(hash).toString() + date).replace(/=/g, '');
};

// Seeded random number generator (deterministic)
export class SeededRandom {
  private seed: number;

  constructor(seedStr: string) {
    // Convert string seed to number
    this.seed = 0;
    for (let i = 0; i < seedStr.length; i++) {
      this.seed = ((this.seed << 5) - this.seed) + seedStr.charCodeAt(i);
      this.seed = this.seed & this.seed;
    }
    this.seed = Math.abs(this.seed);
  }

  // Returns a random number between 0 and 1
  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  // Returns a random integer between min (inclusive) and max (exclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  // Shuffle an array in place
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Check if the user has already played today's daily challenge
export const hasPlayedToday = (): boolean => {
  if (typeof window === 'undefined') return false;

  const stats = getDailyStats();
  return stats.lastPlayedDate === getTodayDate();
};

// Get daily stats from localStorage
export const getDailyStats = (): DailyStats => {
  if (typeof window === 'undefined') {
    return getDefaultStats();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading daily stats:', e);
  }

  return getDefaultStats();
};

// Get default stats object
const getDefaultStats = (): DailyStats => ({
  lastPlayedDate: '',
  currentStreak: 0,
  maxStreak: 0,
  gamesPlayed: 0,
  gamesWon: 0,
  totalWordsFound: 0,
  averageWordsFound: 0,
  dailyHistory: [],
});

// Save daily stats to localStorage
export const saveDailyStats = (stats: DailyStats): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving daily stats:', e);
  }
};

// Record a daily challenge result
export const recordDailyResult = (result: Omit<DailyResult, 'date'>): DailyStats => {
  const stats = getDailyStats();
  const today = getTodayDate();

  // Check if already played today
  if (stats.lastPlayedDate === today) {
    return stats; // Don't record duplicate
  }

  // Calculate streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak = 1;
  if (stats.lastPlayedDate === yesterdayStr) {
    // Continuing streak
    newStreak = stats.currentStreak + 1;
  } else if (stats.lastPlayedDate === '') {
    // First game ever
    newStreak = 1;
  } else {
    // Streak broken
    newStreak = 1;
  }

  const dailyResult: DailyResult = {
    ...result,
    date: today,
  };

  // Update stats
  const newStats: DailyStats = {
    lastPlayedDate: today,
    currentStreak: newStreak,
    maxStreak: Math.max(stats.maxStreak, newStreak),
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + (result.completed ? 1 : 0),
    totalWordsFound: stats.totalWordsFound + result.wordsFound,
    averageWordsFound: Math.round((stats.totalWordsFound + result.wordsFound) / (stats.gamesPlayed + 1) * 10) / 10,
    dailyHistory: [...stats.dailyHistory.slice(-29), dailyResult], // Keep last 30 days
  };

  saveDailyStats(newStats);
  return newStats;
};

// Generate shareable result text
export const generateShareText = (
  wordsFound: number,
  totalWords: number,
  hintsUsed: number,
  timeRemaining: number,
  isDaily: boolean = false
): string => {
  const dayNumber = getDayNumber();
  const header = isDaily ? `JUMBL #${dayNumber}` : 'JUMBL';

  // Create emoji grid (8 squares for 8 words)
  const found = Math.min(wordsFound, totalWords);
  const emptySquares = totalWords - found;

  // Use different colors based on performance
  let squares = '';
  if (wordsFound === totalWords) {
    // Perfect - all green
    squares = '🟩'.repeat(totalWords);
  } else if (wordsFound >= 6) {
    // Good - mostly green
    squares = '🟩'.repeat(found) + '⬜'.repeat(emptySquares);
  } else if (wordsFound >= 4) {
    // Medium - yellow and white
    squares = '🟨'.repeat(found) + '⬜'.repeat(emptySquares);
  } else {
    // Struggling - orange/red
    squares = '🟧'.repeat(found) + '⬜'.repeat(emptySquares);
  }

  // Format time remaining
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeStr = timeRemaining > 0
    ? `${minutes}:${seconds.toString().padStart(2, '0')} left`
    : 'Time up!';

  // Build the share text
  const lines = [
    `🔤 ${header}`,
    '',
    squares,
    `${wordsFound}/${totalWords} words | ${hintsUsed}/5 hints`,
  ];

  if (wordsFound === totalWords) {
    lines.push(`⏱️ ${timeStr}`);
  }

  lines.push('');
  lines.push('Play at: jumbl.game');

  return lines.join('\n');
};

// Check if streak is about to expire (for notifications)
export const isStreakAtRisk = (): boolean => {
  const stats = getDailyStats();
  if (stats.currentStreak === 0) return false;

  const today = getTodayDate();
  return stats.lastPlayedDate !== today && stats.currentStreak > 0;
};

// Get time until next daily challenge
export const getTimeUntilNextDaily = (): { hours: number; minutes: number; seconds: number } => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  const diff = tomorrow.getTime() - now.getTime();

  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
};
