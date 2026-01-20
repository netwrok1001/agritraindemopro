import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, UserPlus, Mail, Phone, User, Briefcase, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const POST_OPTIONS = ['Scientist', 'STO', 'Head'];

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [post, setPost] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [headsEmail, setHeadsEmail] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !post.trim() || !discipline.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (contactMethod === 'email' && !email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (contactMethod === 'phone' && !phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    if (contactMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (contactMethod === 'phone' && !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (post !== 'Head' && !headsEmail.trim()) {
      toast.error('Please enter your head\'s email address');
      return;
    }

    if (headsEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(headsEmail)) {
      toast.error('Please enter a valid email address for head');
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter a password');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!confirmPassword.trim()) {
      toast.error('Please confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const contactMethodValue = contactMethod === 'email' ? 1 : 2;

      const { error } = await supabase.from('new_accounts').insert({
        name,
        post,
        discipline,
        heads_email: post === 'Head' ? null : headsEmail,
        contact_method: contactMethodValue,
        email: contactMethod === 'email' ? email : null,
        phone: contactMethod === 'phone' ? phone : null,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Account creation request submitted!');
      resetForm();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting account request:', error);
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPost('');
    setDiscipline('');
    setHeadsEmail('');
    setEmail('');
    setPhone('');
    setContactMethod('email');
    setPassword('');
    setConfirmPassword('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <UserPlus className="w-6 h-6" />
            Create Account
          </DialogTitle>
          <DialogDescription>
            Fill in your details to create a new account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="post">Post</Label>
            <Select value={post} onValueChange={setPost} required>
              <SelectTrigger id="post" className="pl-10">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Select your post" />
              </SelectTrigger>
              <SelectContent>
                {POST_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discipline">Discipline</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="discipline"
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                placeholder="Enter your discipline"
                className="pl-10"
                required
              />
            </div>
          </div>

          {post !== 'Head' && (
            <div className="space-y-2">
              <Label htmlFor="headsEmail">Head's Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="headsEmail"
                  type="email"
                  value={headsEmail}
                  onChange={(e) => setHeadsEmail(e.target.value)}
                  placeholder="Enter your head's email"
                  className="pl-10"
                  required={post !== 'Head'}
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label>Contact Information</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setContactMethod('email');
                  setPhone('');
                }}
                className={`flex-1 py-2 px-3 rounded-md border transition-colors ${
                  contactMethod === 'email'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-input hover:bg-accent'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setContactMethod('phone');
                  setEmail('');
                }}
                className={`flex-1 py-2 px-3 rounded-md border transition-colors ${
                  contactMethod === 'phone'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-input hover:bg-accent'
                }`}
              >
                Phone
              </button>
            </div>

            {contactMethod === 'email' ? (
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="pl-10"
                  required={contactMethod === 'email'}
                />
              </div>
            ) : (
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit phone number"
                  className="pl-10"
                  required={contactMethod === 'phone'}
                />
              </div>
            )}
          </div>
260→
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAccountModal;
