import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
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

export default function ResendVerificationEmailPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const resendVerificationMutation = useMutation({
    mutationFn: (value: string) => authApi.resendVerification(value),
    onSuccess: (res: any) => {
      setSuccess(
        res?.data?.message || 'Verification email sent. Please check your inbox.'
      );
      setError('');
    },
    onError: (err: any) => {
      setError(
        err?.response?.data?.message ||
          'Failed to resend verification email. Please try again.'
      );
      setSuccess('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    resendVerificationMutation.mutate(email);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

      <Card className="w-full max-w-md border-border/70 bg-card/95 shadow-lg backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Mail className="h-3.5 w-3.5" />
            Email Verification
          </div>
          <CardTitle className="text-2xl font-bold">Resend Verification Email</CardTitle>
          <CardDescription>
            Enter your email address and we will send a new verification link.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {success && (
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                {success}
              </div>
            )}

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
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
                disabled={resendVerificationMutation.isPending}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full"
              disabled={resendVerificationMutation.isPending}
            >
              {resendVerificationMutation.isPending
                ? 'Sending...'
                : 'Resend Verification Email'}
            </Button>

            <Link
              to="/login"
              className="text-sm text-primary transition-colors hover:text-primary/80 hover:underline"
            >
              Back to Login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
