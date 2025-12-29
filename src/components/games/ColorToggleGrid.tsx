import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useScore } from '@/context/ScoreContext';

interface ColorToggleGridProps {
  onBack: () => void;
}

interface LevelConfig {
  gridSize: number;
  timeLimit: number;
}

const LEVEL_CONFIGS: LevelConfig[] = [
  { gridSize: 3, timeLimit: 15 },
  { gridSize: 4, timeLimit: 20 },
  { gridSize: 5, timeLimit: 25 },
  { gridSize: 6, timeLimit: 30 },
  { gridSize: 6, timeLimit: 20 },
];

const COLOR_PAIRS = [
  { target: { name: 'RED', hsl: 'hsl(0, 72%, 50%)' }, goal: { name: 'GREEN', hsl: 'hsl(142, 71%, 45%)' } },
  { target: { name: 'BLUE', hsl: 'hsl(200, 98%, 39%)' }, goal: { name: 'YELLOW', hsl: 'hsl(48, 96%, 53%)' } },
  { target: { name: 'PURPLE', hsl: 'hsl(270, 60%, 50%)' }, goal: { name: 'ORANGE', hsl: 'hsl(30, 90%, 50%)' } },
  { target: { name: 'TEAL', hsl: 'hsl(180, 60%, 40%)' }, goal: { name: 'PINK', hsl: 'hsl(330, 70%, 60%)' } },
];

const ColorToggleGrid = ({ onBack }: ColorToggleGridProps) => {
  const { addScore, subtractScore } = useScore();
  const [level, setLevel] = useState(0);
  const [grid, setGrid] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [shakeCell, setShakeCell] = useState<number | null>(null);
  const [colorPair, setColorPair] = useState(COLOR_PAIRS[0]);
  const [startTime, setStartTime] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const initGrid = useCallback((config: LevelConfig) => {
    const totalCells = config.gridSize * config.gridSize;
    const minTargets = Math.ceil(totalCells * 0.4);
    const maxTargets = Math.floor(totalCells * 0.7);
    const numTargets = minTargets + Math.floor(Math.random() * (maxTargets - minTargets + 1));

    const newGrid = Array(totalCells).fill(false);
    const indices = Array.from({ length: totalCells }, (_, i) => i);

    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    for (let i = 0; i < numTargets; i++) {
      newGrid[indices[i]] = true;
    }

    return newGrid;
  }, []);

  const startLevel = useCallback((levelIndex: number) => {
    const config = LEVEL_CONFIGS[Math.min(levelIndex, LEVEL_CONFIGS.length - 1)];
    const newColorPair = COLOR_PAIRS[levelIndex % COLOR_PAIRS.length];

    setColorPair(newColorPair);
    setGrid(initGrid(config));
    setTimeLeft(config.timeLimit);
    setIsPlaying(true);
    setGameOver(false);
    setFeedback(null);
    setStartTime(Date.now());
  }, [initGrid]);

  const handleStart = () => {
    setLevel(0);
    startLevel(0);
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          setGameOver(true);
          setFeedback('Time Over!');
          subtractScore(10);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, gameOver, subtractScore]);

  const checkWin = useCallback((currentGrid: boolean[]) => {
    return currentGrid.every(cell => !cell);
  }, []);

  const handleCellClick = (index: number) => {
    if (!isPlaying || gameOver) return;

    if (!grid[index]) {
      setShakeCell(index);
      subtractScore(2);
      setTimeout(() => setShakeCell(null), 400);
      return;
    }

    const newGrid = [...grid];
    newGrid[index] = false;
    setGrid(newGrid);

    if (checkWin(newGrid)) {
      const elapsed = (Date.now() - startTime) / 1000;
      const config = LEVEL_CONFIGS[Math.min(level, LEVEL_CONFIGS.length - 1)];
      const timeRatio = elapsed / config.timeLimit;

      let rating: string;
      let points: number;

      if (timeRatio < 0.4) {
        rating = 'Excellent!';
        points = 50 + (level + 1) * 15;
      } else if (timeRatio < 0.7) {
        rating = 'Very Good!';
        points = 30 + (level + 1) * 10;
      } else {
        rating = 'Good!';
        points = 20 + (level + 1) * 5;
      }

      addScore(points);
      setFeedback(`${rating} +${points}`);
      setIsPlaying(false);
      setGameOver(true);
    }
  };

  const handleNextLevel = () => {
    const nextLevel = level + 1;
    setLevel(nextLevel);
    startLevel(nextLevel);
  };

  const isWin = feedback && !feedback.includes('Time Over');
  const config = LEVEL_CONFIGS[Math.min(level, LEVEL_CONFIGS.length - 1)];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Level {level + 1}</span>
            {isPlaying && (
              <span className={`text-lg font-semibold ${timeLeft <= 5 ? 'text-destructive' : 'text-foreground'}`}>
                {timeLeft}s
              </span>
            )}
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Color Toggle</h2>
          {(isPlaying || (!isPlaying && !gameOver)) && (
            <p className="text-muted-foreground">
              Make all the{' '}
              <span className="font-bold" style={{ color: colorPair.target.hsl }}>
                {colorPair.target.name}
              </span>{' '}
              cells{' '}
              <span className="font-bold" style={{ color: colorPair.goal.hsl }}>
                {colorPair.goal.name}
              </span>
            </p>
          )}
        </div>

        {!isPlaying && !gameOver && (
          <div className="text-center">
            <Button onClick={handleStart} size="lg">
              Start Game
            </Button>
          </div>
        )}

        {(isPlaying || gameOver) && (
          <div className="bg-card rounded-2xl p-4 shadow-md mb-6">
            <div
              className="grid gap-3 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
                maxWidth: `${config.gridSize * 90}px`, // 👈 ONLY CHANGE (bigger cells)
              }}
            >
              {grid.map((isTarget, i) => (
                <button
                  key={i}
                  onClick={() => handleCellClick(i)}
                  disabled={!isPlaying}
                  className={`
                    aspect-square rounded-lg transition-all duration-150
                    ${shakeCell === i ? 'animate-[shake_0.4s_ease-in-out]' : ''}
                    ${isPlaying ? 'cursor-pointer hover:scale-95' : 'cursor-default'}
                  `}
                  style={{
                    backgroundColor: isTarget ? colorPair.target.hsl : colorPair.goal.hsl,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {gameOver && (
          <div className={`text-center rounded-2xl p-6 ${isWin ? 'bg-primary/10' : 'bg-destructive/10'}`}>
            <h3 className={`text-xl font-bold mb-4 ${isWin ? 'text-primary' : 'text-destructive'}`}>
              {feedback}
            </h3>
            {isWin ? (
              <Button onClick={handleNextLevel}>Next Level</Button>
            ) : (
              <Button onClick={handleStart} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorToggleGrid;
