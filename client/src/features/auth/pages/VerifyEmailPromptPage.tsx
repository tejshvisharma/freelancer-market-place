import { useLocation, Link } from 'react-router-dom';

export default function VerifyEmailPromptPage() {
  const location = useLocation();
  const email = location.state?.email || 'your email address';

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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[20px]">grid_view</span>
            </div>
            <span className="font-display text-[24px] font-bold tracking-tight text-slate-900">Nayoda</span>
          </div>
        </nav>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center p-6 relative z-10">
        <section className="w-full max-w-[440px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Hero Icon Group */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-pulse">
              <span className="material-symbols-outlined text-indigo-600 text-[48px]">mail</span>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-50">
                <span className="material-symbols-outlined text-[16px]">check</span>
              </div>
            </div>
            {/* Headline & Status */}
            <div className="text-center space-y-2">
              <h1 className="font-display text-[32px] font-bold text-slate-900 tracking-tight">Check your email</h1>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">
                <span className="text-[14px]">✉️</span>
                <span className="font-body-base text-[13px] font-medium text-indigo-700">Sent to inbox</span>
              </div>
            </div>
          </div>

          {/* Descriptive Text */}
          <div className="text-center space-y-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <p className="font-body-base text-[16px] text-slate-600">
              We sent a verification link to: <br/>
              <span className="font-semibold text-slate-900 mt-1 block text-lg">{email}</span>
            </p>
            <p className="font-body-base text-[14px] text-slate-500 pt-2 border-t border-slate-100">
              Click the link in the email to verify your account and complete your setup.
            </p>
          </div>

          {/* Primary Action */}
          <div className="space-y-4">
            <button 
              onClick={() => window.open('https://mail.google.com', '_blank')}
              className="w-full h-[52px] bg-slate-900 text-white font-semibold rounded-xl shadow-md hover:bg-slate-800 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <span>Open Email App</span>
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </div>

          {/* Secondary Actions & Verification Support */}
          <div className="pt-6 space-y-6">
            <div className="flex flex-col gap-4 items-center text-center">
              <div className="flex items-center gap-2 text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <span className="material-symbols-outlined text-[18px] group-hover:rotate-180 transition-transform duration-500">refresh</span>
                <p className="font-body-base text-[14px]">
                  Didn't receive it? <Link to="/resend-verification-email" className="font-semibold text-indigo-600 hover:text-indigo-700 ml-1">Resend email</Link>
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 font-body-base text-[14px] text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">
                <span className="material-symbols-outlined text-[18px]">help_outline</span>
                Check spam folder
              </span>
            </div>
          </div>

          {/* Contextual Graphic / Bento Element */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 overflow-hidden relative group">
            <div className="flex items-start gap-4">
              <div className="bg-white p-2.5 rounded-xl border border-indigo-100 z-10 shadow-sm">
                <span className="material-symbols-outlined text-indigo-600">verified_user</span>
              </div>
              <div className="z-10">
                <h4 className="font-body-base font-semibold text-slate-900">Secure Verification</h4>
                <p className="font-body-base text-[13px] text-slate-600 mt-1 leading-relaxed">Email verification provides a secure way to confirm your Nayoda account access.</p>
              </div>
            </div>
            {/* Abstract UI background element */}
            <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 z-0">
              <span className="material-symbols-outlined text-[140px]">shield</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Information */}
      <footer className="p-6 text-center z-10">
        <p className="font-body-base text-[14px] text-slate-500">
          Need help? <a className="text-indigo-600 font-medium hover:underline" href="#">Contact Support</a>
        </p>
      </footer>
    </div>
  );
}
