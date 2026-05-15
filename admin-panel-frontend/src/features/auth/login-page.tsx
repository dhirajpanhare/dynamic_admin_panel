import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_INFO } from '@/config/constants';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(email, password);
      
      if (response.requiresOtp) {
        // Redirect to OTP verification
        navigate('/verify-otp', { state: { email } });
        toast.info('Please enter the OTP sent to your email');
      } else {
        // Direct login success
        navigate('/admin/dashboard');
        toast.success('Login successful');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setEmail('test@admin.com');
    setPassword('test123');
    toast.info('Test credentials filled');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xl font-bold">
            {APP_INFO.NAME.charAt(0)}
          </div>
          <CardTitle className="text-2xl">{APP_INFO.NAME}</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Test Credentials Helper - Development Only */}
          {import.meta.env.DEV && (
            <div className="mt-6 rounded-lg border border-accent bg-accent/10 p-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">🧪</span>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-accent-foreground">
                    Development Mode
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use test credentials to bypass authentication
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fillTestCredentials}
                    className="mt-2 w-full"
                  >
                    Fill Test Credentials
                  </Button>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p>Email: test@admin.com</p>
                    <p>Password: test123</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
