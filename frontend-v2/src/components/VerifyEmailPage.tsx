import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';
import { http } from '@/lib/api/http';
import { Mail, RefreshCw, CheckCircle2, ArrowLeft, Clock } from 'lucide-react';

interface VerifyEmailPageProps {
  email: string;
  userType: 'fan' | 'artist';
  onVerified: () => void;
  onBack: () => void;
  onResendEmail: () => Promise<void>;
}

export function VerifyEmailPage({ email, userType, onVerified, onBack, onResendEmail }: VerifyEmailPageProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Check URL for verification token on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const type = urlParams.get('type');

    if (token) {
      handleVerifyToken(token);
    }
  }, []);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyToken = async (token: string) => {
    setIsCheckingStatus(true);
    try {
      const response = await http.get(`/auth/verify-email?token=${token}`, { auth: false });

      if (response.userId) {
        toast.success('Email verified successfully!');
        // Clear the URL params
        window.history.replaceState({}, document.title, window.location.pathname);
        onVerified();
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      const message = error.message || 'Verification failed';

      if (message.includes('expired')) {
        toast.error('Verification link has expired. Please request a new one.');
      } else if (message.includes('Invalid')) {
        toast.error('Invalid verification link. Please request a new one.');
      } else {
        toast.error(message);
      }
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      await onResendEmail();
      toast.success('Verification email sent!', {
        description: `Check your inbox at ${email}`
      });
      setResendCooldown(60); // 60 second cooldown
    } catch (error: any) {
      console.error('Failed to resend email:', error);
      toast.error('Failed to send email', {
        description: error.message || 'Please try again later'
      });
    } finally {
      setIsResending(false);
    }
  };

  const accentColor = userType === 'artist' ? 'accent-coral' : 'accent-blue';

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
            seda<span className={`text-${accentColor}`}>.</span>fm
          </h1>
          <div className={`w-12 h-1 bg-${accentColor} mx-auto mt-2`}></div>
        </div>

        <Card className="border-2 border-foreground/20 bg-card/50">
          <CardContent className="p-8 text-center">
            {isCheckingStatus ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8"
              >
                <div className="w-16 h-16 border-4 border-foreground/20 border-t-accent-coral rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Verifying your email...</p>
              </motion.div>
            ) : (
              <>
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className={`w-20 h-20 bg-${accentColor}/20 rounded-full flex items-center justify-center mx-auto mb-6`}
                >
                  <Mail className={`w-10 h-10 text-${accentColor}`} />
                </motion.div>

                {/* Header */}
                <h2 className="text-2xl font-black text-foreground mb-2">
                  CHECK YOUR EMAIL
                </h2>
                <div className={`w-16 h-1 bg-${accentColor} mx-auto mb-6`}></div>

                {/* Description */}
                <p className="text-muted-foreground mb-2">
                  We've sent a verification link to:
                </p>
                <p className="font-mono text-foreground font-semibold mb-6 break-all">
                  {email}
                </p>

                {/* Instructions */}
                <div className="bg-foreground/5 p-4 rounded-lg mb-6 text-left">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    What to do next:
                  </h3>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Open your email inbox</li>
                    <li>Look for an email from <span className="font-mono text-foreground">donotreply@seda.fm</span></li>
                    <li>Click the "Verify Email Address" button</li>
                    <li>You'll be redirected back here automatically</li>
                  </ol>
                </div>

                {/* Tips */}
                <div className="text-xs text-muted-foreground mb-6">
                  <p>Don't see the email? Check your spam folder.</p>
                  <p>The link expires in 24 hours.</p>
                </div>

                {/* Resend Button */}
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending || resendCooldown > 0}
                  variant="outline"
                  className="w-full mb-4 h-12"
                >
                  {isResending ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending...
                    </div>
                  ) : resendCooldown > 0 ? (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Resend in {resendCooldown}s
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Resend Verification Email
                    </div>
                  )}
                </Button>

                {/* Back Button */}
                <Button
                  onClick={onBack}
                  variant="ghost"
                  className="w-full text-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            {userType === 'artist' ? 'Artist Account' : 'Fan Account'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
