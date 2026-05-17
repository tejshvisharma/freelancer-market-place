import { useEffect, useRef, useState, KeyboardEvent, ChangeEvent, ClipboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useInitSetup2FA, useVerifySetup2FA } from '../hooks';
import { twoFACodeSchema, type TwoFACodeInput } from '../schemas/auth.schema';
import { useAuthStore } from '@/stores/auth.store';

export default function TwoFactorEnablePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // 1. Setup Form
  const form = useForm<TwoFACodeInput>({
    resolver: zodResolver(twoFACodeSchema),
    defaultValues: { code: '' },
  });

  // 2. 2FA Hooks
  const initSetup2FA = useInitSetup2FA();
  const verifySetup2FA = useVerifySetup2FA({
    setError: form.setError,
    onSuccess: () => {
      form.reset();
      navigate('/profile'); // or wherever they should go after
    },
  });

  // 3. Auto-initialize 2FA setup on mount
  const hasTriggeredRef = useRef(false);
  useEffect(() => {
    if (!hasTriggeredRef.current && !user?.isTwoFactorEnabled) {
      hasTriggeredRef.current = true;
      initSetup2FA.mutate();
    }
  }, [initSetup2FA, user]);

  // 4. Manual OTP Input Management
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only accept numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    form.setValue('code', newOtp.join(''));
    form.clearErrors('code');

    // Move to next input automatically if value is filled
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

  const onSubmit = (values: TwoFACodeInput) => {
    verifySetup2FA.mutate(values);
  };

  const qrCodeUrl = initSetup2FA.data?.data?.data?.qrCodeDataUrl;
  const manualSecret = (initSetup2FA.data?.data?.data as any)?.secret || (initSetup2FA.data?.data?.data as any)?.manualSecret || '----';


  const copyToClipboard = () => {
    navigator.clipboard.writeText(manualSecret);
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-body-base antialiased">
      <style dangerouslySetInnerHTML={{__html: `
        .qr-gradient-border {
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            padding: 2px;
        }
        .code-box-focus:focus {
            outline: none;
            border-color: #000000;
            box-shadow: 0 0 0 2px rgba(0,0,0,0.05);
        }
        @media (max-width: 768px) {
            .mobile-nav-hide { display: none; }
        }
      `}} />

      {/* TopAppBar */}
      <header className="w-full sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="flex justify-between items-center h-[60px] px-6 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[20px]">grid_view</span>
            </div>
            <span className="font-display text-[24px] font-bold tracking-tight text-slate-900">Nayoda</span>
          </Link>
          <div className="flex items-center gap-6 mobile-nav-hide">
            <nav className="flex gap-6">
              <Link to="/explore" className="text-slate-500 font-medium hover:bg-slate-100 transition-colors duration-200 px-3 py-1 rounded">Explore</Link>
              <Link to="/activity" className="text-slate-500 font-medium hover:bg-slate-100 transition-colors duration-200 px-3 py-1 rounded">Activity</Link>
              <span className="text-slate-900 font-semibold hover:bg-slate-100 transition-colors duration-200 px-3 py-1 rounded cursor-pointer">Security</span>
            </nav>
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <Link to="/profile">
              <span className="material-symbols-outlined text-slate-900 cursor-pointer active:scale-95 transition-transform text-[28px]">account_circle</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-60px)] flex items-center justify-center py-12 px-6">
        <div className="max-w-6xl w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start mx-auto">
          
          {/* Left Column: Visual Assets */}
          <div className="flex flex-col items-center md:items-end justify-center space-y-6">
            <div className="w-full max-w-[320px] bg-white rounded-xl p-8 border border-slate-200 flex flex-col items-center">
              <div className="qr-gradient-border rounded-lg mb-6">
                <div className="bg-white p-4 rounded-md">
                  {initSetup2FA.isPending ? (
                    <div className="w-48 h-48 flex items-center justify-center bg-slate-50 rounded-md">
                      <span className="material-symbols-outlined animate-spin text-[32px] text-slate-400">sync</span>
                    </div>
                  ) : qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 flex flex-col items-center justify-center bg-red-50 text-red-500 rounded-md text-sm text-center px-4">
                      <span className="material-symbols-outlined mb-2 text-[24px]">error</span>
                      Failed to load QR
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center w-full">
                <p className="text-[14px] text-slate-500 mb-2">Can't scan the code?</p>
                <div 
                  onClick={copyToClipboard}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-center justify-between gap-2 group cursor-pointer hover:border-slate-900 transition-colors w-full"
                >
                  <span className="font-mono text-[12px] tracking-widest text-slate-900 font-medium truncate">
                    {initSetup2FA.isPending ? 'LOADING...' : manualSecret}
                  </span>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-900 text-[18px]">content_copy</span>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex flex-col items-end text-right space-y-2 max-w-[320px]">
              <h3 className="font-display text-[24px] font-semibold text-slate-900 leading-[1.3] tracking-[-0.01em]">Security First</h3>
              <p className="text-[14px] text-slate-500 leading-[1.4]">
                Two-factor authentication adds an extra layer of protection to your Nayoda account by requiring a physical device to verify your identity.
              </p>
            </div>
          </div>

          {/* Right Column: Setup Flow */}
          <div className="max-w-[440px] w-full space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-indigo-600/10 text-indigo-600 px-3 py-1 rounded-full">
                <span className="material-symbols-outlined text-[16px] fill-current">lock</span>
                <span className="font-mono text-[12px] font-medium tracking-[0.05em] uppercase">Step 2 of 2</span>
              </div>
              <h2 className="font-display text-[32px] font-semibold tracking-[-0.02em] text-slate-900 leading-[1.2]">
                Enable Two-Factor Authentication
              </h2>
              <p className="text-[16px] text-slate-500 leading-[1.5]">
                Follow these steps to secure your account with a time-based one-time password (TOTP) application like Google Authenticator or 1Password.
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Instruction 1 */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-[14px]">1</div>
                <div>
                  <p className="font-body-base font-semibold text-slate-900">Scan QR Code</p>
                  <p className="text-[14px] text-slate-500 leading-[1.4]">Open your authenticator app and scan the QR code on the left, or enter the manual setup key.</p>
                </div>
              </div>

              {/* Instruction 2 */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-[14px]">2</div>
                <div className="w-full space-y-4">
                  <div>
                    <p className="font-body-base font-semibold text-slate-900">Enter Verification Code</p>
                    <p className="text-[14px] text-slate-500 leading-[1.4]">Input the 6-digit code generated by your app to verify the connection.</p>
                  </div>
                  
                  {/* 6-digit input grid */}
                  <div className="flex gap-2 sm:gap-3 mt-4" onPaste={handleOtpPaste}>
                    {[0, 1, 2].map((i) => (
                      <input
                        key={i}
                        ref={(el) => (inputsRef.current[i] = el)}
                        type="text"
                        maxLength={1}
                        value={otpValues[i]}
                        onChange={(e) => handleOtpChange(i, e)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`w-10 sm:w-12 h-14 border ${form.formState.errors.code ? 'border-red-400 bg-red-50' : 'border-slate-300'} rounded-lg text-center font-display text-[24px] font-semibold text-slate-900 code-box-focus focus:border-slate-900 focus:ring-0 transition-colors`}
                        placeholder="0"
                        disabled={verifySetup2FA.isPending || initSetup2FA.isPending}
                      />
                    ))}
                    <div className="flex items-center text-slate-300">—</div>
                    {[3, 4, 5].map((i) => (
                      <input
                        key={i}
                        ref={(el) => (inputsRef.current[i] = el)}
                        type="text"
                        maxLength={1}
                        value={otpValues[i]}
                        onChange={(e) => handleOtpChange(i, e)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`w-10 sm:w-12 h-14 border ${form.formState.errors.code ? 'border-red-400 bg-red-50' : 'border-slate-300'} rounded-lg text-center font-display text-[24px] font-semibold text-slate-900 code-box-focus focus:border-slate-900 focus:ring-0 transition-colors`}
                        placeholder="0"
                        disabled={verifySetup2FA.isPending || initSetup2FA.isPending}
                      />
                    ))}
                  </div>
                  {form.formState.errors.code && (
                    <p className="text-[14px] text-red-500 font-medium">
                      {form.formState.errors.code.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Instruction 3 */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-semibold text-[14px]">3</div>
                <div>
                  <p className="font-body-base font-semibold text-slate-500">Verify & Enable</p>
                  <p className="text-[14px] text-slate-500 leading-[1.4]">Confirm the setup to finalize your security enhancements.</p>
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <button 
                  type="submit"
                  disabled={verifySetup2FA.isPending || initSetup2FA.isPending || otpValues.join('').length < 6}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
                >
                  {verifySetup2FA.isPending ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Enable</span>
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </>
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="w-full h-12 bg-transparent text-slate-500 hover:text-slate-900 transition-colors font-medium rounded-lg"
                >
                  Cancel and go back
                </button>
              </div>
            </form>

          </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-xl bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex justify-around items-center h-20 pb-safe px-4">
        <Link to="/explore" className="flex flex-col items-center justify-center text-slate-400 hover:text-slate-900 transition-all duration-300">
          <span className="material-symbols-outlined">explore</span>
          <span className="font-mono text-[10px] tracking-widest mt-1">EXPLORE</span>
        </Link>
        <Link to="/jobs" className="flex flex-col items-center justify-center text-slate-400 hover:text-slate-900 transition-all duration-300">
          <span className="material-symbols-outlined">work</span>
          <span className="font-mono text-[10px] tracking-widest mt-1">JOBS</span>
        </Link>
        <Link to="/messages" className="flex flex-col items-center justify-center text-slate-400 hover:text-slate-900 transition-all duration-300">
          <span className="material-symbols-outlined">chat_bubble</span>
          <span className="font-mono text-[10px] tracking-widest mt-1">MESSAGES</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center justify-center text-indigo-600 scale-105 transition-all duration-300">
          <span className="material-symbols-outlined fill-current">person</span>
          <span className="font-mono text-[10px] tracking-widest mt-1">PROFILE</span>
        </Link>
      </nav>

    </div>
  );
}
