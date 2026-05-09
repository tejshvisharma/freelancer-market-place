import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '@/features/auth/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();
  
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');

  const handleNextStep = () => {
    if (!username || !email) {
      setError('Please fill in both username and email.');
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFieldErrors({ email: 'Please enter a valid email address.' });
      return;
    }
    setError('');
    setFieldErrors({});
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      handleNextStep();
      return;
    }

    setError('');
    setFieldErrors({});
    setSuccess('');

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (!agreed) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    try {
      const res = await registerMutation.mutateAsync({ username, fullName: username, email, password, confirmPassword, mobileNumber, role });
      setSuccess((res.message || 'Registered successfully, check your email for verification.'));
      setError('');
      setFieldErrors({});
      navigate('/verify-email-prompt', { state: { email } });
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors;
      if (Array.isArray(apiErrors)) {
        const newFieldErrors: { [key: string]: string } = {};
        apiErrors.forEach((e: { field: string; message: string }) => {
          newFieldErrors[e.field] = e.message;
        });
        setFieldErrors(newFieldErrors);
        setError(err.response?.data?.message || 'Registration failed. Please check the fields.');
        setSuccess('');
        
        // Go back to step 1 if the error is related to username or email
        if (newFieldErrors.username || newFieldErrors.email) {
          setStep(1);
        }
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
        setSuccess('');
      }
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
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
          <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/20 blur-[120px]"></div>
          <div className="absolute -bottom-[20%] left-[10%] w-[70%] h-[70%] rounded-full bg-purple-500/20 blur-[100px]"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 text-center max-w-lg"
        >
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-10">
            <span className="material-symbols-outlined text-white text-display !text-5xl">stars</span>
          </div>
          <h1 className="font-display text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Journey</span>
          </h1>
          <p className="font-body-base text-slate-300 text-lg md:text-xl leading-relaxed">
            Create your account in seconds. Join thousands of professionals accelerating their growth with Nayoda.
          </p>
          
          <div className="mt-12 flex items-center justify-center gap-6 opacity-60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">verified</span>
              <span className="text-sm font-medium">Verified Talent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">payments</span>
              <span className="text-sm font-medium">Secure Payments</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Form Section */}
      <main className="w-full md:w-1/2 min-h-screen flex flex-col p-6 sm:p-12 z-10">
        <div className="w-full max-w-[480px] m-auto flex flex-col items-center">
        
          {/* Mobile Logo Branding */}
          <div className="md:hidden mb-8 flex flex-col items-center group transition-transform duration-500 hover:scale-105">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <span className="material-symbols-outlined text-white text-display !text-3xl">grid_view</span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">Nayoda</h1>
          </div>

          {/* Registration Form Container */}
          <motion.section 
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
          >
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="font-body-base text-xs font-semibold text-slate-500 uppercase tracking-wider">Step {step} of 2</span>
                <span className="font-body-base text-xs font-bold text-indigo-600">{step === 1 ? '50%' : '100%'}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <motion.div 
                  initial={false}
                  animate={{ width: step === 1 ? '50%' : '100%' }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                />
              </div>
            </div>

            <header className="mb-8 text-center md:text-left">
              <h2 className="font-h1 text-3xl font-bold text-slate-900 mb-2">
                {step === 1 ? 'Create an account' : 'Secure your account'}
              </h2>
              <p className="font-body-base text-slate-500">
                {step === 1 ? 'Enter your information to get started.' : 'Create a strong password to protect your data.'}
              </p>
            </header>

            <form className="space-y-6" onSubmit={handleSubmit}>
              
              <AnimatePresence mode="wait">
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 mb-6"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                      <strong className="font-semibold text-emerald-800">Success!</strong>
                    </div>
                    {success}
                    <div className="mt-4">
                      <Link to="/login" className="inline-flex items-center justify-center w-full h-10 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                        Go to Login
                      </Link>
                    </div>
                  </motion.div>
                )}

                {error && !success && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-600 mb-6 flex items-start gap-3"
                  >
                    <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div 
                variants={error ? shakeVariants : undefined}
                animate={error ? "shake" : undefined}
              >
                <div className="relative overflow-hidden min-h-[160px]">
                  <AnimatePresence mode="wait">
                    
                    {/* STEP 1 FIELDS */}
                    {step === 1 && (
                      <motion.div 
                        key="step1"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-5"
                      >
                        {/* Username Field */}
                        <div>
                          <div className={`relative w-full rounded-xl transition-all duration-200 border bg-slate-50/50 ${fieldErrors.username ? 'border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10' : 'border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white'}`}>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
                              <span className="material-symbols-outlined text-[20px]">person</span>
                            </div>
                            <input 
                              className="w-full h-14 pl-12 pr-4 bg-transparent border-none focus:ring-0 font-body-base text-slate-900 outline-none placeholder:text-slate-400" 
                              id="username" 
                              placeholder="Username" 
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              disabled={registerMutation.isPending || !!success}
                              required
                            />
                          </div>
                          {fieldErrors.username && (
                            <p className="mt-1.5 text-xs text-red-500 pl-1">{fieldErrors.username}</p>
                          )}
                        </div>

                        {/* Email Field */}
                        <div>
                          <div className={`relative w-full rounded-xl transition-all duration-200 border bg-slate-50/50 ${fieldErrors.email ? 'border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10' : 'border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white'}`}>
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
                              disabled={registerMutation.isPending || !!success}
                              required
                            />
                          </div>
                          {fieldErrors.email && (
                            <p className="mt-1.5 text-xs text-red-500 pl-1">{fieldErrors.email}</p>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2 FIELDS */}
                    {step === 2 && (
                      <motion.div 
                        key="step2"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-5"
                      >
                        {/* Role Selection */}
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            type="button"
                            onClick={() => setRole('client')}
                            className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 text-center ${role === 'client' ? 'border-slate-900 bg-slate-50 shadow-sm scale-[1.02]' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                          >
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 ${role === 'client' ? 'bg-slate-200 text-slate-900' : 'bg-slate-50 text-slate-400'}`}>
                              <span className="material-symbols-outlined text-[28px]">person</span>
                            </div>
                            <p className="font-body-base text-sm font-semibold text-slate-900 mb-1">Hire Talent</p>
                            <p className="text-xs text-slate-500">Find experts</p>
                          </button>
                          
                          <button 
                            type="button"
                            onClick={() => setRole('freelancer')}
                            className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 text-center ${role === 'freelancer' ? 'border-slate-900 bg-slate-50 shadow-sm scale-[1.02]' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                          >
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 ${role === 'freelancer' ? 'bg-slate-200 text-slate-900' : 'bg-slate-50 text-slate-400'}`}>
                              <span className="material-symbols-outlined text-[28px]">work</span>
                            </div>
                            <p className="font-body-base text-sm font-semibold text-slate-900 mb-1">Freelancer</p>
                            <p className="text-xs text-slate-500">Get hired</p>
                          </button>
                        </div>

                        {/* Password Field */}
                        <div>
                          <div className={`relative w-full rounded-xl transition-all duration-200 border bg-slate-50/50 ${fieldErrors.password ? 'border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10' : 'border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white'}`}>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
                              <span className="material-symbols-outlined text-[20px]">lock</span>
                            </div>
                            <input 
                              className="w-full h-14 pl-12 pr-12 bg-transparent border-none focus:ring-0 font-body-base text-slate-900 outline-none placeholder:text-slate-400" 
                              id="password" 
                              placeholder="Create a password" 
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              disabled={registerMutation.isPending || !!success}
                              required
                            />
                            <button 
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 outline-none rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center" 
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              tabIndex={-1}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {showPassword ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                          </div>
                          {fieldErrors.password && (
                            <p className="mt-1.5 text-xs text-red-500 pl-1">{fieldErrors.password}</p>
                          )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                          <div className={`relative w-full rounded-xl transition-all duration-200 border bg-slate-50/50 ${fieldErrors.confirmPassword ? 'border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10' : 'border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white'}`}>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
                              <span className="material-symbols-outlined text-[20px]">lock_clock</span>
                            </div>
                            <input 
                              className="w-full h-14 pl-12 pr-12 bg-transparent border-none focus:ring-0 font-body-base text-slate-900 outline-none placeholder:text-slate-400" 
                              id="confirmPassword" 
                              placeholder="Confirm password" 
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              disabled={registerMutation.isPending || !!success}
                              required
                            />
                            <button 
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 outline-none rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center" 
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              tabIndex={-1}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {showConfirmPassword ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                          </div>
                          {fieldErrors.confirmPassword && (
                            <p className="mt-1.5 text-xs text-red-500 pl-1">{fieldErrors.confirmPassword}</p>
                          )}
                        </div>

                        {/* Mobile Number Field */}
                        <div>
                          <div className={`relative w-full rounded-xl transition-all duration-200 border bg-slate-50/50 ${fieldErrors.mobileNumber ? 'border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10' : 'border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white'}`}>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
                              <span className="material-symbols-outlined text-[20px]">call</span>
                            </div>
                            <input 
                              className="w-full h-14 pl-12 pr-4 bg-transparent border-none focus:ring-0 font-body-base text-slate-900 outline-none placeholder:text-slate-400" 
                              id="mobileNumber" 
                              placeholder="Mobile Number (Optional)" 
                              type="tel"
                              value={mobileNumber}
                              onChange={(e) => setMobileNumber(e.target.value)}
                              disabled={registerMutation.isPending || !!success}
                            />
                          </div>
                          {fieldErrors.mobileNumber && (
                            <p className="mt-1.5 text-xs text-red-500 pl-1">{fieldErrors.mobileNumber}</p>
                          )}
                        </div>

                        {/* Terms & Privacy */}
                        <label className="flex items-start space-x-3 cursor-pointer group mt-6">
                          <div className="relative flex items-center justify-center mt-0.5">
                            <input 
                              className="peer w-5 h-5 rounded-md border-2 border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500/30 transition-all outline-none appearance-none checked:bg-indigo-600 checked:border-indigo-600" 
                              type="checkbox"
                              checked={agreed}
                              onChange={(e) => setAgreed(e.target.checked)}
                              disabled={registerMutation.isPending || !!success}
                            />
                            <span className="material-symbols-outlined absolute text-white text-[14px] pointer-events-none opacity-0 peer-checked:opacity-100">check</span>
                          </div>
                          <span className="font-body-base text-sm text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed">
                            I agree to the <Link to="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
                          </span>
                        </label>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Actions */}
              <div className="pt-4 flex items-center gap-4">
                {step === 2 && (
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={registerMutation.isPending || !!success}
                    className="h-14 px-6 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  </button>
                )}

                <motion.button 
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 h-14 rounded-xl bg-slate-900 text-white font-body-base font-semibold text-[16px] flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:bg-slate-800 disabled:opacity-70 disabled:hover:scale-100 disabled:hover:y-0" 
                  type="submit"
                  disabled={registerMutation.isPending || !!success}
                >
                  {registerMutation.isPending ? (
                    <span className="material-symbols-outlined animate-spin">sync</span>
                  ) : null}
                  {registerMutation.isPending 
                    ? 'Creating account...' 
                    : step === 1 ? 'Continue' : 'Create Account'}
                  {!registerMutation.isPending && step === 1 && (
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.section>

          {/* Footer Links */}
          <footer className="mt-12 text-center pb-8">
            <p className="font-body-base text-slate-500 text-sm">
              Already have an account? 
              <Link className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors inline-flex items-center group ml-1.5" to="/login">
                Sign in 
                <span className="material-symbols-outlined text-[16px] ml-1 transition-transform group-hover:translate-x-1">arrow_forward</span>
              </Link>
            </p>
          </footer>
        </div>
      </main>

      {/* Background Decoration (Mobile) */}
      <div className="md:hidden fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40">
        <div className="absolute top-[10%] -right-[10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-[20%] left-[10%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

    </div>
  );
}
