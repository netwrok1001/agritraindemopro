import React from 'react';
import { TrainingEvent } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  MapPin,
  Calendar,
  Building,
  TreePine,
  Trash2,
  Image,
  Video
} from 'lucide-react';
import { format } from 'date-fns';

interface TrainingCardProps {
  training: TrainingEvent;
  onDelete?: () => void;
  showActions?: boolean;
}

export const TrainingCard: React.FC<TrainingCardProps> = ({
  training,
  onDelete,
  showActions = true
}) => {
  const totalFarmers = training.totalFarmersMale + training.totalFarmersFemale;
  const CategoryIcon = training.category === 'on-campus' ? Building : TreePine;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant={training.category === 'on-campus' ? 'default' : 'secondary'}
                className="text-xs"
              >
                <CategoryIcon className="w-3 h-3 mr-1" />
                {training.category === 'on-campus' ? 'On-campus' : 'Off-campus'}
              </Badge>
              {training.media.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {training.media.filter(m => m.type === 'image').length > 0 && (
                    <Image className="w-3 h-3 mr-1" />
                  )}
                  {training.media.filter(m => m.type === 'video').length > 0 && (
                    <Video className="w-3 h-3 mr-1" />
                  )}
                  {training.media.length}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {training.title}
            </CardTitle>
          </div>
          {showActions && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {training.description}
        </p>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">{totalFarmers}</span>
            <span>farmers</span>
          </div>
          <div className="text-xs text-muted-foreground">
            ({training.totalFarmersMale}M / {training.totalFarmersFemale}F)
          </div>
        </div>

        <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 text-accent shrink-0" />
          <span className="line-clamp-1">
            {training.coordinates.address || `${training.coordinates.lat.toFixed(4)}, ${training.coordinates.lng.toFixed(4)}`}
          </span>
        </div>

        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(training.createdAt), 'MMM d, yyyy')}
            </div>
            <div className="flex gap-2">
              {Object.entries(training.demographics).map(([key, value]) => (
                value > 0 && (
                  <span key={key} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {key.toUpperCase()}: {value}
                  </span>
                )
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
