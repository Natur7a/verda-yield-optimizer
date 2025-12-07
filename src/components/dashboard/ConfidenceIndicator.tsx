import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getConfidenceData } from '@/lib/mockData';
import { useMemo } from 'react';
import { TrendingUp, DollarSign, PieChart } from 'lucide-react';

export const ConfidenceIndicator = () => {
  const data = useMemo(() => getConfidenceData(), []);

  const indicators = [
    {
      label: 'Yield Prediction',
      value: data.yieldConfidence,
      icon: TrendingUp,
      color: 'bg-primary',
    },
    {
      label: 'Price Forecast',
      value: data.priceConfidence,
      icon: DollarSign,
      color: 'bg-verda-amber',
    },
    {
      label: 'Allocation Model',
      value: data.allocationConfidence,
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
              <Progress 
                value={indicator.value} 
                className="h-2"
                // @ts-ignore - custom indicator color
                indicatorClassName={indicator.color}
              />
            </div>
          );
        })}
        
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Confidence scores are calculated based on historical accuracy, data quality, and model validation metrics.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
