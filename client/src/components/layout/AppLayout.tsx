import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban,
  Menu, Sun, Moon, User, LogOut, Trophy,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useLogoutMutation } from '@/features/auth/api';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useThemeStore } from '@/stores/theme.store';

// ── Nav link config ────────────────────────────────────────────────────────────
const NAV_LINKS = [
  {
    to: '/projects',
    label: 'Projects',
    icon: FolderKanban,
    enabled: true,
  },
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    to: '/leaderboard',
    label: 'Leaderboard',
    icon: Trophy,
    enabled: true,
  },
];

export function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();
  const { isDark, toggleTheme } = useThemeStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="relative flex h-screen overflow-x-hidden bg-background">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-full flex-col border-r border-border/70 bg-card/90 backdrop-blur-md transition-all duration-300',

          // Desktop behavior
          'md:static md:translate-x-0',
          isSidebarOpen ? 'md:w-64' : 'md:w-16',

          // Mobile behavior
          'w-64',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-border/70 px-3">
          {isSidebarOpen && (
            <h1 className="ml-1 text-xl font-bold tracking-tight text-primary">KaryaDesk</h1>
          )}

          <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen((v) => !v)}
          className={cn(
            'hidden shrink-0 md:flex',
            isSidebarOpen ? 'ml-auto' : 'mx-auto'
          )}
        >
          <Menu className="h-5 w-5" />
        </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 p-2 pt-3">
          <TooltipProvider delayDuration={0}>
            {NAV_LINKS.map(({ to, label, icon: Icon, enabled }) => {
              const isActive = location.pathname.startsWith(to);

              const button = (
                <Button
                  key={to}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full rounded-lg transition-all duration-200',
                    isSidebarOpen ? 'justify-start px-3' : 'justify-center px-0',
                    isActive && 'border border-primary/25 bg-primary/10 text-primary shadow-sm',
                    !enabled && 'cursor-not-allowed opacity-50'
                  )}
                  disabled={!enabled}
                  asChild={enabled}
                >
                  {enabled ? (
                    <Link to={to}
                      className="flex items-center gap-3"
                      onClick={() => setIsMobileSidebarOpen(false)}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {isSidebarOpen && <span>{label}</span>}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0" />
                      {isSidebarOpen && <span>{label}</span>}
                    </div>
                  )}
                </Button>
              );

              // Show tooltip only when collapsed
              if (!isSidebarOpen) {
                return (
                  <Tooltip key={to}>
                    <TooltipTrigger asChild>
                      <div>{button}</div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return button;
            })}
          </TooltipProvider>
        </nav>

      </aside>
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-hidden">

        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-card/80 px-4 backdrop-blur-md md:px-6">

          <div className="flex items-center gap-2">

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <h2 className="text-sm md:text-lg font-semibold truncate">
              Welcome back, {user?.username}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-3">

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-9 w-9 rounded-full"
            >
              {isDark
                ? <Sun className="h-4 w-4" />
                : <Moon className="h-4 w-4" />
              }
            </Button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Open user menu"
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar className="h-9 w-9 cursor-pointer border border-border/70 transition-all hover:-translate-y-0.5 hover:ring-2 hover:ring-primary/50">
                    <AvatarImage src={user?.avatar?.url} />
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {user?.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 border-border/70 bg-card/95 backdrop-blur-sm">
                <div className="flex items-center gap-3 border-b border-border/70 px-3 py-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={user?.avatar?.url} />
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {user?.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{user?.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>

                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4 shrink-0" />
                    <span>View Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-1 md:px-6 md:pb-6 md:pt-2">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
