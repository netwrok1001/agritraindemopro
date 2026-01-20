import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrainers } from '@/hooks/useTrainers';
import { useAllTrainings } from '@/hooks/useTrainings';
import { ModePanel } from '@/components/ModePanel';
import { TrainingCard } from '@/components/TrainingCard';
import { TrainingDetailModal } from '@/components/TrainingDetailModal';
import { AddTrainerModal } from '@/components/AddTrainerModal';
import { TrainerCredentialsModal } from '@/components/TrainerCredentialsModal';
import { DownloadCSVModal } from '@/components/DownloadCSVModal';
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
  GraduationCap,
  Download,
  Bell
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ViewMode = 'trainers' | 'trainings';

interface NewAccountRow {
  id: string;
  name: string | null;
  discipline: string | null;
  post: string | null;
  approved: boolean | null;
}

const ManagerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { trainers, isLoading: trainersLoading, addTrainer, deleteTrainer, refetch: refetchTrainers } = useTrainers();
  const { trainings, isLoading: trainingsLoading, getTrainerTrainings, getTrainerStats, getAllStats, refetch: refetchTrainings } = useAllTrainings();
  
  const [viewMode, setViewMode] = useState<ViewMode>('trainers');
  const [showSidebar, setShowSidebar] = useState(false);
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all');
  const [postFilter, setPostFilter] = useState<string>('all');

  useEffect(() => {
    if (!showSidebar) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSidebar(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSidebar]);
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
  
  // CSV Modal state
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [newAccounts, setNewAccounts] = useState<NewAccountRow[]>([]);

  if (!user) return null;

  // Stats replaced by ModePanel
  const selectedTrainerTrainings = selectedTrainer ? getTrainerTrainings(selectedTrainer.id) : [];

  const filteredTrainers = trainers.filter(trainer => {
    const matchesSearch = trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trainer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiscipline = disciplineFilter === 'all' || trainer.Discipline === disciplineFilter;
    const matchesPost = postFilter === 'all' || trainer.Post === postFilter;
    return matchesSearch && matchesDiscipline && matchesPost;
  });

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (training.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (training.gps_address?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Get unique disciplines and posts from trainers
  const uniqueDisciplines = Array.from(new Set(trainers.filter(t => t.Discipline).map(t => t.Discipline)));
  const uniquePosts = Array.from(new Set(trainers.filter(t => t.Post).map(t => t.Post)));

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
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
    toast.info('Edit functionality coming soon');
  };

  const refreshNewAccounts = async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const { data, error } = await supabase
        .from('new_accounts')
        .select('id, name, discipline, post, approved')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setNewAccounts((data || []) as NewAccountRow[]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load new accounts';
      setNotificationsError(message);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleAccountDecision = async (id: string, approved: boolean) => {
    if (!approved) {
      try {
        const { error } = await supabase
          .from('new_accounts')
          .update({ approved: false })
          .eq('id', id);

        if (error) {
          throw error;
        }

        toast.success('Account rejected');
        await refreshNewAccounts();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update account';
        setNotificationsError(message);
        toast.error(message);
      }
      return;
    }

    try {
      const { data: account, error: accountError } = await supabase
        .from('new_accounts')
        .select('name, discipline, post, email, password')
        .eq('id', id)
        .maybeSingle();

      if (accountError) {
        throw accountError;
      }

      if (!account) {
        throw new Error('Account request not found');
      }

      if (!account.email || !account.password) {
        throw new Error('Account is missing email or password');
      }

      const result = await addTrainer(
        account.email,
        account.password,
        account.name || '',
        account.discipline || undefined,
        account.post || undefined
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to create trainer account');
      }

      const { error: updateError } = await supabase
        .from('new_accounts')
        .update({ approved: true })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      toast.success('Account approved and trainer created');
      await refreshNewAccounts();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve account';
      setNotificationsError(message);
      toast.error(message);
    }
  };

  useEffect(() => {
    if (!isNotificationsOpen) return;
    void refreshNewAccounts();
  }, [isNotificationsOpen]);

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
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar((s) => !s)}
              aria-label="Toggle statistics panel"
            >
              <span className="sr-only">Toggle statistics panel</span>
              {/* three-line icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.75 6.75h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5Zm0 6h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5Zm0 6h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5Z"/></svg>
            </Button>
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
                  : 'Head scientist"s Dashboard'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {selectedTrainer 
                  ? selectedTrainer.email
                  : 'Overview of all scientist and their activities'}
              </p>
            </div>
           {!selectedTrainer && (
             <div className="mt-4 flex items-center gap-3">
               <Button variant="outline" onClick={() => setIsCSVModalOpen(true)}>
                 <Download className="w-4 h-4" />
                 Download CSV
               </Button>
               <Button variant="hero" onClick={() => setIsAddTrainerOpen(true)}>
                 <UserPlus className="w-4 h-4" />
                 Add Scientist 
               </Button>
             </div>
           )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              onClick={() => setIsNotificationsOpen(true)}
            >
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {!selectedTrainer ? (
          <>
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={viewMode === 'trainers' ? 'Search trainers...' : 'Search trainings...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters - Only show for Trainers view */}
              {viewMode === 'trainers' && (
                <>
                  <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by discipline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Disciplines</SelectItem>
                      {uniqueDisciplines.map((discipline) => (
                        <SelectItem key={discipline} value={discipline || ''}>
                          {discipline}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={postFilter} onValueChange={setPostFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by post" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Posts</SelectItem>
                      {uniquePosts.map((post) => (
                        <SelectItem key={post} value={post || ''}>
                          {post}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
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

      <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>New Account Requests</DialogTitle>
          </DialogHeader>
          {notificationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : notificationsError ? (
            <div className="text-sm text-red-600 py-4">
              {notificationsError}
            </div>
          ) : newAccounts.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4">
              There are no pending account requests.
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-muted text-sm font-medium text-muted-foreground">
                <div>Name</div>
                <div>Discipline</div>
                <div>Post</div>
                <div className="text-right">Action</div>
              </div>
              <div>
                {newAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="grid grid-cols-4 gap-4 px-4 py-3 border-t text-sm items-center"
                  >
                    <div>{account.name || '-'}</div>
                    <div>{account.discipline || '-'}</div>
                    <div>{account.post || '-'}</div>
                    <div className="flex justify-end gap-2">
                      {account.approved === null ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAccountDecision(account.id, false)}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAccountDecision(account.id, true)}
                          >
                            Accept
                          </Button>
                        </>
                      ) : account.approved ? (
                        <span className="text-xs font-medium text-green-600">
                          Approved
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-red-600">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

      {/* Download CSV Modal */}
      <DownloadCSVModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        trainers={trainers}
        trainings={trainings}
      />
    </div>
  );
};

export default ManagerDashboard;
