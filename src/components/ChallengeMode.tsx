"use client";

import React, { useState } from 'react';
import { useGame } from '@/utils/gameContext';
import { motion } from 'framer-motion';

const ChallengeMode: React.FC = () => {
  const { generateGameSeed, currentWordSet, isLoading, startGameWithSeed } = useGame();
  const [seedGenerated, setSeedGenerated] = useState<boolean>(false);
  const [challengeSeed, setChallengeSeed] = useState<string>("");
  const [challengeLink, setChallengeLink] = useState<string>("");
  const [challengeTime, setChallengeTime] = useState<number>(5); // 5 minutes (in minutes)
  const [seedInput, setSeedInput] = useState<string>("");
  const [seedError, setSeedError] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Generate a new challenge seed
  const generateChallenge = () => {
    if (!currentWordSet) {
      // If no current word set, we need to pre-generate one
      // (this is just a placeholder - actual implementation would need API call)
      fetch('/api/words')
        .then(response => response.json())
        .then(data => {
          const seed = btoa(JSON.stringify({
            words: data.words,
            letters: data.words.join('').split('').filter((c, i, a) => a.indexOf(c) === i).join(''),
            wordLength: data.words[0].length,
            gameDifficulty: "normal"
          }));
          setChallengeSeed(seed);
          setChallengeLink(`${window.location.origin}${window.location.pathname}?seed=${seed}&challenge=true`);
          setSeedGenerated(true);
        })
        .catch(console.error);
    } else {
      // If we have a current word set, use it to generate the seed
      const seed = generateGameSeed();
      setChallengeSeed(seed);
      setChallengeLink(`${window.location.origin}${window.location.pathname}?seed=${seed}&challenge=true`);
      setSeedGenerated(true);
    }
  };

  // Accept a challenge
  const acceptChallenge = async () => {
    if (!seedInput.trim()) {
      setSeedError("Please enter a valid challenge seed or URL");
      return;
    }

    try {
      // Check if input is a URL
      let seed = seedInput.trim();
      if (seed.includes('?seed=')) {
        // Extract seed from URL
        const url = new URL(seed);
        seed = url.searchParams.get('seed') || '';
      }

      if (!seed) {
        setSeedError("Invalid challenge format");
        return;
      }

      // Convert minutes to seconds for the game duration
      const success = await startGameWithSeed(seed, challengeTime * 60);
      if (!success) {
        setSeedError("Invalid seed or failed to load challenge");
      } else {
        setSeedError("");
        setSeedInput("");
      }
    } catch (error) {
      setSeedError("Invalid challenge format");
      console.error("Error accepting challenge:", error);
    }
  };

  // Copy challenge link to clipboard
  const copyLink = () => {
    navigator.clipboard.writeText(challengeLink)
      .then(() => alert('Challenge link copied! Share with your friend to play the same puzzle!'))
      .catch(console.error);
  };

  return (
    <div className="w-full bg-white rounded-xl p-6 shadow-md border border-indigo-100">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center text-xl font-bold text-indigo-600 mb-2"
      >
        <span>Challenge Mode</span>
        <span>{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {!seedGenerated ? (
            <div className="space-y-6">
              <p className="text-gray-700">
                Create a challenge link that you and friends can use to play the exact same game. 
                Perfect for comparing your skills on the same puzzle!
              </p>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Game duration (minutes):
                </label>
                <input
                  type="number"
                  value={challengeTime}
                  onChange={(e) => setChallengeTime(Math.max(1, Math.min(60, parseInt(e.target.value) || 5)))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-indigo-800 bg-white"
                  min="1"
                  max="60"
                />
              </div>

              <motion.button
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-md shadow-md"
                onClick={generateChallenge}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Generate Challenge Link"}
              </motion.button>

              <h3 className="text-lg font-semibold text-indigo-600 mb-2">Accept a Challenge</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-indigo-800 bg-white"
                  placeholder="Paste challenge link or seed here..."
                />
                {seedError && (
                  <p className="text-red-500 text-sm">{seedError}</p>
                )}
                <motion.button
                  className="w-full py-2 bg-green-600 text-white font-medium rounded-md shadow-md"
                  onClick={acceptChallenge}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Accept Challenge"}
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-700 mb-2">Challenge Ready!</h3>
                <p className="text-green-600 mb-3">
                  Share this link with your friends. You'll all play the exact same puzzle!
                </p>
                <div className="flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={challengeLink}
                    className="flex-1 px-4 py-2 bg-white border border-green-300 rounded-l-md focus:outline-none font-medium text-green-800"
                  />
                  <button
                    onClick={copyLink}
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-r-md hover:bg-green-700"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-gray-700 font-medium">Instructions:</p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Send the challenge link to your friends</li>
                  <li>Everyone can play at their own convenience</li>
                  <li>The game will have exactly the same words to find</li>
                  <li>Compare your scores to see who found the most words!</li>
                </ol>
              </div>

              <div className="flex flex-col space-y-2">
                <motion.button
                  className="py-2 bg-blue-600 text-white font-medium rounded-md shadow-md"
                  onClick={() => window.open(challengeLink, '_blank')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Challenge
                </motion.button>
                <motion.button
                  className="py-2 bg-gray-500 text-white font-medium rounded-md shadow-md"
                  onClick={() => {
                    setSeedGenerated(false);
                    setChallengeSeed("");
                    setChallengeLink("");
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ChallengeMode; 