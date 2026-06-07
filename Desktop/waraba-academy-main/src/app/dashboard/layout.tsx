'use client';

import { ReactNode } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SimpleAuthGuard from '@/components/auth/SimpleAuthGuard';

export default function DashboardLayout ({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SimpleAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="pt-16">
          {children}
        </main>
      </div>
    </SimpleAuthGuard>
  );
}
