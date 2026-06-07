'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, Pencil, Trash2, Loader2, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isVerified: boolean;
  createdAt: string;
  authorName: string;
  authorInitials: string;
  isOwn: boolean;
}

interface ReviewStats {
  total: number;
  avgRating: number;
  distribution: Record<string, number>;
}

interface CourseReviewsProps {
  courseId: string;
  isEnrolled: boolean;
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Il y a 1 jour';
  if (days < 30) return `Il y a ${days} jours`;
  const months = Math.floor(days / 30);
  if (months === 1) return 'Il y a 1 mois';
  if (months < 12) return `Il y a ${months} mois`;
  return `Il y a ${Math.floor(months / 12)} an${Math.floor(months / 12) > 1 ? 's' : ''}`;
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
          aria-label={`${s} étoile${s > 1 ? 's' : ''}`}
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              s <= (hovered || value) ? 'text-amber-400 fill-current' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 text-gray-500 text-right">{stars}</span>
      <Star className="w-3 h-3 text-amber-400 fill-current flex-shrink-0" />
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
        <div className="bg-amber-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-gray-400 text-xs w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function CourseReviews({ courseId, isEnrolled }: CourseReviewsProps) {
  const [reviews,     setReviews]     = useState<Review[]>([]);
  const [stats,       setStats]       = useState<ReviewStats | null>(null);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Formulaire
  const [editing,     setEditing]     = useState(false);
  const [formRating,  setFormRating]  = useState(0);
  const [formComment, setFormComment] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError,   setFormError]   = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Suppression
  const [deleting,    setDeleting]    = useState(false);

  const ownReview = reviews.find(r => r.isOwn) ?? null;

  const fetchReviews = useCallback(async (p: number, append = false) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/reviews?page=${p}&limit=10`, { credentials: 'include' });
      if (!res.ok) return;
      const json = await res.json();
      const payload = json.data ?? json; // successResponse wraps in .data
      setStats(payload.stats ?? null);
      setHasMore(payload.hasMore ?? false);
      setReviews(prev => append ? [...prev, ...(payload.reviews ?? [])] : (payload.reviews ?? []));
    } finally {
      setLoadingList(false);
      setLoadingMore(false);
    }
  }, [courseId]);

  useEffect(() => { fetchReviews(1); }, [fetchReviews]);

  const handleLoadMore = async () => {
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    await fetchReviews(next, true);
  };

  const startEdit = (review?: Review) => {
    setFormRating(review?.rating ?? 0);
    setFormComment(review?.comment ?? '');
    setFormError(null);
    setFormSuccess(false);
    setEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formRating === 0) { setFormError('Veuillez sélectionner une note.'); return; }
    setFormLoading(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating: formRating, comment: formComment }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || 'Erreur lors de la publication.'); return; }
      setFormSuccess(true);
      setEditing(false);
      setPage(1);
      await fetchReviews(1);
    } catch {
      setFormError('Erreur réseau. Réessayez.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer votre avis ?')) return;
    setDeleting(true);
    try {
      await fetch(`/api/courses/${courseId}/reviews`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setPage(1);
      await fetchReviews(1);
      setFormSuccess(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
      {/* En-tête */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-400/25">
          <Star className="w-5 h-5 text-white fill-current" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Avis des étudiants</h2>
          {stats && stats.total > 0 && (
            <p className="text-sm text-gray-500">{stats.total} avis · Note moyenne {stats.avgRating.toFixed(1)}/5</p>
          )}
        </div>
      </div>

      {/* Rating overview */}
      {stats && stats.total > 0 && (
        <div className="flex items-center gap-6 p-5 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800 mb-6">
          <div className="text-center flex-shrink-0">
            <p className="text-5xl font-extrabold text-gray-900 dark:text-white">{stats.avgRating.toFixed(1)}</p>
            <div className="flex items-center gap-0.5 mt-1 justify-center">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(stats.avgRating) ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Note du cours</p>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map(s => (
              <RatingBar key={s} stars={s} count={stats.distribution[String(s)] ?? 0} total={stats.total} />
            ))}
          </div>
        </div>
      )}

      {/* Formulaire */}
      {isEnrolled && !editing && (
        <div className="mb-6">
          {ownReview ? (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Votre avis</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(ownReview)}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Modifier
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Supprimer
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= ownReview.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              {ownReview.comment && <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">"{ownReview.comment}"</p>}
            </div>
          ) : (
            <button
              onClick={() => startEdit()}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-amber-300 hover:border-amber-400 text-amber-700 hover:text-amber-800 rounded-2xl transition-colors text-sm font-medium hover:bg-amber-50"
            >
              <Star className="w-4 h-4 fill-current" />
              Laisser un avis sur ce cours
            </button>
          )}
          {formSuccess && !ownReview && (
            <p className="flex items-center gap-1.5 text-sm text-emerald-600 mt-2">
              <CheckCircle className="w-4 h-4" /> Votre avis a été publié. Merci !
            </p>
          )}
        </div>
      )}

      {editing && (
        <form onSubmit={handleSubmit} className="mb-6 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            {ownReview ? 'Modifier votre avis' : 'Laisser un avis'}
          </h3>

          <div>
            <p className="text-xs text-gray-500 mb-2">Votre note *</p>
            <StarInput value={formRating} onChange={setFormRating} />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Commentaire <span className="text-gray-400">(optionnel · {formComment.length}/500)</span>
            </label>
            <textarea
              value={formComment}
              onChange={e => setFormComment(e.target.value.slice(0, 500))}
              placeholder="Partagez votre expérience avec ce cours…"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all resize-none"
            />
          </div>

          {formError && (
            <p className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {formError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-100 text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {ownReview ? 'Modifier' : 'Publier'}
            </button>
          </div>
        </form>
      )}

      {/* Liste des reviews */}
      {loadingList ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aucun avis pour le moment.</p>
          {isEnrolled && <p className="text-xs mt-1">Soyez le premier à partager votre expérience !</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div
              key={r.id}
              className={`p-5 rounded-2xl border transition-colors ${
                r.isOwn
                  ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {r.authorInitials || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{r.authorName}</span>
                      {r.isOwn && <span className="ml-2 text-xs text-blue-600 font-medium">(vous)</span>}
                      {r.isVerified && (
                        <span className="ml-2 inline-flex items-center gap-0.5 text-xs text-emerald-600">
                          <CheckCircle className="w-3 h-3" /> Vérifié
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{relativeDate(r.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  {r.comment && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-2">"{r.comment}"</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full py-3 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Voir plus d'avis
            </button>
          )}
        </div>
      )}
    </section>
  );
}
