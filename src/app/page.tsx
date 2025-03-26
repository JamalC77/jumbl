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
import { useState } from 'react';

// Wrapper component to access game context for conditional rendering
const GameContent = () => {
  const { gameCompleted, gameActive, isChallenge } = useGame();
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Game Area */}
      <div className="p-4 bg-white rounded-xl shadow-lg mb-4">
        <div className="grid gap-4">
          {/* More compact header section */}
          <div className="flex flex-wrap justify-between items-center">
            <DifficultySelector />
            <GameTimer />
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <WordList />
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <LetterTiles />
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <WordInput />
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <GameControls />
          </div>

          {/* Challenge Mode - only show when no game is active */}
          {!gameActive && !gameCompleted && !isChallenge && (
            <div className="border-t border-gray-200 pt-4">
              <ChallengeMode />
            </div>
          )}

          {gameCompleted && (
            <div className="border-t border-gray-200 pt-4">
              <GameSummary />
            </div>
          )}
        </div>
      </div>

      {/* Rules Section - Collapsible on mobile */}
      <div className="bg-white p-4 rounded-xl shadow-lg">
        <button 
          onClick={() => setShowRules(!showRules)}
          className="w-full flex justify-between items-center text-xl font-bold text-indigo-600 mb-2"
        >
          <span>How to Play</span>
          <span>{showRules ? '▲' : '▼'}</span>
        </button>
        
        {showRules && (
          <>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Find 8 words of equal length within 5 minutes</li>
              <li>Type words using only the letters provided</li>
              <li>Press Enter or click Submit to check your word</li>
              <li>Use Shuffle to rearrange letters</li>
              <li>Click a letter tile to use a hint (5 per game)</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-md font-semibold text-blue-700">Tips</h3>
              <p className="text-blue-600 text-xs">Look for common prefixes and suffixes. Try different letter combinations to discover more words.</p>
            </div>
            <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
              <h3 className="text-md font-semibold text-purple-700">Challenge Mode</h3>
              <p className="text-purple-600 text-xs">Generate a shared puzzle link for friends to play the same words. Compare scores to see who found the most words!</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <GameProvider>
      <main className="flex min-h-screen flex-col items-center p-3 bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100">
        <div className="z-10 w-full max-w-6xl items-center justify-between mb-4">
          <h1 className="text-3xl font-extrabold text-center w-full mb-2 text-indigo-600 tracking-tight">
            Jumbl
          </h1>
          <p className="text-center text-indigo-500 text-sm max-w-2xl mx-auto">
            Find 8 words using the letters provided before time runs out!
          </p>
        </div>

        <GameContent />
          
        <footer className="mt-6 text-center text-gray-500 text-xs">
          <p>© 2024 Jumbl - A fun word game challenge!</p>
        </footer>
      </main>
    </GameProvider>
  );
}
