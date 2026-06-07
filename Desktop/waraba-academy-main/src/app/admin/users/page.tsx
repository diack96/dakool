'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card } from '@/components/ui/Card';
import {
  Users,
  Shield,
  UserCheck,
  Search,
  RefreshCw,
  Plus,
  Calendar,
  X,
  Loader2,
  Edit,
  Trash2,
} from 'lucide-react';
import ConfirmModal from '@/components/admin/ConfirmModal';
import StatusBadge from '@/components/admin/StatusBadge';
import Pagination from '@/components/admin/Pagination';
import EmptyState from '@/components/admin/EmptyState';
import { formatDate, formatDateShort, formatFullName, formatInitials } from '@/lib/utils';
import { useToast } from '@/components/admin/Toast';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  totalCourses?: number;
  totalStudents?: number;
}

export default function UsersAdminPage () {
  const { success, error: toastError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student' as 'admin' | 'instructor' | 'student',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [pageSize, setPageSize] = useState(20);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    instructors: 0,
    students: 0,
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', role: 'student' as string });
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pageSize, searchTerm, filter]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Réinitialiser la page à 1 quand la recherche ou le filtre change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchTerm, filter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: createForm.email,
          password: createForm.password,
          first_name: createForm.firstName,
          last_name: createForm.lastName,
          role: createForm.role,
        }),
      });

      if (response.ok) {
        success('Utilisateur créé avec succès');
        setShowCreateModal(false);
        setCreateForm({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'student',
        });
        // Rafraîchir la liste
        fetchUsers();
        fetchStats();
      } else {
        const errorData = await response.json();
        toastError(errorData.error || 'Erreur lors de la création de l\'utilisateur');
      }
    } catch (err) {
      toastError('Erreur lors de la création de l\'utilisateur');
    } finally {
      setCreating(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({ firstName: user.firstName, lastName: user.lastName, role: user.role });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: editingUser.id,
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          role: editForm.role,
        }),
      });
      if (response.ok) {
        success('Utilisateur modifié avec succès');
        setEditingUser(null);
        fetchUsers();
        fetchStats();
      } else {
        const data = await response.json();
        toastError(data.error || 'Erreur lors de la modification');
      }
    } catch {
      toastError('Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModal.user) return;
    try {
      const response = await fetch(`/api/admin/users?id=${deleteModal.user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        success('Utilisateur supprimé avec succès');
        setDeleteModal({ isOpen: false, user: null });
        fetchUsers();
        fetchStats();
      } else {
        const data = await response.json();
        toastError(data.error || 'Erreur lors de la suppression');
      }
    } catch {
      toastError('Erreur lors de la suppression');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/users/stats');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      // Erreur silencieuse pour les stats
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Construire les paramètres de requête
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pageSize.toString(),
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (filter !== 'all') {
        if (['admin', 'instructor', 'student'].includes(filter)) {
          params.append('role', filter);
        }
      }

      // Récupérer les utilisateurs avec pagination
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important pour les cookies de session
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          setError('Erreur d\'authentification. Veuillez vous reconnecter en tant qu\'administrateur.');
        } else if (response.status === 500) {
          setError('Erreur serveur. Vérifiez les logs du serveur.');
        } else {
          setError(`Erreur ${response.status}: ${errorData.error || response.statusText}`);
        }
        setUsers([]);
        setLoading(false);
        return;
      }

      const data = await response.json();

      // L'API retourne { success: true, users: [...], pagination: {...} }
      if (data.success && data.users && Array.isArray(data.users)) {
        // Transformer les données pour correspondre à l'interface
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedUsers = data.users.map((user: any) => {
          // Note: last_sign_in_at n'existe pas dans profiles
          // On considère tous les utilisateurs comme actifs pour l'instant
          // On pourrait récupérer cette info depuis auth.users si nécessaire
          const isActive = true; // Tous les utilisateurs sont considérés comme actifs

          // Normaliser le rôle (s'assurer qu'il est en minuscules)
          const normalizedRole = (user.role || 'student').toLowerCase();

          return {
            id: user.id,
            firstName: user.first_name || user.email?.split('@')[0] || 'User',
            lastName: user.last_name || '',
            email: user.email || '',
            role: normalizedRole,
            isActive: isActive,
            emailVerified: true, // Tous les utilisateurs ont un email vérifié (créés via Supabase Auth)
            createdAt: user.created_at || new Date().toISOString(),
            lastLoginAt: undefined, // last_sign_in_at n'existe pas dans profiles
            totalCourses: user.total_courses || 0,
            totalStudents: user.total_students || 0,
          };
        });
        setUsers(transformedUsers);
        
        // Mettre à jour la pagination
        if (data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: data.pagination.total || 0,
            pages: data.pagination.pages || 0,
          }));
        }
        
        setError(null); // Effacer les erreurs précédentes
      } else {
        // Format de réponse inattendu, essayer de récupérer les utilisateurs
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data.users && Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          setUsers([]);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`Erreur réseau: ${msg}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users;

  const computedStats = useMemo(() => ({
    total: stats.total > 0 ? stats.total : users.length,
    active: stats.active > 0 ? stats.active : users.filter(u => u.isActive).length,
    admins: stats.admins > 0 ? stats.admins : users.filter(u => u.role === 'admin').length,
    instructors: stats.instructors > 0 ? stats.instructors : users.filter(u => u.role === 'instructor').length,
    students: stats.students > 0 ? stats.students : users.filter(u => u.role === 'student').length,
  }), [stats, users]);

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Utilisateurs</h1>
            <p className="text-gray-600">
              {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
              {users.length > 0 && users.length !== filteredUsers.length && ` sur ${users.length}`}
              {users.length === 0 && loading === false && ' (chargement depuis Supabase...)'}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un utilisateur
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Total utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{computedStats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{computedStats.active}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Administrateurs</p>
                <p className="text-2xl font-bold text-gray-900">{computedStats.admins}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Instructeurs</p>
                <p className="text-2xl font-bold text-gray-900">{computedStats.instructors}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">Étudiants</p>
                <p className="text-2xl font-bold text-gray-900">{computedStats.students}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              >
                <option value="all">Tous les rôles</option>
                <option value="admin">Administrateurs</option>
                <option value="instructor">Instructeurs</option>
                <option value="student">Étudiants</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
              <button
                onClick={() => fetchUsers()}
                className="px-4 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Card>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="font-semibold text-red-800 mb-2">Erreur</p>
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Liste des utilisateurs */}
        <Card className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 font-bold text-gray-900">Utilisateur</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-900">Rôle</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-900">Statut</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-900">Date d'inscription</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-900">Email vérifié</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-900"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const fullName = formatFullName(user.firstName, user.lastName, user.email);
                  const initials = formatInitials(user.firstName, user.lastName);

                  return (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          {/* Avatar avec initiales */}
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{fullName}</p>
                            <p className="text-sm text-gray-600 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={user.role} />
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(user.createdAt)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDateShort(user.createdAt)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={user.emailVerified ? 'verified' : 'unverified'} />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            aria-label={`Modifier ${fullName}`}
                          >
                            <Edit className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, user })}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label={`Supprimer ${fullName}`}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && !loading && (
              <EmptyState
                icon={<Users className="w-8 h-8 text-gray-400" />}
                title="Aucun utilisateur trouvé"
                description="Aucun utilisateur ne correspond à vos critères de recherche."
                action={{ label: 'Ajouter un utilisateur', onClick: () => setShowCreateModal(true) }}
              />
            )}
          </div>
        </Card>

        {/* Pagination */}
        <Pagination
          page={pagination.page}
          totalPages={pagination.pages}
          total={pagination.total}
          onPageChange={(p) => setPagination(prev => ({ ...prev, page: p }))}
          label="utilisateurs"
          pageSize={pageSize}
          onPageSizeChange={(s) => { setPageSize(s); setPagination(prev => ({ ...prev, page: 1 })); }}
        />

        {/* Modal d'édition d'utilisateur */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Modifier l&apos;utilisateur</h2>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="student">Étudiant</option>
                    <option value="instructor">Instructeur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center"
                  >
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sauvegarde...</> : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={deleteModal.isOpen}
          title="Supprimer l'utilisateur"
          message={`Êtes-vous sûr de vouloir supprimer ${deleteModal.user?.firstName || ''} ${deleteModal.user?.lastName || ''} (${deleteModal.user?.email || ''}) ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteModal({ isOpen: false, user: null })}
        />

        {/* Modal de création d'utilisateur */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Créer un utilisateur</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="exemple@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={createForm.password}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Minimum 8 caractères"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.firstName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.lastName}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle *
                  </label>
                  <select
                    required
                    value={createForm.role}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value as 'admin' | 'instructor' | 'student' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="student">Étudiant</option>
                    <option value="instructor">Instructeur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      'Créer'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}

