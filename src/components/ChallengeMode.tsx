"use client";

import React, { useState } from 'react';
import { useGame } from '@/utils/gameContext';
import { motion } from 'framer-motion';

const ChallengeMode: React.FC = () => {
  const { generateGameSeed, currentWordSet, isLoading, startGameWithSeed } = useGame();
  const [seedGenerated, setSeedGenerated] = useState<boolean>(false);
  const [challengeSeed, setChallengeSeed] = useState<string>("");
  const [challengeLink, setChallengeLink] = useState<string>("");
  const [challengeTime, setChallengeTime] = useState<number>(300); // 5 minutes
  const [seedInput, setSeedInput] = useState<string>("");
  const [seedError, setSeedError] = useState<string>("");
  const [countdownTime, setCountdownTime] = useState<number>(5); // 5 minute countdown

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
          setChallengeLink(`${window.location.origin}${window.location.pathname}?seed=${seed}&challenge=true&time=${Date.now() + (countdownTime * 60 * 1000)}`);
          setSeedGenerated(true);
        })
        .catch(console.error);
    } else {
      // If we have a current word set, use it to generate the seed
      const seed = generateGameSeed();
      setChallengeSeed(seed);
      setChallengeLink(`${window.location.origin}${window.location.pathname}?seed=${seed}&challenge=true&time=${Date.now() + (countdownTime * 60 * 1000)}`);
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

      const success = await startGameWithSeed(seed, challengeTime);
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
      .then(() => alert('Challenge link copied! Share with your friend to start at the same time!'))
      .catch(console.error);
  };

  // Common input class for consistent styling
  const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-indigo-800 bg-white";

  return (
    <div className="w-full bg-white rounded-xl p-6 shadow-md border border-indigo-100">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">Head-to-Head Challenge</h2>

      {!seedGenerated ? (
        <div className="space-y-6">
          <p className="text-gray-700">
            Create a challenge link that you and a friend can use to play the exact same game at the same time. 
            Perfect for competitive play!
          </p>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Time window to start the challenge (minutes):
            </label>
            <input
              type="number"
              value={countdownTime}
              onChange={(e) => setCountdownTime(Math.max(1, Math.min(60, parseInt(e.target.value) || 5)))}
              className={inputClass}
              min="1"
              max="60"
            />
            <p className="text-sm text-gray-500">
              This is how long the challenge link will be valid for. Both players need to start within this window.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Game duration (seconds):
            </label>
            <input
              type="number"
              value={challengeTime}
              onChange={(e) => setChallengeTime(Math.max(60, Math.min(3600, parseInt(e.target.value) || 300)))}
              className={inputClass}
              min="60"
              max="3600"
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

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-indigo-600 mb-2">Accept a Challenge</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value)}
                className={inputClass}
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
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-700 mb-2">Challenge Ready!</h3>
            <p className="text-green-600 mb-3">
              Share this link with your friend. You both need to start the game within {countdownTime} minutes of each other.
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
              <li>Send the challenge link to your opponent</li>
              <li>Both players should click the link at approximately the same time</li>
              <li>The game will start with exactly the same words to find</li>
              <li>First person to find the most words wins!</li>
            </ol>
          </div>

          <div className="flex space-x-3">
            <motion.button
              className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-md shadow-md"
              onClick={() => window.open(challengeLink, '_blank')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Challenge
            </motion.button>
            <motion.button
              className="flex-1 py-2 bg-gray-500 text-white font-medium rounded-md shadow-md"
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
    </div>
  );
};

export default ChallengeMode; 