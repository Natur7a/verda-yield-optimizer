import { TrendingUp, DollarSign, Leaf, Factory } from 'lucide-react';

const stats = [
  {
    icon: TrendingUp,
    value: '92%',
    label: 'Forecast Accuracy',
    description: 'Yield prediction precision',
  },
  {
    icon: DollarSign,
    value: '+23%',
    label: 'Revenue Increase',
    description: 'Average improvement',
  },
  {
    icon: Leaf,
    value: '-2.1k',
    label: 'Tons CO₂ Reduced',
    description: 'Monthly emissions saved',
  },
  {
    icon: Factory,
    value: '45+',
    label: 'Mills Connected',
    description: 'Across Southeast Asia',
  },
];

export const Stats = () => {
  return (
    <section className="py-20 bg-primary relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label} 
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-foreground/10 mb-4">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-primary-foreground font-medium text-sm mb-1">
                  {stat.label}
                </div>
                <div className="text-primary-foreground/60 text-xs">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
