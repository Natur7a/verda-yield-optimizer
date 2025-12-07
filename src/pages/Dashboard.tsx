import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/landing/Footer';
import { KPICard } from '@/components/dashboard/KPICard';
import { YieldChart } from '@/components/dashboard/YieldChart';
import { PriceChart } from '@/components/dashboard/PriceChart';
import { AllocationChart } from '@/components/dashboard/AllocationChart';
import { TradeoffChart } from '@/components/dashboard/TradeoffChart';
import { ConfidenceIndicator } from '@/components/dashboard/ConfidenceIndicator';
import { MillsTable } from '@/components/dashboard/MillsTable';
import { getKPISummary } from '@/lib/mockData';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, DollarSign, Leaf, Zap } from 'lucide-react';
import { useMemo } from 'react';

const Dashboard = () => {
  const kpi = useMemo(() => getKPISummary(), []);

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
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Predictive Dashboard
              </h1>
              <p className="text-muted-foreground">
                Real-time insights and AI-powered recommendations for your palm oil operations.
              </p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KPICard
                title="Total Yield (tons/day)"
                value={kpi.totalYield}
                change={kpi.yieldChange}
                icon={TrendingUp}
              />
              <KPICard
                title="Projected Revenue"
                value={`$${(kpi.totalRevenue / 1000).toFixed(1)}k`}
                change={kpi.revenueChange}
                icon={DollarSign}
                iconColor="text-verda-amber"
                iconBg="bg-verda-amber/10"
              />
              <KPICard
                title="Emissions Reduced"
                value={`${kpi.emissionsReduced}`}
                suffix=" t CO₂"
                change={kpi.emissionsChange}
                icon={Leaf}
                iconColor="text-verda-mint"
                iconBg="bg-verda-mint/10"
              />
              <KPICard
                title="Mill Efficiency"
                value={kpi.efficiency}
                suffix="%"
                change={kpi.efficiencyChange}
                icon={Zap}
                iconColor="text-verda-sky"
                iconBg="bg-verda-sky/10"
              />
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
