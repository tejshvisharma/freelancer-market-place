import { NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Bell,
  Settings,
  Users,
  Shield,
  Menu,
  X,
} from 'lucide-react'
import { ROUTES } from '@/app/routes'
import { useState } from 'react'

// Navigation configuration per role
const navigation = {
  client: [
    { name: 'Dashboard', href: ROUTES.DASHBOARD_CLIENT, icon: LayoutDashboard },
    { name: 'My Gigs', href: '/gigs/manage', icon: Briefcase },
    { name: 'Messages', href: '/chat', icon: MessageSquare },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Settings', href: '/settings', icon: Settings },
  ],
  freelancer: [
    { name: 'Dashboard', href: ROUTES.DASHBOARD_FREELANCER, icon: LayoutDashboard },
    { name: 'Find Gigs', href: '/gigs', icon: Briefcase },
    { name: 'My Proposals', href: '/proposals', icon: MessageSquare },
    { name: 'Messages', href: '/chat', icon: MessageSquare },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Profile', href: '/profile', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ],
  admin: [
    { name: 'Dashboard', href: ROUTES.DASHBOARD_ADMIN, icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Gigs', href: '/admin/gigs', icon: Briefcase },
    { name: 'Payments', href: '/admin/payments', icon: Shield },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ],
}

export default function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) return null

  const links = navigation[user.role] ?? navigation.client

  const NavItems = () => (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {links.map((item) => {
        const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
        return (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r bg-card">
        <div className="flex h-14 items-center px-6 border-b">
          <span className="text-xl font-bold tracking-tight text-primary">SkillSphere</span>
        </div>
        <ScrollArea className="flex-1">
          <NavItems />
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 truncate">
              <p className="font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed top-3 left-3 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-14 items-center px-6 border-b">
            <span className="text-xl font-bold tracking-tight text-primary">SkillSphere</span>
          </div>
          <ScrollArea className="flex-1">
            <NavItems />
          </ScrollArea>
          <Separator />
          <div className="p-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 truncate">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}