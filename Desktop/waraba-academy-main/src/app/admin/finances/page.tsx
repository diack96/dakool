'use client';

import { useState, useEffect } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/admin/Toast';
import StatusBadge from '@/components/admin/StatusBadge';
import Pagination from '@/components/admin/Pagination';
import TableSkeleton from '@/components/admin/TableSkeleton';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  RefreshCw,
  Download,
  Calendar,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

interface Payment {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_id: string;
  created_at: string;
  paid_at: string | null;
  user?: { email: string; first_name: string; last_name: string };
  course?: { title: string };
}

interface FinanceStats {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  todayRevenue: number;
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  refundedAmount: number;
  averageOrderValue: number;
  revenueGrowth: number;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  count: number;
}

const CURRENCY = 'XOF';

export default function FinancesPage() {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [dateRange, setDateRange] = useState('30');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const txPerPage = 20;

  useEffect(() => {
    fetchFinanceData();
  }, [dateRange, statusFilter, txPage]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/finances?range=${dateRange}&status=${statusFilter}&page=${txPage}&limit=${txPerPage}`,
        { credentials: 'include' },
      );

      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setPayments(data.payments || []);
        setDailyRevenue(data.dailyRevenue || []);
        if (data.pagination) {
          setTxTotalPages(data.pagination.totalPages || 1);
        }
      } else {
        toastError('Erreur lors du chargement des données');
      }
    } catch {
      toastError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!payments.length) return;

    const headers = ['Date', 'Transaction', 'Client', 'Cours', 'Montant', 'Statut', 'Méthode'];
    const rows = payments.map(p => [
      new Date(p.created_at).toLocaleDateString('fr-FR'),
      p.transaction_id || p.id.slice(0, 8),
      p.user ? `${p.user.first_name} ${p.user.last_name}` : '-',
      p.course?.title || '-',
      `${p.amount} ${p.currency}`,
      p.status,
      p.payment_method || '-',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finances-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success('Export CSV téléchargé');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ` ${CURRENCY}`;
  };

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finances & Revenus</h1>
            <p className="text-gray-600">Vue d&apos;ensemble de vos revenus et transactions</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              id="date-range"
              value={dateRange}
              onChange={(e) => { setDateRange(e.target.value); setTxPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="Période"
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
              <option value="365">Cette année</option>
            </select>

            <button
              onClick={exportCSV}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              aria-label="Exporter en CSV"
            >
              <Download className="w-4 h-4 mr-2" aria-hidden="true" />
              Export CSV
            </button>

            <button
              onClick={fetchFinanceData}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              aria-label="Actualiser les données"
            >
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Revenus Totaux */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </p>
                {stats?.revenueGrowth !== undefined && (
                  <div className={`flex items-center mt-2 text-sm ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.revenueGrowth >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(stats.revenueGrowth).toFixed(1)}% vs période précédente
                  </div>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Revenus du Mois */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ce mois</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats?.monthlyRevenue || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {stats?.todayRevenue ? `Aujourd'hui: ${formatCurrency(stats.todayRevenue)}` : 'Aucune vente aujourd\'hui'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Transactions */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.totalTransactions || 0}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="text-green-600">{stats?.completedTransactions || 0} complétées</span>
                  <span className="text-yellow-600">{stats?.pendingTransactions || 0} en attente</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          {/* Panier Moyen */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Panier Moyen</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats?.averageOrderValue || 0)}
                </p>
                {stats?.refundedAmount ? (
                  <p className="text-sm text-red-500 mt-2">
                    Remboursements: {formatCurrency(stats.refundedAmount)}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">Aucun remboursement</p>
                )}
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <ArrowUpRight className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Graphique des revenus quotidiens */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenus Quotidiens</h3>
          <div className="h-64">
            {dailyRevenue.length > 0 ? (
              <div className="flex items-end justify-between h-full gap-1">
                {dailyRevenue.slice(-14).map((day, index) => {
                  const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 1);
                  const height = (day.revenue / maxRevenue) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors cursor-pointer group relative"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${formatCurrency(day.revenue)} - ${day.count} ventes`}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                          {formatCurrency(day.revenue)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                        {new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Aucune donnée pour cette période
              </div>
            )}
          </div>
        </Card>

        {/* Liste des transactions */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Transactions Récentes</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setTxPage(1); }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="completed">Complétés</option>
                <option value="pending">En attente</option>
                <option value="failed">Échoués</option>
                <option value="refunded">Remboursés</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cours</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6}>
                      <TableSkeleton rows={5} columns={6} />
                    </td>
                  </tr>
                ) : payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {payment.transaction_id?.slice(0, 12) || payment.id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {payment.user ? (
                          <div>
                            <div className="font-medium">{payment.user.first_name} {payment.user.last_name}</div>
                            <div className="text-gray-500 text-xs">{payment.user.email}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate">
                        {payment.course?.title || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={payment.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      Aucune transaction pour cette période
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={txPage}
            totalPages={txTotalPages}
            total={payments.length}
            onPageChange={setTxPage}
            label="transactions"
          />
        </Card>
      </div>
    </AdminGuard>
  );
}
