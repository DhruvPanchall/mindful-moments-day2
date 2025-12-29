import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Check } from 'lucide-react';
import { useScore } from '@/context/ScoreContext';

type Level = 1 | 2 | 3;

interface ILoveHueProps {
  onBack: () => void;
}

interface Tile {
  id: number;
  color: string;
  correctIndex: number;
}

const getGridConfig = (level: Level) => {
  if (level === 1) return { rows: 1, cols: 3 };
  if (level === 2) return { rows: 2, cols: 3 };
  return { rows: 3, cols: 3 };
};

/**
 * SAME LOGIC FOR ALL LEVELS
 * Dark → Medium → Light (left → right)
 * Same gradient repeated for every row
 */
const generateGradientColors = (
  rows: number,
  cols: number
): string[] => {
  const colors: string[] = [];

  const baseHue = 140; // calm green
  const saturation = 65;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const lightness =
        30 + col * (45 / (cols - 1));

      colors.push(
        `hsl(${baseHue}, ${saturation}%, ${lightness}%)`
      );
    }
  }

  return colors;
};

const ILoveHue = ({ onBack }: ILoveHueProps) => {
  const { addScore } = useScore();

  const [level, setLevel] = useState<Level>(1);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [correctColors, setCorrectColors] = useState<string[]>([]);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [finished, setFinished] = useState(false);

  const initGame = () => {
    const { rows, cols } = getGridConfig(level);
    const colors = generateGradientColors(rows, cols);

    setCorrectColors(colors);

    const newTiles: Tile[] = colors.map((color, idx) => ({
      id: idx,
      color,
      correctIndex: idx,
    }));

    // Shuffle tiles
    for (let i = newTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newTiles[i].color, newTiles[j].color] =
        [newTiles[j].color, newTiles[i].color];
    }

    setTiles(newTiles);
    setMoves(0);
    setSelectedTile(null);
    setCompleted(false);
  };

  useEffect(() => {
    initGame();
  }, [level]);

  const handleTileClick = (index: number) => {
    if (completed || finished) return;

    if (selectedTile === null) {
      setSelectedTile(index);
    } else {
      setTiles(prev => {
        const copy = [...prev];
        [copy[selectedTile].color, copy[index].color] =
          [copy[index].color, copy[selectedTile].color];
        return copy;
      });
      setMoves(m => m + 1);
      setSelectedTile(null);
    }
  };

  const handleCheck = () => {
    const isCorrect = tiles.every(
      (tile, idx) => tile.color === correctColors[idx]
    );

    if (isCorrect) {
      setCompleted(true);
      addScore(20 + level * 10);
    }
  };

  const handleNextLevel = () => {
    if (level === 3) {
      setFinished(true);
      return;
    }
    setLevel(l => (l + 1) as Level);
  };

  const { cols } = getGridConfig(level);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-sm mx-auto">

        {/* Header */}
        <div className="flex justify-between mb-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="text-sm">Level {level}</div>
        </div>

        <h2 className="text-center text-2xl font-bold mb-1">
          I Love Hue
        </h2>

        <p className="text-center text-muted-foreground mb-3">
          {level === 1 && 'Arrange colors from dark to light'}
          {level === 2 && 'Make both rows match the same gradient'}
          {level === 3 && 'Make all rows match the same gradient'}
        </p>

        {/* Gradient Hint */}
        {!finished && (
          <div className="text-center text-xs text-muted-foreground mb-4">
            <span className="font-medium">Hint:</span>{' '}
            Column 1 → darkest • Column 2 → lighter • Column 3 → lightest
          </div>
        )}

        {/* Grid */}
        <div
          className="grid gap-3 mb-6 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
          }}
        >
          {tiles.map((tile, idx) => (
            <button
              key={tile.id}
              onClick={() => handleTileClick(idx)}
              className={`rounded-xl aspect-square transition
                ${selectedTile === idx
                  ? 'ring-4 ring-foreground scale-105'
                  : 'hover:scale-105'}
              `}
              style={{ backgroundColor: tile.color }}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-3">
          {!finished && (
            <Button variant="outline" onClick={initGame}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          )}

          {!finished && !completed && (
            <Button onClick={handleCheck}>
              <Check className="h-4 w-4" /> Check
            </Button>
          )}

          {!finished && completed && (
            <Button onClick={handleNextLevel}>
              {level === 3 ? 'Finish' : 'Next Level →'}
            </Button>
          )}
        </div>

        {/* Finished State */}
        {finished && (
          <div className="mt-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              🎉 Finished!
            </div>
            <p className="text-muted-foreground mt-1">
              You’ve completed all levels
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ILoveHue;
