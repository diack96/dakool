import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw, Download, Target, Users, Activity, Zap } from 'lucide-react';
import PerformanceMonitor from './PerformanceMonitor';

// chart.js (~400 KB) — chargé uniquement quand ce composant est affiché
const AdvancedCharts = dynamic(() => import('./AdvancedCharts'), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-gray-400">Chargement des graphiques...</div>,
});

interface AnalyticsData {
  conversionRate: number;
  activeUsers: number;
  sessions: number;
  performance: number;
  lastUpdated: string;
}

export default function AnalyticsDashboard () {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    conversionRate: 0,
    activeUsers: 0,
    sessions: 0,
    performance: 0,
    lastUpdated: new Date().toLocaleString('fr-FR'),
  });

  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAnalyticsData({
        conversionRate: Math.random() * 100,
        activeUsers: Math.floor(Math.random() * 10000),
        sessions: Math.floor(Math.random() * 50000),
        performance: Math.random() * 100,
        lastUpdated: new Date().toLocaleString('fr-FR'),
      });
    } catch {
      // Gestion silencieuse des erreurs
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'analytics-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableau de bord analytique</h2>
          <p className="text-gray-600 mt-1">
            Suivez les performances et les métriques clés de votre plateforme
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAnalyticsData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Taux de conversion</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsData.conversionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Utilisateurs actifs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsData.activeUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Sessions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsData.sessions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Performance</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsData.performance.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Composants avancés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdvancedCharts />
        <PerformanceMonitor />
      </div>

      {/* Informations de mise à jour */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <p className="text-sm text-gray-500 text-center">
          Dernière mise à jour : {analyticsData.lastUpdated}
        </p>
      </div>
    </div>
  );
}
