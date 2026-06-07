'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function AuthStatus () {
  const { user, session, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <div className="font-bold mb-2">🔐 Auth Status</div>
      <div className="space-y-1">
        <div>Loading: {loading ? '🔄 Oui' : '✅ Non'}</div>
        <div>User: {user ? '👤 Oui' : '❌ Non'}</div>
        <div>Session: {session ? '🔑 Oui' : '❌ Non'}</div>
        {user && (
          <>
            <div>Email: {user.email}</div>
            <div>Role: {user.user_metadata?.role || 'student'}</div>
            <div>ID: {user.id}</div>
          </>
        )}
        {session && (
          <>
            <div>Expires: {new Date(session.expires_at! * 1000).toLocaleTimeString()}</div>
          </>
        )}
      </div>
    </div>
  );
}
