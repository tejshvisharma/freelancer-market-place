import { useAuthStore } from '@/stores/auth.store';
import { useLogout } from '@/features/auth/hooks';

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const logout = useLogout();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 font-body-base">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center space-y-6 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[32px]">business_center</span>
        </div>
        <div>
          <h1 className="font-display text-[28px] font-bold text-slate-900 tracking-tight mb-2">Welcome, Client</h1>
          <p className="text-[16px] text-slate-500">Hello, {user?.name || 'User'}. You are logged into the Client dashboard.</p>
        </div>
        <button
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="w-full h-12 bg-slate-900 text-white font-semibold rounded-xl shadow-md hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {logout.isPending ? (
            <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
          ) : (
            <>
              <span>Sign out</span>
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
