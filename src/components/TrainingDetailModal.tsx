import React, { useState, useRef } from 'react';
import { TrainingEvent, TRAINING_TYPE_LABELS, TRAINING_MODE_LABELS } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Users, 
  Calendar,
  Image,
  Video,
  IndianRupee,
  Download,
  Trash2,
  Pencil,
  X,
  ZoomIn,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface TrainingDetailModalProps {
  training: TrainingEvent | null;
  isOpen: boolean;
  onClose: () => void;
  isManager?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TrainingDetailModal: React.FC<TrainingDetailModalProps> = ({
  training,
  isOpen,
  onClose,
  isManager = false,
  onEdit,
  onDelete
}) => {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const extSectionRef = useRef<HTMLDivElement | null>(null);
  const [extLoading, setExtLoading] = useState(false);
  const [extError, setExtError] = useState<string | null>(null);
  const [extData, setExtData] = useState<{ title: string | null; description: string | null; partner: string | null; media_urls: string | null } | null>(null);

  // Avoid returning before hooks; guard inside effects and render


  // Fetch extension activity details from extension_activities table when modal opens
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!training?.id) return;
      setExtLoading(true);
      setExtError(null);
      try {
        const { data, error } = await supabase
          .from('extension_activities')
          .select('title, description, partner, media_urls')
          .eq('training_id', training.id)
          .single();
        if (error) throw error;
        if (!cancelled) setExtData(data as any);
      } catch (e: any) {
        if (!cancelled) setExtError(e?.message || 'Failed to load extension activity');
      } finally {
        if (!cancelled) setExtLoading(false);
      }
    };
    if (isOpen) load();
    return () => { cancelled = true; };
  }, [isOpen, training?.id]);

  const totalExpenses = (training?.expenses ?? []).reduce((sum, exp) => sum + Number(exp.amount), 0);

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  const images = training.media?.filter(m => m.file_type.startsWith('image')) || [];
  const videos = training.media?.filter(m => m.file_type.startsWith('video')) || [];

  // Render nothing if closed or missing training
  if (!isOpen || !training) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] sm:w-auto max-w-4xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto" data-hide-close>
          <DialogHeader className="relative pt-12">
            <Button
              size="icon"
              variant="ghost"
              className="absolute left-4 top-4"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="font-serif text-xl sm:text-2xl leading-snug">{training.title}</DialogTitle>
              <div className="flex items-center gap-2">
                {training.extension_activity && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      extSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    See Extension Activity
                  </Button>
                )}
                {isManager && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.();
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.();
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
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

            {/* Trainer Info */}
            {training.trainer && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Trainer</p>
                <p className="font-medium">{training.trainer.name}</p>
                <p className="text-sm text-muted-foreground">{training.trainer.email}</p>
              </div>
            )}

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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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
                  <a
                    href={`https://www.google.com/maps?q=${training.gps_lat},${training.gps_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on Google Maps ({training.gps_lat}, {training.gps_lng})
                  </a>
                )}
              </div>
            )}

            {/* Extension Activity */}
            {(training.extension_activity || extData || extLoading || extError) && (
              <div ref={extSectionRef}>
                <h4 className="font-semibold mb-3">Extension Activity</h4>
                {extLoading && <p className="text-sm text-muted-foreground">Loading extension activity…</p>}
                {extError && <p className="text-sm text-red-500">{extError}</p>}
                <div className="space-y-2">
                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    {extData?.title ? (
                      <p className="font-medium">{extData.title}</p>
                    ) : (
                      training.extension_activity && training.extension_activity.title && (
                        <p className="font-medium">{training.extension_activity.title}</p>
                      )
                    )}
                    {extData?.partner ? (
                      <Badge variant="outline">Partner: {extData.partner}</Badge>
                    ) : (
                      training.extension_activity && training.extension_activity.partner && (
                        <Badge variant="outline">Partner: {training.extension_activity.partner}</Badge>
                      )
                    )}
                  </div>

                  {/* Description */}
                  {extData?.description ? (
                    <p className="text-sm text-muted-foreground">{extData.description}</p>
                  ) : (
                    training.extension_activity && training.extension_activity.description && (
                      <p className="text-sm text-muted-foreground">{training.extension_activity.description}</p>
                    )
                  )}

                  {/* Media from extData.media_urls (comma-separated) */}
                  {extData?.media_urls && extData.media_urls.trim().length > 0 && (
                    <div className="mt-3 space-y-4">
                      {extData.media_urls.split(',').map(s => s.trim()).filter(Boolean).some(u => /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(u)) && (
                        <div>
                          <h5 className="font-medium mb-2 flex items-center gap-2">
                            <Image className="w-4 h-4" />
                            Extension Images
                          </h5>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                            {extData.media_urls.split(',').map(s => s.trim()).filter(Boolean).filter(u => /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(u)).map((url, idx) => (
                              <div key={`ext-img-${idx}`} className="relative group aspect-video rounded-lg overflow-hidden bg-muted">
                                <img src={url} alt={`Extension image ${idx+1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <Button size="icon" variant="secondary" onClick={() => setSelectedMedia(url)}>
                                    <ZoomIn className="w-4 h-4" />
                                  </Button>
                                  <Button size="icon" variant="secondary" onClick={() => handleDownload(url, `extension-image-${idx+1}.jpg`)}>
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {extData.media_urls.split(',').map(s => s.trim()).filter(Boolean).some(u => /\.(mp4|mov|m4v|webm|ogg)(\?|$)/i.test(u)) && (
                        <div>
                          <h5 className="font-medium mb-2 flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Extension Videos
                          </h5>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                            {extData.media_urls.split(',').map(s => s.trim()).filter(Boolean).filter(u => /\.(mp4|mov|m4v|webm|ogg)(\?|$)/i.test(u)).map((url, idx) => (
                              <div key={`ext-vid-${idx}`} className="relative rounded-lg overflow-hidden bg-muted">
                                <video src={url} controls className="w-full aspect-video object-cover" />
                                <div className="p-2 flex items-center justify-between bg-muted/80">
                                  <span className="text-sm truncate flex-1">{url.split('/').pop() || `extension-video-${idx+1}.mp4`}</span>
                                  <Button size="icon" variant="ghost" onClick={() => handleDownload(url, url.split('/').pop() || `extension-video-${idx+1}.mp4`)}>
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Expenses */}
            {training.expenses && training.expenses.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Expenses ({training.expenses.length} items)
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
                    <span>Total Expenses</span>
                    <span className="text-primary">₹{totalExpenses.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Media - Images */}
            {images.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Images ({images.length})
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  {images.map((file) => (
                    <div key={file.id} className="relative group aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={file.file_url}
                        alt={file.file_name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => setSelectedMedia(file.file_url)}
                        >
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => handleDownload(file.file_url, file.file_name)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media - Videos */}
            {videos.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Videos ({videos.length})
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  {videos.map((file) => (
                    <div key={file.id} className="relative rounded-lg overflow-hidden bg-muted">
                      <video
                        src={file.file_url}
                        controls
                        className="w-full aspect-video object-cover"
                      />
                      <div className="p-2 flex items-center justify-between bg-muted/80">
                        <span className="text-sm truncate flex-1">{file.file_name}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDownload(file.file_url, file.file_name)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full-size Image Viewer */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedMedia(null)}
          >
            <X className="w-6 h-6" />
          </Button>
          <img
            src={selectedMedia}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};
