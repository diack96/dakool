'use client';

import { useState, useEffect } from 'react';
import { Activity, Zap, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  score: number; // Performance Score
}

interface PerformanceAlert {
  type: 'warning' | 'error' | 'success';
  message: string;
  metric: string;
  value: number;
  threshold: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    score: 0,
  });
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Simuler le monitoring de performance
    const interval = setInterval(() => {
      if (isMonitoring) {
        updateMetrics();
      }
    }, 5000); // Mise à jour toutes les 5 secondes

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const updateMetrics = () => {
    // Simulation de métriques de performance
    const newMetrics: PerformanceMetrics = {
      fcp: Math.random() * 2 + 0.5, // 0.5 - 2.5s
      lcp: Math.random() * 3 + 1, // 1 - 4s
      fid: Math.random() * 100 + 10, // 10 - 110ms
      cls: Math.random() * 0.2, // 0 - 0.2
      ttfb: Math.random() * 500 + 100, // 100 - 600ms
      score: Math.random() * 30 + 70, // 70 - 100
    };

    setMetrics(newMetrics);
    checkPerformanceAlerts(newMetrics);
  };

  const checkPerformanceAlerts = (newMetrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = [];

    // Vérifier FCP (First Contentful Paint)
    if (newMetrics.fcp > 1.8) {
      newAlerts.push({
        type: 'warning',
        message: 'FCP trop lent',
        metric: 'FCP',
        value: newMetrics.fcp,
        threshold: 1.8,
      });
    }

    // Vérifier LCP (Largest Contentful Paint)
    if (newMetrics.lcp > 2.5) {
      newAlerts.push({
        type: 'error',
        message: 'LCP critique',
        metric: 'LCP',
        value: newMetrics.lcp,
        threshold: 2.5,
      });
    }

    // Vérifier FID (First Input Delay)
    if (newMetrics.fid > 100) {
      newAlerts.push({
        type: 'warning',
        message: 'FID élevé',
        metric: 'FID',
        value: newMetrics.fid,
        threshold: 100,
      });
    }

    // Vérifier CLS (Cumulative Layout Shift)
    if (newMetrics.cls > 0.1) {
      newAlerts.push({
        type: 'error',
        message: 'CLS trop élevé',
        metric: 'CLS',
        value: newMetrics.cls,
        threshold: 0.1,
      });
    }

    // Vérifier le score global
    if (newMetrics.score < 80) {
      newAlerts.push({
        type: 'warning',
        message: 'Score de performance faible',
        metric: 'Score',
        value: newMetrics.score,
        threshold: 80,
      });
    }

    setAlerts(newAlerts);
  };

  const getMetricColor = (metric: string, value: number): string => {
    const thresholds: Record<string, { good: number; warning: number }> = {
      fcp: { good: 1.8, warning: 3.0 },
      lcp: { good: 2.5, warning: 4.0 },
      fid: { good: 100, warning: 300 },
      cls: { good: 0.1, warning: 0.25 },
      ttfb: { good: 600, warning: 1000 },
      score: { good: 90, warning: 70 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'text-gray-600';

    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricStatus = (metric: string, value: number): 'good' | 'warning' | 'poor' => {
    const thresholds: Record<string, { good: number; warning: number }> = {
      fcp: { good: 1.8, warning: 3.0 },
      lcp: { good: 2.5, warning: 4.0 },
      fid: { good: 100, warning: 300 },
      cls: { good: 0.1, warning: 0.25 },
      ttfb: { good: 600, warning: 1000 },
      score: { good: 90, warning: 70 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.warning) return 'warning';
    return 'poor';
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'poor') => {
    switch (status) {
    case 'good':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'poor':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  const formatMetricValue = (metric: string, value: number): string => {
    switch (metric) {
    case 'fcp':
    case 'lcp':
      return `${value.toFixed(2)}s`;
    case 'fid':
      return `${Math.round(value)}ms`;
    case 'cls':
      return value.toFixed(3);
    case 'ttfb':
      return `${Math.round(value)}ms`;
    case 'score':
      return `${Math.round(value)}%`;
    default:
      return value.toString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec bouton de monitoring */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monitoring de Performance</h2>
          <p className="text-gray-600">Métriques en temps réel et alertes</p>
        </div>
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            isMonitoring
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isMonitoring ? 'Arrêter' : 'Démarrer'} le monitoring
        </button>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className={getMetricColor('fcp', metrics.fcp)}>
              {getStatusIcon(getMetricStatus('fcp', metrics.fcp))}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">FCP</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatMetricValue('fcp', metrics.fcp)}
          </p>
          <p className="text-sm text-gray-600">First Contentful Paint</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className={getMetricColor('lcp', metrics.lcp)}>
              {getStatusIcon(getMetricStatus('lcp', metrics.lcp))}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">LCP</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatMetricValue('lcp', metrics.lcp)}
          </p>
          <p className="text-sm text-gray-600">Largest Contentful Paint</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div className={getMetricColor('fid', metrics.fid)}>
              {getStatusIcon(getMetricStatus('fid', metrics.fid))}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">FID</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatMetricValue('fid', metrics.fid)}
          </p>
          <p className="text-sm text-gray-600">First Input Delay</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className={getMetricColor('cls', metrics.cls)}>
              {getStatusIcon(getMetricStatus('cls', metrics.cls))}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">CLS</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatMetricValue('cls', metrics.cls)}
          </p>
          <p className="text-sm text-gray-600">Cumulative Layout Shift</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            <div className={getMetricColor('ttfb', metrics.ttfb)}>
              {getStatusIcon(getMetricStatus('ttfb', metrics.ttfb))}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">TTFB</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatMetricValue('ttfb', metrics.ttfb)}
          </p>
          <p className="text-sm text-gray-600">Time to First Byte</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div className={getMetricColor('score', metrics.score)}>
              {getStatusIcon(getMetricStatus('score', metrics.score))}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Score</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatMetricValue('score', metrics.score)}
          </p>
          <p className="text-sm text-gray-600">Performance Score</p>
        </div>
      </div>

      {/* Alertes de performance */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Alertes de Performance</h3>
            <p className="text-sm text-gray-600">Actions recommandées</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    alert.type === 'error'
                      ? 'bg-red-50 border border-red-200'
                      : alert.type === 'warning'
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-green-50 border border-green-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {alert.type === 'error' ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : alert.type === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">{alert.message}</h4>
                      <p className="text-sm text-gray-600">
                        {alert.metric}: {formatMetricValue(alert.metric, alert.value)}
                        (Seuil: {formatMetricValue(alert.metric, alert.threshold)})
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Statut du monitoring */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className="text-lg font-medium text-gray-900">
              Monitoring {isMonitoring ? 'actif' : 'inactif'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
