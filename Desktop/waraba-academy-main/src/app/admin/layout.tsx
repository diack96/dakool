'use client';

import { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ToastProvider } from '@/components/admin/Toast';
import {
  LogOut,
  Shield,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Home,
  Crown,
  Zap,
  Sparkles,
  Wallet,
  Ticket,
  Menu,
  X,
  GraduationCap,
  Bell,
  HelpCircle,
  UserCheck,
  ClipboardList,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import AdminGlobalSearch from '@/components/admin/AdminGlobalSearch';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import KeyboardShortcutsHelp from '@/components/admin/KeyboardShortcutsHelp';
import { useAdminShortcuts } from '@/hooks/useAdminShortcuts';

const NAV_SECTIONS = [
  {
    title: 'Principal',
    activeColor: 'bg-blue-50 text-blue-700',
    items: [
      { href: '/admin', icon: BarChart3, label: 'Dashboard', color: 'bg-blue-600', exact: true },
      { href: '/admin/finances', icon: Wallet, label: 'Finances', color: 'bg-green-600' },
      { href: '/admin/reports', icon: Shield, label: 'Rapports', color: 'bg-purple-600' },
    ],
  },
  {
    title: 'Contenu',
    activeColor: 'bg-orange-50 text-orange-700',
    items: [
      { href: '/admin/courses', icon: BookOpen, label: 'Cours', color: 'bg-orange-600' },
      { href: '/admin/learning-paths', icon: Layers, label: 'Parcours', color: 'bg-teal-600' },
      { href: '/admin/categories', icon: Zap, label: 'Catégories', color: 'bg-yellow-600' },
      { href: '/admin/quizzes', icon: HelpCircle, label: 'Quizzes', color: 'bg-violet-600' },
      { href: '/admin/enrollments', icon: Sparkles, label: 'Inscriptions', color: 'bg-green-600' },
      { href: '/admin/coupons', icon: Ticket, label: 'Coupons', color: 'bg-pink-600' },
    ],
  },
  {
    title: 'Utilisateurs',
    activeColor: 'bg-indigo-50 text-indigo-700',
    items: [
      { href: '/admin/users', icon: Users, label: 'Utilisateurs', color: 'bg-indigo-600' },
      { href: '/admin/instructors', icon: UserCheck, label: 'Instructeurs', color: 'bg-blue-500' },
      { href: '/admin/students', icon: GraduationCap, label: 'Suivi étudiants', color: 'bg-teal-600' },
    ],
  },
  {
    title: 'Communication',
    activeColor: 'bg-amber-50 text-amber-700',
    items: [
      { href: '/admin/notifications', icon: Bell, label: 'Notifications', color: 'bg-amber-600' },
    ],
  },
  {
    title: 'Configuration',
    activeColor: 'bg-gray-100 text-gray-900',
    items: [
      { href: '/admin/settings', icon: Settings, label: 'Paramètres', color: 'bg-gray-600' },
      { href: '/admin/audit', icon: ClipboardList, label: 'Journal d\'audit', color: 'bg-slate-600' },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, logoutAdmin } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin-sidebar-collapsed') === 'true';
    }
    return false;
  });

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('admin-sidebar-collapsed', String(next));
      return next;
    });
  };

  useAdminShortcuts();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;
    if (!isLoading && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" role="status" aria-label="Chargement" />
          <p className="text-gray-600 text-lg">Vérification de l&apos;accès administrateur...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" role="status" aria-label="Redirection" />
          <p className="text-gray-600">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                {/* Mobile menu toggle */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                  aria-expanded={sidebarOpen}
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Crown className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">Administration</h1>
                  <p className="text-sm text-gray-600">Waraba Academy</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                <AdminGlobalSearch />
                <Link
                  href="/"
                  className="hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                  Retour au site
                </Link>
                <button
                  onClick={logoutAdmin}
                  className="inline-flex items-center px-3 sm:px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                  aria-label="Se déconnecter"
                >
                  <LogOut className="w-4 h-4 sm:mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex relative">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Sidebar */}
          <aside
            className={`
              fixed lg:sticky top-16 z-40 lg:z-auto
              bg-white border-r border-gray-200 h-[calc(100vh-4rem)] overflow-y-auto
              transform transition-all duration-200 ease-in-out flex flex-col
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              ${collapsed ? 'lg:w-16' : 'lg:w-64'}
              w-64
            `}
            role="navigation"
            aria-label="Navigation admin"
          >
            <div className={`flex-1 py-4 ${collapsed ? 'px-2' : 'px-4'}`}>
              <nav className="space-y-1">
                {NAV_SECTIONS.map((section) => (
                  <div key={section.title} className="mb-4">
                    {/* Titre de section — masqué en mode réduit */}
                    {!collapsed && (
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2 mb-2">
                        {section.title}
                      </p>
                    )}
                    {collapsed && <div className="border-t border-gray-100 my-2" />}

                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = item.exact
                        ? pathname === item.href
                        : pathname === item.href || pathname.startsWith(item.href + '/');
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={collapsed ? item.label : undefined}
                          className={`flex items-center rounded-lg transition-colors group relative
                            ${collapsed ? 'justify-center px-2 py-2.5' : 'px-4 py-2.5'}
                            ${isActive ? `${section.activeColor} font-semibold` : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                          `}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center shrink-0 ${collapsed ? '' : 'mr-3'}`}>
                            <Icon className="w-4 h-4 text-white" aria-hidden="true" />
                          </div>
                          {!collapsed && <span className="font-medium truncate">{item.label}</span>}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>

              {/* Mobile-only: retour au site */}
              {!collapsed && (
                <div className="lg:hidden border-t border-gray-200 mt-4 pt-4">
                  <Link
                    href="/"
                    className="flex items-center px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <Home className="w-4 h-4 mr-3" aria-hidden="true" />
                    Retour au site
                  </Link>
                </div>
              )}
            </div>

            {/* Bouton collapse — desktop uniquement */}
            <div className="hidden lg:flex border-t border-gray-200 p-2 justify-end">
              <button
                onClick={toggleCollapsed}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={collapsed ? 'Agrandir la sidebar' : 'Réduire la sidebar'}
                title={collapsed ? 'Agrandir' : 'Réduire'}
              >
                {collapsed
                  ? <PanelLeftOpen className="w-4 h-4" />
                  : <PanelLeftClose className="w-4 h-4" />
                }
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
            <AdminBreadcrumbs />
            {children}
          </main>
        </div>

        <KeyboardShortcutsHelp />
      </div>
    </ToastProvider>
  );
}
