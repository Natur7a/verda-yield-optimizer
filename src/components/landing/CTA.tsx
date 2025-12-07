import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const CTA = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-verda-mint/5 rounded-3xl p-8 md:p-16 overflow-hidden border border-primary/20">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-verda-mint/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Optimize Your Mill Operations?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Start making data-driven decisions today. Access real-time predictions, smart allocation recommendations, and comprehensive analytics.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-all text-base px-8">
                <Link to="/dashboard">
                  Open Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8">
                <Link to="/forecasts">
                  View Sample Forecasts
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
