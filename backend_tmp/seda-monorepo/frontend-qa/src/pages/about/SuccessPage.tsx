import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

export function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const email = location?.state?.email as string | undefined;
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-2xl font-semibold">You're on the list! 🎉</div>
          {email ? (
            <div className="text-sm text-muted-foreground">We’ll email <span className="text-foreground font-medium">{email}</span> when beta access opens.</div>
          ) : (
            <div className="text-sm text-muted-foreground">We’ll email you when beta access opens.</div>
          )}
          <Button onClick={() => navigate('/about')}>Back to Home</Button>
        </CardContent>
      </Card>
    </div>
  );
}

