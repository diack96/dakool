'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Bell, Plus, Edit, Trash2, Send, Eye, EyeOff, Users, X, Search } from 'lucide-react';
import AdminGuard from '@/components/admin/AdminGuard';
import { useToast } from '@/components/admin/Toast';
import ConfirmModal from '@/components/admin/ConfirmModal';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'email' | 'push' | 'in_app';
  isRead: boolean;
  userId?: string;
  createdAt: string;
  user?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: 'email' | 'push' | 'in_app';
  isActive: boolean;
  category: 'course' | 'payment' | 'system' | 'marketing';
}

function TemplateFormModal ({
  editingTemplate,
  onClose,
  onSuccess,
}: {
  editingTemplate: NotificationTemplate | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { success, error } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: editingTemplate?.name || '',
    title: editingTemplate?.title || '',
    message: editingTemplate?.message || '',
    type: editingTemplate?.type || 'email' as 'email' | 'push' | 'in_app',
    category: editingTemplate?.category || 'course' as 'course' | 'payment' | 'system' | 'marketing',
    isActive: editingTemplate?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.title.trim() || !form.message.trim()) {
      error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSaving(true);
    try {
      const url = editingTemplate
        ? `/api/admin/notification-templates?id=${editingTemplate.id}`
        : '/api/admin/notification-templates';

      const response = await fetch(url, {
        method: editingTemplate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        success(editingTemplate ? 'Template modifié avec succès' : 'Template créé avec succès');
        onSuccess();
      } else {
        const data = await response.json().catch(() => ({}));
        error(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch {
      error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {editingTemplate ? 'Modifier le Template' : 'Nouveau Template'}
        </h3>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du Template
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ex: Rappel de cours"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ex: Nouveau cours disponible"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contenu du message..."
              value={form.message}
              onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.type}
                onChange={(e) => setForm(f => ({ ...f, type: e.target.value as 'email' | 'push' | 'in_app' }))}
              >
                <option value="email">Email</option>
                <option value="push">Push</option>
                <option value="in_app">In-App</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value as 'course' | 'payment' | 'system' | 'marketing' }))}
              >
                <option value="course">Cours</option>
                <option value="payment">Paiement</option>
                <option value="system">Système</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Template actif
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
              {saving ? 'Enregistrement...' : editingTemplate ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NotificationsPage () {
  const { success, error } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; templateId: string | null }>({
    isOpen: false,
    templateId: null,
  });
  const [userSelectModal, setUserSelectModal] = useState<{ isOpen: boolean; templateId: string | null }>({
    isOpen: false,
    templateId: null,
  });
  const [sendConfirmModal, setSendConfirmModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<{ id: string; email: string; first_name: string; last_name: string; role: string }[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchTemplates();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/notification-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des templates:', error);
    }
  };

  const fetchAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/admin/users?limit=100', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.users) {
          setAvailableUsers(data.users);
        }
      }
    } catch {
      // silent
    } finally {
      setLoadingUsers(false);
    }
  };

  const openUserSelectModal = (templateId: string) => {
    setUserSelectModal({ isOpen: true, templateId });
    setSelectedUsers([]);
    setUserSearch('');
    if (availableUsers.length === 0) {
      fetchAvailableUsers();
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const selectByRole = (role: string) => {
    const roleUserIds = availableUsers.filter(u => u.role === role).map(u => u.id);
    setSelectedUsers(prev => {
      const alreadyAll = roleUserIds.every(id => prev.includes(id));
      if (alreadyAll) {
        return prev.filter(id => !roleUserIds.includes(id));
      }
      return [...new Set([...prev, ...roleUserIds])];
    });
  };

  const handleSendNotification = async () => {
    if (!userSelectModal.templateId) return;
    if (selectedUsers.length === 0) {
      error('Veuillez sélectionner au moins un utilisateur');
      return;
    }

    // Double confirmation pour envoi à plus de 5 utilisateurs
    if (selectedUsers.length > 5 && !sendConfirmModal) {
      setSendConfirmModal(true);
      return;
    }
    setSendConfirmModal(false);

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: userSelectModal.templateId,
          userIds: selectedUsers,
        }),
      });

      if (response.ok) {
        success('Notifications envoyées avec succès !');
        setSelectedUsers([]);
        setUserSelectModal({ isOpen: false, templateId: null });
        fetchNotifications();
      } else {
        error('Erreur lors de l\'envoi des notifications');
      }
    } catch {
      error('Erreur lors de l\'envoi des notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    setDeleteModal({ isOpen: true, templateId });
  };

  const confirmDelete = async () => {
    if (!deleteModal.templateId) return;

    try {
      const response = await fetch(`/api/admin/notification-templates?id=${deleteModal.templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== deleteModal.templateId));
        success('Template supprimé avec succès');
      } else {
        error('Erreur lors de la suppression');
      }
    } catch (err) {
      error('Erreur lors de la suppression');
    } finally {
      setDeleteModal({ isOpen: false, templateId: null });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case 'email': return '📧';
    case 'push': return '📱';
    case 'in_app': return '🔔';
    default: return '📢';
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      email: 'bg-blue-100 text-blue-800',
      push: 'bg-green-100 text-green-800',
      in_app: 'bg-purple-100 text-purple-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      course: 'bg-indigo-100 text-indigo-800',
      payment: 'bg-green-100 text-green-800',
      system: 'bg-red-100 text-red-800',
      marketing: 'bg-yellow-100 text-yellow-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Notifications</h1>
            <p className="text-gray-600 mt-2">
              Gérez les notifications système et les templates de communication
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Template
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Lues</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {notifications.filter(n => n.isRead).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <EyeOff className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Non lues</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {notifications.filter(n => !n.isRead).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Send className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Templates</p>
                  <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates de notifications */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Templates de Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Template</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Catégorie</th>
                    <th className="text-left py-3 px-4">Statut</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr key={template.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-gray-600">{template.title}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getTypeBadge(template.type)}>
                          {getTypeIcon(template.type)} {template.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getCategoryBadge(template.category)}>
                          {template.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {template.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingTemplate(template)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUserSelectModal(template.id)}
                            disabled={isLoading}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Notifications récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg ${
                    notification.isRead ? 'bg-gray-50' : 'bg-white border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getTypeBadge(notification.type)}>
                          {getTypeIcon(notification.type)} {notification.type}
                        </Badge>
                        {!notification.isRead && (
                          <Badge className="bg-blue-100 text-blue-800">Nouveau</Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>
                          {notification.user ?
                            `${notification.user.firstName || ''} ${notification.user.lastName || ''} (${notification.user.email})` :
                            'Système'
                          }
                        </span>
                        <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modal de création/édition de template */}
        {(showCreateForm || editingTemplate) && (
          <TemplateFormModal
            editingTemplate={editingTemplate}
            onClose={() => {
              setShowCreateForm(false);
              setEditingTemplate(null);
            }}
            onSuccess={() => {
              setShowCreateForm(false);
              setEditingTemplate(null);
              fetchTemplates();
            }}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Supprimer le template"
        message="Êtes-vous sûr de vouloir supprimer ce template ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, templateId: null })}
      />

      <ConfirmModal
        isOpen={sendConfirmModal}
        title="Confirmer l'envoi en masse"
        message={`Vous êtes sur le point d'envoyer une notification à ${selectedUsers.length} utilisateurs. Cette action est irréversible. Confirmer ?`}
        confirmText={`Envoyer à ${selectedUsers.length} personnes`}
        cancelText="Annuler"
        variant="danger"
        onConfirm={handleSendNotification}
        onCancel={() => setSendConfirmModal(false)}
      />

      {/* Modal de sélection d'utilisateurs */}
      {userSelectModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Sélectionner les destinataires
              </h3>
              <button onClick={() => setUserSelectModal({ isOpen: false, templateId: null })} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sélection par rôle */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => selectByRole('student')}
                className="px-3 py-1.5 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
              >
                Tous les étudiants
              </button>
              <button
                type="button"
                onClick={() => selectByRole('instructor')}
                className="px-3 py-1.5 text-sm border border-green-300 text-green-700 rounded-lg hover:bg-green-50"
              >
                Tous les instructeurs
              </button>
              <button
                type="button"
                onClick={() => selectByRole('admin')}
                className="px-3 py-1.5 text-sm border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50"
              >
                Tous les admins
              </button>
            </div>

            {/* Recherche */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Liste des utilisateurs */}
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg max-h-[400px]">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8 text-gray-500">Chargement...</div>
              ) : (
                availableUsers
                  .filter(u => {
                    if (!userSearch) return true;
                    const term = userSearch.toLowerCase();
                    return (u.first_name || '').toLowerCase().includes(term) ||
                           (u.last_name || '').toLowerCase().includes(term) ||
                           (u.email || '').toLowerCase().includes(term);
                  })
                  .map(u => (
                    <label key={u.id} className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.id)}
                        onChange={() => toggleUserSelection(u.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {u.first_name || ''} {u.last_name || ''} {!u.first_name && !u.last_name ? u.email : ''}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{u.email} - {u.role}</p>
                      </div>
                    </label>
                  ))
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">{selectedUsers.length} utilisateur(s) sélectionné(s)</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setUserSelectModal({ isOpen: false, templateId: null })}>
                  Annuler
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSendNotification}
                  disabled={selectedUsers.length === 0 || isLoading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? 'Envoi...' : `Envoyer (${selectedUsers.length})`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminGuard>
  );
}
