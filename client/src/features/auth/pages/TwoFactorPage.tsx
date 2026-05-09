import { useState, useRef, ChangeEvent, KeyboardEvent, ClipboardEvent, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useVerify2FA } from '../hooks';
import { twoFAVerifySchema, type TwoFAVerifyInput } from '../schemas/auth.schema';
import { ROUTES } from '@/app/routes';

export default function TwoFactorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const twoFactorToken = location.state?.twoFactorToken as string;

  useEffect(() => {
    if (!twoFactorToken) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [twoFactorToken, navigate]);

  const form = useForm<TwoFAVerifyInput>({
    resolver: zodResolver(twoFAVerifySchema),
    defaultValues: { 
      twoFactorToken: twoFactorToken || '', 
      code: '' 
    },
  });

  const verify2FA = useVerify2FA({ setError: form.setError });

  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    form.setValue('code', newOtp.join(''));
    form.clearErrors('code');

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    if (!pastedData) return;

    const newOtp = [...otpValues];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtpValues(newOtp);
    form.setValue('code', newOtp.join(''));
    
    const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputsRef.current[focusIndex]?.focus();
  };

  const onSubmit = (values: TwoFAVerifyInput) => {
    verify2FA.mutate(values);
  };

  if (!twoFactorToken) return null;

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-body-base relative overflow-hidden">
      
      {/* Top AppBar */}
      <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="flex justify-between items-center h-[60px] px-6 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[20px]">grid_view</span>
            </div>
            <span className="font-display text-[24px] font-bold tracking-tight text-slate-900">Nayoda</span>
          </Link>
          {/* Decorative dummy icon, standard for auth screens before logging in completely */}
          <span className="material-symbols-outlined text-slate-400 text-[28px]">account_circle</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-[440px] flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Security Icon Section */}
          <div className="mb-8 relative">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden z-10 relative">
              <span className="material-symbols-outlined text-indigo-600 text-4xl">encrypted</span>
            </div>
            {/* Decorative subtle ring */}
            <div className="absolute inset-0 rounded-full border-2 border-indigo-600/10 scale-125 z-0"></div>
          </div>

          {/* Content Header */}
          <h1 className="font-display text-[32px] font-bold text-slate-900 tracking-tight mb-2">Two-factor authentication</h1>
          <p className="text-[14px] text-slate-500 mb-8">
            Enter the 6-digit code from your authenticator app
          </p>

          {/* 2FA Input Grid */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mb-8">
            <div className="flex justify-between gap-2 md:gap-4 mb-8" onPaste={handleOtpPaste}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="text"
                  maxLength={1}
                  value={otpValues[i]}
                  onChange={(e) => handleOtpChange(i, e)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={`w-full aspect-square text-center font-display text-[28px] font-bold border-2 ${form.formState.errors.code ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'} rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all outline-none`}
                  placeholder="•"
                  disabled={verify2FA.isPending}
                />
              ))}
            </div>

            {form.formState.errors.code && (
              <p className="text-[14px] text-red-500 font-medium mb-6 -mt-4">
                {form.formState.errors.code.message}
              </p>
            )}

            <button 
              type="submit"
              disabled={verify2FA.isPending || otpValues.join('').length < 6}
              className="w-full h-[52px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {verify2FA.isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Continue
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Alternative Actions */}
          <div className="flex flex-col gap-4 w-full">
            <button type="button" className="text-[14px] text-indigo-600 font-medium hover:underline flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">vpn_key</span>
              Use backup code
            </button>
            <button type="button" className="text-[14px] text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">help_center</span>
              Contact support
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 w-full">
            <Link to={ROUTES.LOGIN} className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 font-medium text-[14px] transition-colors group">
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">chevron_left</span>
              Back to login
            </Link>
          </div>
        </div>
      </main>

      {/* Illustration / Geometric Background Element */}
      <div className="hidden lg:block fixed bottom-0 right-0 p-8 pointer-events-none opacity-20 z-0">
        <div className="w-64 h-64 border-2 border-indigo-600 rounded-full flex items-center justify-center">
          <div className="w-48 h-48 border border-indigo-600/50 rounded-full flex items-center justify-center">
            <div className="w-32 h-32 border border-indigo-600/20 rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block fixed top-24 left-12 p-8 pointer-events-none opacity-10 z-0">
        <div className="grid grid-cols-4 gap-4">
          <div className="w-4 h-4 rounded-full bg-indigo-600"></div>
          <div className="w-4 h-4 rounded-full bg-indigo-600/40"></div>
          <div className="w-4 h-4 rounded-full bg-indigo-600/10"></div>
          <div className="w-4 h-4 rounded-full bg-indigo-600/5"></div>
          <div className="w-4 h-4 rounded-full bg-indigo-600/60"></div>
          <div className="w-4 h-4 rounded-full bg-indigo-600"></div>
          <div className="w-4 h-4 rounded-full bg-indigo-600/30"></div>
          <div className="w-4 h-4 rounded-full bg-indigo-600/10"></div>
        </div>
      </div>
      
    </div>
  );
}
