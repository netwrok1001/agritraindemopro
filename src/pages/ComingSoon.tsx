import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ComingSoon: React.FC = () => {
  const location = useLocation();
  const label = location.pathname.toUpperCase().replace('/', '') || 'Feature';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
          <Construction className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="font-serif text-3xl font-bold mb-2">{label} - Coming Soon</h1>
        <p className="text-muted-foreground mb-6">We are working hard to bring this experience to you. Please check back later.</p>
        <Button asChild>
          <Link to="/dashboard">Go to Training (Home)</Link>
        </Button>
      </div>
    </div>
  );
};

export default ComingSoon;
