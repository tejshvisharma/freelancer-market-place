import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { KeyRound } from 'lucide-react';
import { authApi } from '../api';
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      try {
        const res = await authApi.forgotPassword(email);
        // If backend returns success: false, treat as error
        if (res.data && res.data.success === false) {
          const err: any = new Error(res.data.message || 'Failed to send reset link.');
          err.response = { data: res.data };
          
          throw err;
        }
        return res;
      } catch (err: any) {
        throw err;
      }
    },
    onSuccess: (res: any) => {
      setSuccess(res.data.message || 'If your email exists, a reset link has been sent.');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Failed to send reset link.');
      setSuccess('');
    },
    onSettled: () => {
      // Always reset loading state
      // (React Query handles isPending, but this ensures UI updates)
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    forgotPasswordMutation.mutate(email);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

      <Card className="w-full max-w-md border-border/70 bg-card/95 shadow-lg backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <KeyRound className="h-3.5 w-3.5" />
            Password Recovery
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {success && (
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">{success}</div>
            )}
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={forgotPasswordMutation.isPending}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
              {forgotPasswordMutation.isPending ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
