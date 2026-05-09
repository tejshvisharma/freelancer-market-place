import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '@/features/auth/api';
import { resendVerificationEmail } from '../resendVerification';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      navigate('/dashboard');
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

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const shakeVariants = {
    shake: {
      x: [0, -4, 4, -4, 4, 0],
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col md:flex-row relative overflow-x-hidden">
      
      {/* Premium Desktop Hero Section */}
      <div className="hidden md:flex w-1/2 h-screen sticky top-0 flex-col items-center justify-center relative overflow-hidden p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-500/20 blur-[120px]"></div>
          <div className="absolute bottom-[10%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-500/20 blur-[100px]"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 text-center max-w-lg"
        >
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-10">
            <span className="material-symbols-outlined text-white text-display !text-5xl">grid_view</span>
          </div>
          <h1 className="font-display text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Craft</span>
          </h1>
          <p className="font-body-base text-slate-300 text-lg md:text-xl leading-relaxed">
            Join the premier marketplace for top-tier freelancers. Connect, collaborate, and create extraordinary projects.
          </p>
        </motion.div>
      </div>

      {/* Form Section */}
      <main className="w-full md:w-1/2 min-h-screen flex flex-col p-6 sm:p-12 z-10">
        <div className="w-full max-w-[480px] m-auto flex flex-col items-center">
        
        {/* Mobile Logo Branding */}
        <div className="md:hidden mb-10 flex flex-col items-center group transition-transform duration-500 hover:scale-105">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="material-symbols-outlined text-white text-display !text-3xl">grid_view</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">Nayoda</h1>
        </div>

        {/* Login Form Container */}
        <motion.section 
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
        >
          <header className="mb-10 text-center md:text-left">
            <h2 className="font-h1 text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="font-body-base text-slate-500">Please enter your details to sign in.</p>
          </header>

          <form className="space-y-stack-lg" onSubmit={handleSubmit}>
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-md border border-status-error/30 bg-status-error/10 p-3 text-sm text-status-error mb-4"
                >
                  {error}
                  {resendUrl && (
                    <div className="mt-3">
                      <button 
                        type="button" 
                        onClick={handleResend} 
                        disabled={!!resendStatus}
                        className="text-xs font-medium border border-status-error/50 rounded px-3 py-1.5 hover:bg-status-error/20 transition-colors disabled:opacity-50"
                      >
                        Resend Verification Email
                      </button>
                      {resendStatus && (
                        <div className="mt-2 text-xs text-status-success">{resendStatus}</div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              variants={error ? shakeVariants : undefined}
              animate={error ? "shake" : undefined}
              className="space-y-stack-lg"
            >
              {/* Email Field */}
              <div className={`relative w-full rounded-xl transition-all duration-200 border bg-slate-50/50 ${error ? 'border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10' : 'border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white'}`}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <input 
                  className="w-full h-14 pl-12 pr-4 bg-transparent border-none focus:ring-0 font-body-base text-slate-900 outline-none placeholder:text-slate-400" 
                  id="email" 
                  placeholder="Email address" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loginMutation.isPending}
                  required
                />
              </div>

              {/* Password Field */}
              <div className={`relative w-full rounded-xl transition-all duration-200 border bg-slate-50/50 ${error ? 'border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10' : 'border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white'}`}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input 
                  className="w-full h-14 pl-12 pr-12 bg-transparent border-none focus:ring-0 font-body-base text-slate-900 outline-none placeholder:text-slate-400" 
                  id="password" 
                  placeholder="Password" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loginMutation.isPending}
                  required
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 outline-none rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </motion.div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between mt-6">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input className="peer w-5 h-5 rounded-md border-2 border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500/30 transition-all outline-none appearance-none checked:bg-indigo-600 checked:border-indigo-600" type="checkbox" />
                  <span className="material-symbols-outlined absolute text-white text-[14px] pointer-events-none opacity-0 peer-checked:opacity-100">check</span>
                </div>
                <span className="font-body-base text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
              </label>
              <Link className="font-body-base text-sm font-semibold text-indigo-600 hover:text-indigo-500 hover:underline transition-colors" to="/forgot-password">Forgot password?</Link>
            </div>

            {/* Actions */}
            <div className="pt-6 space-y-5">
              <motion.button 
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 rounded-xl bg-slate-900 text-white font-body-base font-semibold text-[16px] flex items-center justify-center transition-all shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:bg-slate-800 disabled:opacity-70 disabled:hover:scale-100 disabled:hover:y-0" 
                type="submit"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <span className="material-symbols-outlined animate-spin mr-2">sync</span>
                ) : null}
                {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
              </motion.button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 font-body-base text-xs font-medium text-slate-400 uppercase tracking-wider">or continue with</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center space-x-3 transition-all hover:bg-slate-50 hover:border-slate-300 shadow-sm" 
                type="button"
                disabled={loginMutation.isPending}
              >
                <img alt="Google Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDqTaaaD9n4TYPBq70PKdGqXhpWDnSd6YHMDubEcLZlXZOIm6Q04YzJRJOy1fC8tIY61XkM5xD-DMzzPYGq_-yAsTh9rdFWDQjIsOHbzZqaVvYrhvyIwTsbgUFeUcUhUnfSm9smm17b1LNyMkXH-69EUn2bqAUcyOHZMthvXGI_ED9jCIu6nGKZHTAAjkbm06W11Ex47IQtiryrb4lfaInHPNim0sckOkE06tPEXKipWLpOVYA5vnoZVWoZyFe3uVw72Qq4eJCBApJ"/>
                <span className="font-body-base font-semibold text-slate-700">Continue with Google</span>
              </motion.button>
            </div>
          </form>
        </motion.section>

        {/* Footer Links */}
        <footer className="mt-12 text-center pb-8">
          <p className="font-body-base text-slate-500 text-sm">
            Don't have an account? 
            <Link className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors inline-flex items-center group ml-1.5" to="/register">
              Sign up 
              <span className="material-symbols-outlined text-[16px] ml-1 transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </p>
        </footer>
        </div>
      </main>

      {/* Background Decoration (Mobile) */}
      <div className="md:hidden fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40">
        <div className="absolute top-[10%] right-[15%] w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[20%] left-[10%] w-96 h-96 bg-gradient-end/5 rounded-full blur-3xl"></div>
      </div>

    </div>
  );
}
