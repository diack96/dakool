'use client';

import { useState, useEffect } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import { Card } from '@/components/ui/Card';
import ContentForm from '@/components/admin/ContentForm';
import { useToast } from '@/components/admin/Toast';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  FileText,
  MessageSquare,
  Users,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
} from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

interface Partner {
  id: string;
  name: string;
  logo: string;
  website: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
}

export default function ContentAdminPage () {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('testimonials');
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: string; id: string | null }>({
    isOpen: false,
    type: '',
    id: null,
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [testimonialsRes, partnersRes, faqsRes] = await Promise.all([
        fetch('/api/admin/testimonials'),
        fetch('/api/admin/partners'),
        fetch('/api/admin/content/faqs'),
      ]);

      if (testimonialsRes.ok) {
        const testimonialsData = await testimonialsRes.json();
        setTestimonials(testimonialsData);
      }

      if (partnersRes.ok) {
        const partnersData = await partnersRes.json();
        setPartners(partnersData);
      }

      if (faqsRes.ok) {
        const faqsData = await faqsRes.json();
        setFaqs(faqsData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du contenu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (type: string, data: any) => {
    try {
      const method = data.id ? 'PUT' : 'POST';
      const url = data.id
        ? `/api/admin/${type === 'faqs' ? 'content/faqs' : type}`
        : `/api/admin/${type === 'faqs' ? 'content/faqs' : type}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchContent();
        setEditingItem(null);
        setShowAddForm(false);
        success('Élément sauvegardé avec succès');
      } else {
        const errorData = await response.json();
        error(errorData.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (type: string, item: any) => {
    setEditingItem({ ...item, type });
    setShowAddForm(true);
  };

  const handleDelete = (type: string, id: string) => {
    setDeleteModal({ isOpen: true, type, id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id || !deleteModal.type) return;

    try {
      const url = `/api/admin/${deleteModal.type === 'faqs' ? 'content/faqs' : deleteModal.type}?id=${deleteModal.id}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchContent();
        success('Élément supprimé avec succès');
      } else {
        error('Erreur lors de la suppression');
      }
    } catch (err) {
      error('Erreur lors de la suppression');
    } finally {
      setDeleteModal({ isOpen: false, type: '', id: null });
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

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestion du Contenu du Site</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {/* Onglets */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'testimonials'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Témoignages
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'partners'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Partenaires
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'faqs'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            FAQ
          </button>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'testimonials' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Témoignages</h3>
              <span className="text-sm text-gray-600">{testimonials.length} témoignages</span>
            </div>

            <div className="space-y-4">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{testimonial.name}</h4>
                        <span className="text-sm text-gray-500">({testimonial.role})</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${i < testimonial.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{testimonial.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Créé le {new Date(testimonial.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit('testimonials', testimonial)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('testimonials', testimonial.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'partners' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Partenaires</h3>
              <span className="text-sm text-gray-600">{partners.length} partenaires</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partners.map((partner) => (
                <div key={partner.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{partner.name}</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit('partners', partner)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('partners', partner.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {partner.logo && (
                    <div className="mb-3">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="h-16 w-auto object-contain"
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-700 mb-2">{partner.description}</p>
                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {partner.website}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'faqs' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">FAQ</h3>
              <span className="text-sm text-gray-600">{faqs.length} questions</span>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {faq.category}
                        </span>
                        <span className="text-sm text-gray-500">Ordre: {faq.order}</span>
                      </div>
                      <h4 className="font-medium mb-2">{faq.question}</h4>
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit('faqs', faq)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('faqs', faq.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Formulaire d'ajout/édition */}
        {showAddForm && (
          <ContentForm
            initialData={editingItem ? {
              title: editingItem.name || editingItem.question || '',
              description: editingItem.description || editingItem.answer || '',
              type: 'text',
              content: editingItem.content || '',
            } : undefined}
            onSubmit={async (data) => {
              await handleSave(activeTab, { ...editingItem, ...data });
            }}
            onCancel={() => {
              setShowAddForm(false);
              setEditingItem(null);
            }}
            isEditing={!!editingItem}
          />
        )}

        {/* Modal de confirmation de suppression */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          title="Supprimer l'élément"
          message="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal({ isOpen: false, type: '', id: null })}
        />
      </div>
    </AdminGuard>
  );
}

