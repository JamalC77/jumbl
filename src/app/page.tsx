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
import { motion, AnimatePresence } from 'framer-motion';

// Wrapper component to access game context for conditional rendering
const GameContent = () => {
  const { gameCompleted, gameActive, isChallenge } = useGame();
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Game Card */}
      <motion.div
        className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header with difficulty and timer */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
          <div className="flex justify-between items-center">
            <DifficultySelector />
            <GameTimer />
          </div>
        </div>

        {/* Game content */}
        <div className="p-6 space-y-8">
          {/* Letter tiles - HERO section */}
          <section>
            <LetterTiles />
          </section>

          {/* Word input controls */}
          <section>
            <WordInput />
          </section>

          {/* Game controls (Start/Give Up/Share) */}
          <section>
            <GameControls />
          </section>

          {/* Word list with progress */}
          <section>
            <WordList />
          </section>

          {/* Challenge Mode - only show when no game is active */}
          <AnimatePresence>
            {!gameActive && !gameCompleted && !isChallenge && (
              <motion.section
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <ChallengeMode />
              </motion.section>
            )}
          </AnimatePresence>

          {/* Game Summary - only show when game is completed */}
          <AnimatePresence>
            {gameCompleted && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GameSummary />
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* How to Play - Collapsible */}
      <motion.div
        className="mt-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => setShowRules(!showRules)}
          className="w-full p-4 flex justify-between items-center text-indigo-700 hover:bg-indigo-50 transition-colors"
        >
          <span className="font-bold">How to Play</span>
          <motion.span
            animate={{ rotate: showRules ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ▼
          </motion.span>
        </button>

        <AnimatePresence>
          {showRules && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-4"
            >
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">●</span>
                  <span>Find 8 words using the letters provided within 5 minutes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">●</span>
                  <span>Click the letter tiles to build your word, then hit Submit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">●</span>
                  <span>The first letter of each word is shown as a hint</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">●</span>
                  <span>Right-click a tile to use one of your 5 hints</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5">●</span>
                  <span>Use Shuffle to rearrange letters for a fresh perspective</span>
                </li>
              </ul>

              <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <p className="text-purple-700 text-sm font-medium">
                  Challenge friends by sharing your puzzle link after completing a game!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default function Home() {
  return (
    <GameProvider>
      <main className="min-h-screen bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400 p-4 md:p-6">
        {/* Header */}
        <header className="text-center mb-6">
          <motion.h1
            className="text-4xl md:text-5xl font-black text-white drop-shadow-lg tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Jumbl
          </motion.h1>
          <motion.p
            className="text-white/90 text-sm md:text-base mt-1 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Find 8 words before time runs out!
          </motion.p>
        </header>

        <GameContent />

        {/* Footer */}
        <footer className="mt-6 text-center">
          <p className="text-white/60 text-xs">
            © 2024 Jumbl
          </p>
        </footer>
      </main>
    </GameProvider>
  );
}
