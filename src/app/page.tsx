"use client";

import { GameProvider } from '@/utils/gameContext';
import LetterTiles from '@/components/LetterTiles';
import WordInput from '@/components/WordInput';
import GameTimer from '@/components/GameTimer';
import WordList from '@/components/WordList';
import GameControls from '@/components/GameControls';
import DifficultySelector from '@/components/DifficultySelector';
import GameSummary from '@/components/GameSummary';
import ChallengeMode from '@/components/ChallengeMode';
import { useGame } from '@/utils/gameContext';

// Wrapper component to access game context for conditional rendering
const GameContent = () => {
  const { gameCompleted, gameActive, isChallenge } = useGame();

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Game Area - 2/3 width on desktop */}
      <div className="md:col-span-2">
        <div className="p-4 md:p-8 bg-white rounded-xl shadow-lg">
          <div className="grid gap-8">
            {/* Challenge Timer removed since challenges are asynchronous */}
            
            <DifficultySelector />
            
            <GameTimer />
            
            <div className="border-t border-gray-200 pt-6">
              <LetterTiles />
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <WordList />
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <WordInput />
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <GameControls />
            </div>

            {/* Challenge Mode - only show when no game is active */}
            {!gameActive && !gameCompleted && !isChallenge && (
              <div className="border-t border-gray-200 pt-6">
                <ChallengeMode />
              </div>
            )}

            {gameCompleted && (
              <div className="border-t border-gray-200 pt-6">
                <GameSummary />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rules Section - 1/3 width on desktop */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-indigo-600 mb-4">How to Play</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Find 10 words of equal length within 5 minutes</li>
          <li>Type words using only the letters provided</li>
          <li>Press Enter or click Submit to check your word</li>
          <li>Use Shuffle to rearrange letters</li>
          <li>Click a letter tile to use a hint (5 per game)</li>
        </ul>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-700">Tips</h3>
          <p className="text-blue-600 text-sm">Look for common prefixes and suffixes. Try different letter combinations to discover more words.</p>
        </div>
        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
          <h3 className="text-lg font-semibold text-purple-700">Challenge Mode</h3>
          <p className="text-purple-600 text-sm">Generate a shared puzzle link for friends to play the same words. Compare scores to see who found the most words!</p>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <GameProvider>
      <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100">
        <div className="z-10 w-full max-w-6xl items-center justify-between">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center w-full mb-6 text-indigo-600 tracking-tight">
            Jumbl
          </h1>
          <p className="text-center text-indigo-500 max-w-2xl mx-auto mb-8">
            Find all words using the letters provided before time runs out!
          </p>
        </div>

        <GameContent />
          
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2024 Jumbl - A fun word game challenge!</p>
        </footer>
      </main>
    </GameProvider>
  );
}
