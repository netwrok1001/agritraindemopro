import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, FlaskConical, MapPin, GraduationCap, BarChart2 } from 'lucide-react';

interface ModePanelProps {
  onLogout: () => Promise<void> | void;
}

export const ModePanel: React.FC<ModePanelProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (path: string) => {
    if (location.pathname !== path) navigate(path);
  };

  return (
    <aside className="w-72 bg-sidebar text-sidebar-foreground p-6 flex flex-col gap-6 min-h-screen">
      <div className="border-b border-sidebar-border pb-4">
        <h2 className="font-serif text-xl font-semibold text-sidebar-foreground">Mode</h2>
        <p className="text-sm text-sidebar-foreground/70 mt-1">Choose a workflow</p>
      </div>

      <div className="flex flex-col gap-3">
        <Button variant="secondary" className="justify-start gap-2" onClick={() => go('/oft')}>
          <MapPin className="w-4 h-4" />
          OFT (On Field Training)
        </Button>
        <Button variant="secondary" className="justify-start gap-2" onClick={() => go('/fld')}>
          <FlaskConical className="w-4 h-4" />
          FLD (Front-Line Demonstration)
        </Button>
        <Button variant="hero" className="justify-start gap-2" onClick={() => go('/dashboard')}>
          <GraduationCap className="w-4 h-4" />
          Training (Home)
        </Button>
      </div>

      <div className="mt-2">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => go('/analysis')}>
          <BarChart2 className="w-4 h-4" />
          Analysis
        </Button>
      </div>

      <div className="mt-auto pt-6 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => void onLogout()}>
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default ModePanel;
