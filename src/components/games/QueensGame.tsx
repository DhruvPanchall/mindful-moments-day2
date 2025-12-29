import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useScore } from '@/context/ScoreContext';

interface QueensGameProps {
  onBack: () => void;
}

type CellState = 'empty' | 'x' | 'queen';

interface Cell {
  state: CellState;
  region: number;
}

// Predefined puzzles - each number represents a color region
const PUZZLES = [
  {
    size: 5,
    regions: [
      [0, 0, 1, 1, 1],
      [0, 0, 1, 2, 2],
      [3, 3, 1, 2, 2],
      [3, 4, 4, 4, 2],
      [3, 4, 4, 4, 4],
    ],
  },
  {
    size: 5,
    regions: [
      [0, 0, 0, 1, 1],
      [0, 2, 2, 1, 1],
      [2, 2, 2, 3, 3],
      [4, 4, 3, 3, 3],
      [4, 4, 4, 3, 3],
    ],
  },
  {
    size: 5,
    regions: [
      [0, 0, 1, 1, 2],
      [0, 1, 1, 2, 2],
      [0, 3, 3, 3, 2],
      [4, 3, 3, 3, 2],
      [4, 4, 4, 4, 4],
    ],
  },
  {
    size: 5,
    regions: [
      [0, 1, 1, 1, 2],
      [0, 0, 1, 2, 2],
      [0, 3, 3, 3, 2],
      [4, 4, 3, 3, 2],
      [4, 4, 4, 4, 4],
    ],
  },
];

const REGION_COLORS = [
  'hsl(340, 82%, 52%)',  // Vibrant pink
  'hsl(200, 98%, 48%)',  // Bright blue
  'hsl(142, 71%, 45%)',  // Vivid green
  'hsl(45, 93%, 58%)',   // Bright yellow
  'hsl(280, 87%, 60%)',  // Vibrant purple
];

const QueensGame = ({ onBack }: QueensGameProps) => {
  const { addScore } = useScore();
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState<Cell[][]>(() => initGrid(PUZZLES[0]));
  const [conflicts, setConflicts] = useState<boolean[][]>([]);
  const [completed, setCompleted] = useState(false);

  function initGrid(puzzle: typeof PUZZLES[0]): Cell[][] {
    return puzzle.regions.map(row => 
      row.map(region => ({ state: 'empty' as CellState, region }))
    );
  }

  const checkConflicts = useCallback((currentGrid: Cell[][]): boolean[][] => {
    const size = currentGrid.length;
    const conflictGrid: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
    
    const queens: [number, number][] = [];
    currentGrid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell.state === 'queen') queens.push([r, c]);
      });
    });

    // Check row conflicts
    for (let r = 0; r < size; r++) {
      const queensInRow = queens.filter(([qr]) => qr === r);
      if (queensInRow.length > 1) {
        queensInRow.forEach(([qr, qc]) => conflictGrid[qr][qc] = true);
      }
    }

    // Check column conflicts
    for (let c = 0; c < size; c++) {
      const queensInCol = queens.filter(([, qc]) => qc === c);
      if (queensInCol.length > 1) {
        queensInCol.forEach(([qr, qc]) => conflictGrid[qr][qc] = true);
      }
    }

    // Check region conflicts
    const regionQueens: Map<number, [number, number][]> = new Map();
    queens.forEach(([r, c]) => {
      const region = currentGrid[r][c].region;
      if (!regionQueens.has(region)) regionQueens.set(region, []);
      regionQueens.get(region)!.push([r, c]);
    });
    regionQueens.forEach(qList => {
      if (qList.length > 1) {
        qList.forEach(([r, c]) => conflictGrid[r][c] = true);
      }
    });

    // Check diagonal conflicts (queens on same diagonal)
    queens.forEach(([r1, c1], i) => {
      queens.forEach(([r2, c2], j) => {
        if (i !== j) {
          const rowDiff = Math.abs(r1 - r2);
          const colDiff = Math.abs(c1 - c2);
          // Only adjacent cells (including diagonally adjacent) are conflicts
          if (rowDiff <= 1 && colDiff <= 1) {
            conflictGrid[r1][c1] = true;
            conflictGrid[r2][c2] = true;
          }
        }
      });
    });

    return conflictGrid;
  }, []);

  const checkWin = useCallback((currentGrid: Cell[][]): boolean => {
    const size = currentGrid.length;
    const queens: [number, number][] = [];
    currentGrid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell.state === 'queen') queens.push([r, c]);
      });
    });

    if (queens.length !== size) return false;

    // Check each row has exactly one queen
    for (let r = 0; r < size; r++) {
      if (queens.filter(([qr]) => qr === r).length !== 1) return false;
    }

    // Check each column has exactly one queen
    for (let c = 0; c < size; c++) {
      if (queens.filter(([, qc]) => qc === c).length !== 1) return false;
    }

    // Check each region has exactly one queen
    const regionQueens: Map<number, number> = new Map();
    queens.forEach(([r, c]) => {
      const region = currentGrid[r][c].region;
      regionQueens.set(region, (regionQueens.get(region) || 0) + 1);
    });
    for (const count of regionQueens.values()) {
      if (count !== 1) return false;
    }

    // Check no adjacent touching (including diagonally adjacent)
    for (let i = 0; i < queens.length; i++) {
      for (let j = i + 1; j < queens.length; j++) {
        const [r1, c1] = queens[i];
        const [r2, c2] = queens[j];
        const rowDiff = Math.abs(r1 - r2);
        const colDiff = Math.abs(c1 - c2);
        // Queens cannot touch (horizontally, vertically, or diagonally adjacent)
        if (rowDiff <= 1 && colDiff <= 1) return false;
      }
    }

    return true;
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (completed) return;
    
    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })));
      const current = newGrid[row][col].state;
      
      if (current === 'empty') {
        newGrid[row][col].state = 'x';
      } else if (current === 'x') {
        newGrid[row][col].state = 'queen';
      } else {
        newGrid[row][col].state = 'empty';
      }
      
      const newConflicts = checkConflicts(newGrid);
      setConflicts(newConflicts);
      
      if (checkWin(newGrid)) {
        setCompleted(true);
        addScore(50 + level * 10);
      }
      
      return newGrid;
    });
  };

  const handleNextLevel = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * PUZZLES.length);
    } while (nextIndex === puzzleIndex && PUZZLES.length > 1);
    
    setPuzzleIndex(nextIndex);
    setGrid(initGrid(PUZZLES[nextIndex]));
    setConflicts([]);
    setCompleted(false);
    setLevel(prev => prev + 1);
  };

  const handleReset = () => {
    setGrid(initGrid(PUZZLES[puzzleIndex]));
    setConflicts([]);
    setCompleted(false);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <span className="text-sm font-medium text-muted-foreground">Level {level}</span>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Queens</h2>
          <p className="text-sm text-muted-foreground">
            Place one 👑 in each row, column, and color region. No queens can touch!
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click: ❌ → Double click: 👑 → Click again: Clear
          </p>
        </div>

        <div className="bg-card rounded-2xl p-4 shadow-md mb-6">
          <div 
            className="grid gap-1 mx-auto"
            style={{ 
              gridTemplateColumns: `repeat(${grid.length}, 1fr)`,
              maxWidth: '320px'
            }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`
                    aspect-square flex items-center justify-center text-xl font-bold
                    rounded-md transition-all border-2
                    ${conflicts[r]?.[c] ? 'border-destructive animate-pulse' : 'border-transparent'}
                  `}
                  style={{ backgroundColor: REGION_COLORS[cell.region] }}
                >
                  {cell.state === 'x' && <span className="text-foreground/80">✕</span>}
                  {cell.state === 'queen' && <span>👑</span>}
                </button>
              ))
            )}
          </div>
        </div>

        {completed && (
          <div className="text-center bg-primary/10 rounded-2xl p-6 mb-4">
            <h3 className="text-xl font-bold text-primary mb-2">Level Complete! 🎉</h3>
            <p className="text-muted-foreground mb-4">+{50 + level * 10} points</p>
            <Button onClick={handleNextLevel}>Next Level</Button>
          </div>
        )}

        <div className="text-center">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QueensGame;
