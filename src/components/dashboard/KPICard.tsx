import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  suffix?: string;
  iconColor?: string;
  iconBg?: string;
}

export const KPICard = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  suffix,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10'
}: KPICardProps) => {
  const isPositive = change >= 0;
  
  return (
    <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-card gradient-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', iconBg)}>
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            isPositive 
              ? 'bg-primary/10 text-primary' 
              : 'bg-destructive/10 text-destructive'
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{change}%
          </div>
        </div>
        
        <div className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
          {value}{suffix}
        </div>
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
};
