'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AdminGuard from '@/components/admin/AdminGuard';
import { useToast } from '@/components/admin/Toast';
import { createBrowserSupabaseClient } from '@/lib/supabase-helpers';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Link as LinkIcon,
  FileText,
  Upload,
  Loader2,
  ExternalLink,
  File,
  X,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Resource {
  id: string;
  course_id: string;
  title: string;
  type: 'file' | 'link';
  url: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  order: number;
  created_at: string;
}

type Tab = 'link' | 'file';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return <File className="w-5 h-5 text-gray-400" />;
  if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
  if (mimeType.includes('zip') || mimeType.includes('compressed'))
    return <File className="w-5 h-5 text-yellow-500" />;
  if (mimeType.includes('image')) return <File className="w-5 h-5 text-blue-500" />;
  return <File className="w-5 h-5 text-gray-500" />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CourseResourcesPage() {
  const { id: courseId } = useParams<{ id: string }>();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('link');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Formulaire lien
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // Formulaire fichier
  const [fileTitle, setFileTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/resources`);
      const data = await res.json();
      setResources(data.resources ?? []);
    } catch {
      toast.error('Erreur lors du chargement des ressources');
    } finally {
      setLoading(false);
    }
  }, [courseId, toast]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  // ── Ajouter lien ───────────────────────────────────────────────────────────

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: linkTitle.trim(),
          type: 'link',
          url: linkUrl.trim(),
          order: resources.length,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Lien ajouté');
      setLinkTitle('');
      setLinkUrl('');
      setShowForm(false);
      fetchResources();
    } catch {
      toast.error('Erreur lors de l\'ajout du lien');
    } finally {
      setSaving(false);
    }
  }

  // ── Uploader fichier ───────────────────────────────────────────────────────

  async function handleUploadFile(e: React.FormEvent) {
    e.preventDefault();
    if (!fileTitle.trim() || !selectedFile) return;

    setSaving(true);
    setUploadProgress(0);

    try {
      const supabase = createBrowserSupabaseClient();
      const path = `${courseId}/${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('course-resources')
        .upload(path, selectedFile, { upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      setUploadProgress(80);

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from('course-resources')
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;

      // Enregistrer en DB via l'API
      const res = await fetch(`/api/admin/courses/${courseId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fileTitle.trim(),
          type: 'file',
          url: publicUrl,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          mime_type: selectedFile.type || null,
          order: resources.length,
        }),
      });

      if (!res.ok) {
        // Nettoyer le fichier uploadé si l'enregistrement DB échoue
        await supabase.storage.from('course-resources').remove([path]);
        throw new Error();
      }

      setUploadProgress(100);
      toast.success('Fichier ajouté');
      setFileTitle('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowForm(false);
      fetchResources();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  }

  // ── Supprimer ──────────────────────────────────────────────────────────────

  async function handleDelete(resourceId: string) {
    if (!confirm('Supprimer cette ressource ?')) return;
    setDeletingId(resourceId);
    try {
      const res = await fetch(
        `/api/admin/courses/${courseId}/resources?resourceId=${resourceId}`,
        { method: 'DELETE' },
      );
      if (!res.ok) throw new Error();
      toast.success('Ressource supprimée');
      setResources(prev => prev.filter(r => r.id !== resourceId));
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <Link
                  href={`/admin/courses/${courseId}`}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Ressources du cours</h1>
                  <p className="text-sm text-gray-500">Fichiers et liens mis à disposition des apprenants</p>
                </div>
              </div>
              <button
                onClick={() => { setShowForm(true); setActiveTab('link'); }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une ressource
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Formulaire d'ajout */}
          {showForm && (
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Nouvelle ressource</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b mb-5">
                <button
                  onClick={() => setActiveTab('link')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'link'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  Lien externe
                </button>
                <button
                  onClick={() => setActiveTab('file')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'file'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Upload className="w-4 h-4 inline mr-1" />
                  Fichier
                </button>
              </div>

              {/* Tab: Lien */}
              {activeTab === 'link' && (
                <form onSubmit={handleAddLink} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={linkTitle}
                      onChange={e => setLinkTitle(e.target.value)}
                      placeholder="Ex: Documentation officielle"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      Ajouter
                    </button>
                  </div>
                </form>
              )}

              {/* Tab: Fichier */}
              {activeTab === 'file' && (
                <form onSubmit={handleUploadFile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fileTitle}
                      onChange={e => setFileTitle(e.target.value)}
                      placeholder="Ex: Exercices du module 1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fichier <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg"
                      onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                      className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">PDF, ZIP, DOC, XLS, PPT, images — max 20 Mo</p>
                  </div>
                  {saving && uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !selectedFile}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      {saving ? 'Upload en cours...' : 'Uploader'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Liste des ressources */}
          <div className="bg-white rounded-xl border shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : resources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="w-12 h-12 text-gray-200 mb-3" />
                <p className="text-gray-500 font-medium">Aucune ressource pour ce cours</p>
                <p className="text-sm text-gray-400 mt-1">
                  Ajoutez des fichiers ou des liens utiles pour vos apprenants
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {resources.map(resource => (
                  <li
                    key={resource.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {resource.type === 'link' ? (
                        <LinkIcon className="w-5 h-5 text-blue-500 shrink-0" />
                      ) : (
                        getFileIcon(resource.mime_type)
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{resource.title}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {resource.type === 'link'
                            ? resource.url
                            : `${resource.file_name ?? ''}${resource.file_size ? ` · ${formatFileSize(resource.file_size)}` : ''}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        resource.type === 'link'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {resource.type === 'link' ? 'Lien' : 'Fichier'}
                      </span>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ouvrir"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(resource.id)}
                        disabled={deletingId === resource.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40"
                        title="Supprimer"
                      >
                        {deletingId === resource.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {resources.length > 0 && (
            <p className="text-xs text-gray-400 text-center">
              {resources.length} ressource{resources.length > 1 ? 's' : ''} · Visible uniquement par les apprenants inscrits
            </p>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
