import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileInput,
  Sliders,
  TrendingUp,
  Menu,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/input', label: 'Data Input', icon: FileInput },
  { href: '/simulator', label: 'What-If Analysis', icon: Sliders },
];

import { ProfileDialog } from './ProfileDialog';

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const NavItem = ({ item, mobile = false }: { item: typeof navItems[0]; mobile?: boolean }) => {
    const isActive = location.pathname === item.href;
    return (
      <Link
        to={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-sidebar-accent text-white shadow-sm"
            : "text-slate-400 hover:bg-sidebar-accent/50 hover:text-white"
        )}
        onClick={() => mobile && setMobileMenuOpen(false)}
      >
        <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
        <span>{item.label}</span>
        {isActive && !mobile && <ChevronRight className="ml-auto h-4 w-4 opacity-50 text-white" />}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50 bg-sidebar border-r border-sidebar-border shadow-md text-sidebar-foreground">
        {/* Sidebar Header */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border bg-sidebar">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
            Risk Predictor
          </span>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 flex flex-col gap-6 p-4 overflow-y-auto">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
              Analytics Dashboard
            </div>
            <nav className="space-y-1.5">
              {navItems.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}
            </nav>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar">
          <div
            className="flex items-center gap-3 px-2 mb-4 cursor-pointer hover:bg-sidebar-accent p-2 rounded-xl transition-colors group"
            onClick={() => setProfileOpen(true)}
          >
            <div className="h-10 w-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-white font-semibold group-hover:scale-105 transition-transform">
              {profile?.name.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{profile?.name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{profile?.role || 'Guest'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start gap-3 text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </Button>
        </div>
      </aside>

      <ProfileDialog isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:pl-72 transition-all duration-300">

        {/* Mobile Header / Top Bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-border bg-card/80 backdrop-blur px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-foreground">Risk Predictor</span>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="relative flex w-full max-w-xs flex-1 flex-col bg-sidebar pt-5 pb-4 shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 pb-4 border-b border-sidebar-border">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-500 text-white">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-lg font-bold text-white">Risk Predictor</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex-1 space-y-1 px-4 py-4">
                {navItems.map((item) => (
                  <NavItem key={item.href} item={item} mobile />
                ))}
              </nav>
              <div className="border-t border-sidebar-border p-4">
                <div
                  className="flex items-center gap-3 px-2 mb-4 cursor-pointer hover:bg-sidebar-accent p-2 rounded-lg transition-colors"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setProfileOpen(true);
                  }}
                >
                  <div className="h-10 w-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-semibold">
                    {profile?.name.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{profile?.name || 'User'}</p>
                    <p className="text-xs text-slate-500 truncate">{profile?.role || 'Guest'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start gap-3 text-slate-400 hover:bg-sidebar-accent hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 py-8 bg-background">
          <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
