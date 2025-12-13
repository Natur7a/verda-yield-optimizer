import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAIPredictionData } from '@/contexts/AIPredictionContext';

export const TradeoffChart = () => {
  const { scenarios, isLoading } = useAIPredictionData();

  // Transform scenarios into trade-off data points
  const data = scenarios.map(scenario => ({
    revenue: scenario.revenue,
    emissions: scenario.emissions,
    label: scenario.name,
  }));

  return (
    <Card className="border-border/50 gradient-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-lg font-semibold text-foreground">
          Revenue vs Emissions Trade-off
        </CardTitle>
        <p className="text-sm text-muted-foreground">Pareto frontier of optimization scenarios</p>
      </CardHeader>
      <CardContent>
        {isLoading && data.length === 0 ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
            No trade-off data available
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number"
                  dataKey="revenue" 
                  name="Revenue"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  label={{ value: 'Revenue (USD)', position: 'bottom', offset: 0, style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } }}
                />
                <YAxis 
                  type="number"
                  dataKey="emissions" 
                  name="Emissions"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `${value}`}
                  label={{ value: 'CO₂ Reduced (tons)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-soft)'
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="p-3 bg-card border border-border rounded-lg shadow-soft">
                          <p className="font-semibold text-foreground">{item.label}</p>
                          <p className="text-sm text-muted-foreground">Revenue: ${item.revenue.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">CO₂ Reduced: {Math.abs(item.emissions)} tons</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={data} fill="hsl(var(--primary))">
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.label === 'Balanced' ? 'hsl(var(--chart-2))' : 'hsl(var(--primary))'}
                      stroke={entry.label === 'Balanced' ? 'hsl(var(--chart-2))' : 'hsl(var(--primary))'}
                      strokeWidth={entry.label === 'Balanced' ? 3 : 1}
                      r={entry.label === 'Balanced' ? 8 : 6}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
