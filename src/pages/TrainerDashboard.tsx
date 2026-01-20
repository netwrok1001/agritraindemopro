import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrainings } from '@/hooks/useTrainings';
import { ModePanel } from '@/components/ModePanel';
import { TrainingCard } from '@/components/TrainingCard';
import { TrainingForm } from '@/components/TrainingForm';
import { TrainingDetailModal } from '@/components/TrainingDetailModal';
import { TrainingEvent } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  LogOut, 
  Sprout,
  Search,
  Filter,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TrainerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [selectedTraining, setSelectedTraining] = useState<TrainingEvent | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

 React.useEffect(() => {
   if (!showSidebar) return;
   const onKey = (e: KeyboardEvent) => {
     if (e.key === 'Escape') setShowSidebar(false);
   };
   window.addEventListener('keydown', onKey);
   return () => window.removeEventListener('keydown', onKey);
 }, [showSidebar]);

  const { trainings, isLoading, refetch } = useTrainings(user?.trainerId);

  // Avoid returning before hooks; render a lightweight shell instead
  const noUser = !user;


  const filteredTrainings = trainings.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesMode = modeFilter === 'all' || t.training_mode === modeFilter;
    return matchesSearch && matchesMode;
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background relative">
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'} z-40`}
        onClick={() => setShowSidebar(false)}
        aria-hidden={!showSidebar}
      />
      <div
        className={`fixed left-0 top-0 h-screen w-80 transform transition-transform duration-300 z-50 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal={showSidebar}
        aria-label="Sidebar"
      >
        <ModePanel onLogout={handleLogout} onClose={() => setShowSidebar(false)} />
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {user && (
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar((s) => !s)}
              aria-label="Toggle statistics panel"
            >
              <span className="sr-only">Toggle statistics panel</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.75 6.75h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5Zm0 6h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5Zm0 6h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5Z"/></svg>
            </Button>
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">
                Welcome, {user.name}
              </h1>
              {(user.Discipline || user.Post) && (
                <div className="mt-3 inline-flex bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950 dark:to-emerald-950 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-2">
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {user.Discipline && user.Post ? `${user.Discipline} • ${user.Post}` : user.Discipline || user.Post}
                  </span>
                </div>
              )}
              <p className="text-muted-foreground mt-1">
                Manage your agricultural training sessions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="hero" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4" />
              New Training
            </Button>
          </div>
        </header>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search trainings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={modeFilter} onValueChange={setModeFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="on_campus">On Campus</SelectItem>
              <SelectItem value="off_campus">Off Campus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredTrainings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTrainings.map((training, index) => (
              <div
                key={training.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <TrainingCard 
                  training={training}
                  onClick={() => setSelectedTraining(training)}
                  showActions={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <Sprout className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              No trainings found
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || modeFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first training session'}
            </p>
            {!searchQuery && modeFilter === 'all' && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4" />
                Create Training
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Training Form Modal */}
      {user.trainerId && (
        <TrainingForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          trainerId={user.trainerId}
          onSuccess={refetch}
        />
      )}

      {/* Training Detail Modal - View Only for Trainers */}
      <TrainingDetailModal
        training={selectedTraining}
        isOpen={!!selectedTraining}
        onClose={() => setSelectedTraining(null)}
        isManager={false}
      />
    </div>
  );
};

export default TrainerDashboard;
