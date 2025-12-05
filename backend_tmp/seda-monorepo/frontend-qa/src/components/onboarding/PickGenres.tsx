import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Check, Music, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_GENRES = [
  'Electronic', 'Hip-Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'R&B', 'Country',
  'Folk', 'Reggae', 'Blues', 'Funk', 'Soul', 'Punk', 'Metal', 'Alternative',
  'Indie', 'House', 'Techno', 'Trance', 'Drum & Bass', 'Dubstep', 'Ambient',
  'Experimental', 'World', 'Latin', 'Reggaeton', 'Afrobeat', 'K-Pop', 'J-Pop'
];

interface PickGenresProps {
  onComplete: (genres: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function PickGenres({ onComplete, isLoading = false }: PickGenresProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleGenre = (genre: string) => {
    if (isSubmitting || isLoading) return;

    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        if (prev.length >= 10) {
          toast.error('You can select up to 10 genres');
          return prev;
        }
        return [...prev, genre];
      }
    });
  };

  const handleSubmit = async () => {
    console.log('🚀 [DEBUG] PickGenres: Submit button clicked');
    console.log('🚀 [DEBUG] PickGenres: Selected genres:', selectedGenres);

    if (selectedGenres.length === 0) {
      console.log('❌ [DEBUG] PickGenres: No genres selected');
      toast.error('Please select at least one genre');
      return;
    }

    console.log('⏳ [DEBUG] PickGenres: Starting submission...');
    setIsSubmitting(true);
    try {
      console.log('📞 [DEBUG] PickGenres: Calling onComplete callback...');
      await onComplete(selectedGenres);
      console.log('✅ [DEBUG] PickGenres: onComplete callback succeeded');
    } catch (error) {
      console.error('❌ [DEBUG] PickGenres: onComplete callback failed:', error);
      toast.error('Failed to save genres. Please try again.');
    } finally {
      console.log('🏁 [DEBUG] PickGenres: Submission finished, resetting submitting state');
      setIsSubmitting(false);
    }
  };

  const disabled = isSubmitting || isLoading;

  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 w-16 h-16 bg-primary rounded-xl flex items-center justify-center"
            >
              <Music className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <CardTitle className="text-2xl">Pick Your Genres</CardTitle>
            <CardDescription>
              Choose the music genres you love most. This helps us personalize your experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Selected: <span className="font-medium">{selectedGenres.length}</span> / 10
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            >
              {AVAILABLE_GENRES.map((genre, index) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <motion.button
                    key={genre}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => toggleGenre(genre)}
                    disabled={disabled}
                    className={`
                      relative p-3 rounded-lg border-2 transition-all duration-200
                      ${isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                      }
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <span className="text-sm font-medium">{genre}</span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>

            {selectedGenres.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <h4 className="text-sm font-medium">Your Selection:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedGenres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="px-3 py-1">
                      {genre}
                      <button
                        onClick={() => toggleGenre(genre)}
                        disabled={disabled}
                        className="ml-2 hover:text-destructive transition-colors"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-4"
            >
              <Button
                onClick={handleSubmit}
                disabled={selectedGenres.length === 0 || disabled}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue to sedā.fm'
                )}
              </Button>
            </motion.div>

            <p className="text-xs text-muted-foreground text-center">
              You can always change your genres later in your profile settings.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}