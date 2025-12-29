import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTraining } from '@/contexts/TrainingContext';
import { StatsSidebar } from '@/components/StatsSidebar';
import { TrainingCard } from '@/components/TrainingCard';
import { TrainingForm } from '@/components/TrainingForm';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  LogOut, 
  Sprout,
  Search,
  Filter
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
  const { getTrainerStats, getTrainerTrainings, deleteTraining } = useTraining();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  if (!user) return null;

  const stats = getTrainerStats(user.id);
  const trainings = getTrainerTrainings(user.id);

  const filteredTrainings = trainings.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <StatsSidebar stats={stats} title="My Statistics" />

      <main className="flex-1 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Welcome, {user.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your agricultural training sessions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="hero" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4" />
              New Training
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </header>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search trainings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="on-campus">On-campus</SelectItem>
              <SelectItem value="off-campus">Off-campus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Training Cards Grid */}
        {filteredTrainings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTrainings.map((training, index) => (
              <div
                key={training.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <TrainingCard
                  training={training}
                  onDelete={() => deleteTraining(training.id)}
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
              {searchQuery || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first training session'}
            </p>
            {!searchQuery && categoryFilter === 'all' && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4" />
                Create Training
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Training Form Modal */}
      <TrainingForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        trainerId={user.id}
        trainerName={user.name}
      />
    </div>
  );
};

export default TrainerDashboard;
