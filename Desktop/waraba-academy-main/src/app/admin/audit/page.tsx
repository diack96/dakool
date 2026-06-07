'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/admin/Toast';
import {
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string;
  adminName: string;
  action: string;
  resource: string;
  ip_address: string;
  timestamp: string;
  success: boolean;
  details: Record<string, unknown> | null;
}

const ACTION_LABELS: Record<string, string> = {
  admin_access: 'Accès admin',
  'courses.view': 'Vue cours',
  'courses.create': 'Création cours',
  'courses.update': 'Modification cours',
  'courses.delete': 'Suppression cours',
  'users.view': 'Vue utilisateurs',
  'users.delete': 'Suppression utilisateur',
  'enrollments.delete': 'Suppression inscription',
};

export default function AuditLogPage() {
  const { error: toastError } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = useCallback(async (p: number = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(p), limit: '50' });
      if (actionFilter) params.set('action', actionFilter);
      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (!res.ok) {
        toastError('Erreur lors du chargement des logs');
        return;
      }
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      toastError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, toastError]);

  useEffect(() => { fetchLogs(page); }, [page, actionFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const uniqueActions = [...new Set(logs.map((l) => l.action))];

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Journal d&apos;audit</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Historique des actions administrateurs — {total} entrée{total !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {uniqueActions.length > 0 && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={actionFilter}
                  onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les actions</option>
                  {Object.entries(ACTION_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={() => fetchLogs(page)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Shield className="w-12 h-12 mb-3 opacity-40" />
                <p className="font-medium text-gray-600">Aucun log trouvé</p>
              </div>
            ) : (
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Date', 'Administrateur', 'Action', 'Ressource', 'IP', 'Statut'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('fr-FR', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {log.adminName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate" title={log.resource}>
                        {log.resource}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                        {log.ip_address || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {log.success ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
              <span>{total} entrées au total</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>Page {page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AdminGuard>
  );
}
