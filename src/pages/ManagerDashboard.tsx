import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTraining } from '@/contexts/TrainingContext';
import { StatsSidebar } from '@/components/StatsSidebar';
import { TrainingCard } from '@/components/TrainingCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LogOut, 
  Users,
  ChevronRight,
  ArrowLeft,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

// Demo trainers list
const TRAINERS = [
  { id: '1', name: 'Rajesh Kumar', email: 'trainer@agri.com' },
  { id: '2', name: 'Priya Sharma', email: 'trainer2@agri.com' },
];

const ManagerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { getAllStats, getTrainerTrainings, getTrainerStats, trainings } = useTraining();
  const navigate = useNavigate();
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) return null;

  const overallStats = getAllStats();
  const selectedTrainer = TRAINERS.find(t => t.id === selectedTrainerId);
  const selectedTrainerStats = selectedTrainerId ? getTrainerStats(selectedTrainerId) : null;
  const selectedTrainerTrainings = selectedTrainerId ? getTrainerTrainings(selectedTrainerId) : [];

  const filteredTrainers = TRAINERS.filter(trainer =>
    trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <StatsSidebar 
        stats={selectedTrainerStats || overallStats} 
        title={selectedTrainer ? `${selectedTrainer.name}'s Stats` : "Overall Statistics"} 
      />

      <main className="flex-1 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {selectedTrainerId && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSelectedTrainerId(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">
                {selectedTrainer 
                  ? `${selectedTrainer.name}'s Trainings`
                  : 'Manager Dashboard'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {selectedTrainer 
                  ? selectedTrainer.email
                  : 'Overview of all trainers and their activities'}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </header>

        {!selectedTrainerId ? (
          <>
            {/* Search */}
            <div className="relative max-w-md mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search trainers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Trainers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTrainers.map((trainer, index) => {
                const trainerStats = getTrainerStats(trainer.id);
                return (
                  <Card
                    key={trainer.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => setSelectedTrainerId(trainer.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{trainer.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{trainer.email}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{trainerStats.totalTrainings}</p>
                          <p className="text-xs text-muted-foreground">Trainings</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-accent">{trainerStats.totalFarmers}</p>
                          <p className="text-xs text-muted-foreground">Farmers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-success">{trainerStats.onCampusTrainings + trainerStats.offCampusTrainings}</p>
                          <p className="text-xs text-muted-foreground">Sessions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          /* Selected Trainer's Trainings */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {selectedTrainerTrainings.length > 0 ? (
              selectedTrainerTrainings.map((training, index) => (
                <div
                  key={training.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <TrainingCard training={training} showActions={false} />
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Users className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  No trainings yet
                </h3>
                <p className="text-muted-foreground">
                  This trainer hasn't conducted any trainings yet.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManagerDashboard;
