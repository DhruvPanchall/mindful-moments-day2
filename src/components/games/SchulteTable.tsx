import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useScore } from '@/context/ScoreContext';

interface SchulteTableProps {
  onBack: () => void;
}

const generateNumbers = (): number[] => {
  const nums = Array.from({ length: 25 }, (_, i) => i + 1);
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  return nums;
};

const SchulteTable = ({ onBack }: SchulteTableProps) => {
  const { addScore } = useScore();
  const [numbers, setNumbers] = useState<number[]>(generateNumbers());
  const [nextNumber, setNextNumber] = useState(1);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const [clicked, setClicked] = useState<number[]>([]);

  const shuffleRemaining = useCallback((excludeNum: number) => {
    setNumbers(prev => {
      const remaining = prev.filter(n => n > excludeNum);
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }
      let remainingIndex = 0;
      return prev.map(n => n <= excludeNum ? n : remaining[remainingIndex++]);
    });
  }, []);

  const handleClick = (num: number) => {
    if (completed) return;
    
    if (!startTime) {
      setStartTime(Date.now());
    }

    if (num === nextNumber) {
      setClicked(prev => [...prev, num]);
      if (num === 25) {
        const time = Math.round((Date.now() - (startTime || Date.now())) / 1000);
        setFinalTime(time);
        setCompleted(true);
        const points = Math.max(100 - time * 2, 10);
        addScore(points);
      } else {
        setNextNumber(prev => prev + 1);
        if (shuffleMode) {
          shuffleRemaining(num);
        }
      }
    }
  };

  const reset = () => {
    setNumbers(generateNumbers());
    setNextNumber(1);
    setStartTime(null);
    setCompleted(false);
    setFinalTime(0);
    setClicked([]);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Label htmlFor="shuffle" className="text-sm text-muted-foreground">Shuffle</Label>
            <Switch 
              id="shuffle" 
              checked={shuffleMode} 
              onCheckedChange={setShuffleMode}
              disabled={startTime !== null && !completed}
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Schulte Table</h2>
          <p className="text-muted-foreground">
            {completed 
              ? `Completed in ${finalTime}s! +${Math.max(100 - finalTime * 2, 10)} points`
              : `Click numbers 1-25 in order. Next: ${nextNumber}`
            }
          </p>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-6">
          {numbers.map((num, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(num)}
              disabled={clicked.includes(num)}
              className={`aspect-square text-lg font-bold rounded-lg transition-all
                ${clicked.includes(num) 
                  ? 'bg-primary/20 text-primary cursor-default' 
                  : 'bg-card border border-border hover:bg-primary hover:text-primary-foreground cursor-pointer shadow-sm'
                }
              `}
            >
              {num}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SchulteTable;
