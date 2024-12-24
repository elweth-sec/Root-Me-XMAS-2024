import { useEffect, useRef, useState } from 'react';
import { Gift } from '../types';
import { GiftIcon } from 'lucide-react';
import { submitScore } from '../utils/scoreUtils';

interface GameProps {
  playerName: string;
  onGameOver: (score: number) => void;
}

const SANTA_WIDTH = 120;
const SANTA_HEIGHT = 160;
const GIFT_SIZE = 50;
const GAME_DURATION = 20;
const MOVE_SPEED = 300;

interface GameOverOverlayProps {
  score: number;
  flag?: string | null;
}

const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ score, flag }) => {
  return (
    <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center z-50 text-white">
      <h1 className="text-4xl font-bold">Game Over</h1>
      <p className="text-2xl mt-4">Your Score: {score}</p>
      {flag && (
        <div className="mt-6 bg-green-500 p-4 rounded-lg">
          <p className="text-xl font-bold">🎉 New Record!</p>
          <p>Your Flag: {flag}</p>
        </div>
      )}
    </div>
  );
};

export default function Game({ playerName, onGameOver }: GameProps) {
  const [score, setScore] = useState(0);
  const [santaX, setSantaX] = useState(window.innerWidth / 2);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [flag, setFlag] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number | null>(null);
  const keysPressed = useRef({ ArrowLeft: false, ArrowRight: false });
  const gameEnded = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        keysPressed.current[e.key] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        keysPressed.current[e.key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const createGift = () => {
      if (gameEnded.current) return;
      const newGift: Gift = {
        x: Math.random() * (window.innerWidth - GIFT_SIZE),
        y: -GIFT_SIZE,
        speed: 2 + Math.random() * 3,
      };
      setGifts((prev) => [...prev, newGift]);
    };

    const giftInterval = setInterval(createGift, 1000);
    return () => clearInterval(giftInterval);
  }, []);

  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      if (gameEnded.current) return;

      if (!lastTimeRef.current) lastTimeRef.current = timestamp;

      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setSantaX((prevX) => {
        let newX = prevX;

        if (keysPressed.current.ArrowLeft) {
          newX = Math.max(0, prevX - MOVE_SPEED * delta);
        }
        if (keysPressed.current.ArrowRight) {
          newX = Math.min(window.innerWidth - SANTA_WIDTH, prevX + MOVE_SPEED * delta);
        }

        return newX;
      });

      setGifts((prevGifts) => {
        const newGifts = prevGifts
          .map((gift) => ({
            ...gift,
            y: gift.y + gift.speed,
          }))
          .filter((gift) => gift.y < window.innerHeight);

        newGifts.forEach((gift) => {
          if (
            gift.y + GIFT_SIZE > window.innerHeight - SANTA_HEIGHT &&
            gift.x + GIFT_SIZE > santaX &&
            gift.x < santaX + SANTA_WIDTH
          ) {
            setScore((s) => {
              const encoded = atob('ODIzNzQ2OS04MjM3NDE5');
              const [left, right] = encoded.split('-').map(Number);
              const result = left - right;

              const newScore = s + result;
              scoreRef.current = newScore;
              return newScore;
            });
            gift.y = window.innerHeight + GIFT_SIZE;
          }
        });

        return newGifts;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(gameLoopRef.current!);
  }, [santaX]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleGameEnd = async () => {
    gameEnded.current = true;
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    const finalScore = scoreRef.current;
    setShowOverlay(true);

    try {
      const response = await submitScore(playerName, finalScore);

      if (response.isNewRecord && response.flag) {
        setFlag(response.flag);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }

    setTimeout(() => {
      setShowOverlay(false);
      onGameOver(finalScore);
    }, 5000);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-blue-900 to-blue-600 overflow-hidden">
      <div className="absolute top-4 left-4 bg-white/80 rounded-lg p-2 z-10">
        <p className="text-xl font-bold">Score: {score}</p>
        <p className="text-lg">Time: {Math.ceil(timeLeft)}s</p>
      </div>

      {showOverlay && <GameOverOverlay score={score} flag={flag} />}

      <div
        className="absolute bottom-0"
        style={{
          left: santaX,
          width: SANTA_WIDTH,
          height: SANTA_HEIGHT,
        }}
      >
        <img
          src="/images/hotte.png"
          alt="Santa"
          className="w-full h-full object-contain"
        />
      </div>

      {gifts.map((gift, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            left: gift.x,
            top: gift.y,
            width: GIFT_SIZE,
            height: GIFT_SIZE,
          }}
        >
          <GiftIcon className="w-full h-full text-red-500" />
        </div>
      ))}
    </div>
  );
}
