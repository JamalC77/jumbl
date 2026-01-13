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
import DailyChallenge from '@/components/DailyChallenge';
import StatsModal from '@/components/StatsModal';
import { useGame } from '@/utils/gameContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDayNumber } from '@/utils/dailyChallenge';

// Wrapper component to access game context for conditional rendering
const GameContent = () => {
  const { gameCompleted, gameActive, isChallenge, isDailyChallenge } = useGame();
  const [showRules, setShowRules] = useState(false);
  const [showStats, setShowStats] = useState(false);

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
            <div className="flex items-center gap-3">
              <DifficultySelector />
              {/* Stats button */}
              <button
                onClick={() => setShowStats(true)}
                className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                title="View Stats"
              >
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
            </div>
            <GameTimer />
          </div>

          {/* Daily challenge badge */}
          {isDailyChallenge && gameActive && (
            <motion.div
              className="mt-2 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                📅 Daily Challenge #{getDayNumber()}
              </span>
            </motion.div>
          )}
        </div>

        {/* Game content */}
        <div className="p-6 space-y-8">
          {/* Daily Challenge - show prominently when not in game */}
          <AnimatePresence>
            {!gameActive && !gameCompleted && (
              <motion.section
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
              >
                <DailyChallenge onOpenStats={() => setShowStats(true)} />
              </motion.section>
            )}
          </AnimatePresence>

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

          {/* Challenge Mode - only show when no game is active and not showing daily */}
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

              <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <p className="text-amber-700 text-sm font-medium">
                  🔥 Play the Daily Challenge to build your streak and compete with friends!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats Modal */}
      <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} />
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
