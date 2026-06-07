'use client';

import { useState, useEffect } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/admin/Toast';
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  BarChart3,
  Download,
  RefreshCw,
  PieChart,
  Loader2,
} from 'lucide-react';

interface ReportData {
  success: boolean;
  period: string;
  summary: {
    totalRevenue: number;
    totalOrders?: number;
    totalPayments: number;
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    usersGrowth: number;
    coursesGrowth: number;
    enrollmentsGrowth: number;
    revenueGrowth: number;
  };
  categoryBreakdown: Array<{ categoryId: string; categoryName: string; count: number }>;
  courseCompletion: Array<{ title: string; completionRate: number; totalStudents: number }>;
  users: Array<{ id: string; email: string; created_at: string }>;
  courses: Array<{ id: string; title: string; price: number; created_at: string }>;
  enrollments: Array<{ id: string; enrolled_at: string }>;
  payments: Array<{ id: string; amount: number; created_at: string }>;
}

export default function ReportsAdminPage () {
  const { success, error: toastError } = useToast();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/admin/reports?range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'csv' | 'pdf') => {
    setExporting(format);
    try {
      const url = `/api/admin/reports/export?format=${format}&range=${dateRange}`;
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-waraba-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        success(`Rapport ${format.toUpperCase()} exporté avec succès`);
      } else {
        const errorData = await response.json();
        toastError(errorData.error || 'Erreur lors de l\'export');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toastError('Erreur lors de l\'export du rapport');
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </AdminGuard>
    );
  }

  if (!reportData) {
    return (
      <AdminGuard>
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-8 text-gray-500">
            Erreur lors du chargement des rapports
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Rapports & Statistiques</h1>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
              <option value="365">1 an</option>
            </select>
            <button
              onClick={() => exportReport('csv')}
              disabled={exporting === 'csv'}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {exporting === 'csv' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Export...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export CSV
                </>
              )}
            </button>
            <button
              onClick={() => exportReport('pdf')}
              disabled={exporting === 'pdf'}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {exporting === 'pdf' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Export...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export PDF
                </>
              )}
            </button>
            <button
              onClick={fetchReports}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.summary.totalRevenue.toLocaleString()} XOF
                </p>
                {reportData.summary.revenueGrowth !== 0 && (
                  <p className={`text-xs ${reportData.summary.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {reportData.summary.revenueGrowth > 0 ? '+' : ''}{reportData.summary.revenueGrowth.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.summary.totalUsers.toLocaleString()}
                </p>
                {reportData.summary.usersGrowth !== 0 && (
                  <p className={`text-xs ${reportData.summary.usersGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {reportData.summary.usersGrowth > 0 ? '+' : ''}{reportData.summary.usersGrowth.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.summary.totalCourses.toLocaleString()}
                </p>
                {reportData.summary.coursesGrowth !== 0 && (
                  <p className={`text-xs ${reportData.summary.coursesGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {reportData.summary.coursesGrowth > 0 ? '+' : ''}{reportData.summary.coursesGrowth.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inscriptions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.summary.totalEnrollments.toLocaleString()}
                </p>
                {reportData.summary.enrollmentsGrowth !== 0 && (
                  <p className={`text-xs ${reportData.summary.enrollmentsGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {reportData.summary.enrollmentsGrowth > 0 ? '+' : ''}{reportData.summary.enrollmentsGrowth.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Graphiques et tableaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Répartition par catégorie */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Cours par catégorie</h3>
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-3">
              {reportData.categoryBreakdown.length > 0 ? (
                reportData.categoryBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 truncate max-w-[150px]">{item.categoryName}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(item.count / Math.max(...reportData.categoryBreakdown.map(c => c.count), 1)) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {item.count}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Aucune donnée disponible</p>
              )}
            </div>
          </Card>

          {/* Paiements récents */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Paiements récents</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="space-y-3">
              {reportData.payments.length > 0 ? (
                reportData.payments.slice(0, 8).map((payment, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {payment.amount.toLocaleString()} XOF
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Aucun paiement récent</p>
              )}
            </div>
          </Card>
        </div>

        {/* Tableaux détaillés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Liste des cours */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Cours récents</h3>
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-sm">Cours</th>
                    <th className="text-left py-2 font-medium text-sm">Prix</th>
                    <th className="text-left py-2 font-medium text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.courses.length > 0 ? (
                    reportData.courses.slice(0, 8).map((course, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 text-sm truncate max-w-[150px]">{course.title}</td>
                        <td className="py-2 text-sm font-medium text-green-600">
                          {course.price.toLocaleString()} XOF
                        </td>
                        <td className="py-2 text-sm text-gray-500">
                          {new Date(course.created_at).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-sm text-gray-500">
                        Aucun cours récent
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Taux de complétion */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Taux de complétion</h3>
              <PieChart className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="space-y-3">
              {reportData.courseCompletion.length > 0 ? (
                reportData.courseCompletion.map((course, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 truncate flex-1 max-w-[150px]">{course.title}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-10 text-right">
                        {course.completionRate}%
                      </span>
                      <span className="text-xs text-gray-400 w-16 text-right">
                        {course.totalStudents} étud.
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Aucune donnée disponible</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}

