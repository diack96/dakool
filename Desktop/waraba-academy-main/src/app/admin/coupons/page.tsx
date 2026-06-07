'use client';

import { useState, useEffect } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/admin/Toast';
import {
  Ticket,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Percent,
  DollarSign,
  Users,
  Calendar,
  Loader2,
  X,
  Save,
  RefreshCw,
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_discount: number | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  starts_at: string;
  expires_at: string | null;
  applicable_courses: string[];
  created_at: string;
}

interface CouponStats {
  total: number;
  active: number;
  expired: number;
  totalUsages: number;
}

export default function CouponsPage() {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 10,
    min_purchase: 0,
    max_discount: '',
    usage_limit: '',
    is_active: true,
    expires_at: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, [search, statusFilter]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/admin/coupons?${params.toString()}`, {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
        setStats(data.stats);
      } else {
        toastError('Erreur lors du chargement');
      }
    } catch (err) {
      console.error('Erreur:', err);
      toastError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_purchase: coupon.min_purchase,
        max_discount: coupon.max_discount?.toString() || '',
        usage_limit: coupon.usage_limit?.toString() || '',
        is_active: coupon.is_active,
        expires_at: coupon.expires_at ? String(coupon.expires_at).split('T')[0] || '' : '',
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: generateCode(),
        description: '',
        discount_type: 'percentage',
        discount_value: 10,
        min_purchase: 0,
        max_discount: '',
        usage_limit: '',
        is_active: true,
        expires_at: '',
      });
    }
    setShowModal(true);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'WARABA';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const saveCoupon = async () => {
    if (!formData.code.trim()) {
      toastError('Le code est requis');
      return;
    }

    setSaving(true);
    try {
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : '/api/admin/coupons';

      const method = editingCoupon ? 'PATCH' : 'POST';

      const body = {
        code: formData.code.toUpperCase(),
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        min_purchase: formData.min_purchase,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        is_active: formData.is_active,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        success(editingCoupon ? 'Coupon mis à jour' : 'Coupon créé');
        setShowModal(false);
        fetchCoupons();
      } else {
        const data = await res.json();
        toastError(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      console.error('Erreur:', err);
      toastError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const deleteCoupon = async (coupon: Coupon) => {
    if (!confirm(`Supprimer le coupon "${coupon.code}" ?`)) return;

    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        success('Coupon supprimé');
        fetchCoupons();
      } else {
        toastError('Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('Erreur:', err);
      toastError('Erreur lors de la suppression');
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: !coupon.is_active }),
      });

      if (res.ok) {
        success(coupon.is_active ? 'Coupon désactivé' : 'Coupon activé');
        fetchCoupons();
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    success('Code copié !');
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`;
    }
    return `${coupon.discount_value.toLocaleString()} XOF`;
  };

  const isExpired = (coupon: Coupon) => {
    return coupon.expires_at && new Date(coupon.expires_at) < new Date();
  };

  const isLimitReached = (coupon: Coupon) => {
    return coupon.usage_limit && coupon.usage_count >= coupon.usage_limit;
  };

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Codes Promo</h1>
            <p className="text-gray-600">Gérez vos coupons et promotions</p>
          </div>

          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Créer un coupon
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
              </div>
              <Ticket className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expirés</p>
                <p className="text-2xl font-bold text-red-600">{stats?.expired || 0}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilisations</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.totalUsages || 0}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un code..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs uniquement</option>
              <option value="expired">Expirés</option>
            </select>
            <button
              onClick={fetchCoupons}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </Card>

        {/* Liste des coupons */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun coupon</h3>
              <p className="text-gray-500 mb-4">Créez votre premier code promo</p>
              <button
                onClick={() => openModal()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer un coupon
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Réduction</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisation</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900">{coupon.code}</span>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Copier"
                          >
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {coupon.discount_type === 'percentage' ? (
                            <Percent className="w-4 h-4 text-blue-600" />
                          ) : (
                            <DollarSign className="w-4 h-4 text-green-600" />
                          )}
                          <span className="font-semibold">{formatDiscount(coupon)}</span>
                        </div>
                        {coupon.min_purchase > 0 && (
                          <p className="text-xs text-gray-500">Min: {coupon.min_purchase.toLocaleString()} XOF</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${isLimitReached(coupon) ? 'text-red-600' : 'text-gray-900'}`}>
                          {coupon.usage_count}
                          {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {coupon.expires_at ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className={isExpired(coupon) ? 'text-red-600' : 'text-gray-600'}>
                              {new Date(coupon.expires_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Illimité</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isExpired(coupon) ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Expiré
                          </span>
                        ) : isLimitReached(coupon) ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Épuisé
                          </span>
                        ) : coupon.is_active ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleActive(coupon)}
                            className={`p-2 rounded-lg ${coupon.is_active ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                            title={coupon.is_active ? 'Désactiver' : 'Activer'}
                          >
                            {coupon.is_active ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => openModal(coupon)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Modifier"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteCoupon(coupon)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Modal Création/Édition */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingCoupon ? 'Modifier le coupon' : 'Nouveau coupon'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code promo *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono uppercase"
                      placeholder="WARABA20"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, code: generateCode() })}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                    >
                      Générer
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ex: Promo de lancement"
                  />
                </div>

                {/* Type et valeur */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="percentage">Pourcentage (%)</option>
                      <option value="fixed">Montant fixe (XOF)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valeur *</label>
                    <input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                      min="1"
                      max={formData.discount_type === 'percentage' ? 100 : undefined}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Achat min et réduction max */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Achat minimum (XOF)</label>
                    <input
                      type="number"
                      value={formData.min_purchase}
                      onChange={(e) => setFormData({ ...formData, min_purchase: parseFloat(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  {formData.discount_type === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Réduction max (XOF)</label>
                      <input
                        type="number"
                        value={formData.max_discount}
                        onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                        placeholder="Illimité"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Limite d'utilisation et expiration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Limite d'utilisation</label>
                    <input
                      type="number"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                      placeholder="Illimité"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
                    <input
                      type="date"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Actif */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Coupon actif
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  onClick={saveCoupon}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
