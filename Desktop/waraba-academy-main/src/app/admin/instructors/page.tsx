'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/admin/Toast';
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Users,
  BookOpen,
  RefreshCw,
  X,
  Loader2,
  Camera,
  User,
} from 'lucide-react';
import ConfirmModal from '@/components/admin/ConfirmModal';

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  avatarUrl: string;
  specialization: string;
  rating: number;
  totalStudents: number;
  totalCourses: number;
  isActive: boolean;
  createdAt: string;
}

function AvatarUpload({
  currentUrl,
  onUploaded,
  instructorId,
}: {
  currentUrl: string;
  onUploaded: (url: string) => void;
  instructorId?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La photo ne doit pas depasser 5 MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      alert('Format accepte: JPG, PNG, WebP, GIF');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'instructor-avatar');
      formData.append('courseId', instructorId || 'instructors');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onUploaded(data.url);
      } else {
        const err = await response.json();
        alert(err.error || 'Erreur lors du telechargement');
      }
    } catch {
      alert('Erreur reseau lors du telechargement');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
          {currentUrl ? (
            <Image
              src={currentUrl}
              alt="Avatar"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-gray-400" />
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        {uploading ? 'Chargement...' : currentUrl ? 'Changer la photo' : 'Ajouter une photo'}
      </button>
    </div>
  );
}

export default function InstructorsAdminPage () {
  const { success, error: toastError } = useToast();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    bio: '',
    specialization: '',
    avatarUrl: '',
  });
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', bio: '', specialization: '', avatarUrl: '' });
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; instructor: Instructor | null }>({ isOpen: false, instructor: null });

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await fetch('/api/admin/instructors');
      if (response.ok) {
        const data = await response.json();
        setInstructors(data);
      }
    } catch {
      toastError('Erreur lors du chargement des instructeurs');
    } finally {
      setLoading(false);
    }
  };

  const handleEditInstructor = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setEditForm({
      firstName: instructor.firstName,
      lastName: instructor.lastName,
      bio: instructor.bio,
      specialization: instructor.specialization,
      avatarUrl: instructor.avatarUrl,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstructor) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/instructors/${editingInstructor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          bio: editForm.bio,
          specialization: editForm.specialization,
          avatar_url: editForm.avatarUrl,
        }),
      });
      if (response.ok) {
        success('Instructeur modifie avec succes');
        setEditingInstructor(null);
        fetchInstructors();
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

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await fetch('/api/admin/instructors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: createForm.email,
          password: createForm.password,
          first_name: createForm.firstName,
          last_name: createForm.lastName,
          bio: createForm.bio,
          specialization: createForm.specialization,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // If avatar was uploaded, update it via PATCH
        if (createForm.avatarUrl && data.instructor?.id) {
          await fetch(`/api/admin/instructors/${data.instructor.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ avatar_url: createForm.avatarUrl }),
          });
        }
        success('Instructeur cree avec succes');
        setShowAddForm(false);
        setCreateForm({ email: '', password: '', firstName: '', lastName: '', bio: '', specialization: '', avatarUrl: '' });
        fetchInstructors();
      } else {
        const errorData = await response.json();
        toastError(errorData.error || 'Erreur lors de la creation');
      }
    } catch {
      toastError('Erreur lors de la creation');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteInstructor = async () => {
    if (!deleteModal.instructor) return;
    try {
      const response = await fetch(`/api/admin/instructors/${deleteModal.instructor.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        success('Instructeur supprime avec succes');
        setDeleteModal({ isOpen: false, instructor: null });
        fetchInstructors();
      } else {
        const data = await response.json();
        toastError(data.error || 'Erreur lors de la suppression');
      }
    } catch {
      toastError('Erreur lors de la suppression');
    }
  };

  const filteredInstructors = instructors.filter(instructor => {
    const matchesFilter = filter === 'all' ||
      (filter === 'active' && instructor.isActive) ||
      (filter === 'inactive' && !instructor.isActive);

    const matchesSearch =
      instructor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.specialization.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalInstructors = instructors.length;
  const activeInstructors = instructors.filter(i => i.isActive).length;
  const averageRating = instructors.length > 0
    ? (instructors.reduce((sum, i) => sum + i.rating, 0) / instructors.length).toFixed(1)
    : '0.0';

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

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestion des Instructeurs</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un instructeur
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total instructeurs</p>
                <p className="text-2xl font-bold text-gray-900">{totalInstructors}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">{activeInstructors}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                <p className="text-2xl font-bold text-gray-900">{averageRating}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cours crees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {instructors.reduce((sum, i) => sum + i.totalCourses, 0)}
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
                placeholder="Rechercher par nom, email ou specialisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
              <button
                onClick={fetchInstructors}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="Actualiser"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Liste des instructeurs */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold">Instructeur</th>
                  <th className="text-left py-3 px-4 font-semibold">Specialisation</th>
                  <th className="text-left py-3 px-4 font-semibold">Note</th>
                  <th className="text-left py-3 px-4 font-semibold">Cours</th>
                  <th className="text-left py-3 px-4 font-semibold">Etudiants</th>
                  <th className="text-left py-3 px-4 font-semibold">Statut</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstructors.map((instructor) => (
                  <tr key={instructor.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                          {instructor.avatarUrl ? (
                            <Image
                              src={instructor.avatarUrl}
                              alt={`${instructor.firstName} ${instructor.lastName}`}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{instructor.firstName} {instructor.lastName}</p>
                          <p className="text-sm text-gray-600">{instructor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {instructor.specialization || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{instructor.rating}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{instructor.totalCourses}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{instructor.totalStudents}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        instructor.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {instructor.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditInstructor(instructor)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          aria-label={`Modifier ${instructor.firstName} ${instructor.lastName}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, instructor })}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label={`Supprimer ${instructor.firstName} ${instructor.lastName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredInstructors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun instructeur trouve
              </div>
            )}
          </div>
        </Card>

        {/* Modal de creation */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Creer un instructeur</h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setCreateForm({ email: '', password: '', firstName: '', lastName: '', bio: '', specialization: '', avatarUrl: '' });
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form className="p-6 space-y-4" onSubmit={handleCreateInstructor}>
                <AvatarUpload
                  currentUrl={createForm.avatarUrl}
                  onUploaded={(url) => setCreateForm(prev => ({ ...prev, avatarUrl: url }))}
                />
                <input
                  type="text"
                  placeholder="Prenom *"
                  required
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Nom *"
                  required
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="Mot de passe * (min. 8 caracteres)"
                  required
                  minLength={8}
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Biographie"
                  rows={3}
                  value={createForm.bio}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Specialisation"
                  value={createForm.specialization}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, specialization: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setCreateForm({ email: '', password: '', firstName: '', lastName: '', bio: '', specialization: '', avatarUrl: '' });
                    }}
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
                        Creation...
                      </>
                    ) : (
                      'Creer'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal d'edition */}
        {editingInstructor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Modifier l&apos;instructeur</h2>
                <button onClick={() => setEditingInstructor(null)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <AvatarUpload
                  currentUrl={editForm.avatarUrl}
                  onUploaded={(url) => setEditForm(f => ({ ...f, avatarUrl: url }))}
                  instructorId={editingInstructor.id}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prenom</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
                  <textarea
                    rows={3}
                    value={editForm.bio}
                    onChange={(e) => setEditForm(f => ({ ...f, bio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialisation</label>
                  <input
                    type="text"
                    value={editForm.specialization}
                    onChange={(e) => setEditForm(f => ({ ...f, specialization: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingInstructor(null)}
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
          title="Supprimer l'instructeur"
          message={`Etes-vous sur de vouloir supprimer ${deleteModal.instructor?.firstName || ''} ${deleteModal.instructor?.lastName || ''} ? Cette action est irreversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          onConfirm={handleDeleteInstructor}
          onCancel={() => setDeleteModal({ isOpen: false, instructor: null })}
        />
      </div>
    </AdminGuard>
  );
}
