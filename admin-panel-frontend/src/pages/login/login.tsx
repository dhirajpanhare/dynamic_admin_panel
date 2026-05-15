import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ROUTES } from '@/config';
import { toast } from 'sonner';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Mock successful login
      setUser({
        id: '1',
        name: 'John Doe',
        email: email,
        role: 'Admin',
      });
      setToken('mock-token-123');
      toast.success('Login successful!');
      navigate(ROUTES.WORKSPACE);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-700 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm font-bold text-xl">
              D
            </div>
            <span className="text-2xl font-semibold">Dynamic Admin</span>
          </div>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-semibold text-white leading-tight">
            Manage your workspace
            <br />
            with confidence
          </h1>
          <p className="text-primary-100 text-lg">
            Enterprise-grade admin panel with powerful features for modern teams.
          </p>
        </div>
        <div className="flex items-center gap-8 text-primary-100 text-sm">
          <span>© 2024 Dynamic Admin</span>
          <span>•</span>
          <a href="#" className="hover:text-white transition-colors">
            Privacy
          </a>
          <span>•</span>
          <a href="#" className="hover:text-white transition-colors">
            Terms
          </a>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold text-slate-900">
              Workspace Login
            </h2>
            <p className="text-sm text-slate-600">
              Enter your credentials to access your workspace
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-slate-600">Remember me</span>
              </label>
              <a
                href="#"
                className="text-primary hover:text-primary-700 font-medium"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <a href="#" className="text-primary hover:text-primary-700 font-medium">
              Contact sales
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
