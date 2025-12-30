import React from 'react';
import { TrainingEvent, TRAINING_TYPE_LABELS, TRAINING_MODE_LABELS } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Users, 
  Calendar,
  Image,
  Video,
  IndianRupee
} from 'lucide-react';
import { format } from 'date-fns';

interface TrainingDetailModalProps {
  training: TrainingEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TrainingDetailModal: React.FC<TrainingDetailModalProps> = ({
  training,
  isOpen,
  onClose
}) => {
  if (!training) return null;

  const totalExpenses = training.expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{training.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="default">
              {TRAINING_TYPE_LABELS[training.training_type]}
            </Badge>
            <Badge variant="secondary">
              {TRAINING_MODE_LABELS[training.training_mode]}
            </Badge>
          </div>

          {/* Description */}
          {training.description && (
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground">{training.description}</p>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Created on {format(new Date(training.created_at), 'PPP')}</span>
          </div>

          {/* Farmer Stats */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Farmer Attendance
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">
                  {training.total_farmers_male + training.total_farmers_female}
                </p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold">{training.total_farmers_male}</p>
                <p className="text-sm text-muted-foreground">Male</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold">{training.total_farmers_female}</p>
                <p className="text-sm text-muted-foreground">Female</p>
              </div>
            </div>
          </div>

          {/* Demographics */}
          <div>
            <h4 className="font-semibold mb-3">Demographics Breakdown</h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-muted/50 p-3 rounded-lg text-center">
                <p className="text-xl font-bold">{training.demographics_sc}</p>
                <p className="text-xs text-muted-foreground uppercase">SC</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg text-center">
                <p className="text-xl font-bold">{training.demographics_st}</p>
                <p className="text-xs text-muted-foreground uppercase">ST</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg text-center">
                <p className="text-xl font-bold">{training.demographics_gen}</p>
                <p className="text-xs text-muted-foreground uppercase">GEN</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg text-center">
                <p className="text-xl font-bold">{training.demographics_obc}</p>
                <p className="text-xs text-muted-foreground uppercase">OBC</p>
              </div>
            </div>
          </div>

          {/* Location */}
          {(training.gps_address || training.gps_lat) && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </h4>
              {training.gps_address && (
                <p className="text-muted-foreground mb-2">{training.gps_address}</p>
              )}
              {training.gps_lat && training.gps_lng && (
                <p className="text-sm text-muted-foreground">
                  Coordinates: {training.gps_lat}, {training.gps_lng}
                </p>
              )}
            </div>
          )}

          {/* Expenses */}
          {training.expenses && training.expenses.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Expenses
              </h4>
              <div className="space-y-2">
                {training.expenses.map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{expense.expense_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.category?.name}
                      </p>
                    </div>
                    <p className="font-semibold">₹{Number(expense.amount).toLocaleString('en-IN')}</p>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg font-semibold">
                  <span>Total</span>
                  <span>₹{totalExpenses.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Media */}
          {training.media && training.media.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Image className="w-4 h-4" />
                Media ({training.media.length} files)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {training.media.map((file) => (
                  <div key={file.id} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    {file.file_type === 'image' ? (
                      <img
                        src={file.file_url}
                        alt={file.file_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={file.file_url}
                        controls
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
