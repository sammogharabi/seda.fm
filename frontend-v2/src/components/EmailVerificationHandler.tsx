import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { http } from '@/lib/api/http';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

interface VerificationSession {
  access_token: string;
  refresh_token: string;
}

interface EmailVerificationHandlerProps {
  onVerificationComplete: (session?: VerificationSession) => void;
  onNavigateToLogin: () => void;
}

type VerificationState = 'loading' | 'success' | 'error' | 'expired' | 'invalid';

export function EmailVerificationHandler({
  onVerificationComplete,
  onNavigateToLogin
}: EmailVerificationHandlerProps) {
  const [state, setState] = useState<VerificationState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const hasCalledApi = useRef(false);
  const hasCalledCallback = useRef(false);
  const onVerificationCompleteRef = useRef(onVerificationComplete);
  const sessionRef = useRef<VerificationSession | undefined>(undefined);

  // Keep refs updated
  onVerificationCompleteRef.current = onVerificationComplete;

  // Handler for completing verification (used by both auto-redirect and button)
  const handleComplete = () => {
    if (hasCalledCallback.current) {
      console.log('⏭️ Callback already called, skipping');
      return;
    }
    hasCalledCallback.current = true;
    window.history.replaceState({}, document.title, '/');
    onVerificationCompleteRef.current(sessionRef.current);
  };

  useEffect(() => {
    // Prevent duplicate API calls (React Strict Mode can run effects twice)
    if (hasCalledApi.current) {
      console.log('⏭️ Skipping duplicate API call');
      return;
    }
    hasCalledApi.current = true;

    const verifyEmail = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userType = urlParams.get('type') as 'fan' | 'artist' | null;

      console.log('🔐 EMAIL VERIFICATION STARTED', {
        token: token ? token.substring(0, 20) + '...' : 'null',
        userType,
        url: window.location.href
      });

      if (!token) {
        console.log('❌ No token found in URL');
        setState('invalid');
        setErrorMessage('No verification token found in the URL.');
        return;
      }

      try {
        console.log('📡 Calling verify-email API...');
        const response = await http.get<{
          userId: string;
          message: string;
          userType: string;
          session?: {
            access_token: string;
            refresh_token: string;
          };
        }>(`/auth/verify-email?token=${token}`, { auth: false });
        console.log('✅ API Response:', response);

        if (response.userId) {
          console.log('🎉 Verification successful! userId:', response.userId);
          console.log('🔑 Session received:', response.session ? 'yes' : 'no');
          // Store the session for later use
          sessionRef.current = response.session;
          setState('success');
          toast.success('Email verified successfully!');
        } else {
          console.log('⚠️ Response received but no userId:', response);
          setState('error');
          setErrorMessage('Verification response was invalid. Please try again.');
        }
      } catch (error: any) {
        console.error('❌ Verification error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          statusCode: error.statusCode,
          error: error.error,
          name: error.name
        });
        const message = error.message || 'Verification failed';

        if (message.includes('expired')) {
          setState('expired');
          setErrorMessage('This verification link has expired. Please request a new one.');
        } else if (message.includes('Invalid') || message.includes('invalid')) {
          setState('invalid');
          setErrorMessage('This verification link is invalid. Please request a new one.');
        } else {
          setState('error');
          setErrorMessage(message);
        }
      }
    };

    verifyEmail();
  }, []);

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <Loader2 className="w-16 h-16 text-accent-coral animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-black text-foreground mb-2">
              VERIFYING YOUR EMAIL
            </h2>
            <p className="text-muted-foreground">
              Please wait while we verify your email address...
            </p>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-black text-foreground mb-2">
              EMAIL VERIFIED!
            </h2>
            <div className="w-16 h-1 bg-green-500 mx-auto mb-6"></div>
            <p className="text-muted-foreground mb-6">
              Your email has been verified successfully. Welcome to Sedā.fm!
            </p>
            <Button
              onClick={handleComplete}
              className="bg-accent-coral hover:bg-accent-coral/90 text-background font-bold"
            >
              Enter the Experience
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        );

      case 'expired':
      case 'invalid':
      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <XCircle className="w-10 h-10 text-red-500" />
            </motion.div>
            <h2 className="text-2xl font-black text-foreground mb-2">
              {state === 'expired' ? 'LINK EXPIRED' : 'VERIFICATION FAILED'}
            </h2>
            <div className="w-16 h-1 bg-red-500 mx-auto mb-6"></div>
            <p className="text-muted-foreground mb-6">
              {errorMessage}
            </p>
            <Button
              onClick={onNavigateToLogin}
              className="bg-accent-coral hover:bg-accent-coral/90 text-background font-bold"
            >
              Back to Login
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-foreground">
            seda<span className="text-accent-coral">.</span>fm
          </h1>
          <div className="w-12 h-1 bg-accent-coral mx-auto mt-2"></div>
        </div>

        <Card className="border-2 border-foreground/20 bg-card/50">
          <CardContent className="p-8">
            {renderContent()}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Email Verification
          </p>
        </div>
      </motion.div>
    </div>
  );
}
