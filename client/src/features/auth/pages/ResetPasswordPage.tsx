import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetPasswordMutation = useMutation({
    mutationFn: (payload: { token: string; newPassword: string }) =>
      authApi.resetPassword(payload.token, payload.newPassword),
    onSuccess: (res: any) => {
      setSuccess(res.data.message || 'Password reset successful. You can now log in.');
      setError('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/login'), 2500);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to reset password.');
      setSuccess('');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    resetPasswordMutation.mutate({ token, newPassword });
  };

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
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[20px]">grid_view</span>
            </div>
            <span className="font-display text-[24px] font-bold tracking-tight text-slate-900">Nayoda</span>
          </Link>
        </nav>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 relative z-10">
        <section className="w-full max-w-[440px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            
            {!success ? (
              <>
                <div className="text-center space-y-2 mb-8">
                  <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[32px]">lock_reset</span>
                  </div>
                  <h1 className="font-display text-[32px] font-bold text-slate-900 tracking-tight">Reset Password</h1>
                  <p className="font-body-base text-[16px] text-slate-500 px-4">
                    Enter your new password below to secure your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-600 flex items-start gap-3 animate-in fade-in duration-300">
                      <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className={`relative w-full rounded-xl transition-all duration-200 border bg-slate-50/50 ${error ? 'border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10' : 'border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white'}`}>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
                        <span className="material-symbols-outlined text-[20px]">lock</span>
                      </div>
                      <input 
                        id="newPassword" 
                        type={showPassword ? "text" : "password"}
                        placeholder="New Password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={resetPasswordMutation.isPending}
                        className="w-full h-[52px] pl-12 pr-12 bg-transparent border-none focus:ring-0 font-body-base text-slate-900 outline-none placeholder:text-slate-400" 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 outline-none rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>

                    <div className={`relative w-full rounded-xl transition-all duration-200 border bg-slate-50/50 ${error ? 'border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10' : 'border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white'}`}>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
                        <span className="material-symbols-outlined text-[20px]">lock_clock</span>
                      </div>
                      <input 
                        id="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm New Password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={resetPasswordMutation.isPending}
                        className="w-full h-[52px] pl-12 pr-12 bg-transparent border-none focus:ring-0 font-body-base text-slate-900 outline-none placeholder:text-slate-400" 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 outline-none rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 space-y-4">
                    <button 
                      type="submit" 
                      disabled={resetPasswordMutation.isPending}
                      className="w-full h-[52px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {resetPasswordMutation.isPending ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                          Resetting...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-500">
                <div className="check-container mb-2">
                  <svg fill="none" height="80" viewBox="0 0 80 80" width="80" xmlns="http://www.w3.org/2000/svg">
                    <circle className="check-circle" cx="40" cy="40" r="38" stroke="#10B981" strokeWidth="4"></circle>
                    <path className="check-mark" d="M25 40L35 50L55 30" stroke="#10B981" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6"></path>
                  </svg>
                </div>
                <div className="pop-effect flex flex-col items-center space-y-2 text-center">
                  <h2 className="font-display text-[32px] font-bold text-slate-900 tracking-tight">Password Reset!</h2>
                  <p className="font-body-base text-[16px] text-slate-500 leading-relaxed">{success}</p>
                </div>
                <div className="w-full pt-4 pop-effect" style={{ animationDelay: '1s' }}>
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full h-[52px] bg-slate-900 text-white font-semibold rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
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
              </div>
            )}

          </div>
        </section>
      </main>
    </div>
  );
}
