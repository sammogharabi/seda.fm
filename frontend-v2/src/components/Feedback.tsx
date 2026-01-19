import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { MessageSquare, Star } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface FeedbackProps {
  user: any;
}

export function Feedback({ user }: FeedbackProps) {
  const [userType, setUserType] = useState<'artist' | 'fan' | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType) {
      toast.error('Please select your user type');
      return;
    }
    
    if (rating === null) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Please provide your feedback');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send feedback to backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2cdc6b38/feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            userType,
            rating,
            comment,
            username: user?.username || 'Anonymous',
            userId: user?.id || null
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to submit feedback:', errorData);
        throw new Error(errorData.error || 'Failed to submit feedback');
      }

      const data = await response.json();
      console.log('Feedback submitted successfully:', data);

      toast.success('Feedback submitted!', {
        description: 'Thank you for helping us improve sedā.fm'
      });
      
      // Reset form
      setUserType(null);
      setRating(null);
      setComment('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback', {
        description: 'Please try again later'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-accent-coral/10 flex items-center justify-center rounded-lg border border-accent-coral/20">
              <MessageSquare className="w-5 h-5 text-accent-coral" />
            </div>
            <h1 className="text-3xl">Feedback</h1>
          </div>
          <p className="text-muted-foreground">
            Help us build the future of music culture. Your feedback shapes sedā.fm.
          </p>
        </div>

        {/* Feedback Form */}
        <Card className="p-6 md:p-8 border-foreground/10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* User Type Selection */}
            <div>
              <label className="block mb-4">
                I am a(n):
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('artist')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === 'artist'
                      ? 'border-accent-coral bg-accent-coral/10'
                      : 'border-foreground/10 hover:border-foreground/20 hover:bg-secondary/50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-lg mb-1 ${userType === 'artist' ? 'text-accent-coral' : ''}`}>
                      Artist
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Creator, musician, producer
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('fan')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === 'fan'
                      ? 'border-accent-coral bg-accent-coral/10'
                      : 'border-foreground/10 hover:border-foreground/20 hover:bg-secondary/50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-lg mb-1 ${userType === 'fan' ? 'text-accent-coral' : ''}`}>
                      Fan
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Listener, supporter, curator
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block mb-4">
                Rate your experience (1-10):
              </label>
              <div className="grid grid-cols-10 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className={`aspect-square rounded-lg border-2 transition-all flex items-center justify-center ${
                      rating === num
                        ? 'border-accent-coral bg-accent-coral/10 text-accent-coral'
                        : 'border-foreground/10 hover:border-foreground/20 hover:bg-secondary/50'
                    }`}
                  >
                    <span className={rating === num ? '' : 'text-muted-foreground'}>
                      {num}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Not good</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Comment Box */}
            <div>
              <label className="block mb-4">
                Your feedback:
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you think. What's working? What could be better? What features would you like to see?"
                className="min-h-[160px] resize-none border-foreground/10 focus:border-accent-coral/50"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Be honest, be specific</span>
                <span>{comment.length} characters</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !userType || rating === null || !comment.trim()}
                className="w-full h-12 bg-accent-coral hover:bg-accent-coral/90 text-background disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 p-6 border-foreground/10 bg-accent-blue/5">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Star className="w-5 h-5 text-accent-blue" />
            </div>
            <div>
              <h3 className="mb-2">Your voice matters</h3>
              <p className="text-sm text-muted-foreground">
                sedā.fm is built by and for the music community. Every piece of feedback helps us create a better platform for artists and fans alike.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
