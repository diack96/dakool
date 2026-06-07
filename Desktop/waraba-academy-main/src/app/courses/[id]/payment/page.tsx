'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  BookOpen,
  Tag,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PaymentPanel from '@/components/payments/PaymentPanel';
import { AdminCourse } from '@/types';

interface CourseData {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  description?: string;
  image?: string;
  thumbnail?: string;
}

/** Construit un objet AdminCourse minimal pour PaymentPanel à partir des données API */
function toCourse(c: CourseData): AdminCourse {
  return {
    id: c.id,
    title: c.title,
    price: c.price,
    originalPrice: c.original_price,
    description: c.description || '',
    shortDescription: '',
    categoryId: '',
    instructorId: '',
    duration: '',
    level: 'beginner',
    status: 'published',
    syllabus: '[]',
    requirements: [],
    objectives: [],
    materials: [],
    enrollmentCount: 0,
    rating: 0,
    reviewCount: 0,
    isFeatured: false,
    isPopular: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/* ─── Contenu principal ──────────────────────────────────────── */

function CoursePaymentForm() {
  const params      = useParams();
  const router      = useRouter();
  const { user, loading: authLoading } = useAuth();
  const courseId    = params.id as string;

  const [loadingCourse, setLoadingCourse] = useState(true);
  const [course,        setCourse]        = useState<CourseData | null>(null);

  // État code promo
  const [couponInput,   setCouponInput]   = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError,   setCouponError]   = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalPrice: number;
    description: string | null;
  } | null>(null);

  /* Charger les données du cours */
  useEffect(() => {
    if (!courseId) return;
    (async () => {
      try {
        setLoadingCourse(true);
        const res = await fetch(`/api/courses/${courseId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Cours non trouvé');
        const data = await res.json();
        const raw  = data.course || data.data?.course || data.data;
        if (data.success && raw) {
          raw.price = parseFloat(String(raw.price)) || 0;
          if (raw.original_price) {
            raw.original_price = parseFloat(String(raw.original_price)) || undefined;
          }
          setCourse(raw);
        } else {
          throw new Error(data.error || 'Cours non trouvé');
        }
      } catch (err) {
        console.error('[Payment] Chargement cours:', err instanceof Error ? err.message : err);
      } finally {
        setLoadingCourse(false);
      }
    })();
  }, [courseId]);

  /* Rediriger vers login si non connecté */
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(
        `/auth/login?redirect=${encodeURIComponent(`/courses/${courseId}/payment`)}`,
      );
    }
  }, [authLoading, user, router, courseId]);

  /* ─── Loaders / erreurs ────────────────────────────────────── */

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <div className="text-center">
          <Loader2 className="w-14 h-14 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Vérification de la session…</p>
        </div>
      </div>
    );
  }

  if (loadingCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <div className="text-center">
          <Loader2 className="w-14 h-14 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement du cours…</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
        <div className="text-center">
          <AlertCircle className="w-14 h-14 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cours introuvable</h2>
          <p className="text-gray-600 mb-4">Le cours demandé n&apos;existe pas ou a été supprimé.</p>
          <Link href="/courses" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4" />
            Retour aux cours
          </Link>
        </div>
      </div>
    );
  }

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, courseId }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({
          code: data.code,
          discountAmount: data.discountAmount,
          finalPrice: data.finalPrice,
          description: data.description,
        });
        setCouponInput('');
      } else {
        setCouponError(data.error || 'Code promo invalide.');
      }
    } catch {
      setCouponError('Erreur réseau. Réessayez.');
    } finally {
      setCouponLoading(false);
    }
  };

  const adminCourse = toCourse(course);
  const discount    = course.original_price && course.original_price > course.price
    ? Math.round((1 - course.price / course.original_price) * 100)
    : 0;

  /* ─── Page principale ──────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 relative overflow-hidden pt-24">
      {/* Blobs décoratifs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-20 left-10 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Fil d'Ariane */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-blue-600 transition-colors">Accueil</Link></li>
            <li className="flex items-center gap-2">
              <span>/</span>
              <Link href="/courses" className="hover:text-blue-600 transition-colors">Cours</Link>
            </li>
            <li className="flex items-center gap-2">
              <span>/</span>
              <Link href={`/courses/${courseId}`} className="hover:text-blue-600 transition-colors line-clamp-1 max-w-[160px]">
                {course.title}
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span>/</span>
              <span className="text-gray-900 font-medium">Paiement</span>
            </li>
          </ol>
        </nav>

        {/* Titre de page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finaliser votre inscription</h1>
          <p className="text-gray-600 mt-1">Choisissez votre méthode de paiement et accédez immédiatement au cours.</p>
        </div>

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* ── Panneau de paiement (3/5 de la grille) ───────── */}
          <div className="lg:col-span-3">
            <PaymentPanel
              course={adminCourse}
              overridePrice={appliedCoupon ? appliedCoupon.finalPrice : undefined}
            />
          </div>

          {/* ── Résumé de commande (2/5 de la grille) ────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Carte cours */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
              <h2 className="text-base font-semibold text-gray-700 mb-4">Votre commande</h2>

              <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 leading-snug">{course.title}</p>
                  <p className="text-sm text-gray-500 mt-1">Accès à vie · Certificat inclus</p>
                </div>
              </div>

              {/* Prix */}
              <div className="mt-4 space-y-2 text-sm">
                {course.original_price && course.original_price > course.price && (
                  <div className="flex justify-between text-gray-500">
                    <span>Prix habituel</span>
                    <span className="line-through">{course.original_price.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Réduction
                    </span>
                    <span>−{discount}%</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Code {appliedCoupon.code}
                    </span>
                    <span>−{appliedCoupon.discountAmount.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-blue-600">
                    {(appliedCoupon ? appliedCoupon.finalPrice : course.price).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              {/* Champ code promo */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Code <strong>{appliedCoupon.code}</strong> appliqué</span>
                      {appliedCoupon.description && (
                        <span className="text-emerald-600 font-normal">— {appliedCoupon.description}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setAppliedCoupon(null); setCouponError(null); }}
                      className="text-emerald-500 hover:text-emerald-700 transition-colors ml-2"
                      aria-label="Retirer le code promo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-600">Code promo</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="EX : WARABA20"
                        maxLength={50}
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        {couponLoading
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Tag className="w-3.5 h-3.5" />}
                        Appliquer
                      </button>
                    </div>
                    {couponError && (
                      <p className="flex items-center gap-1.5 text-xs text-red-600">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Ce qui est inclus */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Ce qui est inclus</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  'Accès à vie au contenu du cours',
                  'Certificat de réussite numérique',
                  'Ressources et exercices pratiques',
                  'Support de la communauté',
                  'Mises à jour gratuites à vie',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sécurité */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>Paiement 100 % sécurisé — chiffrement SSL 256 bits</span>
              </div>
            </div>

            {/* Garantie */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold">Garantie satisfait ou remboursé 30 jours</p>
                  <p className="mt-0.5 text-green-700">Si vous n&apos;êtes pas satisfait, nous vous remboursons intégralement.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Retour */}
        <div className="mt-8">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la page du cours
          </Link>
        </div>

      </div>
    </div>
  );
}

/* ─── Export avec Suspense (requis pour useSearchParams dans les enfants) ── */

export default function CoursePaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <CoursePaymentForm />
    </Suspense>
  );
}
