'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  LogOut,
  Menu,
  X,
  Home,
  Compass,
  Trophy,
  Moon,
  Sun,
  LayoutDashboard,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeContext } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Image from 'next/image';
// Composant Avatar avec fallback
function AvatarWithFallback({
  avatarUrl,
  firstName,
  email,
  size = 40
}: {
  avatarUrl?: string | null;
  firstName?: string;
  email?: string;
  size?: number;
}) {
  const [imageError, setImageError] = useState(false);
  const initials = firstName?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || 'U';
  const sizeClass = size === 32 ? 'w-8 h-8' : size === 56 ? 'w-14 h-14' : 'w-10 h-10';
  const textSizeClass = size === 32 ? 'text-xs' : 'text-sm';

  if (!avatarUrl || imageError) {
    return (
      <div className={`${sizeClass} bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0`}>
        <span className={`text-white ${textSizeClass} font-semibold`}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden border-2 border-blue-600 dark:border-blue-400 flex-shrink-0 relative`}>
      <Image
        src={avatarUrl}
        alt={`${firstName || 'Utilisateur'}`}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        unoptimized
        onError={() => setImageError(true)}
      />
    </div>
  );
}

export default function DashboardHeader () {

  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const logoutButtonRef = useRef<HTMLButtonElement>(null);

  // Theme context
  const themeContext = useContext(ThemeContext);
  const resolvedTheme = themeContext?.resolvedTheme || 'light';
  const toggleTheme = themeContext?.toggleTheme || (() => {});
  const isDark = resolvedTheme === 'dark';

  // Empêcher le scroll du body quand le drawer est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);


  // Gestionnaire pour fermer le menu quand on clique en dehors
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const menuElement = document.querySelector('[data-user-menu]');
      const buttonElement = document.querySelector('[data-user-menu-button]');
      
      if (menuElement && !menuElement.contains(target) && buttonElement && !buttonElement.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      window.location.replace('/auth/login');
    }
  };

  const navigation = [
    { name: 'Accueil',         href: '/',                        icon: Home },
    { name: 'Tableau de bord', href: '/dashboard',               icon: LayoutDashboard },
    { name: 'Mes cours',       href: '/dashboard/courses',       icon: GraduationCap },
    { name: 'Explorer',        href: '/courses',                 icon: Compass },
    { name: 'Certificats',     href: '/dashboard/certificates',  icon: Trophy },
    { name: 'Mon profil',      href: '/dashboard/profile',       icon: User },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-3">
              {/* Logo Officiel de Waraba Digital */}
              <div className="w-12 h-12 relative">
                <Image
                  src="/waraba-academy.svg"
                  alt="Waraba Digital Academy"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Actions Droites */}
          <div className="flex items-center space-x-4">
            {/* Toggle Theme */}
            <ThemeToggle />

            {/* Menu Utilisateur */}
            <div className="relative">
              <button
                data-user-menu-button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                }}
                className="flex items-center space-x-3 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <AvatarWithFallback
                  avatarUrl={user?.user_metadata?.avatar_url}
                  firstName={user?.user_metadata?.first_name}
                  email={user?.email}
                  size={32}
                />
                <span className="hidden md:block font-medium">
                  {user?.user_metadata?.first_name || 'Utilisateur'} {user?.user_metadata?.last_name || ''}
                </span>
              </button>

              {/* Dropdown Menu Utilisateur */}
              {isUserMenuOpen && (
                <div 
                  data-user-menu
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-2">
                      <AvatarWithFallback
                        avatarUrl={user?.user_metadata?.avatar_url}
                        firstName={user?.user_metadata?.first_name}
                        email={user?.email}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user?.user_metadata?.first_name || 'Utilisateur'} {user?.user_metadata?.last_name || ''}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Mon Profil</span>
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 py-2">
                    <button
                      ref={logoutButtonRef}
                      onClick={(e) => {
                        try {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLogout();
                        } catch (error) {
                          console.error('Error in logout button handler:', error);
                        }
                      }}
                      className="flex items-center space-x-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile - Drawer Latéral Amélioré */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay sombre avec blur */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer latéral à droite */}
            <div
              className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl z-50 md:hidden flex flex-col transition-transform duration-300 ease-out"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navigation"
            >
              {/* Header avec logo et bouton fermer */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                <Image
                  src="/waraba-academy.svg"
                  alt="Waraba Academy"
                  width={36}
                  height={36}
                  priority
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Section Profil Utilisateur */}
              {user && (
                <div className="px-5 py-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <AvatarWithFallback
                        avatarUrl={user.user_metadata?.avatar_url}
                        firstName={user.user_metadata?.first_name}
                        email={user.email}
                        size={56}
                      />
                      {/* Indicateur en ligne */}
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                    </div>

                    {/* Infos utilisateur */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                        Bonjour, {user.user_metadata?.first_name || user.email?.split('@')[0] || 'Utilisateur'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-4">
                <div className="space-y-1 px-3">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href ||
                      (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Séparateur */}
                <div className="mx-6 my-4 h-px bg-gray-200 dark:bg-gray-700" />

                {/* Toggle Dark Mode */}
                <div className="px-3">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    {isDark ? (
                      <>
                        <Sun size={20} className="text-amber-500" />
                        <span className="font-medium">Mode clair</span>
                      </>
                    ) : (
                      <>
                        <Moon size={20} className="text-indigo-500" />
                        <span className="font-medium">Mode sombre</span>
                      </>
                    )}
                  </button>
                </div>
              </nav>

              {/* Footer - Déconnexion */}
              {user && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <LogOut size={18} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}

              {/* Copyright */}
              <div className="px-4 pb-4">
                <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center">
                  © {new Date().getFullYear()} Waraba Academy
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
