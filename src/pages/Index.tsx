import { useState } from 'react';
import { Grid3X3, Palette, Brain, Calculator, Crown, Zap, Music, ToggleLeft, Shapes, CopyCheck } from 'lucide-react';
import Header from '@/components/Header';
import GameCard from '@/components/GameCard';
import SchulteTable from '@/components/games/SchulteTable';
import StroopTest from '@/components/games/StroopTest';
import ILoveHue from '@/components/games/ILoveHue';
import SymbolicSavings from '@/components/games/SymbolicSavings';
import QueensGame from '@/components/games/QueensGame';
import ImpulseControl from '@/components/games/ImpulseControl';
import SequenceMemory from '@/components/games/SequenceMemory';
import ColorToggleGrid from '@/components/games/ColorToggleGrid';
import CardFlip from '@/components/games/CardFlip';

type GameType = 'home' | 'schulte' | 'stroop' | 'hue' | 'symbolic' | 'queens' | 'impulse' | 'sequence' | 'toggle' | 'flipc' ;

const games = [
  {
    id: 'schulte' as const,
    title: 'Schulte Table',
    description: 'Click numbers 1-25 in order as fast as you can',
    icon: Grid3X3,
    color: 'bg-primary',
  },
  {
    id: 'stroop' as const,
    title: 'Stroop Test',
    description: 'Select the color of the text, not the word',
    icon: Palette,
    color: 'bg-sky-500',
  },
  {
    id: 'hue' as const,
    title: 'I Love Hue',
    description: 'Arrange tiles to create smooth color gradients',
    icon: Shapes,
    color: 'bg-pink-500',
  },
  {
    id: 'symbolic' as const,
    title: 'Symbolic Savings',
    description: 'Calculate who has more wealth using symbols',
    icon: Calculator,
    color: 'bg-amber-500',
  },
  {
    id: 'queens' as const,
    title: 'Queens',
    description: 'Place queens on the board following all rules',
    icon: Crown,
    color: 'bg-violet-500',
  },
  {
    id: 'impulse' as const,
    title: 'Impulse Control',
    description: 'Click only when the target appears',
    icon: Zap,
    color: 'bg-emerald-500',
  },
  {
    id: 'sequence' as const,
    title: 'Sequence Memory',
    description: 'Remember and repeat the pattern sequence',
    icon: Music,
    color: 'bg-indigo-500',
  },
  {
    id: 'toggle' as const,
    title: 'Color Toggle',
    description: 'Convert all target cells to the goal color',
    icon: ToggleLeft,
    color: 'bg-blue-600',
  },
  {
    id: 'flipc' as const,
    title: 'Card-Flip',
    description: 'A visual memory game where players flip cards to find matching pairs',
    icon: CopyCheck,
    color: 'bg-rose-500',
  },
];

const Index = () => {
  const [currentGame, setCurrentGame] = useState<GameType>('home');

  const renderGame = () => {
    switch (currentGame) {
      case 'schulte':
        return <SchulteTable onBack={() => setCurrentGame('home')} />;
      case 'stroop':
        return <StroopTest onBack={() => setCurrentGame('home')} />;
      case 'hue':
        return <ILoveHue onBack={() => setCurrentGame('home')} />;
      case 'symbolic':
        return <SymbolicSavings onBack={() => setCurrentGame('home')} />;
      case 'queens':
        return <QueensGame onBack={() => setCurrentGame('home')} />;
      case 'impulse':
        return <ImpulseControl onBack={() => setCurrentGame('home')} />;
      case 'sequence':
        return <SequenceMemory onBack={() => setCurrentGame('home')} />;
      case 'toggle':
        return <ColorToggleGrid onBack={() => setCurrentGame('home')} />;
      case 'flipc':
        return <CardFlip onBack={() => setCurrentGame('home')} />;
      default:
        return null;
    }
  };

  if (currentGame !== 'home') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        {renderGame()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">Train Your Mind</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Eight cognitive exercises to sharpen focus, attention, and reasoning skills
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {games.map(game => (
            <GameCard
              key={game.id}
              title={game.title}
              description={game.description}
              icon={game.icon}
              color={game.color}
              onClick={() => setCurrentGame(game.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
