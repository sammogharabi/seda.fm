import React from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { 
  Globe,
  Hash,
  User,
  Lock
} from 'lucide-react';

interface RoomTypeTabsProps {
  roomType: string;
  onRoomTypeChange: (type: string) => void;
}

export function RoomTypeTabs({ roomType, onRoomTypeChange }: RoomTypeTabsProps) {
  const roomTypes = [
    {
      value: 'public',
      icon: Globe,
      label: 'Public',
      color: 'accent-mint',
      description: 'Anyone can discover and join. Perfect for open music communities and general discussion.'
    },
    {
      value: 'genre',
      icon: Hash,
      label: 'Genre',
      color: 'accent-blue',
      description: 'Focused on a specific musical genre. Great for deep dives into particular sounds and styles.'
    },
    {
      value: 'artist',
      icon: User,
      label: 'Artist',
      color: 'accent-coral',
      description: 'Dedicated to a specific artist. Unofficial rooms can be claimed by verified artists later.'
    },
    {
      value: 'private',
      icon: Lock,
      label: 'Private',
      color: 'accent-yellow',
      description: 'Invite-only space. Members must be approved before joining.'
    }
  ];

  const selectedRoomType = roomTypes.find(type => type.value === roomType);

  return (
    <div>
      <Label className="text-base font-medium mb-3 block">Room Type</Label>
      <Tabs value={roomType} onValueChange={onRoomTypeChange}>
        {/* Mobile-Optimized Tab Navigation */}
        <div className="w-full">
          <TabsList className="w-full h-auto p-1 bg-secondary/50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-1">
              {roomTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <TabsTrigger 
                    key={type.value}
                    value={type.value} 
                    className="flex flex-col items-center justify-center gap-1 py-3 px-2 min-h-[60px] data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{type.label}</span>
                  </TabsTrigger>
                );
              })}
            </div>
          </TabsList>
        </div>

        {/* Selected Room Type Description */}
        {selectedRoomType && (
          <div className="mt-4 p-4 bg-secondary/20 border border-foreground/10 rounded-lg">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 bg-${selectedRoomType.color} flex items-center justify-center rounded`}>
                <selectedRoomType.icon className="w-4 h-4 text-background" />
              </div>
              <div>
                <h4 className="font-medium mb-1">{selectedRoomType.label} Room</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedRoomType.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}