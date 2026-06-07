'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu, Bell, ChevronDown, LogOut,
  BookOpen, Award, User, LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import GlobalSearch from '@/components/search/GlobalSearch';
import DrawerMenu from '@/components/layout/DrawerMenu';
import { createBrowserClient } from '@supabase/ssr';
import { supabaseConfig } from '@/config/supabase';

// Composant Avatar avec fallback pour gérer les images corrompues et récupérer depuis profiles
function AvatarWithFallback({
  avatarUrl: initialAvatarUrl,
  firstName,
  email,
  userId,
  size = 32
}: {
  avatarUrl?: string | null;
  firstName?: string;
  email?: string;
  userId?: string;
  size?: number;
}) {
  const [imageError, setImageError] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(initialAvatarUrl);
  const fetchedRef = useRef(false);
  const initials = firstName?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || 'U';

  // Fetch avatar from profiles ONCE if not in user_metadata
  useEffect(() => {
    if (!initialAvatarUrl && userId && !fetchedRef.current) {
      fetchedRef.current = true;
      const supabase = createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);

      supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .maybeSingle()
        .then(({ data, error }) => {
          if (!error && data?.avatar_url) {
            setAvatarUrl(data.avatar_url);
          }
        });
    }
  }, [initialAvatarUrl, userId]);

  if (!avatarUrl || imageError) {
    return (
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-semibold">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 relative">
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

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    await signOut();
    window.location.replace('/auth/login');
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Accueil', href: '/' },
    { name: 'Cours', href: '/courses' },
    { name: 'Catégories', href: '/categories' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white dark:bg-gray-900 ${
        isScrolled ? 'shadow-md py-2' : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo seul (Épuré) */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center group">
              <Image 
                src="/waraba-academy.svg" 
                alt="Logo Waraba" 
                width={48} 
                height={48}
                className="transition-transform group-hover:scale-105"
                priority
              />
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Actions Droite */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:block">
              <GlobalSearch />
            </div>
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-3">
                <button aria-label="Notifications" className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full relative">
                  <Bell size={20} aria-hidden="true" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" aria-hidden="true"></span>
                </button>

                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 pr-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    <AvatarWithFallback 
                      avatarUrl={user.user_metadata?.avatar_url}
                      firstName={user.user_metadata?.first_name}
                      email={user.email}
                      userId={user.id}
                      size={32}
                    />
                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user.user_metadata?.first_name || user.email?.split('@')[0] || 'Utilisateur'}
                    </span>
                    <ChevronDown size={14} className={isUserMenuOpen ? 'rotate-180' : ''} />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      {/* Backdrop — ferme le menu au clic extérieur */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserMenuOpen(false)}
                        aria-hidden="true"
                      />

                      <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden">
                        {/* En-tête dropdown : nom + email */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {user.user_metadata?.first_name && user.user_metadata?.last_name
                              ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                              : user.user_metadata?.first_name || user.email?.split('@')[0] || 'Mon compte'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>

                        {/* Navigation principale */}
                        <nav className="py-1">
                          {[
                            { href: '/dashboard',                  icon: LayoutDashboard, label: 'Tableau de bord' },
                            { href: '/dashboard/courses',          icon: BookOpen,        label: 'Mes cours'       },
                            { href: '/dashboard/certificates',     icon: Award,           label: 'Mes certificats' },
                            { href: '/profile',                    icon: User,            label: 'Mon profil'      },
                          ].map(({ href, icon: Icon, label }) => (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setIsUserMenuOpen(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                                ${pathname === href
                                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
                                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                              <Icon size={16} className="shrink-0" />
                              {label}
                            </Link>
                          ))}
                        </nav>

                        {/* Déconnexion */}
                        <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                          >
                            <LogOut size={16} className="shrink-0" />
                            Déconnexion
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <Link 
                href="/auth/login" 
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Connexion
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={isMobileMenuOpen}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <Menu size={24} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <DrawerMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
}