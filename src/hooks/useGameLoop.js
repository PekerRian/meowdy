import { useEffect, useState, useRef } from "react";

const jumpSound = new Audio("/assets/jump.ogg");
const gameOverSound = new Audio("/assets/gameover.ogg");
const scoreSound = new Audio("/assets/score.ogg");

const GRAVITY = 0.6;
const FLAP_STRENGTH = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_INTERVAL = 2000;
const GAME_HEIGHT = 600;
const GAME_WIDTH = 400;
const Meow_WIDTH = 34;
const Meow_HEIGHT = 24;
const Meow_X = 50;

export default function useGameLoop(onGameOver, nftCount = 1) {
  const [MeowY, setMeowY] = useState(250);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [lives, setLives] = useState(nftCount > 0 ? nftCount : 1);
  const [isInvulnerable, setIsInvulnerable] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);

  const velocity = useRef(0);
  const animationFrameId = useRef(null);
  const gameRunning = useRef(true);

  useEffect(() => {
    setLives(nftCount > 0 ? nftCount : 1);
  }, [nftCount]);

  const generatePipe = () => {
    const height = Math.floor(Math.random() * 200) + 50;
    setPipes((prev) => [...prev, { x: GAME_WIDTH, height, scored: false }]);
  };

  const detectCollision = (MeowY, pipes) => {
    if (isInvulnerable) return false;

    const MeowTop = MeowY;
    const MeowBottom = MeowY + Meow_HEIGHT;
    const MeowLeft = Meow_X;
    const MeowRight = MeowLeft + Meow_WIDTH;

    for (const pipe of pipes) {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;

      const topPipeBottom = pipe.height;
      const bottomPipeTop = pipe.height + PIPE_GAP;

      const hitsPipeHorizontally = MeowRight > pipeLeft && MeowLeft < pipeRight;
      const hitsTopPipe = MeowTop < topPipeBottom;
      const hitsBottomPipe = MeowBottom > bottomPipeTop;

      if (hitsPipeHorizontally && (hitsTopPipe || hitsBottomPipe)) {
        return true;
      }
    }

    return MeowBottom >= GAME_HEIGHT;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameRunning.current && isGameStarted) generatePipe();
    }, PIPE_INTERVAL);
    return () => clearInterval(interval);
  }, [isGameStarted]);

  useEffect(() => {
    const gameLoop = () => {
      if (!gameRunning.current) return;

      if (isGameStarted) {
        velocity.current += GRAVITY;
        setMeowY((prev) => {
          const nextY = prev + velocity.current;
          return Math.max(0, Math.min(nextY, GAME_HEIGHT - Meow_HEIGHT));
        });

        setPipes((prev) => {
          return prev
            .map((pipe) => {
              const newX = pipe.x - 2;
              if (!pipe.scored && newX + PIPE_WIDTH < Meow_X) {
                pipe.scored = true;
                setScore((s) => s + 1);
                scoreSound.play();
              }
              return { ...pipe, x: newX };
            })
            .filter((pipe) => pipe.x + PIPE_WIDTH > 0);
        });

        if (detectCollision(MeowY, pipes)) {
          handleCollision();
        }
      }

      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [isGameStarted, MeowY, pipes, isInvulnerable]);

  const handleCollision = () => {
    setIsVibrating(true);
    setIsBlinking(true);
    setIsInvulnerable(true);
    gameOverSound.play();

    setTimeout(() => {
      setIsVibrating(false);
    }, 1000);

    setTimeout(() => {
      setIsBlinking(false);
      setIsInvulnerable(false);
    }, 3000);

    if (lives > 1) {
      setLives((prev) => prev - 1);
    } else {
      stopGame();
      onGameOver?.();
    }
  };

  const stopGame = () => {
    gameRunning.current = false;
    cancelAnimationFrame(animationFrameId.current);
  };

  const resetGame = () => {
    setMeowY(250);
    setPipes([]);
    setScore(0);
    setLives(nftCount > 0 ? nftCount : 1);
    velocity.current = 0;
    setIsGameStarted(false);
    setIsInvulnerable(false);
    setIsBlinking(false);
    setIsVibrating(false);
    gameRunning.current = true;
  };

  const jump = () => {
    if (gameRunning.current && isGameStarted) {
      velocity.current = FLAP_STRENGTH;
      jumpSound.play();
    }
  };

  const startGame = () => {
    setIsGameStarted(true);
  };

  return {
    MeowY,
    pipes,
    score,
    jump,
    stopGame,
    startGame,
    isGameStarted,
    resetGame,
    lives,
    isBlinking,
    isVibrating,
  };
}