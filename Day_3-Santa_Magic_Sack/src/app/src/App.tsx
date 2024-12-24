import { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import Game from './components/Game';
import Scoreboard from './components/Scoreboard';
import { Player } from './types';

const STORAGE_KEY = 'christmasGameScores';

function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [scores, setScores] = useState<Player[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  }, [scores]);

  const handleStartGame = (playerName: string) => {
    setCurrentPlayer(playerName);
    setGameState('playing');
  };

  const handleGameOver = (score: number) => {
    setScores(prev => [...prev, { name: currentPlayer, score }]);
    setGameState('end');
  };

  const handlePlayAgain = () => {
    setGameState('start');
  };

  return (
    <div className="w-full h-screen">
      {gameState === 'start' && (
        <StartScreen onStart={handleStartGame} />
      )}
      {gameState === 'playing' && (
        <Game 
          playerName={currentPlayer}
          onGameOver={handleGameOver}
        />
      )}
      {gameState === 'end' && (
        <Scoreboard 
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}

export default App;