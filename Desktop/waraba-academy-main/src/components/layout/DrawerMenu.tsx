'use client';

import { useState, useEffect, useContext } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  Home,
  BookOpen,
  Compass,
  LayoutDashboard,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Moon,
  Sun,
  GraduationCap,
  Award,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeContext } from '@/contexts/ThemeContext';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DrawerMenu({ isOpen, onClose }: DrawerMenuProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [imageError, setImageError] = useState(false);

  // Extraire les infos du profil depuis user_metadata
  const userMetadata = user?.user_metadata;

  const themeContext = useContext(ThemeContext);
  const resolvedTheme = themeContext?.resolvedTheme || 'light';
  const toggleTheme = themeContext?.toggleTheme || (() => {});
  const isDark = resolvedTheme === 'dark';

  // Empêcher le scroll du body quand le drawer est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    onClose();
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      window.location.replace('/auth/login');
    }
  };

  // Obtenir les initiales de l'utilisateur
  const getInitials = (): string => {
    const firstName = userMetadata?.first_name || userMetadata?.firstName;
    const lastName = userMetadata?.last_name || userMetadata?.lastName;
    if (firstName && lastName) {
      return `${String(firstName)[0]}${String(lastName)[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Obtenir le nom d'affichage
  const getDisplayName = (): string => {
    const firstName = userMetadata?.first_name || userMetadata?.firstName;
    if (firstName) {
      return String(firstName);
    }
    if (user?.email) {
      return user.email.split('@')[0] || 'Utilisateur';
    }
    return 'Utilisateur';
  };

  // Obtenir l'URL de l'avatar
  const avatarUrl = userMetadata?.avatar_url || userMetadata?.avatarUrl;

  const navigationAuth = [
    { name: 'Accueil',         href: '/',                        icon: Home },
    { name: 'Tableau de bord', href: '/dashboard',               icon: LayoutDashboard },
    { name: 'Mes cours',       href: '/dashboard/courses',       icon: GraduationCap },
    { name: 'Explorer',        href: '/courses',                 icon: Compass },
    { name: 'Certificats',     href: '/dashboard/certificates',  icon: Award },
    { name: 'Mon profil',      href: '/dashboard/profile',       icon: User },
  ];

  const navigationGuest = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Cours', href: '/courses', icon: BookOpen },
    { name: 'Explorer', href: '/categories', icon: Compass },
  ];

  const navigation = user ? navigationAuth : navigationGuest;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl z-[70] lg:hidden flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
      >
        {/* Header avec bouton fermer */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <Image
            src="/waraba-academy.svg"
            alt="Waraba Academy"
            width={36}
            height={36}
            priority
          />
          <button
            onClick={onClose}
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
                {avatarUrl && !imageError ? (
                  <Image
                    src={avatarUrl}
                    alt="Photo de profil"
                    width={56}
                    height={56}
                    className="rounded-full object-cover ring-2 ring-white dark:ring-gray-700 shadow-md"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold ring-2 ring-white dark:ring-gray-700 shadow-md">
                    {getInitials()}
                  </div>
                )}
                {/* Indicateur en ligne */}
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
              </div>

              {/* Infos utilisateur */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                  Bonjour, {getDisplayName()}
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
                  onClick={onClose}
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

          {/* Auth Actions */}
          {!user && (
            <>
              <div className="mx-6 my-4 h-px bg-gray-200 dark:bg-gray-700" />
              <div className="px-5 space-y-3">
                <Link
                  href="/auth/login"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-3 text-gray-700 dark:text-gray-300 font-medium border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                >
                  <LogIn size={18} />
                  <span>Connexion</span>
                </Link>
                <Link
                  href="/auth/register"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                >
                  <UserPlus size={18} />
                  <span>Créer un compte</span>
                </Link>
              </div>
            </>
          )}
        </nav>

        {/* Footer - Déconnexion (utilisateur connecté uniquement) */}
        {user && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-3 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </div>
        )}

        {/* Copyright minimaliste */}
        <div className="px-4 pb-4">
          <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center">
            © {new Date().getFullYear()} Waraba Academy
          </p>
        </div>
      </div>
    </>
  );
}
