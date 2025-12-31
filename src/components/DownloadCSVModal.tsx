import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Download, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Trainer, TrainingEvent } from '@/types';
import { TRAINING_TYPE_LABELS, TRAINING_MODE_LABELS } from '@/types';

interface DownloadCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainers: Trainer[];
  trainings: TrainingEvent[];
}

export const DownloadCSVModal: React.FC<DownloadCSVModalProps> = ({
  isOpen,
  onClose,
  trainers,
  trainings,
}) => {
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [selectAllTrainers, setSelectAllTrainers] = useState(true);
  const [selectedTrainerIds, setSelectedTrainerIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTrainerToggle = (trainerId: string) => {
    setSelectedTrainerIds(prev =>
      prev.includes(trainerId)
        ? prev.filter(id => id !== trainerId)
        : [...prev, trainerId]
    );
    setSelectAllTrainers(false);
  };

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAllTrainers(checked);
    if (checked) {
      setSelectedTrainerIds([]);
    }
  };

  const generateCSV = () => {
    setIsGenerating(true);

    // Filter trainings based on criteria
    let filteredTrainings = trainings;

    // Filter by date range
    if (fromDate) {
      filteredTrainings = filteredTrainings.filter(
        t => new Date(t.created_at) >= fromDate
      );
    }
    if (toDate) {
      const endOfDay = new Date(toDate);
      endOfDay.setHours(23, 59, 59, 999);
      filteredTrainings = filteredTrainings.filter(
        t => new Date(t.created_at) <= endOfDay
      );
    }

    // Filter by trainers
    if (!selectAllTrainers && selectedTrainerIds.length > 0) {
      filteredTrainings = filteredTrainings.filter(t =>
        selectedTrainerIds.includes(t.trainer_id)
      );
    }

    // Get trainer name by ID
    const getTrainerName = (trainerId: string) => {
      const trainer = trainers.find(t => t.id === trainerId);
      return trainer?.name || 'Unknown';
    };

    // Generate CSV content
    const headers = [
      'Training Title',
      'Description',
      'Trainer Name',
      'Training Type',
      'Training Mode',
      'Date',
      'Male Farmers',
      'Female Farmers',
      'Total Farmers',
      'SC',
      'ST',
      'OBC',
      'GEN',
      'GPS Address',
      'GPS Latitude',
      'GPS Longitude',
      'Total Expenses',
      'Expense Details',
    ];

    const rows = filteredTrainings.map(training => {
      const totalFarmers = training.total_farmers_male + training.total_farmers_female;
      const totalExpenses = training.expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const expenseDetails = training.expenses
        ?.map(e => `${e.expense_name}: ₹${e.amount}`)
        .join('; ') || '';

      return [
        `"${(training.title || '').replace(/"/g, '""')}"`,
        `"${(training.description || '').replace(/"/g, '""')}"`,
        `"${getTrainerName(training.trainer_id)}"`,
        `"${TRAINING_TYPE_LABELS[training.training_type] || training.training_type}"`,
        `"${TRAINING_MODE_LABELS[training.training_mode] || training.training_mode}"`,
        `"${format(new Date(training.created_at), 'dd/MM/yyyy')}"`,
        training.total_farmers_male,
        training.total_farmers_female,
        totalFarmers,
        training.demographics_sc,
        training.demographics_st,
        training.demographics_obc,
        training.demographics_gen,
        `"${(training.gps_address || '').replace(/"/g, '""')}"`,
        training.gps_lat || '',
        training.gps_lng || '',
        totalExpenses,
        `"${expenseDetails.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trainings_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsGenerating(false);
    onClose();
  };

  const handleClose = () => {
    setFromDate(undefined);
    setToDate(undefined);
    setSelectAllTrainers(true);
    setSelectedTrainerIds([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download Training Data
          </DialogTitle>
          <DialogDescription>
            Select date range and trainers to export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date Range</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "dd/MM/yyyy") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "dd/MM/yyyy") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    disabled={(date) => fromDate ? date < fromDate : false}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Trainer Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Trainers</Label>
            <div className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-trainers"
                  checked={selectAllTrainers}
                  onCheckedChange={handleSelectAllChange}
                />
                <Label htmlFor="all-trainers" className="text-sm font-medium cursor-pointer">
                  All Trainers
                </Label>
              </div>

              {!selectAllTrainers && (
                <ScrollArea className="h-32 mt-2 pr-2">
                  <div className="space-y-2">
                    {trainers.map(trainer => (
                      <div key={trainer.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={trainer.id}
                          checked={selectedTrainerIds.includes(trainer.id)}
                          onCheckedChange={() => handleTrainerToggle(trainer.id)}
                        />
                        <Label htmlFor={trainer.id} className="text-sm cursor-pointer">
                          {trainer.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={generateCSV} 
            disabled={isGenerating || (!selectAllTrainers && selectedTrainerIds.length === 0)}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
