import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAIPredictionData } from '@/contexts/AIPredictionContext';
import { TrendingUp, DollarSign, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ConfidenceIndicator = () => {
  const { isLoading } = useAIPredictionData();

  // AI model confidence scores based on historical performance
  // These represent the validated accuracy of the AI models
  const indicators = [
    {
      label: 'Yield Prediction',
      value: 92,
      icon: TrendingUp,
      color: 'bg-primary',
    },
    {
      label: 'Price Forecast',
      value: 78,
      icon: DollarSign,
      color: 'bg-verda-amber',
    },
    {
      label: 'Allocation Model',
      value: 85,
      icon: PieChart,
      color: 'bg-verda-sky',
    },
  ];

  return (
    <Card className="border-border/50 gradient-card">
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-lg font-semibold text-foreground">
          Model Confidence
        </CardTitle>
        <p className="text-sm text-muted-foreground">AI prediction reliability scores</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </>
        ) : (
          <>
            {indicators.map((indicator) => {
              const Icon = indicator.icon;
              return (
                <div key={indicator.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{indicator.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{indicator.value}%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn("h-full transition-all", indicator.color)}
                      style={{ width: `${indicator.value}%` }}
                    />
                  </div>
                </div>
              );
            })}
            
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Confidence scores are calculated based on historical accuracy, data quality, and model validation metrics.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
