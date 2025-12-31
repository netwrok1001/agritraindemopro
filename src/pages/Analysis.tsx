import React from 'react';
import { BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Analysis: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="max-w-2xl w-full text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
          <BarChart2 className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="font-serif text-3xl font-bold mb-2">Analysis</h1>
        <p className="text-muted-foreground mb-6">Insights and analytics will appear here. For now, continue managing your trainings.</p>
        <Button asChild>
          <Link to="/dashboard">Back to Training</Link>
        </Button>
      </div>
    </div>
  );
};

export default Analysis;
