import { useScore } from '@/context/ScoreContext';
import { Brain, Trophy } from 'lucide-react';

const Header = () => {
  const { score } = useScore();

  return (
    <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">MindFlex</h1>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
          <Trophy className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">{score}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
