import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MailCheck, XCircle } from 'lucide-react';
import { authApi } from '../api';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type VerificationState = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = (searchParams.get('token') || '').trim();

  const [state, setState] = useState<VerificationState>(token ? 'loading' : 'error');
  const [errorMessage, setErrorMessage] = useState(
    token ? '' : 'Invalid verification link'
  );
  const hasTriggeredRef = useRef(false);
  const redirectTimeoutRef = useRef<number | null>(null);

  const verifyEmailMutation = useMutation({
    mutationFn: (verificationToken: string) => authApi.verifyEmail(verificationToken),
    onSuccess: () => {
      setState('success');
      setErrorMessage('');
      redirectTimeoutRef.current = window.setTimeout(() => {
        navigate('/login');
      }, 4000);
    },
    onError: (err: any) => {
      setState('error');
      setErrorMessage(
        err?.response?.data?.message || 'Verification failed. Please request a new verification link.'
      );
    },
  });

  useEffect(() => {
    if (!token || hasTriggeredRef.current) {
      return;
    }

    hasTriggeredRef.current = true;
    setState('loading');
    verifyEmailMutation.mutate(token);

    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [token, verifyEmailMutation, navigate]);

  const isLoading = state === 'loading';
  const isSuccess = state === 'success';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-12 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

      <Card className="w-full max-w-md border-border/70 bg-card/95 shadow-lg backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {isSuccess ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : state === 'error' ? (
              <XCircle className="h-3.5 w-3.5" />
            ) : (
              <MailCheck className="h-3.5 w-3.5" />
            )}
            Email Verification
          </div>

          <CardTitle className="text-2xl font-bold">
            {isLoading
              ? 'Verifying your email...'
              : isSuccess
                ? 'Email Verified'
                : 'Verification Failed'}
          </CardTitle>

          <CardDescription>
            {isLoading
              ? 'Please wait while we validate your verification link.'
              : isSuccess
                ? 'Your email has been successfully verified.'
                : errorMessage}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex min-h-[100px] items-center justify-center">
          {isLoading ? <Spinner size="lg" /> : null}
        </CardContent>

        <CardFooter className="flex w-full gap-2">
          {isSuccess ? (
            <Button className="w-full" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          ) : isLoading ? (
            <Button className="w-full" disabled>
              Verifying...
            </Button>
          ) : (
            <>
              <Button className="flex-1" variant="outline" onClick={() => navigate('/resend-verification-email')}>
                Resend Email
              </Button>
              <Button className="flex-1" onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
