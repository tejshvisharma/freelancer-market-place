import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useLoginMutation } from '@/features/auth/api';
import { resendVerificationEmail } from '../resendVerification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resendUrl, setResendUrl] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResendUrl(null);
    setResendStatus('');

    try {
      await loginMutation.mutateAsync({ email, password });
      navigate('/projects');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      // If backend provides resendEmailLink, show resend button
      const resend = err.response?.data?.errors?.resendEmailLink;
      if (resend) {
        setResendUrl(resend);
      }
    }
  };

  const handleResend = async () => {
    if (!resendUrl) return;
    setResendStatus('');
    try {
      const  resendRes = await resendVerificationEmail(resendUrl, email);
      setResendStatus(resendRes.data.message ||'Verification email sent. Please check your inbox.');
    } catch (err: any) {
      setResendStatus('Failed to resend verification email. Please try again.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

      <Card className="w-full max-w-md border-border/70 bg-card/95 shadow-lg backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure Access
          </div>
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
                {resendUrl && (
                  <div className="mt-2">
                    <Button type="button" variant="outline" onClick={handleResend} disabled={!!resendStatus}>
                      Resend Verification Email
                    </Button>
                    {resendStatus && (
                      <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">{resendStatus}</div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loginMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loginMutation.isPending}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </Button>
            <div className="flex flex-col items-center space-y-2 w-full">
              <Link to="/forgot-password" className="text-sm text-primary transition-colors hover:text-primary/80 hover:underline">
                Forgot password?
              </Link>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary transition-colors hover:text-primary/80 hover:underline">
                  Register
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
