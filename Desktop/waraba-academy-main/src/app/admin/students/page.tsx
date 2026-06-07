'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/admin/Toast';
import {
  Users,
  BookOpen,
  GraduationCap,
  Award,
  TrendingUp,
  RefreshCw,
  Download,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  ChevronUp,
  ChevronDown,
  Filter,
} from 'lucide-react';
import type { TrackingRow, TrackingStats, EnrollmentStatus, ExtendedStatusFilter } from '@/app/api/admin/student-tracking/route';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseOption {
  id: string;
  title: string;
}

type SortKey = 'studentName' | 'courseTitle' | 'enrolledAt' | 'progress' | 'status';
type SortDir = 'asc' | 'desc';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  EnrollmentStatus,
  { label: string; bg: string; icon: React.ReactNode }
> = {
  completed: {
    label: 'Terminé',
    bg: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="w-3 h-3" aria-hidden="true" />,
  },
  in_progress: {
    label: 'En cours',
    bg: 'bg-blue-100 text-blue-800',
    icon: <Clock className="w-3 h-3" aria-hidden="true" />,
  },
  not_started: {
    label: 'Non commencé',
    bg: 'bg-gray-100 text-gray-600',
    icon: <XCircle className="w-3 h-3" aria-hidden="true" />,
  },
};

function StatusBadge({ status }: { status: EnrollmentStatus }) {
  const { label, bg, icon } = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${bg}`}
      role="status"
    >
      {icon}
      {label}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color =
    value >= 100
      ? 'bg-green-500'
      : value >= 50
      ? 'bg-blue-500'
      : value > 0
      ? 'bg-yellow-500'
      : 'bg-gray-300';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700 w-10 text-right">
        {value}%
      </span>
    </div>
  );
}

function SortIcon({ col, sortKey, dir }: { col: SortKey; sortKey: SortKey; dir: SortDir }) {
  if (col !== sortKey) return null;
  return dir === 'asc' ? (
    <ChevronUp className="w-3 h-3 ml-1 inline" />
  ) : (
    <ChevronDown className="w-3 h-3 ml-1 inline" />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentTrackingPage() {
  const { error: toastError, success: toastSuccess } = useToast();

  // Data state
  const [rows, setRows] = useState<TrackingRow[]>([]);
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filter state
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<ExtendedStatusFilter>('all');
  const [certFilter, setCertFilter] = useState<'all' | 'yes' | 'no'>('all');

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>('enrolledAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // ── Fetch helpers ──

  useEffect(() => {
    fetchTracking(courseFilter);
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/courses?limit=200&status=published');
      if (res.ok) {
        const data = await res.json();
        const list = (data.courses || data || []).map(
          (c: { id: string; title: string }) => ({ id: c.id, title: c.title })
        );
        setCourses(list);
      }
    } catch {
      // silent – course filter just won't be populated
    }
  }, []);

  const fetchTracking = useCallback(
    async (courseId: string = courseFilter) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (courseId !== 'all') params.set('courseId', courseId);
        if (statusFilter !== 'all') params.set('status', statusFilter);
        const res = await fetch(`/api/admin/student-tracking?${params.toString()}`);
        if (!res.ok) {
          toastError('Erreur lors du chargement du suivi');
          return;
        }
        const data = await res.json();
        setRows(data.data || []);
        setStats(data.stats || null);
      } catch {
        toastError('Erreur réseau lors du chargement');
      } finally {
        setLoading(false);
      }
    },
    [courseFilter, toastError]
  );

  useEffect(() => {
    fetchCourses();
    fetchTracking('all');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchTracking(courseFilter);
  }, [courseFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Client-side filter + sort ──

  const filtered = useMemo(() => {
    let data = rows;

    if (statusFilter !== 'all' && statusFilter !== 'inactive') {
      data = data.filter((r) => r.status === statusFilter);
    }

    if (certFilter !== 'all') {
      data = data.filter((r) =>
        certFilter === 'yes' ? r.certificateGenerated : !r.certificateGenerated
      );
    }

    if (search) {
      const term = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.studentName.toLowerCase().includes(term) ||
          r.email.toLowerCase().includes(term) ||
          r.courseTitle.toLowerCase().includes(term)
      );
    }

    // Sort
    const multiplier = sortDir === 'asc' ? 1 : -1;
    data = [...data].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === 'number' && typeof vb === 'number') {
        return (va - vb) * multiplier;
      }
      return String(va).localeCompare(String(vb), 'fr') * multiplier;
    });

    return data;
  }, [rows, statusFilter, certFilter, search, sortKey, sortDir]);

  const handleSort = (col: SortKey) => {
    if (sortKey === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col);
      setSortDir('asc');
    }
  };

  // ── CSV Export ──

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams({ format: 'csv' });
      if (courseFilter !== 'all') params.set('courseId', courseFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/student-tracking?${params.toString()}`);
      if (!res.ok) {
        toastError("Erreur lors de l'export CSV");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suivi-etudiants-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toastSuccess('Export CSV téléchargé');
    } catch {
      toastError("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  };

  // ─── Stats cards ───────────────────────────────────────────────────────────

  const STAT_CARDS = [
    {
      label: 'Total inscriptions',
      value: stats?.totalEnrollments ?? 0,
      icon: <Users className="w-6 h-6 text-blue-600" />,
      bg: 'bg-blue-100',
    },
    {
      label: 'Non commencés',
      value: stats?.notStarted ?? 0,
      icon: <XCircle className="w-6 h-6 text-gray-500" />,
      bg: 'bg-gray-100',
    },
    {
      label: 'En cours',
      value: stats?.inProgress ?? 0,
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      bg: 'bg-blue-50',
    },
    {
      label: 'Terminés',
      value: stats?.completed ?? 0,
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      bg: 'bg-green-100',
    },
    {
      label: 'Certificats délivrés',
      value: stats?.certificatesIssued ?? 0,
      icon: <Award className="w-6 h-6 text-yellow-600" />,
      bg: 'bg-yellow-100',
    },
    {
      label: 'Avancement moyen',
      value: `${stats?.avgProgress ?? 0}%`,
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      bg: 'bg-purple-100',
    },
  ];

  // ── Table header columns ──

  const COLUMNS: { key: SortKey; label: string; sortable?: boolean }[] = [
    { key: 'studentName', label: 'Étudiant', sortable: true },
    { key: 'courseTitle', label: 'Cours', sortable: true },
    { key: 'enrolledAt', label: 'Inscription', sortable: true },
    { key: 'progress', label: '% Avancement', sortable: true },
    { key: 'status', label: 'Statut', sortable: true },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suivi des étudiants</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Avancement, statuts et certificats par cours
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTracking(courseFilter)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Export...' : 'Exporter CSV'}
            </button>
          </div>
        </div>

        {/* ── Stats cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {STAT_CARDS.map((card) => (
            <Card key={card.label} className="p-4">
              <div className="flex flex-col items-start gap-2">
                <div className={`p-2 ${card.bg} rounded-lg`}>{card.icon}</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium leading-tight">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Filters ── */}
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher étudiant, email, cours…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Course filter */}
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="all">Tous les cours</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ExtendedStatusFilter)}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="not_started">Non commencé</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="inactive">Inactifs 30j</option>
                </select>
              </div>

              {/* Certificate filter */}
              <div className="relative">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={certFilter}
                  onChange={(e) => setCertFilter(e.target.value as 'all' | 'yes' | 'no')}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="all">Tous (certificat)</option>
                  <option value="yes">Certificat obtenu</option>
                  <option value="no">Sans certificat</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active filter summary */}
          {filtered.length !== rows.length && (
            <p className="mt-2 text-xs text-gray-500">
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''} sur {rows.length} inscriptions
            </p>
          )}
        </Card>

        {/* ── Table ── */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
                <p>Chargement des données…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <GraduationCap className="w-12 h-12 mb-3 opacity-40" />
                <p className="font-medium text-gray-600">Aucune inscription trouvée</p>
                <p className="text-sm mt-1">
                  {search || statusFilter !== 'all' || certFilter !== 'all'
                    ? 'Essayez de modifier vos filtres.'
                    : 'Aucun étudiant inscrit pour le moment.'}
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[860px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                          col.sortable ? 'cursor-pointer select-none hover:text-gray-900' : ''
                        }`}
                        onClick={() => col.sortable && handleSort(col.key)}
                      >
                        {col.label}
                        {col.sortable && (
                          <SortIcon col={col.key} sortKey={sortKey} dir={sortDir} />
                        )}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Certificat
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date d&apos;obtention
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((row) => (
                    <tr
                      key={row.enrollmentId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Student */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{row.studentName}</p>
                          <p className="text-xs text-gray-500">{row.email}</p>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg max-w-[200px] truncate"
                          title={row.courseTitle}
                        >
                          <BookOpen className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                          <span className="truncate">{row.courseTitle}</span>
                        </span>
                      </td>

                      {/* Enrolled at */}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(row.enrolledAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Progress */}
                      <td className="px-4 py-3 min-w-[140px]">
                        <ProgressBar value={row.progress} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>

                      {/* Certificate generated */}
                      <td className="px-4 py-3">
                        {row.certificateGenerated ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                            <Award className="w-3 h-3" />
                            Oui
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">
                            <XCircle className="w-3 h-3" />
                            Non
                          </span>
                        )}
                      </td>

                      {/* Certificate date */}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row.certificateDate ? (
                          <div>
                            <p>
                              {new Date(row.certificateDate).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                            {row.certificateNumber && (
                              <p className="text-xs text-gray-400">#{row.certificateNumber}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Table footer */}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
              <span>
                {filtered.length} inscription{filtered.length !== 1 ? 's' : ''} affichée
                {filtered.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 font-medium transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Télécharger CSV
              </button>
            </div>
          )}
        </Card>
      </div>
    </AdminGuard>
  );
}
