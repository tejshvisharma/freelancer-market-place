import { Link } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/features/auth/schemas/auth.schema";
import { useForgotPassword } from "@/features/auth/hooks";

export default function ForgotPasswordPage() {
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const forgotPassword = useForgotPassword({ setError: form.setError });

  const onSubmit = (values: ForgotPasswordInput) => {
    form.clearErrors("root");
    forgotPassword.mutate(values);
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-body-base overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
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

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center p-6 relative z-10">
        <section className="w-full max-w-[440px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="text-center space-y-2 mb-8">
              <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[32px]">key</span>
              </div>
              <h1 className="font-display text-[32px] font-bold text-slate-900 tracking-tight">Forgot Password</h1>
              <p className="font-body-base text-[16px] text-slate-500 px-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {forgotPassword.isSuccess ? (
              <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-emerald-500 text-[32px]">check_circle</span>
                </div>
                <div className="text-center space-y-2">
                  <p className="font-body-base text-[16px] text-slate-600 leading-relaxed px-2">If your email exists, a reset link has been sent.</p>
                </div>
                <button 
                  onClick={() => window.open('https://mail.google.com', '_blank')}
                  className="w-full h-[52px] bg-slate-900 text-white font-semibold rounded-xl shadow-md hover:bg-slate-800 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group mt-4"
                >
                  <span>Open Email App</span>
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
                <div className="pt-4 text-center">
                  <Link to="/login" className="font-body-base text-[14px] text-indigo-600 font-semibold hover:underline flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back to Login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {form.formState.errors.root && (
                  <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-600 flex items-start gap-3 animate-in fade-in duration-300">
                    <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
                    <span>{form.formState.errors.root.message}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className={`relative w-full rounded-xl transition-all duration-200 border bg-slate-50/50 ${form.formState.errors.email ? 'border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10' : 'border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white'}`}>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
                      <span className="material-symbols-outlined text-[20px]">mail</span>
                    </div>
                    <input 
                      id="email" 
                      type="email"
                      placeholder="john@example.com" 
                      {...form.register("email")}
                      disabled={forgotPassword.isPending}
                      className="w-full h-[52px] pl-12 pr-4 bg-transparent border-none focus:ring-0 font-body-base text-slate-900 outline-none placeholder:text-slate-400" 
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="mt-1 text-xs text-red-500 pl-1">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-4 pt-2">
                  <button 
                    type="submit" 
                    disabled={forgotPassword.isPending}
                    className="w-full h-[52px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {forgotPassword.isPending ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                  <div className="text-center pt-2">
                    <Link to="/login" className="font-body-base text-[14px] text-slate-500 hover:text-slate-700 font-medium flex items-center justify-center gap-1 group">
                      <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                      Back to Login
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
