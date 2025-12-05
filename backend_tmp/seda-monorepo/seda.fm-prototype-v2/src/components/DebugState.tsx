import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Bug, X, Eye } from 'lucide-react';
import { motion } from 'motion/react';

interface DebugStateProps {
  currentUser: any;
  currentView: string;
  isMobile: boolean;
  isAuthenticated: boolean;
  showMainApp: boolean;
  showLoginPage: boolean;
}

export function DebugState({ 
  currentUser, 
  currentView, 
  isMobile, 
  isAuthenticated, 
  showMainApp, 
  showLoginPage 
}: DebugStateProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  if (!isVisible) {
    return (
      <motion.button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 w-12 h-12 bg-accent-blue text-background rounded-full shadow-lg flex items-center justify-center hover:bg-accent-blue/90 transition-colors z-[9999]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Bug className="w-5 h-5" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 z-[9999] max-w-xs"
    >
      <Card className="border-2 border-accent-blue/20 bg-background shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-accent-blue" />
              Debug State
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="w-6 h-6 p-0 hover:bg-accent-blue/10"
            >
              <X className="w-3 h-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* Current User */}
          <div className="p-2 bg-secondary/50 rounded-lg">
            <div className="text-muted-foreground">User:</div>
            <div className="font-medium">
              {currentUser?.displayName || 'None'}
            </div>
            <div className="text-muted-foreground">
              Type: {currentUser?.userType || 'None'}
            </div>
            <div className="text-muted-foreground">
              ID: {currentUser?.id || 'None'}
            </div>
          </div>

          {/* App State */}
          <div className="p-2 bg-secondary/50 rounded-lg">
            <div className="text-muted-foreground">App State:</div>
            <div>View: {currentView}</div>
            <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
            <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
            <div>Show Main: {showMainApp ? 'Yes' : 'No'}</div>
            <div>Show Login: {showLoginPage ? 'Yes' : 'No'}</div>
          </div>

          {/* Conditional Rendering Logic */}
          <div className="p-2 bg-secondary/50 rounded-lg">
            <div className="text-muted-foreground">Should Render:</div>
            <div className="text-xs">
              {showMainApp && isAuthenticated && currentUser ? (
                <span className="text-green-500">✅ Main App</span>
              ) : showLoginPage ? (
                <span className="text-yellow-500">🔐 Login Page</span>
              ) : (
                <span className="text-blue-500">📄 About Page</span>
              )}
            </div>
          </div>

          {/* Refresh Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              console.log('🔄 Debug refresh triggered');
              window.location.reload();
            }}
            className="w-full text-xs"
          >
            Force Refresh
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}