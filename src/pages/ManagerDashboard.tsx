import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrainers } from '@/hooks/useTrainers';
import { useAllTrainings } from '@/hooks/useTrainings';
import { StatsSidebar } from '@/components/StatsSidebar';
import { TrainingCard } from '@/components/TrainingCard';
import { TrainingDetailModal } from '@/components/TrainingDetailModal';
import { AddTrainerModal } from '@/components/AddTrainerModal';
import { TrainerCredentialsModal } from '@/components/TrainerCredentialsModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LogOut, 
  Users,
  ChevronRight,
  ArrowLeft,
  Search,
  UserPlus,
  Eye,
  Trash2,
  Loader2,
  GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Trainer, TrainingEvent } from '@/types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';

type ViewMode = 'trainers' | 'trainings';

const ManagerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { trainers, isLoading: trainersLoading, deleteTrainer, refetch: refetchTrainers } = useTrainers();
  const { trainings, isLoading: trainingsLoading, getTrainerTrainings, getTrainerStats, getAllStats, refetch: refetchTrainings } = useAllTrainings();
  
  const [viewMode, setViewMode] = useState<ViewMode>('trainers');
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTrainerOpen, setIsAddTrainerOpen] = useState(false);
  const [credentialsTrainer, setCredentialsTrainer] = useState<Trainer | null>(null);
  const [deleteTrainerId, setDeleteTrainerId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Training detail state
  const [selectedTraining, setSelectedTraining] = useState<TrainingEvent | null>(null);
  const [deleteTrainingId, setDeleteTrainingId] = useState<string | null>(null);
  const [isDeletingTraining, setIsDeletingTraining] = useState(false);

  if (!user) return null;

  const overallStats = getAllStats();
  const selectedTrainerStats = selectedTrainer ? getTrainerStats(selectedTrainer.id) : null;
  const selectedTrainerTrainings = selectedTrainer ? getTrainerTrainings(selectedTrainer.id) : [];

  const filteredTrainers = trainers.filter(trainer =>
    trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTrainings = trainings.filter(training =>
    training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (training.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (training.gps_address?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDeleteTrainer = async () => {
    if (!deleteTrainerId) return;
    
    setIsDeleting(true);
    const result = await deleteTrainer(deleteTrainerId);
    
    if (result.success) {
      toast.success('Trainer deleted successfully');
    } else {
      toast.error(result.error || 'Failed to delete trainer');
    }
    
    setIsDeleting(false);
    setDeleteTrainerId(null);
  };

  const handleDeleteTraining = async () => {
    if (!deleteTrainingId) return;
    
    setIsDeletingTraining(true);
    const { error } = await supabase
      .from('trainings')
      .delete()
      .eq('id', deleteTrainingId);

    if (error) {
      toast.error('Failed to delete training');
    } else {
      toast.success('Training deleted successfully');
      refetchTrainings();
      setSelectedTraining(null);
    }
    
    setIsDeletingTraining(false);
    setDeleteTrainingId(null);
  };

  const handleEditTraining = () => {
    // For now, show a toast - edit functionality would require a separate form
    toast.info('Edit functionality coming soon');
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
            {selectedTrainer && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSelectedTrainer(null)}
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
          <div className="flex items-center gap-3">
            {!selectedTrainer && (
              <Button variant="hero" onClick={() => setIsAddTrainerOpen(true)}>
                <UserPlus className="w-4 h-4" />
                Add Trainer
              </Button>
            )}
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </header>

        {!selectedTrainer ? (
          <>
            {/* View Mode Toggle */}
            <div className="flex items-center gap-4 mb-6">
              <div className="inline-flex rounded-lg border border-border bg-muted p-1">
                <button
                  onClick={() => { setViewMode('trainers'); setSearchQuery(''); }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'trainers'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Users className="w-4 h-4 inline-block mr-2" />
                  All Trainers
                </button>
                <button
                  onClick={() => { setViewMode('trainings'); setSearchQuery(''); }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'trainings'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 inline-block mr-2" />
                  All Trainings
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={viewMode === 'trainers' ? 'Search trainers...' : 'Search trainings...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Loading State */}
            {viewMode === 'trainers' ? (
              /* Trainers View */
              trainersLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredTrainers.map((trainer, index) => {
                    const trainerStats = getTrainerStats(trainer.id);
                    return (
                      <Card
                        key={trainer.id}
                        className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 animate-slide-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex items-center gap-3 cursor-pointer flex-1"
                              onClick={() => setSelectedTrainer(trainer)}
                            >
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
                          <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCredentialsTrainer(trainer);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTrainerId(trainer.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {filteredTrainers.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                        <Users className="w-12 h-12 text-muted-foreground" />
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                        No trainers found
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {searchQuery ? 'Try adjusting your search' : 'Add your first trainer to get started'}
                      </p>
                      {!searchQuery && (
                        <Button onClick={() => setIsAddTrainerOpen(true)}>
                          <UserPlus className="w-4 h-4" />
                          Add Trainer
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )
            ) : (
              /* Trainings View */
              trainingsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredTrainings.length > 0 ? (
                    filteredTrainings.map((training, index) => (
                      <div
                        key={training.id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <TrainingCard 
                          training={training} 
                          showActions={true}
                          onClick={() => setSelectedTraining(training)}
                          onDelete={() => setDeleteTrainingId(training.id)}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                        <GraduationCap className="w-12 h-12 text-muted-foreground" />
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                        No trainings found
                      </h3>
                      <p className="text-muted-foreground">
                        {searchQuery ? 'Try adjusting your search' : 'No trainings have been conducted yet'}
                      </p>
                    </div>
                  )}
                </div>
              )
            )}
          </>
        ) : (
          /* Selected Trainer's Trainings */
          <>
            {trainingsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {selectedTrainerTrainings.length > 0 ? (
                  selectedTrainerTrainings.map((training, index) => (
                    <div
                      key={training.id}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <TrainingCard 
                        training={training} 
                        showActions={true}
                        onClick={() => setSelectedTraining(training)}
                        onDelete={() => setDeleteTrainingId(training.id)}
                      />
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
          </>
        )}
      </main>

      {/* Add Trainer Modal */}
      <AddTrainerModal
        isOpen={isAddTrainerOpen}
        onClose={() => setIsAddTrainerOpen(false)}
        onSuccess={refetchTrainers}
      />

      {/* Trainer Credentials Modal */}
      <TrainerCredentialsModal
        trainer={credentialsTrainer}
        isOpen={!!credentialsTrainer}
        onClose={() => setCredentialsTrainer(null)}
      />

      {/* Training Detail Modal - With Edit/Delete for Managers */}
      <TrainingDetailModal
        training={selectedTraining}
        isOpen={!!selectedTraining}
        onClose={() => setSelectedTraining(null)}
        isManager={true}
        onEdit={handleEditTraining}
        onDelete={() => {
          if (selectedTraining) {
            setDeleteTrainingId(selectedTraining.id);
          }
        }}
      />

      {/* Delete Trainer Confirmation */}
      <AlertDialog open={!!deleteTrainerId} onOpenChange={() => setDeleteTrainerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trainer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trainer? This action cannot be undone and will also delete all their trainings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTrainer}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Training Confirmation */}
      <AlertDialog open={!!deleteTrainingId} onOpenChange={() => setDeleteTrainingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Training</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this training? This action cannot be undone and will remove all associated media and expenses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTraining}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingTraining}
            >
              {isDeletingTraining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Training'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManagerDashboard;
