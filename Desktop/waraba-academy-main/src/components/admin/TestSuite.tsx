import { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'running' | 'pending';
  duration?: number;
  error?: string;
  category?: 'unit' | 'integration' | 'performance';
}

const TestSuite: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    running: 0,
  });

  const testSuites = [
    {
      name: 'Composants UI',
      tests: [
        { name: 'CTAVariants - Rendu correct', category: 'unit' as const },
        { name: 'AchievementBadges - État des badges', category: 'unit' as const },
        { name: 'PersonalizedLearningProfile - Profil IA', category: 'unit' as const },
        { name: 'Testimonials - Carousel navigation', category: 'unit' as const },
        { name: 'LeadMagnet - Formulaire validation', category: 'unit' as const },
      ],
    },
    {
      name: 'Analytics & Tracking',
      tests: [
        { name: 'trackEvent - Envoi des événements', category: 'unit' as const },
        { name: 'A/B Testing - Sélection variantes', category: 'unit' as const },
        { name: 'Conversion tracking - Métriques', category: 'unit' as const },
        { name: 'Performance monitoring - Métriques temps réel', category: 'integration' as const },
      ],
    },
    {
      name: 'Performance & Optimisation',
      tests: [
        { name: 'Lazy loading - Intersection Observer', category: 'performance' as const },
        { name: 'Chart.js - Rendu graphiques', category: 'performance' as const },
        { name: 'Animations CSS - Transitions fluides', category: 'performance' as const },
        { name: 'Bundle size - Optimisation code', category: 'performance' as const },
      ],
    },
    {
      name: 'Intégration & API',
      tests: [
        { name: 'Dashboard analytics - Chargement données', category: 'integration' as const },
        { name: 'Notifications temps réel - WebSocket', category: 'integration' as const },
        { name: 'Export rapports - Génération PDF', category: 'integration' as const },
        { name: 'Responsive design - Breakpoints', category: 'integration' as const },
      ],
    },
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    const allTests: TestResult[] = [];

    // Préparer tous les tests
    testSuites.forEach(suite => {
      suite.tests.forEach(test => {
        allTests.push({
          ...test,
          status: 'pending',
        });
      });
    });

    setTests(allTests);
    setSummary({
      total: allTests.length,
      passed: 0,
      failed: 0,
      running: 0,
    });

    // Exécuter les tests un par un
    for (let i = 0; i < allTests.length; i++) {
      const test = allTests[i];
      if (!test) continue;
      
      const updatedTests = [...allTests];

      // Marquer le test comme en cours
      updatedTests[i] = { ...test, status: 'running' as const, name: test.name ?? 'Test' };
      setTests(updatedTests);

      // Simuler l'exécution du test
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 800));
      const duration = Date.now() - startTime;

      // Déterminer le résultat (simulation)
      const shouldPass = Math.random() > 0.1; // 90% de succès
      const status: 'pass' | 'fail' = shouldPass ? 'pass' : 'fail';
      const error = shouldPass ? undefined : 'Erreur simulée pour test';

      updatedTests[i] = { ...test, status, duration, error };
      setTests(updatedTests);

      // Mettre à jour le résumé
      setSummary(prev => ({
        ...prev,
        passed: prev.passed + (status === 'pass' ? 1 : 0),
        failed: prev.failed + (status === 'fail' ? 1 : 0),
        running: prev.running - 1,
      }));
    }

    setIsRunning(false);
  };

  const runTestSuite = async (suiteName: string) => {
    const suite = testSuites.find(s => s.name === suiteName);
    if (!suite) return;

    setIsRunning(true);
    const suiteTests: TestResult[] = suite.tests.map(test => ({
      ...test,
      status: 'pending' as const,
    }));

    setTests(suiteTests);
    setSummary({
      total: suiteTests.length,
      passed: 0,
      failed: 0,
      running: 0,
    });

    // Exécuter les tests de la suite
    for (let i = 0; i < suiteTests.length; i++) {
      const test = suiteTests[i];
      const updatedTests = [...suiteTests];

      if (!test) continue;
      updatedTests[i] = { ...test, status: 'running' as const, name: test.name || 'Test' };
      setTests(updatedTests);

      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

      const duration = Date.now() - Date.now() + 300;
      const shouldPass = Math.random() > 0.15; // 85% de succès
      const status: 'pass' | 'fail' = shouldPass ? 'pass' : 'fail';
      const error = shouldPass ? undefined : 'Test suite error';

      updatedTests[i] = { ...test, status, duration, error };
      setTests(updatedTests);

      setSummary(prev => ({
        ...prev,
        passed: prev.passed + (status === 'pass' ? 1 : 0),
        failed: prev.failed + (status === 'fail' ? 1 : 0),
      }));
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
    case 'pass':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'fail':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'running':
      return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    case 'pending':
      return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
    case 'pass':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'fail':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'running':
      return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'pending':
      return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getCategoryColor = (category: TestResult['category']) => {
    switch (category) {
    case 'unit':
      return 'bg-blue-100 text-blue-800';
    case 'integration':
      return 'bg-green-100 text-green-800';
    case 'performance':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Suite de Tests</h2>
          <p className="text-gray-600">Validation des composants et fonctionnalités</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="w-4 h-4 mr-2 inline" />
            Tous les tests
          </button>
        </div>
      </div>

      {/* Résumé des tests */}
      {summary.total > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé des Tests</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
              <div className="text-sm text-gray-600">Réussis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
              <div className="text-sm text-gray-600">Échoués</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.running}</div>
              <div className="text-sm text-gray-600">En cours</div>
            </div>
          </div>
        </div>
      )}

      {/* Suites de tests */}
      <div className="space-y-6">
        {testSuites.map((suite, suiteIndex) => (
          <div key={suiteIndex} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{suite.name}</h3>
                <button
                  onClick={() => runTestSuite(suite.name)}
                  disabled={isRunning}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Play className="w-4 h-4 mr-1 inline" />
                  Exécuter
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {suite.tests.map((test, testIndex) => {
                  const testResult = tests.find(t => t.name === test.name);
                  return (
                    <div
                      key={testIndex}
                      className={`p-4 rounded-lg border ${
                        testResult ? getStatusColor(testResult.status) : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {testResult ? getStatusIcon(testResult.status) : <AlertTriangle className="w-5 h-5 text-gray-400" />}
                          <div>
                            <h4 className="font-medium">{test.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(test.category)}`}>
                                {test.category}
                              </span>
                              {testResult?.duration && (
                                <span className="text-xs text-gray-500">
                                  {testResult.duration}ms
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {testResult?.error && (
                          <div className="text-sm text-red-600 max-w-xs">
                            {testResult.error}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => runTestSuite('Composants UI')}
            disabled={isRunning}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="font-medium text-gray-900">Tests UI</div>
            <div className="text-sm text-gray-600">Validation des composants</div>
          </button>
          <button
            onClick={() => runTestSuite('Analytics & Tracking')}
            disabled={isRunning}
            className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
          >
            <div className="font-medium text-gray-900">Tests Analytics</div>
            <div className="text-sm text-gray-600">Validation du tracking</div>
          </button>
          <button
            onClick={() => runTestSuite('Performance & Optimisation')}
            disabled={isRunning}
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
          >
            <div className="font-medium text-gray-900">Tests Performance</div>
            <div className="text-sm text-gray-600">Validation des optimisations</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestSuite;
