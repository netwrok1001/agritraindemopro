import React from 'react';
import { Trainer } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Mail, User, Calendar, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface TrainerCredentialsModalProps {
  trainer: Trainer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TrainerCredentialsModal: React.FC<TrainerCredentialsModalProps> = ({
  trainer,
  isOpen,
  onClose
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  if (!trainer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <User className="w-6 h-6" />
            Trainer Credentials
          </DialogTitle>
          <DialogDescription>
            Login credentials for {trainer.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{trainer.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{trainer.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{format(new Date(trainer.created_at), 'PPP')}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Note: For security reasons, passwords are not stored in a retrievable format. 
              If the trainer forgets their password, you'll need to reset it through the authentication system.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
