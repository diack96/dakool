'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AdminGuard from '@/components/admin/AdminGuard';

// chart.js (~400 KB) — chargé uniquement quand la page admin est affichée
const AdminCharts = dynamic(() => import('@/components/admin/AdminCharts'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-gray-400">Chargement des graphiques...</div>,
});
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  Plus,
  ArrowRight,
  BarChart3,
  Activity,
  Award,
  AlertCircle,
  Clock,
  type LucideIcon,
} from 'lucide-react';

// Composant pour animer les nombres (extrait hors du render pour éviter les recréations)
function AnimatedNumber ({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(value * easeOut));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{displayValue.toLocaleString()}</>;
}

// StatCard extrait hors du render
function StatCard ({
  title,
  value,
  subtitle,
  growth,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  growth?: number;
  icon: LucideIcon;
  color: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {growth !== undefined && (
          <div className={`flex items-center text-sm font-semibold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(growth).toFixed(1)}%
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">
        {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
      </h3>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      {href && (
        <div className="mt-3 flex items-center text-xs text-blue-600 font-medium">
          Voir détails <ArrowRight className="w-3 h-3 ml-1" />
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function AdminDashboardContent () {
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState({
    users: { total: 0, growth: 0, active: 0 },
    courses: { total: 0, growth: 0, published: 0 },
    enrollments: { total: 0, growth: 0, thisMonth: 0 },
    revenue: { total: 0, growth: 0, thisMonth: 0 },
    averageRating: 0,
    completionRate: 0,
  });
  const [chartData, setChartData] = useState<{
    enrollmentData?: { labels: string[]; data: number[] };
    revenueData?: { labels: string[]; data: number[] };
  }>({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [syncInfo, setSyncInfo] = useState<{ outOfSync: boolean; missing: number }>({ outOfSync: false, missing: 0 });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.name === 'InvalidNodeTypeError') {
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setFetchError(null);
      // cache: 'default' → le navigateur réutilise la réponse si max-age (60s)
      // n'est pas encore expiré, évitant les refetchs inutiles lors des
      // navigations rapides entre les pages admin.
      const response = await fetch('/api/admin/stats?period=30d', {
        cache: 'default',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.stats) {
        const usersTotal = data.stats.users?.total || 0;
        const usersNew = data.stats.users?.new || 0;
        const coursesTotal = data.stats.courses?.total || 0;
        const coursesPublished = data.stats.courses?.published || 0;
        const coursesNew = data.stats.courses?.new || 0;
        const enrollmentsTotal = data.stats.enrollments?.total || 0;

        const enrollmentsNew = data.stats.enrollments?.new || 0;
        const revenue = data.stats.payments?.revenue || 0;
        const revenueThisMonth = data.stats.payments?.revenueThisMonth || 0;
        const revenueGrowth = data.stats.payments?.revenueGrowth || 0;
        const averageRating = data.stats.averageRating || 0;

        const usersGrowth = usersTotal > 0 ? parseFloat(((usersNew / usersTotal) * 100).toFixed(2)) : 0;
        const coursesGrowth = coursesTotal > 0 ? parseFloat(((coursesNew / coursesTotal) * 100).toFixed(2)) : 0;
        const enrollmentsGrowth = enrollmentsTotal > 0 ? parseFloat(((enrollmentsNew / enrollmentsTotal) * 100).toFixed(2)) : 0;

        setStats({
          users: {
            total: usersTotal,
            growth: usersGrowth,
            active: usersTotal,
          },
          courses: {
            total: coursesTotal,
            growth: coursesGrowth,
            published: coursesPublished,
          },
          enrollments: {
            total: enrollmentsTotal,
            growth: enrollmentsGrowth,
            thisMonth: enrollmentsNew,
          },
          revenue: {
            total: revenue,
            growth: revenueGrowth,
            thisMonth: revenueThisMonth,
          },
          averageRating: averageRating,
          completionRate: parseFloat(data.stats.progress?.completionRate || '0'),
        });

        // Détecter le décalage profiles / auth.users
        setSyncInfo({
          outOfSync: data.stats.users?.profilesOutOfSync === true,
          missing: data.stats.users?.missingSyncCount || 0,
        });

        // Only use real chart data from API, no fallback to fake data
        if (data.stats.enrollments?.dailyData) {
          const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
          setChartData(prev => ({
            ...prev,
            enrollmentData: { labels: days, data: data.stats.enrollments.dailyData },
          }));
        }

        if (data.stats.payments?.monthlyData) {
          const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun'];
          setChartData(prev => ({
            ...prev,
            revenueData: { labels: months, data: data.stats.payments.monthlyData },
          }));
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setFetchError(errorMessage);

      setStats({
        users: { total: 0, growth: 0, active: 0 },
        courses: { total: 0, growth: 0, published: 0 },
        enrollments: { total: 0, growth: 0, thisMonth: 0 },
        revenue: { total: 0, growth: 0, thisMonth: 0 },
        averageRating: 0,
        completionRate: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/sync-profiles', { method: 'POST', credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        await fetchStats();
      }
    } catch {
      // non-bloquant
    } finally {
      setSyncing(false);
    }
  }, [fetchStats]);

  useEffect(() => {
    if (!authLoading) {
      const timeoutId = setTimeout(() => fetchStats(), 100);

      // Refresh toutes les 5 minutes — mais seulement si l'onglet est visible.
      // Quand l'utilisateur change d'onglet/fenêtre, on stoppe l'intervalle
      // pour éviter des requêtes inutiles. Il reprend (avec un refresh immédiat)
      // dès que l'onglet redevient actif.
      let interval: ReturnType<typeof setInterval> | null = null;

      const startInterval = () => {
        if (!interval) interval = setInterval(fetchStats, 300000);
      };
      const stopInterval = () => {
        if (interval) { clearInterval(interval); interval = null; }
      };

      const handleVisibilityChange = () => {
        if (document.hidden) {
          stopInterval();
        } else {
          // Onglet redevenu visible : refresh immédiat + reprise de l'intervalle
          fetchStats();
          startInterval();
        }
      };

      startInterval();
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearTimeout(timeoutId);
        stopInterval();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
    return undefined;
  }, [authLoading, fetchStats]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Bannière d'erreur */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <strong>Erreur :</strong> {fetchError}
        </div>
      )}

      {/* Bannière de désynchronisation profils */}
      {syncInfo.outOfSync && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="text-sm text-amber-800">
            <strong>{syncInfo.missing} utilisateur{syncInfo.missing > 1 ? 's' : ''}</strong> inscrit{syncInfo.missing > 1 ? 's' : ''} dans Supabase
            {' '}n&apos;{syncInfo.missing > 1 ? 'ont' : 'a'} pas encore de profil — les statistiques sont incomplètes.
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="shrink-0 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {syncing ? 'Synchronisation…' : 'Synchroniser maintenant'}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Administrateur
          </h1>
          <p className="text-gray-600">
            Bienvenue {user?.email || 'Admin'}, voici un aperçu de votre plateforme
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/courses/new"
            className="group inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold text-base shadow-xl hover:bg-gray-50 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <Plus className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
            Nouveau cours
          </Link>
          <Link
            href="/admin/reports"
            className="inline-flex items-center px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Rapports
          </Link>
        </div>
      </div>

      {/* Stats Grid - Actionnables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Utilisateurs authentifiés"
          value={stats.users.total.toLocaleString()}
          subtitle={`${stats.users.active} actifs`}
          growth={stats.users.growth}
          icon={Users}
          color="bg-blue-600"
          href="/admin/users"
        />
        <StatCard
          title="Inscriptions aux cours"
          value={stats.enrollments.total.toLocaleString()}
          subtitle={`${stats.enrollments.thisMonth} ce mois`}
          growth={stats.enrollments.growth}
          icon={GraduationCap}
          color="bg-green-600"
          href="/admin/enrollments"
        />
        <StatCard
          title="Cours publiés"
          value={stats.courses.total}
          subtitle={`${stats.courses.published} publiés`}
          growth={stats.courses.growth}
          icon={BookOpen}
          color="bg-orange-600"
          href="/admin/courses"
        />
        <StatCard
          title="Revenus totaux"
          value={`${stats.revenue.total.toLocaleString()} FCFA`}
          subtitle={`${stats.revenue.thisMonth.toLocaleString()} FCFA ce mois`}
          growth={stats.revenue.growth}
          icon={DollarSign}
          color="bg-purple-600"
          href="/admin/reports"
        />
      </div>

      {/* Section "À faire" - Tâches urgentes */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            À faire
          </h2>
          <Link
            href="/admin/courses?status=draft"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Voir tout
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/courses?status=draft"
            className="p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 group-hover:text-orange-700">
                  Cours en brouillon
                </p>
                <p className="text-sm text-gray-600">
                  {stats.courses.total - stats.courses.published} à publier
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-600" />
            </div>
          </Link>

          <Link
            href="/admin/users?filter=new"
            className="p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 group-hover:text-blue-700">
                  Nouveaux utilisateurs
                </p>
                <p className="text-sm text-gray-600">
                  {stats.users.growth > 0 ? Math.round(stats.users.total * stats.users.growth / 100) : 0} ce mois
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
            </div>
          </Link>

          <Link
            href="/admin/enrollments?status=pending"
            className="p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 group-hover:text-green-700">
                  Inscriptions récentes
                </p>
                <p className="text-sm text-gray-600">
                  {stats.enrollments.thisMonth} ce mois
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
            </div>
          </Link>
        </div>
      </div>

      {/* Graphiques Chart.js */}
      <AdminCharts
        stats={stats}
        enrollmentData={chartData.enrollmentData}
        revenueData={chartData.revenueData}
      />

      {/* Métriques de performance */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Performance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Note moyenne */}
          <div className="bg-yellow-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-500 shrink-0" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">Note moyenne</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">{stats.averageRating.toFixed(1)}<span className="text-sm font-normal text-gray-400">/5</span></p>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 shrink-0 ${i < Math.floor(stats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>

          {/* Taux de complétion */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">Taux de complétion</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">{stats.completionRate.toFixed(1)}<span className="text-sm font-normal text-gray-400">%</span></p>
            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Nouvelles inscriptions */}
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-500 shrink-0" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">Nouvelles inscriptions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-2">{stats.enrollments.thisMonth}</p>
            <p className="text-xs text-gray-500">Ce mois-ci</p>
          </div>

        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/courses"
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Gestion des Cours</h3>
          <p className="text-sm text-gray-600 mb-4">
            Créez, modifiez et gérez vos cours en ligne
          </p>
          <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
            Gérer les cours →
          </span>
        </Link>

        <Link
          href="/admin/users"
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Gestion des Utilisateurs</h3>
          <p className="text-sm text-gray-600 mb-4">
            Gérez les comptes utilisateurs et leurs permissions
          </p>
          <span className="text-sm font-semibold text-green-600 group-hover:text-green-700">
            Gérer les utilisateurs →
          </span>
        </Link>

        <Link
          href="/admin/reports"
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Rapports & Analytics</h3>
          <p className="text-sm text-gray-600 mb-4">
            Consultez les statistiques et rapports détaillés
          </p>
          <span className="text-sm font-semibold text-purple-600 group-hover:text-purple-700">
            Voir les rapports →
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminDashboard () {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
