'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { User, LogOut, Settings, BookOpen } from 'lucide-react';

export default function AuthNav () {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      window.location.href = '/';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/auth/login"
          className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
        >
          Se connecter
        </Link>
        <Link
          href="/auth/register"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Commencer
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Menu utilisateur */}
      <div className="relative group">
        <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-medium">
            {user.user_metadata?.first_name || user.email?.split('@')[0]}
          </span>
        </button>

        {/* Dropdown menu */}
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="py-2">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Tableau de bord</span>
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Profil</span>
            </Link>
            <hr className="my-2" />
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
