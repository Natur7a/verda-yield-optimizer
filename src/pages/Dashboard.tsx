import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/landing/Footer';
import { KPICard } from '@/components/dashboard/KPICard';
import { YieldChart } from '@/components/dashboard/YieldChart';
import { PriceChart } from '@/components/dashboard/PriceChart';
import { AllocationChart } from '@/components/dashboard/AllocationChart';
import { TradeoffChart } from '@/components/dashboard/TradeoffChart';
import { ConfidenceIndicator } from '@/components/dashboard/ConfidenceIndicator';
import { MillsTable } from '@/components/dashboard/MillsTable';
import { RefreshButton } from '@/components/dashboard/RefreshButton';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { useAIPredictionData } from '@/contexts/AIPredictionContext';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, DollarSign, Leaf, Zap, Brain, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useVerdaPrediction } from '@/hooks/useVerdaPrediction';
import { createSampleInput } from '@/lib/api';

const Dashboard = () => {
  const { kpiSummary, isLoading: aiLoading, error: aiError, refreshData, lastUpdated } = useAIPredictionData();
  const { predict, isLoading, error, result } = useVerdaPrediction();
  
  const USE_REAL_API = import.meta.env.VITE_USE_REAL_AI === 'true';

  const handleRunSamplePrediction = async () => {
    const sampleInput = createSampleInput();
    await predict(sampleInput);
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - VERDA Predictive AI</title>
        <meta name="description" content="Monitor yield forecasts, price predictions, and optimal waste allocation with VERDA's comprehensive dashboard." />
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
                    Predictive Dashboard
                  </h1>
                  <Badge variant="default" className={USE_REAL_API ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"}>
                    {USE_REAL_API ? "🟢 Live AI" : "📊 Demo Data"}
                  </Badge>
                </div>
                <RefreshButton 
                  onRefresh={refreshData}
                  isLoading={aiLoading}
                  lastUpdated={lastUpdated}
                />
              </div>
              <p className="text-muted-foreground">
                Real-time insights and AI-powered recommendations for your palm oil operations.
              </p>
            </div>

            {/* Error State */}
            {aiError && (
              <ErrorState 
                error={aiError} 
                onRetry={refreshData}
                showCachedDataMessage={!!kpiSummary}
              />
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {aiLoading && !kpiSummary ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-border/50 gradient-card">
                      <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-32" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-24 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : kpiSummary ? (
                <>
                  <KPICard
                    title="Total Yield (tons/day)"
                    value={kpiSummary.totalYield}
                    change={kpiSummary.yieldChange}
                    icon={TrendingUp}
                  />
                  <KPICard
                    title="Projected Revenue"
                    value={`$${(kpiSummary.totalRevenue / 1000).toFixed(1)}k`}
                    change={kpiSummary.revenueChange}
                    icon={DollarSign}
                    iconColor="text-verda-amber"
                    iconBg="bg-verda-amber/10"
                  />
                  <KPICard
                    title="Emissions Reduced"
                    value={`${kpiSummary.emissionsReduced}`}
                    suffix=" t CO₂"
                    change={kpiSummary.emissionsChange}
                    icon={Leaf}
                    iconColor="text-verda-mint"
                    iconBg="bg-verda-mint/10"
                  />
                  <KPICard
                    title="Mill Efficiency"
                    value={kpiSummary.efficiency}
                    suffix="%"
                    change={kpiSummary.efficiencyChange}
                    icon={Zap}
                    iconColor="text-verda-sky"
                    iconBg="bg-verda-sky/10"
                  />
                </>
              ) : null}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <YieldChart />
              <PriceChart />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <AllocationChart />
              <TradeoffChart />
              <ConfidenceIndicator />
            </div>

            {/* Live AI Prediction Card */}
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-verda-primary" />
                    <CardTitle>Live AI Prediction</CardTitle>
                  </div>
                  <CardDescription>
                    Run real-time AI predictions using the VERDA machine learning models
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleRunSamplePrediction}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Run Sample Prediction
                      </>
                    )}
                  </Button>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {result && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      {/* Biomass Prediction */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Biomass Waste Prediction
                        </h4>
                        <p className="text-3xl font-bold text-foreground">
                          {result.biomass.toFixed(2)} <span className="text-lg font-normal">tons</span>
                        </p>
                      </div>

                      {/* Price Predictions */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Price Predictions
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Biofuel</span>
                            <span className="font-semibold">${result.prices.biofuel.toFixed(2)}/ton</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Animal Feed</span>
                            <span className="font-semibold">${result.prices.feed.toFixed(2)}/ton</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Compost</span>
                            <span className="font-semibold">${result.prices.compost.toFixed(2)}/ton</span>
                          </div>
                        </div>
                      </div>

                      {/* Optimal Allocation */}
                      <div className="md:col-span-2 pt-2">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Recommended Allocation Strategy
                        </h4>
                        <Badge 
                          variant={result.optimal_allocation === 0 ? "default" : result.optimal_allocation === 1 ? "secondary" : "outline"}
                          className="text-sm py-2 px-4"
                        >
                          {result.allocation_description}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Mills Table */}
            <MillsTable />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Dashboard;
