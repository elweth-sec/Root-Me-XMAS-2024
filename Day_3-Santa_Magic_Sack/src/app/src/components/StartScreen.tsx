import React, { useState } from 'react';
import { GiftIcon } from 'lucide-react';

interface StartScreenProps {
  onStart: (playerName: string) => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim().length < 2) {
      setError('The name must contain at least 2 characters');
      return;
    }
    onStart(playerName.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <GiftIcon className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Catch the gifts
          </h1>
          <p className="text-gray-600">
            Try to beat Santa to get the flag!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="playerName" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your nickname
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your nickname ..."
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Start the game
          </button>
        </form>

        <div className="mt-8 text-sm text-gray-600">
          <h3 className="font-semibold mb-2">How to play:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Use the arrows ← → to move Santa Claus</li>
            <li>Catch falling gifts</li>
            <li>Each gift is worth 50 points</li>
            <li>You've got 20 seconds to get the best score!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}