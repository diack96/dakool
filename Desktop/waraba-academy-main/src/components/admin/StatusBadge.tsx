'use client';

import {
  CheckCircle,
  Clock,
  XCircle,
  ArrowDownRight,
  AlertTriangle,
  Shield,
  UserCheck,
  Users,
  BookOpen,
  Archive,
} from 'lucide-react';

type StatusType =
  | 'published' | 'draft' | 'archived'
  | 'completed' | 'pending' | 'failed' | 'refunded'
  | 'active' | 'inactive' | 'abandoned'
  | 'beginner' | 'intermediate' | 'advanced'
  | 'admin' | 'instructor' | 'student'
  | 'verified' | 'unverified';

const STATUS_CONFIG: Record<string, { bg: string; icon?: React.ReactNode; label: string }> = {
  // Course status
  published:    { bg: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" aria-hidden="true" />, label: 'Publié' },
  draft:        { bg: 'bg-orange-100 text-orange-800', icon: <Clock className="w-3 h-3" aria-hidden="true" />, label: 'Brouillon' },
  archived:     { bg: 'bg-gray-100 text-gray-800', icon: <Archive className="w-3 h-3" aria-hidden="true" />, label: 'Archivé' },
  // Payment status
  completed:    { bg: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" aria-hidden="true" />, label: 'Complété' },
  pending:      { bg: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3" aria-hidden="true" />, label: 'En attente' },
  failed:       { bg: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" aria-hidden="true" />, label: 'Échoué' },
  refunded:     { bg: 'bg-purple-100 text-purple-800', icon: <ArrowDownRight className="w-3 h-3" aria-hidden="true" />, label: 'Remboursé' },
  // User status
  active:       { bg: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" aria-hidden="true" />, label: 'Actif' },
  inactive:     { bg: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" aria-hidden="true" />, label: 'Inactif' },
  abandoned:    { bg: 'bg-orange-100 text-orange-800', icon: <AlertTriangle className="w-3 h-3" aria-hidden="true" />, label: 'Abandonné' },
  // Level
  beginner:     { bg: 'bg-blue-100 text-blue-800', icon: <BookOpen className="w-3 h-3" aria-hidden="true" />, label: 'Débutant' },
  intermediate: { bg: 'bg-yellow-100 text-yellow-800', icon: <BookOpen className="w-3 h-3" aria-hidden="true" />, label: 'Intermédiaire' },
  advanced:     { bg: 'bg-red-100 text-red-800', icon: <BookOpen className="w-3 h-3" aria-hidden="true" />, label: 'Avancé' },
  // Roles
  admin:        { bg: 'bg-orange-100 text-orange-800', icon: <Shield className="w-3 h-3" aria-hidden="true" />, label: 'Admin' },
  instructor:   { bg: 'bg-blue-100 text-blue-800', icon: <UserCheck className="w-3 h-3" aria-hidden="true" />, label: 'Instructeur' },
  student:      { bg: 'bg-blue-100 text-blue-800', icon: <Users className="w-3 h-3" aria-hidden="true" />, label: 'Étudiant' },
  // Email
  verified:     { bg: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" aria-hidden="true" />, label: 'Vérifié' },
  unverified:   { bg: 'bg-orange-100 text-orange-800', icon: <XCircle className="w-3 h-3" aria-hidden="true" />, label: 'Non vérifié' },
};

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

export default function StatusBadge({ status, label, showIcon = true, className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { bg: 'bg-gray-100 text-gray-800', label: status };
  const displayLabel = label || config.label;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${className}`}
      role="status"
    >
      {showIcon && config.icon}
      {displayLabel}
    </span>
  );
}
