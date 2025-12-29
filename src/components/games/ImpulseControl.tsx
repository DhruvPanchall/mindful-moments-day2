import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useScore } from '@/context/ScoreContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImpulseControlProps {
  onBack: () => void;
}

type ShapeType = 'circle' | 'square' | 'triangle';

interface Shape {
  type: ShapeType;
  color: string;
  x: number;
  y: number;
  id: number;
}

const COLORS = [
  { name: 'green', hsl: 'hsl(142, 71%, 45%)' },
  { name: 'red', hsl: 'hsl(0, 72%, 50%)' },
  { name: 'blue', hsl: 'hsl(200, 98%, 39%)' },
  { name: 'yellow', hsl: 'hsl(48, 96%, 53%)' },
];

const SHAPES: ShapeType[] = ['circle', 'square', 'triangle'];
const TARGET_SHAPE: ShapeType = 'circle';

const ROUND_DURATION = 2000;
const ROUNDS_PER_GAME = 15;

const ImpulseControl = ({ onBack }: ImpulseControlProps) => {
  const { addScore, subtractScore } = useScore();

  const [mode, setMode] = useState<'basic' | 'advanced'>('basic');
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const clickedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const roundStartedRef = useRef(false);

  const generateShapes = useCallback((isAdvanced: boolean): Shape[] => {
    if (!isAdvanced) {
      const hasTarget = Math.random() > 0.3;
      return [{
        id: 0,
        type: hasTarget
          ? TARGET_SHAPE
          : SHAPES[Math.floor(Math.random() * SHAPES.length)],
        color: hasTarget
          ? COLORS[0].hsl
          : COLORS[Math.floor(Math.random() * (COLORS.length - 1)) + 1].hsl,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
      }];
    }

    const count = 3 + Math.floor(Math.random() * 4);
    const hasTarget = Math.random() > 0.35;

    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      type: hasTarget && i === 0
        ? TARGET_SHAPE
        : SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: hasTarget && i === 0
        ? COLORS[0].hsl
        : COLORS[Math.floor(Math.random() * COLORS.length)].hsl,
      x: 15 + Math.random() * 70,
      y: 15 + Math.random() * 70,
    }));
  }, []);

  const hasTarget = (list: Shape[]) =>
    list.some(s => s.type === TARGET_SHAPE && s.color === COLORS[0].hsl);

  const startRound = useCallback(() => {
    if (roundStartedRef.current) return;
    roundStartedRef.current = true;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const newShapes = generateShapes(mode === 'advanced');
    setShapes(newShapes);
    clickedRef.current = false;
    setFeedback(null);

    timeoutRef.current = setTimeout(() => {
      if (!clickedRef.current) {
        if (hasTarget(newShapes)) {
          setWrong(w => w + 1);
          subtractScore(5);
          setFeedback('wrong');
        } else {
          setCorrect(c => c + 1);
          addScore(10);
          setFeedback('correct');
        }
      }

      setTimeout(() => {
        roundStartedRef.current = false;
        setRound(r => {
          const next = r + 1;
          if (next >= ROUNDS_PER_GAME) {
            setIsPlaying(false);
            setGameOver(true);
            return r;
          }
          return next;
        });
      }, 500);
    }, ROUND_DURATION);
  }, [mode, generateShapes, addScore, subtractScore]);

  useEffect(() => {
    if (isPlaying && !gameOver) startRound();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [round, isPlaying, gameOver, startRound]);

  const handleShapeClick = (shape: Shape) => {
    if (!isPlaying || clickedRef.current) return;
    clickedRef.current = true;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const isTarget =
      shape.type === TARGET_SHAPE && shape.color === COLORS[0].hsl;

    if (isTarget) {
      setCorrect(c => c + 1);
      addScore(10);
      setFeedback('correct');
    } else {
      setWrong(w => w + 1);
      subtractScore(5);
      setFeedback('wrong');
    }

    setTimeout(() => {
      roundStartedRef.current = false;
      setRound(r => {
        const next = r + 1;
        if (next >= ROUNDS_PER_GAME) {
          setIsPlaying(false);
          setGameOver(true);
          return r;
        }
        return next;
      });
    }, 500);
  };

  const handleStart = () => {
    setIsPlaying(true);
    setGameOver(false);
    setRound(0);
    setCorrect(0);
    setWrong(0);
    setFeedback(null);
  };

  const renderShape = (s: Shape) => {
    if (s.type === 'triangle') {
      return (
        <div
          key={s.id}
          onClick={() => handleShapeClick(s)}
          className="absolute cursor-pointer"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            transform: 'translate(-50%, -50%)',
            width: 0,
            height: 0,
            borderLeft: '32px solid transparent',
            borderRight: '32px solid transparent',
            borderBottom: `56px solid ${s.color}`,
          }}
        />
      );
    }

    return (
      <div
        key={s.id}
        onClick={() => handleShapeClick(s)}
        className={`absolute w-16 h-16 cursor-pointer transition-transform hover:scale-110 ${
          s.type === 'circle' ? 'rounded-full' : 'rounded-lg'
        }`}
        style={{
          backgroundColor: s.color,
          left: `${s.x}%`,
          top: `${s.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {isPlaying && (
            <span className="text-sm text-muted-foreground">
              Round {round + 1}/{ROUNDS_PER_GAME}
            </span>
          )}
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Impulse Control
          </h2>

          {/* ✅ HINT TEXT */}
          <p className="text-sm text-muted-foreground">
            Hint: Click only the{' '}
            <span className="font-semibold text-green-500">
              GREEN CIRCLE
            </span>
            . Ignore all other shapes.
          </p>
        </div>

        {!isPlaying && !gameOver && (
          <>
            <Tabs value={mode} onValueChange={v => setMode(v as any)} className="mb-4">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button onClick={handleStart} size="lg" className="w-full">
              Start Game
            </Button>
          </>
        )}

        {isPlaying && (
          <div className="relative bg-card rounded-2xl shadow-md mt-6 h-[320px] overflow-hidden">
            {shapes.map(renderShape)}

            {feedback && (
              <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold pointer-events-none">
                {feedback === 'correct' ? '✓' : '✗'}
              </div>
            )}
          </div>
        )}

        {gameOver && (
          <div className="text-center bg-card rounded-2xl p-6 mt-6 shadow-md">
            <h3 className="text-xl font-bold mb-2">Game Over</h3>
            <p>Correct: {correct}</p>
            <p>Wrong: {wrong}</p>
            <Button onClick={handleStart} className="mt-4 gap-2">
              <RotateCcw className="h-4 w-4" />
              Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImpulseControl;
