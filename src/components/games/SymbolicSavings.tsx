import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, User, Coins, Gem, Crown, Star, Zap } from 'lucide-react';
import { useScore } from '@/context/ScoreContext';

interface SymbolicSavingsProps {
  onBack: () => void;
}

const SYMBOLS = [
  { icon: Coins, name: 'Coin', color: 'text-yellow-500' },
  { icon: Gem, name: 'Gem', color: 'text-cyan-500' },
  { icon: Crown, name: 'Crown', color: 'text-amber-500' },
  { icon: Star, name: 'Star', color: 'text-purple-500' },
  { icon: Zap, name: 'Bolt', color: 'text-blue-500' },
];

interface Character {
  items: { symbolIdx: number; count: number }[];
  total: number;
}

const SymbolicSavings = ({ onBack }: SymbolicSavingsProps) => {
  const { addScore, subtractScore } = useScore();
  const [symbolValues, setSymbolValues] = useState<number[]>([]);
  const [leftChar, setLeftChar] = useState<Character>({ items: [], total: 0 });
  const [rightChar, setRightChar] = useState<Character>({ items: [], total: 0 });
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [rounds, setRounds] = useState(0);

  const generateRound = () => {
    // Generate random values for symbols
    const values = SYMBOLS.map(() => Math.floor(Math.random() * 9) + 1);
    setSymbolValues(values);

    const createCharacter = (): Character => {
      const numItems = Math.floor(Math.random() * 3) + 1;
      const items: { symbolIdx: number; count: number }[] = [];
      let total = 0;

      for (let i = 0; i < numItems; i++) {
        const symbolIdx = Math.floor(Math.random() * SYMBOLS.length);
        const count = Math.floor(Math.random() * 4) + 1;
        items.push({ symbolIdx, count });
        total += values[symbolIdx] * count;
      }

      return { items, total };
    };

    let left = createCharacter();
    let right = createCharacter();
    
    // Ensure they're not equal
    while (left.total === right.total) {
      right = createCharacter();
    }

    setLeftChar(left);
    setRightChar(right);
    setResult(null);
  };

  useEffect(() => {
    generateRound();
  }, []);

  const handleChoice = (choice: 'left' | 'right') => {
    const isCorrect = 
      (choice === 'left' && leftChar.total > rightChar.total) ||
      (choice === 'right' && rightChar.total > leftChar.total);

    if (isCorrect) {
      setResult('correct');
      const points = 10 + streak * 2;
      addScore(points);
      setStreak(prev => prev + 1);
    } else {
      setResult('wrong');
      subtractScore(5);
      setStreak(0);
    }
    setRounds(prev => prev + 1);
  };

  const nextRound = () => {
    generateRound();
  };

  const renderCharacter = (char: Character, side: 'left' | 'right') => (
    <Card className={`flex-1 ${result && 
      ((side === 'left' && leftChar.total > rightChar.total) || 
       (side === 'right' && rightChar.total > leftChar.total))
      ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          {char.items.map((item, idx) => {
            const Symbol = SYMBOLS[item.symbolIdx];
            return (
              <div key={idx} className="flex items-center justify-center gap-2">
                <span className="font-bold text-foreground">{item.count}×</span>
                <Symbol.icon className={`h-6 w-6 ${Symbol.color}`} />
              </div>
            );
          })}
        </div>
        {result && (
          <div className="mt-4 text-lg font-bold text-primary">
            = {side === 'left' ? leftChar.total : rightChar.total}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Streak: {streak}</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Symbolic Savings</h2>
          <p className="text-muted-foreground">Who has more wealth?</p>
        </div>

        {/* Legend */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-3 text-center font-medium">VALUE LEGEND</p>
            <div className="flex justify-center gap-4 flex-wrap">
              {SYMBOLS.map((symbol, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <symbol.icon className={`h-5 w-5 ${symbol.color}`} />
                  <span className="text-sm font-semibold text-foreground">= {symbolValues[idx]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Characters */}
        <div className="flex gap-4 mb-6">
          {renderCharacter(leftChar, 'left')}
          {renderCharacter(rightChar, 'right')}
        </div>

        {/* Buttons */}
        {!result ? (
          <div className="flex gap-4">
            <Button 
              onClick={() => handleChoice('left')} 
              className="flex-1 h-14"
              variant="outline"
            >
              Left is Richer
            </Button>
            <Button 
              onClick={() => handleChoice('right')} 
              className="flex-1 h-14"
              variant="outline"
            >
              Right is Richer
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className={`text-xl font-bold mb-4 ${result === 'correct' ? 'text-primary' : 'text-destructive'}`}>
              {result === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
            </div>
            <Button onClick={nextRound} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Next Round
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SymbolicSavings;
