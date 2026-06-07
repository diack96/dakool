'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card } from '@/components/ui/Card';
import StatusBadge from '@/components/admin/StatusBadge';
import Pagination from '@/components/admin/Pagination';
import EmptyState from '@/components/admin/EmptyState';
import { useToast } from '@/components/admin/Toast';
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Download,
  RefreshCw,
} from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  transaction_id: string;
  created_at: string;
  paid_at?: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  course: {
    title: string;
  } | null;
}

export default function EnrollmentsAdminPage () {
  const { error: toastError } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetchOrders();
  }, [page, filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ range: '365' });
      if (filter !== 'all') params.set('status', filter);

      const response = await fetch(`/api/admin/finances?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.payments) {
          setOrders(data.payments);
        }
      } else {
        toastError('Erreur lors du chargement des inscriptions');
      }
    } catch {
      toastError('Erreur réseau lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const paginated = orders.slice((page - 1) * limit, page * limit);
    if (!searchTerm) return paginated;
    const term = searchTerm.toLowerCase();
    return paginated.filter(order => {
      const userName = `${order.user?.first_name || ''} ${order.user?.last_name || ''}`.toLowerCase();
      const userEmail = (order.user?.email || '').toLowerCase();
      const courseTitle = (order.course?.title || '').toLowerCase();
      return userName.includes(term) || userEmail.includes(term) || courseTitle.includes(term);
    });
  }, [orders, page, searchTerm, limit]);

  const totalPages = Math.ceil(orders.length / limit);
  const total = orders.length;

  const totalRevenue = useMemo(() =>
    orders.filter(order => order.status === 'completed').reduce((sum, order) => sum + (order.amount || 0), 0),
  [orders]);

  const exportToCSV = () => {
    const headers = ['ID', 'Utilisateur', 'Cours', 'Montant', 'Statut', 'Méthode', 'Date'];
    const csvData = filteredOrders.map(order => [
      order.id,
      `${order.user?.first_name || ''} ${order.user?.last_name || ''}`,
      order.course?.title || '',
      `${order.amount} ${order.currency}`,
      order.status,
      order.payment_method || '',
      new Date(order.created_at).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    if (typeof window !== 'undefined') {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `commandes-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Inscriptions & Paiements</h1>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              aria-label="Exporter les données en CSV"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Exporter CSV
            </button>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Actualiser les données"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
                <p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()} XOF</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paiements réussis</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Échecs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'failed').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher par nom, email ou cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="completed">Payé</option>
                <option value="pending">En attente</option>
                <option value="failed">Échoué</option>
                <option value="refunded">Remboursé</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Liste des commandes */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold">Utilisateur</th>
                  <th className="text-left py-3 px-4 font-semibold">Cours</th>
                  <th className="text-left py-3 px-4 font-semibold">Montant</th>
                  <th className="text-left py-3 px-4 font-semibold">Statut</th>
                  <th className="text-left py-3 px-4 font-semibold">Méthode</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{order.user?.first_name || ''} {order.user?.last_name || ''}</p>
                        <p className="text-sm text-gray-600">{order.user?.email || ''}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{order.course?.title || '—'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{(order.amount || 0).toLocaleString()} {order.currency}</p>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize">{order.payment_method || '—'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && !loading && (
              <EmptyState
                icon={<DollarSign className="w-8 h-8 text-gray-400" />}
                title="Aucune commande trouvée"
                description="Aucune transaction ne correspond à vos critères."
              />
            )}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            label="commandes"
          />
        </Card>
      </div>
    </AdminGuard>
  );
}

