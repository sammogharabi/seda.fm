import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { 
  Type,
  Music,
  Users,
  List,
  X,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: () => void;
  onCreateRoom: () => void;
  onCreateCrate: () => void;
  user: any;
}

export function CreateModal({ 
  isOpen, 
  onClose, 
  onCreatePost, 
  onCreateRoom, 
  onCreateCrate,
  user 
}: CreateModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const createOptions = [
    {
      id: 'post',
      title: 'Create Post',
      description: 'Share your thoughts, music discoveries, or announce events',
      icon: Type,
      color: 'accent-coral',
      action: onCreatePost
    },
    {
      id: 'room',
      title: 'Create Room',
      description: 'Build a music community around genres, artists, or vibes',
      icon: Users,
      color: 'accent-mint',
      action: onCreateRoom
    },
    {
      id: 'crate',
      title: 'Create Crate',
      description: 'Curate and organize your favorite tracks and albums',
      icon: List,
      color: 'accent-blue',
      action: onCreateCrate
    }
  ];

  const handleOptionSelect = (option: typeof createOptions[0]) => {
    setSelectedType(option.id);
    
    // Add a small delay for visual feedback
    setTimeout(() => {
      onClose();
      option.action();
      setSelectedType(null);
    }, 150);
  };

  const handleClose = () => {
    setSelectedType(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto" aria-describedby="create-modal-description">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl">What do you want to create?</DialogTitle>
          <DialogDescription id="create-modal-description">
            Choose what you'd like to share with the sedā.fm community
          </DialogDescription>
        </DialogHeader>

        {/* User Info */}
        <div className="flex items-center gap-3 p-4 bg-secondary/30 border border-foreground/10 rounded-lg mb-4">
          <div className="w-10 h-10 bg-accent-coral text-background flex items-center justify-center font-semibold border border-foreground/20 rounded">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium">{user?.displayName || user?.username || 'User'}</p>
            <p className="text-sm text-muted-foreground">@{user?.username || 'user'}</p>
          </div>
        </div>

        {/* Create Options */}
        <div className="space-y-3">
          {createOptions.map((option, index) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.id;
            
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg border-l-4 border-l-${option.color} hover:border-l-${option.color}/80 ${
                    isSelected ? `bg-${option.color}/10` : 'hover:bg-secondary/50'
                  }`}
                  onClick={() => handleOptionSelect(option)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-${option.color} text-background flex items-center justify-center rounded-lg`}>
                        {isSelected ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <ArrowRight className="w-6 h-6" />
                          </motion.div>
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{option.title}</h3>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      
                      <ArrowRight className={`w-5 h-5 text-muted-foreground transition-all ${
                        isSelected ? 'opacity-0' : 'group-hover:translate-x-1'
                      }`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Cancel Button */}
        <div className="flex justify-center pt-4 border-t border-foreground/10">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="px-8"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}