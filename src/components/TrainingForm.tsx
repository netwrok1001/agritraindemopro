import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TrainingType, TrainingMode, ExpenseCategory, TRAINING_TYPE_LABELS, TRAINING_MODE_LABELS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Upload, 
  MapPin, 
  Users, 
  Building, 
  TreePine,
  Image,
  Video,
  X,
  Loader2,
  Plus,
  Trash2,
  GraduationCap,
  Tractor,
  UserCheck,
  IndianRupee
} from 'lucide-react';

interface TrainingFormProps {
  isOpen: boolean;
  onClose: () => void;
  trainerId: string;
  onSuccess?: () => void;
}

interface ExpenseItem {
  category_id: string;
  expense_name: string;
  amount: string;
}

type Step = 'type' | 'mode' | 'details';

export const TrainingForm: React.FC<TrainingFormProps> = ({
  isOpen,
  onClose,
  trainerId,
  onSuccess
}) => {
  const [step, setStep] = useState<Step>('type');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  
  // Form state
  const [trainingType, setTrainingType] = useState<TrainingType | null>(null);
  const [trainingMode, setTrainingMode] = useState<TrainingMode | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maleCount, setMaleCount] = useState('');
  const [femaleCount, setFemaleCount] = useState('');
  const [demographics, setDemographics] = useState({ sc: '', st: '', gen: '', obc: '' });
  const [gpsLat, setGpsLat] = useState('');
  const [gpsLng, setGpsLng] = useState('');
  const [gpsAddress, setGpsAddress] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<{ file: File; url: string; type: string }[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchExpenseCategories();
    }
  }, [isOpen]);

  const fetchExpenseCategories = async () => {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .order('name');

    if (!error && data) {
      setExpenseCategories(data);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLat(position.coords.latitude.toString());
          setGpsLng(position.coords.longitude.toString());
          toast.success('Location captured successfully!');
        },
        (error) => {
          toast.error('Failed to get location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: { file: File; url: string; type: string }[] = [];

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (isImage || isVideo) {
        newFiles.push(file);
        newPreviews.push({
          file,
          url: URL.createObjectURL(file),
          type: isImage ? 'image' : 'video'
        });
      }
    });

    setMediaFiles(prev => [...prev, ...newFiles]);
    setMediaPreviews(prev => [...prev, ...newPreviews]);
    toast.success(`${newFiles.length} file(s) added`);
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index].url);
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addExpense = () => {
    if (expenseCategories.length > 0) {
      setExpenses(prev => [...prev, { 
        category_id: expenseCategories[0].id, 
        expense_name: '', 
        amount: '' 
      }]);
    }
  };

  const updateExpense = (index: number, field: keyof ExpenseItem, value: string) => {
    setExpenses(prev => prev.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExpense = (index: number) => {
    setExpenses(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a training title');
      return;
    }

    if (!trainingType || !trainingMode) {
      toast.error('Please select training type and mode');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create training record
      const { data: training, error: trainingError } = await supabase
        .from('trainings')
        .insert({
          trainer_id: trainerId,
          title,
          description: description || null,
          training_type: trainingType,
          training_mode: trainingMode,
          total_farmers_male: parseInt(maleCount) || 0,
          total_farmers_female: parseInt(femaleCount) || 0,
          demographics_sc: parseInt(demographics.sc) || 0,
          demographics_st: parseInt(demographics.st) || 0,
          demographics_gen: parseInt(demographics.gen) || 0,
          demographics_obc: parseInt(demographics.obc) || 0,
          gps_lat: gpsLat ? parseFloat(gpsLat) : null,
          gps_lng: gpsLng ? parseFloat(gpsLng) : null,
          gps_address: gpsAddress || null
        })
        .select()
        .single();

      if (trainingError) throw trainingError;

      // Upload media files
      for (const file of mediaFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${training.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('training-media')
          .upload(fileName, file);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('training-media')
            .getPublicUrl(fileName);

          await supabase.from('training_media').insert({
            training_id: training.id,
            file_url: publicUrl,
            file_type: file.type.startsWith('image/') ? 'image' : 'video',
            file_name: file.name
          });
        }
      }

      // Add expenses
      for (const expense of expenses) {
        if (expense.expense_name && expense.amount) {
          await supabase.from('training_expenses').insert({
            training_id: training.id,
            category_id: expense.category_id,
            expense_name: expense.expense_name,
            amount: parseFloat(expense.amount)
          });
        }
      }

      toast.success('Training created successfully!');
      resetForm();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating training:', error);
      toast.error('Failed to create training');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep('type');
    setTrainingType(null);
    setTrainingMode(null);
    setTitle('');
    setDescription('');
    setMaleCount('');
    setFemaleCount('');
    setDemographics({ sc: '', st: '', gen: '', obc: '' });
    setGpsLat('');
    setGpsLng('');
    setGpsAddress('');
    mediaPreviews.forEach(p => URL.revokeObjectURL(p.url));
    setMediaFiles([]);
    setMediaPreviews([]);
    setExpenses([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderTypeSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="font-serif text-xl font-semibold">Select Training Type</h3>
        <p className="text-muted-foreground text-sm mt-1">Choose the category of farmers for this training</p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Button
          type="button"
          variant={trainingType === 'farmer_farmwoman' ? 'default' : 'outline'}
          className="h-auto py-6 flex-col gap-3"
          onClick={() => setTrainingType('farmer_farmwoman')}
        >
          <Tractor className="w-8 h-8" />
          <span className="text-lg">Farmer & Farm Woman</span>
        </Button>
        <Button
          type="button"
          variant={trainingType === 'rural_youth' ? 'default' : 'outline'}
          className="h-auto py-6 flex-col gap-3"
          onClick={() => setTrainingType('rural_youth')}
        >
          <GraduationCap className="w-8 h-8" />
          <span className="text-lg">Rural Youth</span>
        </Button>
        <Button
          type="button"
          variant={trainingType === 'inservice' ? 'default' : 'outline'}
          className="h-auto py-6 flex-col gap-3"
          onClick={() => setTrainingType('inservice')}
        >
          <UserCheck className="w-8 h-8" />
          <span className="text-lg">Inservice</span>
        </Button>
      </div>
      <Button 
        className="w-full" 
        disabled={!trainingType}
        onClick={() => setStep('mode')}
      >
        Continue
      </Button>
    </div>
  );

  const renderModeSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="font-serif text-xl font-semibold">Select Training Mode</h3>
        <p className="text-muted-foreground text-sm mt-1">Where will this training take place?</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant={trainingMode === 'on_campus' ? 'default' : 'outline'}
          className="h-auto py-8 flex-col gap-3"
          onClick={() => setTrainingMode('on_campus')}
        >
          <Building className="w-8 h-8" />
          <span className="text-lg">On Campus</span>
        </Button>
        <Button
          type="button"
          variant={trainingMode === 'off_campus' ? 'default' : 'outline'}
          className="h-auto py-8 flex-col gap-3"
          onClick={() => setTrainingMode('off_campus')}
        >
          <TreePine className="w-8 h-8" />
          <span className="text-lg">Off Campus</span>
        </Button>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => setStep('type')}>
          Back
        </Button>
        <Button 
          className="flex-1" 
          disabled={!trainingMode}
          onClick={() => setStep('details')}
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderDetailsForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-2 mb-4">
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
          {trainingType && TRAINING_TYPE_LABELS[trainingType]}
        </span>
        <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
          {trainingMode && TRAINING_MODE_LABELS[trainingMode]}
        </span>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Training Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Organic Farming Techniques"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the training objectives and content..."
            rows={3}
          />
        </div>
      </div>

      {/* Farmer Counts */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Farmer Attendance
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="male" className="text-sm text-muted-foreground">Male Farmers</Label>
            <Input
              id="male"
              type="number"
              min="0"
              value={maleCount}
              onChange={(e) => setMaleCount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="female" className="text-sm text-muted-foreground">Female Farmers</Label>
            <Input
              id="female"
              type="number"
              min="0"
              value={femaleCount}
              onChange={(e) => setFemaleCount(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div className="space-y-4">
        <Label>Demographics Breakdown</Label>
        <div className="grid grid-cols-4 gap-3">
          {(['sc', 'st', 'gen', 'obc'] as const).map((key) => (
            <div key={key}>
              <Label htmlFor={key} className="text-xs text-muted-foreground uppercase">{key}</Label>
              <Input
                id={key}
                type="number"
                min="0"
                value={demographics[key]}
                onChange={(e) => setDemographics(prev => ({
                  ...prev,
                  [key]: e.target.value
                }))}
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* GPS Coordinates */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Location
        </Label>
        <div className="space-y-3">
          <div>
            <Label htmlFor="address" className="text-sm text-muted-foreground">Address / Venue</Label>
            <Input
              id="address"
              value={gpsAddress}
              onChange={(e) => setGpsAddress(e.target.value)}
              placeholder="Enter venue name or address"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lat" className="text-sm text-muted-foreground">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={gpsLat}
                onChange={(e) => setGpsLat(e.target.value)}
                placeholder="28.6139"
              />
            </div>
            <div>
              <Label htmlFor="lng" className="text-sm text-muted-foreground">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                value={gpsLng}
                onChange={(e) => setGpsLng(e.target.value)}
                placeholder="77.2090"
              />
            </div>
          </div>
          <Button type="button" variant="outline" className="w-full" onClick={handleGetLocation}>
            <MapPin className="w-4 h-4 mr-2" />
            Get Current Location
          </Button>
        </div>
      </div>

      {/* Expenses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4" />
            Expenses
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={addExpense}>
            <Plus className="w-4 h-4 mr-1" />
            Add Expense
          </Button>
        </div>
        
        {expenses.map((expense, index) => (
          <div key={index} className="flex gap-2 items-end p-3 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <select
                value={expense.category_id}
                onChange={(e) => updateExpense(index, 'category_id', e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {expenseCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input
                value={expense.expense_name}
                onChange={(e) => updateExpense(index, 'expense_name', e.target.value)}
                placeholder="Expense name"
              />
            </div>
            <div className="w-32">
              <Label className="text-xs text-muted-foreground">Amount (₹)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={expense.amount}
                onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeExpense(index)}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Media Upload */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Media Upload
        </Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <input
            type="file"
            id="media"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="media" className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2">
                <Image className="w-8 h-8 text-muted-foreground" />
                <Video className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Click to upload photos or videos
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPG, PNG, MP4, MOV
              </p>
            </div>
          </label>
        </div>

        {mediaPreviews.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {mediaPreviews.map((preview, index) => (
              <div key={index} className="relative group">
                {preview.type === 'image' ? (
                  <img
                    src={preview.url}
                    alt={preview.file.name}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-20 bg-muted rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" className="flex-1" onClick={() => setStep('mode')}>
          Back
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Training'
          )}
        </Button>
      </div>
    </form>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Create New Training</DialogTitle>
          <DialogDescription>
            {step === 'type' && 'Step 1: Select the training type'}
            {step === 'mode' && 'Step 2: Select the training mode'}
            {step === 'details' && 'Step 3: Fill in the training details'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {step === 'type' && renderTypeSelection()}
          {step === 'mode' && renderModeSelection()}
          {step === 'details' && renderDetailsForm()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
