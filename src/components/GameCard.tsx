import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface GameCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  color: string;
}

const GameCard = ({ title, description, icon: Icon, onClick, color }: GameCardProps) => {
  return (
    <Card 
      onClick={onClick}
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-card border-border"
    >
      <CardContent className="p-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default GameCard;
