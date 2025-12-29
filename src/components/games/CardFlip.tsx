import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useScore } from '@/context/ScoreContext';

interface CardFlipProps {
  onBack: () => void;
}

type Card = {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const LEVELS = [
  { columns: 4, cardCount: 12 }, // 4x3
  { columns: 4, cardCount: 16 }, // 4x4
  { columns: 4, cardCount: 20 }, // 4x5
];

const EMOJIS = [
  '🍎','🍌','🍇','🍓','🍉','🍍','🥝','🍑',
  '🥑','🌽','🥕','🍆','🍒','🍋','🍊','🥥',
  '🫐','🥭','🍄','🌶️'
];

const shuffle = <T,>(arr: T[]) =>
  [...arr].sort(() => Math.random() - 0.5);

const CardFlip = ({ onBack }: CardFlipProps) => {
  const { addScore, subtractScore } = useScore();

  const [level, setLevel] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loadingLevel, setLoadingLevel] = useState(false);

  const { columns, cardCount } = LEVELS[level];

  /* Timer */
  useEffect(() => {
    if (completed || loadingLevel) return;
    const t = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(t);
  }, [completed, loadingLevel]);

  /* Init Level */
  useEffect(() => {
    setLoadingLevel(true);

    const pairs = cardCount / 2;
    const chosen = shuffle(EMOJIS).slice(0, pairs);

    const deck: Card[] = shuffle(
      chosen.flatMap(v => [v, v])
    ).map((v, i) => ({
      id: i,
      value: v,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(deck);
    setOpen([]);
    setLocked(false);
    setMoves(0);
    setTime(0);
    setCompleted(false);

    const t = setTimeout(() => setLoadingLevel(false), 100);
    return () => clearTimeout(t);
  }, [level, cardCount]);

  /* Match / mismatch logic */
  useEffect(() => {
    if (open.length !== 2) return;

    const [a, b] = open;
    setLocked(true);

    const isMatch = cards[a].value === cards[b].value;

    setTimeout(() => {
      setCards(prev =>
        prev.map((c, i) => {
          if (i !== a && i !== b) return c;
          return {
            ...c,
            isMatched: isMatch ? true : c.isMatched,
            isFlipped: isMatch ? true : false,
          };
        })
      );

      if (isMatch) {
        addScore(10);
      } else {
        subtractScore(2);
      }

      setOpen([]);
      setLocked(false);
    }, isMatch ? 400 : 900);
  }, [open, cards, addScore, subtractScore]);

  /* Level complete */
  useEffect(() => {
    if (!cards.length || loadingLevel) return;

    if (cards.every(c => c.isMatched)) {
      setCompleted(true);
      addScore(20 * (level + 1));

      if (level < LEVELS.length - 1) {
        setLoadingLevel(true);
        setTimeout(() => {
          setCompleted(false);
          setLevel(l => l + 1);
        }, 1000);
      }
    }
  }, [cards, level, addScore, loadingLevel]);

  const handleFlip = (index: number) => {
    if (locked || loadingLevel) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (open.length === 2) return;

    setCards(prev =>
      prev.map((c, i) =>
        i === index ? { ...c, isFlipped: true } : c
      )
    );

    setOpen(prev => {
      const next = [...prev, index];
      if (next.length === 2) setMoves(m => m + 1);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <span className="text-sm text-muted-foreground">
            Level {level + 1}
          </span>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Card Flip</h2>
          <p className="text-muted-foreground">
            Moves: {moves} · Time: {time}s
          </p>
        </div>

        {loadingLevel && (
          <div className="text-center mt-12 text-muted-foreground">
            Loading next level…
          </div>
        )}

        {!loadingLevel && cards.length > 0 && (
          <div
            className="grid gap-4 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              maxWidth: `${columns * 130}px`,
            }}
          >
            {cards.map((card, i) => (
              <button
                key={card.id}
                onClick={() => handleFlip(i)}
                className="relative aspect-square [perspective:1000px]"
              >
                <div
                  className={`
                    absolute inset-0 rounded-2xl transition-transform duration-500
                    [transform-style:preserve-3d]
                    ${card.isFlipped || card.isMatched ? '[transform:rotateY(180deg)]' : ''}
                  `}
                >
                  {/* Face down colors*/}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700
 shadow-lg [backface-visibility:hidden]" />

                  {/* Face up */}
                  <div className="absolute inset-0 rounded-2xl flex items-center justify-center text-4xl shadow-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    {card.value}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {completed && (
          <div className="mt-8 text-center text-primary font-semibold text-lg">
            Level Complete 🎉
          </div>
        )}
      </div>
    </div>
  );
};

export default CardFlip;
