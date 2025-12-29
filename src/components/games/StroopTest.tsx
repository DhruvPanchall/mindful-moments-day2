import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useScore } from '@/context/ScoreContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StroopTestProps {
  onBack: () => void;
}

const COLORS = [
  { name: 'RED', hsl: 'hsl(0, 72%, 50%)' },
  { name: 'BLUE', hsl: 'hsl(200, 98%, 39%)' },
  { name: 'GREEN', hsl: 'hsl(142, 71%, 45%)' },
  { name: 'YELLOW', hsl: 'hsl(48, 96%, 53%)' },
  { name: 'BLACK', hsl: 'hsl(0, 0%, 10%)' },
];

const SHAPES = ['circle', 'square', 'triangle'] as const;
type ShapeType = typeof SHAPES[number];

const GAME_DURATION = 60;

const StroopTest = ({ onBack }: StroopTestProps) => {
  const { addScore, subtractScore } = useScore();

  const [mode, setMode] = useState<'word' | 'shape'>('word');

  // WORD MODE STATE (unchanged)
  const [wordColor, setWordColor] = useState(COLORS[0]);
  const [displayWord, setDisplayWord] = useState(COLORS[1].name);

  // SHAPE MODE STATE (updated)
  const [borderColor, setBorderColor] = useState(COLORS[0]);
  const [shapeFillColor, setShapeFillColor] = useState(COLORS[1]);
  const [innerWord, setInnerWord] = useState(COLORS[2].name);
  const [currentShape, setCurrentShape] = useState<ShapeType>('circle');

  // GAME STATE
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  /* ---------------- WORD MODE LOGIC (UNCHANGED) ---------------- */

  const generateNewWord = useCallback(() => {
    const colorIdx = Math.floor(Math.random() * COLORS.length);
    let wordIdx = Math.floor(Math.random() * COLORS.length);

    if (Math.random() > 0.5) {
      while (wordIdx === colorIdx) {
        wordIdx = Math.floor(Math.random() * COLORS.length);
      }
    }

    setWordColor(COLORS[colorIdx]);
    setDisplayWord(COLORS[wordIdx].name);
  }, []);

  /* ---------------- SHAPE MODE LOGIC (FIXED) ---------------- */

  const generateNewShape = useCallback(() => {
    // BORDER = correct answer
    const borderIdx = Math.floor(Math.random() * COLORS.length);
    const border = COLORS[borderIdx];

    // FILL = random noise
    let fillIdx = Math.floor(Math.random() * COLORS.length);
    if (Math.random() > 0.5) {
      while (fillIdx === borderIdx) {
        fillIdx = Math.floor(Math.random() * COLORS.length);
      }
    }

    // WORD = independent conflict
    let wordIdx = Math.floor(Math.random() * COLORS.length);
    if (Math.random() > 0.5) {
      while (wordIdx === borderIdx) {
        wordIdx = Math.floor(Math.random() * COLORS.length);
      }
    }

    const shapeIdx = Math.floor(Math.random() * SHAPES.length);

    setBorderColor(border);
    setShapeFillColor(COLORS[fillIdx]);
    setInnerWord(COLORS[wordIdx].name);
    setCurrentShape(SHAPES[shapeIdx]);
  }, []);

  /* ---------------- GAME FLOW ---------------- */

  const handleStart = () => {
    setIsPlaying(true);
    setTimeLeft(GAME_DURATION);
    setCorrect(0);
    setWrong(0);
    setGameOver(false);

    mode === 'word' ? generateNewWord() : generateNewShape();
  };

  const handleAnswer = (colorName: string) => {
    if (!isPlaying || gameOver) return;

    const isCorrect =
      mode === 'word'
        ? colorName === wordColor.name
        : colorName === borderColor.name;

    if (isCorrect) {
      setCorrect(c => c + 1);
      addScore(10);
    } else {
      setWrong(w => w + 1);
      subtractScore(5);
    }

    mode === 'word' ? generateNewWord() : generateNewShape();
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsPlaying(false);
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, gameOver]);

  /* ---------------- SHAPE RENDER (EXACT LOOK) ---------------- */

  const renderShape = () => {
    if (currentShape === 'triangle') {
      return (
        <div className="relative w-40 h-40 mx-auto">
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '80px solid transparent',
              borderRight: '80px solid transparent',
              borderBottom: `140px solid ${borderColor.hsl}`,
            }}
          />
          <div
            className="absolute"
            style={{
              top: '18px',
              left: '16px',
              width: 0,
              height: 0,
              borderLeft: '64px solid transparent',
              borderRight: '64px solid transparent',
              borderBottom: `110px solid ${shapeFillColor.hsl}`,
            }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
            {innerWord}
          </span>
        </div>
      );
    }

    return (
      <div
        className={`w-40 h-40 mx-auto flex items-center justify-center border-[10px] ${
          currentShape === 'circle' ? 'rounded-full' : 'rounded-xl'
        }`}
        style={{
          borderColor: borderColor.hsl,
          backgroundColor: shapeFillColor.hsl,
        }}
      >
        <span className="text-xl font-bold text-white">
          {innerWord}
        </span>
      </div>
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="text-lg font-semibold">
            {isPlaying && `${timeLeft}s`}
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Stroop Test</h2>

          {!isPlaying && !gameOver && (
            <Tabs value={mode} onValueChange={v => setMode(v as any)}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="word">Word Color</TabsTrigger>
                <TabsTrigger value="shape">Shape Border</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <p className="text-muted-foreground mt-2">
            {mode === 'word'
              ? 'Select the COLOR of the text, not what it says!'
              : 'Click the button that matches the BORDER COLOR of the shape, not the word inside!'}
          </p>
        </div>

        {!isPlaying && !gameOver && (
          <div className="text-center">
            <Button onClick={handleStart} size="lg">
              Start Game
            </Button>
          </div>
        )}

        {isPlaying && (
          <>
            <div className="bg-card rounded-2xl p-12 mb-8 shadow-md text-center">
              {mode === 'word' ? (
                <span
                  className="text-5xl font-bold"
                  style={{ color: wordColor.hsl }}
                >
                  {displayWord}
                </span>
              ) : (
                renderShape()
              )}
            </div>

            <div className="grid grid-cols-5 gap-3">
              {COLORS.map(color => (
                <Button
                  key={color.name}
                  onClick={() => handleAnswer(color.name)}
                  className="h-14 font-semibold"
                  style={{ backgroundColor: color.hsl }}
                >
                  {color.name}
                </Button>
              ))}
            </div>
          </>
        )}

        {gameOver && (
          <div className="text-center bg-card rounded-2xl p-8 shadow-md">
            <h3 className="text-xl font-bold mb-4">Game Over</h3>
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

export default StroopTest;
