import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAIPredictionData } from '@/contexts/AIPredictionContext';

interface TooltipPayload {
  payload: {
    revenue: number;
    emissions: number;
  };
}

export const AllocationChart = () => {
  const { allocationData, isLoading } = useAIPredictionData();

  return (
    <Card className="border-border/50 gradient-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg font-semibold text-foreground">
          Optimal Allocation
        </CardTitle>
        <p className="text-sm text-muted-foreground">AI-recommended waste distribution</p>
      </CardHeader>
      <CardContent>
        {isLoading && allocationData.length === 0 ? (
          <div className="h-[280px] w-full flex items-center justify-center">
            <Skeleton className="h-full w-full rounded-full" />
          </div>
        ) : allocationData.length === 0 ? (
          <div className="h-[280px] w-full flex items-center justify-center text-muted-foreground">
            No allocation data available
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="category"
                  label={({ category, value }) => `${category}: ${value}%`}
                  labelLine={false}
                >
                  {allocationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-soft)'
                  }}
                  formatter={(value: number, name: string, props: TooltipPayload) => [
                    <div key="tooltip" className="space-y-1">
                      <div className="font-medium">{value}%</div>
                      <div className="text-xs text-muted-foreground">
                        Revenue: ${props.payload.revenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        CO₂: {props.payload.emissions} tons
                      </div>
                    </div>,
                    name
                  ]}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                  formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
