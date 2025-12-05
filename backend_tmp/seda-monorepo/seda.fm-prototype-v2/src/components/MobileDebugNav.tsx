import React from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';
import { Home, Compass, User, Users, Search } from 'lucide-react';

interface MobileDebugNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function MobileDebugNav({ 
  currentView, 
  onViewChange, 
  sidebarOpen, 
  setSidebarOpen 
}: MobileDebugNavProps) {
  
  const handleNavClick = (view: string) => {
    console.log('🐛 DEBUG NAV: Clicked', view);
    onViewChange(view);
    setSidebarOpen(false);
  };

  const testNavItems = [
    { id: 'feed', label: 'Home', icon: Home },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'rooms', label: 'Rooms', icon: Users },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  console.log('🐛 DEBUG NAV: Rendering with', { currentView, sidebarOpen });

  return (
    <div className="fixed top-4 left-4 z-[999] bg-accent-coral text-background p-2 text-xs rounded">
      <div className="mb-2">DEBUG NAV - View: {currentView}</div>
      
      {/* Test Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={(open) => {
        console.log('🐛 DEBUG SHEET: State changing to', open);
        setSidebarOpen(open);
      }}>
        <SheetTrigger asChild>
          <Button 
            size="sm"
            className="mb-2 bg-background text-foreground hover:bg-background/90"
            onClick={() => console.log('🐛 DEBUG: Sheet trigger clicked')}
          >
            OPEN SHEET
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0" aria-describedby="debug-nav-description">
          <SheetTitle className="sr-only">Debug Navigation</SheetTitle>
          <SheetDescription id="debug-nav-description" className="sr-only">Debug navigation menu</SheetDescription>
          
          <div className="p-4 bg-card h-full">
            <h3 className="font-medium mb-4">Debug Navigation</h3>
            <div className="space-y-2">
              {testNavItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start h-12 text-sm ${
                    currentView === item.id 
                      ? 'bg-accent-coral/10 text-accent-coral' 
                      : ''
                  }`}
                  onClick={() => {
                    console.log('🐛 DEBUG: Navigation item clicked', item.id);
                    handleNavClick(item.id);
                  }}
                  style={{ 
                    pointerEvents: 'auto', 
                    touchAction: 'manipulation',
                    minHeight: '48px'
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Direct test buttons */}
      <div className="space-y-1">
        {testNavItems.map((item) => (
          <Button
            key={`direct-${item.id}`}
            size="sm"
            variant="ghost"
            className={`w-full justify-start text-xs ${
              currentView === item.id ? 'bg-accent-mint text-background' : 'bg-background text-foreground'
            }`}
            onClick={() => {
              console.log('🐛 DEBUG: Direct button clicked', item.id);
              handleNavClick(item.id);
            }}
          >
            <item.icon className="w-3 h-3 mr-2" />
            {item.label}
          </Button>
        ))}
        
        {/* Raw DOM button test */}
        <button
          className="w-full bg-accent-yellow text-background p-2 text-xs font-bold"
          onClick={() => {
            console.log('🐛 RAW DOM: Button clicked');
            alert('Raw DOM button works!');
          }}
          onTouchStart={() => console.log('🐛 RAW DOM: Touch start')}
          onTouchEnd={() => console.log('🐛 RAW DOM: Touch end')}
        >
          RAW DOM TEST
        </button>
      </div>
    </div>
  );
}