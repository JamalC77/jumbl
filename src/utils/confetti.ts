import confetti from 'canvas-confetti';

// Celebration confetti for finding a word
export const celebrateWordFound = () => {
  // Quick burst from the center
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.6 },
    colors: ['#a855f7', '#6366f1', '#22d3ee', '#10b981', '#f59e0b'],
    ticks: 150,
    gravity: 1.2,
    scalar: 0.9,
  });
};

// Big celebration for winning the game
export const celebrateWin = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const interval: NodeJS.Timeout = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Confetti from both sides
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#a855f7', '#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ec4899'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#a855f7', '#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ec4899'],
    });
  }, 250);
};

// Streak celebration (smaller burst)
export const celebrateStreak = (streakCount: number) => {
  const particleCount = Math.min(streakCount * 20, 100);

  confetti({
    particleCount,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#f59e0b', '#ef4444', '#f97316'],
    ticks: 100,
  });
};
