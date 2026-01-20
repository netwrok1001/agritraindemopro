import React from 'react';
import { Button } from '@/components/ui/button';
import { Sprout, Users, GraduationCap, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjhCMjIiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNSIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary mb-8 shadow-lg animate-fade-in">
              <Sprout className="w-10 h-10 text-primary-foreground" />
            </div>

            {/* Heading */}
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-slide-up">
              AgriTrain <span className="text-primary">Manager</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
              Empowering agricultural education through efficient training management and farmer outreach programs.
            </p>

            {/* CTA Button */}
            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to="/login">
                <Button variant="hero" size="xl">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground mt-1">Trainings</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-accent">15K+</p>
                <p className="text-sm text-muted-foreground mt-1">Farmers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-success">50+</p>
                <p className="text-sm text-muted-foreground mt-1">Districts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center text-foreground mb-16">
            Everything you need to manage trainings
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: GraduationCap,
                title: 'Training Management',
                description: 'Create and manage agricultural training events with detailed farmer demographics and location tracking.'
              },
              {
                icon: Users,
                title: 'Trainer Dashboard',
                description: 'Personalized dashboard for trainers to track their activities, farmer reach, and training statistics.'
              },
              {
                icon: BarChart3,
                title: 'Manager Overview',
                description: 'Comprehensive view of all trainers and their activities with aggregated statistics and reports.'
              }
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="p-8 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Sprout className="w-5 h-5 text-primary" />
            <span>AgriTrain Manager</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Empowering agricultural education across India
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
