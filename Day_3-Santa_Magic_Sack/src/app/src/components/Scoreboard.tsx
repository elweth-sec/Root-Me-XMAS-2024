import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { fetchTopScores } from '../utils/scoreUtils';
import '../index.css';

interface ScoreboardProps {
  onPlayAgain: () => void;
}

interface Score {
  playerName: string;
  score: number;
  timestamp: number;
}

export default function Scoreboard({ onPlayAgain }: ScoreboardProps) {
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    const loadScores = async () => {
      const topScores = await fetchTopScores();
      setScores(topScores);
    };
    loadScores();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-600 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col h-full max-h-[90vh]">
        <div className="flex items-center justify-center p-6 border-b">
          <Trophy className="w-12 h-12 text-yellow-500 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">High Scores</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {scores.map((score, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg ${
                index === 0 ? 'bg-yellow-100' :
                index === 1 ? 'bg-gray-100' :
                index === 2 ? 'bg-orange-100' : 'bg-white'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-4 w-8">{index + 1}</span>
                <div>
                  <span className="text-xl">{score.playerName}</span>
                  <div className="text-sm text-gray-500">
                    {new Date(score.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <span className="text-xl font-bold">{score.score}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onPlayAgain}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
