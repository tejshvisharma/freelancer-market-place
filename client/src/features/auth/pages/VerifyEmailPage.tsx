import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../api';

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
      }, 3000);
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
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-body-base overflow-hidden relative">
      <style dangerouslySetInnerHTML={{__html: `
        .check-container {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 80px;
        }
        .check-circle {
            stroke-dasharray: 251.32;
            stroke-dashoffset: 251.32;
            animation: circle-draw 0.8s ease-out forwards;
        }
        .check-mark {
            stroke-dasharray: 50;
            stroke-dashoffset: 50;
            animation: mark-draw 0.4s 0.6s ease-out forwards;
        }
        @keyframes circle-draw {
            to { stroke-dashoffset: 0; }
        }
        @keyframes mark-draw {
            to { stroke-dashoffset: 0; }
        }
        .pop-effect {
            animation: pop 0.4s 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            transform: scale(0.9);
            opacity: 0;
        }
        @keyframes pop {
            to { transform: scale(1); opacity: 1; }
        }
      `}} />
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] -left-[10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-[20%] right-[10%] w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Top Navigation Header */}
      <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <nav className="flex justify-between items-center h-[60px] px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[20px]">grid_view</span>
            </div>
            <span className="font-display text-[24px] font-bold tracking-tight text-slate-900">Nayoda</span>
          </div>
          <div className="flex items-center">
            <span className="material-symbols-outlined text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-colors duration-200 cursor-pointer">account_circle</span>
          </div>
        </nav>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-6 py-8 relative z-10">
        <div className="max-w-[440px] w-full flex flex-col items-center text-center space-y-6 bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          
          {isLoading && (
            <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-500">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-2"></div>
              <h2 className="font-display text-[32px] font-bold text-slate-900 tracking-tight">Verifying...</h2>
              <p className="font-body-base text-[16px] text-slate-500">Please wait while we validate your link.</p>
            </div>
          )}

          {isSuccess && (
            <>
              {/* Animated Success State */}
              <div className="check-container mb-4">
                <svg fill="none" height="80" viewBox="0 0 80 80" width="80" xmlns="http://www.w3.org/2000/svg">
                  <circle className="check-circle" cx="40" cy="40" r="38" stroke="#10B981" strokeWidth="4"></circle>
                  <path className="check-mark" d="M25 40L35 50L55 30" stroke="#10B981" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"></path>
                </svg>
              </div>
              <div className="pop-effect flex flex-col items-center space-y-2">
                <h2 className="font-display text-[32px] font-bold text-slate-900 tracking-tight">Email Verified!</h2>
                <p className="font-body-base text-[16px] text-slate-500">Welcome to Nayoda</p>
              </div>
              <div className="w-full pt-6 pop-effect" style={{ animationDelay: '1s' }}>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full h-[48px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-body-base font-semibold rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Go to Login
                </button>
              </div>
              <div className="flex items-center justify-center space-y-2 pt-2 pop-effect w-full" style={{ animationDelay: '1.2s' }}>
                <div className="flex items-center gap-2 text-slate-500 text-[14px]">
                  <div className="w-4 h-4 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p>Redirecting in 3 seconds...</p>
                </div>
              </div>
            </>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-500 w-full">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-red-500 text-[48px]">error</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <h2 className="font-display text-[32px] font-bold text-slate-900 tracking-tight">Verification Failed</h2>
                <p className="font-body-base text-[16px] text-slate-500 leading-relaxed px-4">{errorMessage}</p>
              </div>
              <div className="w-full pt-6 space-y-3">
                <button 
                  onClick={() => navigate('/resend-verification-email')}
                  className="w-full h-[48px] bg-slate-900 text-white font-body-base font-semibold rounded-xl shadow-md hover:bg-slate-800 transition-all duration-200"
                >
                  Resend Email
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full h-[48px] bg-white border border-slate-200 text-slate-700 font-body-base font-semibold rounded-xl hover:bg-slate-50 transition-all duration-200"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Optional visual context for trust-building */}
        <div className="mt-12 w-full max-w-4xl px-6 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/50">
            <span className="material-symbols-outlined text-indigo-600 text-[32px] mb-3">lock</span>
            <span className="font-body-base text-[12px] uppercase font-semibold text-slate-600 tracking-wider">Secure Platform</span>
          </div>
          <div className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/50">
            <span className="material-symbols-outlined text-indigo-600 text-[32px] mb-3">shield_person</span>
            <span className="font-body-base text-[12px] uppercase font-semibold text-slate-600 tracking-wider">Data Privacy</span>
          </div>
          <div className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/50">
            <span className="material-symbols-outlined text-indigo-600 text-[32px] mb-3">verified_user</span>
            <span className="font-body-base text-[12px] uppercase font-semibold text-slate-600 tracking-wider">KYC Compliant</span>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center z-10 relative">
        <p className="font-body-base text-[14px] text-slate-500">© 2024 Nayoda Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
}
