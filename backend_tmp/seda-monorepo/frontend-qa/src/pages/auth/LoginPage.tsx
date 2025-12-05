import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Music, Loader2, Eye, EyeOff, AlertCircle, TestTube } from 'lucide-react';
import { authService } from '../../services/auth';
import { toast } from 'sonner';

const OAUTH_PROVIDERS = [
  { name: 'Spotify', color: '#1DB954', icon: '🎵', provider: 'spotify' },
  { name: 'Google', color: '#4285F4', icon: '🔍', provider: 'google' },
  { name: 'Apple', color: '#000000', icon: '🍎', provider: 'apple' },
];

export function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSandboxBypass, setShowSandboxBypass] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path or default to dashboard
  const from = location.state?.from?.pathname || '/feed';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await authService.signInWithEmail(formData.email, formData.password);

      if (result.error) {
        toast.error(result.error.message || 'Failed to sign in');
        return;
      }

      if (result.user) {
        toast.success('Welcome back!');
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);

      // Check if this is a Supabase service error
      const isServiceError = error.message?.includes('503') ||
                            error.message?.includes('Service Unavailable') ||
                            error.message?.includes('Failed to fetch') ||
                            error.name === 'TypeError';

      if (isServiceError) {
        setShowSandboxBypass(true);
        toast.error('Authentication service is currently unavailable');
      } else {
        toast.error('Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: any) => {
    if (!provider.provider) {
      toast.error(`${provider.name} login coming soon!`);
      return;
    }

    setLoading(true);
    try {
      await authService.signInWithProvider(provider.provider);
      // OAuth will redirect, so no need to continue here
    } catch (error) {
      console.error('OAuth login error:', error);
      toast.error(`Failed to login with ${provider.name}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxBypass = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('bypass_auth', 'true');
    window.location.href = currentUrl.toString();
  };

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
          <p className="text-muted-foreground">Sign in to your account</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
                disabled={loading}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  disabled={loading}
                  className={errors.password ? 'border-destructive' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
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
              Sign In
            </Button>
          </form>

          <div className="text-center">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary underline"
            >
              Forgot your password?
            </Link>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">Or continue with</p>
            <div className="grid gap-2">
              {OAUTH_PROVIDERS.map((provider) => (
                <Button
                  key={provider.name}
                  variant="outline"
                  onClick={() => handleOAuthLogin(provider)}
                  className="h-12 border-2 hover:border-primary transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <span className="mr-2">{provider.icon}</span>
                  )}
                  Continue with {provider.name}
                </Button>
              ))}
            </div>
          </div>

          {showSandboxBypass && (
            <div className="p-4 border-2 border-amber-500/20 bg-amber-500/10 rounded-lg">
              <div className="flex items-start gap-3">
                <TestTube className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-amber-500">Sandbox UAT Mode Available</h4>
                    <p className="text-xs text-amber-400/80 mt-1">
                      Authentication service is temporarily unavailable. You can continue with sandbox testing.
                    </p>
                  </div>
                  <Button
                    onClick={handleSandboxBypass}
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                  >
                    <TestTube className="w-3 h-3 mr-1" />
                    Continue with Sandbox UAT
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/auth/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}