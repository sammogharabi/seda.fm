import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Music, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../../services/auth';
import { toast } from 'sonner';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.resetPassword(email);

      if (result.error) {
        setError(result.error.message || 'Failed to send reset email');
        toast.error(result.error.message || 'Failed to send reset email');
        return;
      }

      setSent(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to send reset email');
      toast.error('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 dark" style={{ backgroundColor: '#000000' }}>
        <Card className="w-full max-w-md shadow-xl border-2">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Music className="w-8 h-8 text-primary" style={{ color: '#00ff88' }} />
              <CardTitle className="text-2xl bg-gradient-to-r from-[#00ff88] to-[#00ccff] bg-clip-text text-transparent">
                sedā.fm
              </CardTitle>
            </div>
            <p className="text-muted-foreground">Check your email</p>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Email sent!</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to reset your password. If you don't see it, check your spam folder.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => {
                  setSent(false);
                  setEmail('');
                  setError('');
                }}
                variant="outline"
                className="w-full"
              >
                Send another email
              </Button>

              <Link to="/auth/login">
                <Button variant="ghost" className="w-full">
                  Back to sign in
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 dark" style={{ backgroundColor: '#000000' }}>
      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Music className="w-8 h-8 text-primary" style={{ color: '#00ff88' }} />
            <CardTitle className="text-2xl bg-gradient-to-r from-[#00ff88] to-[#00ccff] bg-clip-text text-transparent">
              sedā.fm
            </CardTitle>
          </div>
          <p className="text-muted-foreground">Reset your password</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                className={error ? 'border-destructive' : ''}
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              style={{ backgroundColor: '#00ff88', color: '#000' }}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send reset email
            </Button>
          </form>

          <div className="text-center">
            <Link
              to="/auth/login"
              className="text-sm text-muted-foreground hover:text-primary underline"
            >
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}