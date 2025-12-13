import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/landing/Footer';
import { YieldChart } from '@/components/dashboard/YieldChart';
import { PriceChart } from '@/components/dashboard/PriceChart';
import { TradeoffChart } from '@/components/dashboard/TradeoffChart';
import { RefreshButton } from '@/components/dashboard/RefreshButton';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Helmet } from 'react-helmet-async';
import { useAIPredictionData } from '@/contexts/AIPredictionContext';
import { TrendingUp, DollarSign, Leaf, CheckCircle2 } from 'lucide-react';

const Forecasts = () => {
  const { scenarios, isLoading, error, refreshData, lastUpdated } = useAIPredictionData();
  const USE_REAL_API = import.meta.env.VITE_USE_REAL_AI === 'true';

  return (
    <>
      <Helmet>
        <title>Forecasts - VERDA Predictive AI</title>
        <meta name="description" content="Explore detailed yield and price forecasts with optimization scenarios for palm oil waste management." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-3xl font-bold text-foreground">
                    Forecasts & Scenarios
                  </h1>
                  <Badge variant="default" className={USE_REAL_API ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"}>
                    {USE_REAL_API ? "🟢 Live AI" : "📊 Demo Data"}
                  </Badge>
                </div>
                <RefreshButton 
                  onRefresh={refreshData}
                  isLoading={isLoading}
                  lastUpdated={lastUpdated}
                />
              </div>
              <p className="text-muted-foreground">
                Explore yield predictions, price trends, and optimization scenarios for informed decision-making.
              </p>
            </div>

            {/* Error State */}
            {error && (
              <ErrorState 
                error={error} 
                onRetry={refreshData}
                showCachedDataMessage={scenarios.length > 0}
              />
            )}

            {/* Forecast Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <YieldChart />
              <PriceChart />
            </div>

            {/* Tradeoff Analysis */}
            <div className="mb-8">
              <TradeoffChart />
            </div>

            {/* Optimization Scenarios */}
            <div className="mb-8">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Optimization Scenarios
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading && scenarios.length === 0 ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="border-border/50 gradient-card">
                        <CardHeader className="pb-3">
                          <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-24 w-full" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : scenarios.length === 0 ? (
                  <div className="col-span-3 text-center py-12 text-muted-foreground">
                    No scenario data available
                  </div>
                ) : (
                  scenarios.map((scenario, index) => (
                    <Card 
                      key={scenario.name}
                      className={`border-border/50 gradient-card transition-all hover:shadow-card ${
                        scenario.name === 'Balanced' ? 'ring-2 ring-primary/50' : ''
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="font-display text-lg font-semibold text-foreground">
                            {scenario.name}
                          </CardTitle>
                          {scenario.name === 'Balanced' && (
                            <Badge className="bg-primary/10 text-primary border-0">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-verda-amber/10 flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-verda-amber" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Revenue</p>
                              <p className="text-sm font-semibold text-foreground">
                                ${scenario.revenue.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Leaf className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">CO₂ Reduced</p>
                              <p className="text-sm font-semibold text-foreground">
                                {Math.abs(scenario.emissions)} tons
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Allocation breakdown */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Allocation
                          </p>
                          {scenario.allocation.map((item) => (
                            <div key={item.category} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm text-foreground">{item.category}</span>
                              </div>
                              <span className="text-sm font-medium text-muted-foreground">
                                {item.value}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Methodology Note */}
            <Card className="border-border/50 bg-muted/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-2">
                      About These Forecasts
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Forecasts are generated using time-series ML models trained on historical mill data, 
                      market trends, and seasonal patterns. The optimization engine uses multi-objective 
                      algorithms to balance revenue maximization with emissions reduction. Current models 
                      achieve 92% yield prediction accuracy and 78% price forecast accuracy based on 
                      backtesting against historical data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Forecasts;
