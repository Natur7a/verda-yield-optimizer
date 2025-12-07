import { TrendingUp, PieChart, Zap, Shield, BarChart3, Leaf } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: TrendingUp,
    title: 'Yield Forecasting',
    description: 'Predict daily, weekly, and monthly waste output including EFB, POME, fiber, and shell with 92% accuracy.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: BarChart3,
    title: 'Price Predictions',
    description: 'Forecast market prices for biofuel, animal feed, compost, and carbon credits using real-time market data.',
    color: 'text-verda-amber',
    bgColor: 'bg-verda-amber/10',
  },
  {
    icon: PieChart,
    title: 'Smart Allocation',
    description: 'AI-optimized waste distribution across biofuel, feed, and compost channels to maximize revenue.',
    color: 'text-verda-sky',
    bgColor: 'bg-verda-sky/10',
  },
  {
    icon: Leaf,
    title: 'Emissions Tracking',
    description: 'Monitor and minimize CO₂ emissions with multi-objective optimization balancing profit and sustainability.',
    color: 'text-verda-mint',
    bgColor: 'bg-verda-mint/10',
  },
  {
    icon: Zap,
    title: 'Real-time Insights',
    description: 'Live dashboards with confidence intervals, scenario simulations, and actionable recommendations.',
    color: 'text-verda-coral',
    bgColor: 'bg-verda-coral/10',
  },
  {
    icon: Shield,
    title: 'Regulatory Compliance',
    description: 'Stay compliant with environmental regulations through automated monitoring and alerts.',
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">Features</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
            Intelligent Waste Management
          </h2>
          <p className="text-muted-foreground text-lg">
            Leverage machine learning to transform palm oil mill waste into sustainable value streams.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title} 
                className="group border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-card gradient-card animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
