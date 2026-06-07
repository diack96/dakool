'use client';

import { useEffect, useState } from 'react';
import { Flame, Star, Trophy, Lock } from 'lucide-react';
import type { LevelInfo } from '@/lib/gamification';

interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  earned: boolean;
  earned_at: string | null;
}

interface GamificationData {
  xp_total: number;
  current_streak: number;
  longest_streak: number;
  lessons_completed: number;
  level: LevelInfo;
  badges: Badge[];
}

export default function GamificationStats() {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gamification/stats', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => { if (d.level) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8 animate-pulse transition-colors">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      </div>
    );
  }

  if (!data) return null;

  const { xp_total, current_streak, level, badges } = data;
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        Progression & Récompenses
      </h2>

      {/* Grille stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* XP + Niveau */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Niveau {level.level} — {level.label}
              </span>
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-mono font-bold">
              {xp_total} XP
            </span>
          </div>
          {/* Barre XP */}
          <div className="w-full bg-blue-100 dark:bg-blue-900/40 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${level.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-blue-500 dark:text-blue-400 mt-1">
            <span>{level.currentXP} XP</span>
            <span>{level.nextLevelXP} XP → Niveau {level.level + 1}</span>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800 flex flex-col items-center justify-center">
          <Flame className={`w-8 h-8 mb-1 ${current_streak > 0 ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600'}`} />
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{current_streak}</p>
          <p className="text-xs font-medium text-orange-500 dark:text-orange-400 text-center">
            {current_streak === 1 ? 'jour consécutif' : 'jours consécutifs'}
          </p>
          {data.longest_streak > 1 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Record : {data.longest_streak}j
            </p>
          )}
        </div>
      </div>

      {/* Badges */}
      <div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Badges — {earnedCount}/{badges.length} obtenus
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              title={badge.earned ? `${badge.name} — obtenu` : `${badge.name} : ${badge.description}`}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all ${
                badge.earned
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                  : 'bg-gray-50 dark:bg-gray-700/40 border-gray-200 dark:border-gray-600 opacity-50'
              }`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className={`text-xs font-medium leading-tight ${badge.earned ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-400 dark:text-gray-500'}`}>
                {badge.name}
              </span>
              {!badge.earned && (
                <Lock className="absolute top-1 right-1 w-3 h-3 text-gray-300 dark:text-gray-600" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
