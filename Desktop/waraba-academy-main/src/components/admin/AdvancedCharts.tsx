
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string | string[];
    backgroundColor?: string | string[];
    fill?: boolean;
    borderWidth?: number;
    [key: string]: any; // Allow other Chart.js properties
  }[];
}

interface AdvancedChartsProps {
  conversionData?: ChartData;
  engagementData?: ChartData;
  abTestData?: ChartData;
  userDistribution?: ChartData;
}

const AdvancedCharts: React.FC<AdvancedChartsProps> = ({
  conversionData,
  engagementData,
  abTestData,
  userDistribution,
}) => {
  // Données par défaut pour les graphiques
  const defaultConversionData: ChartData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Inscriptions',
        data: [12, 19, 15, 25, 22, 30, 28],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
      {
        label: 'Conversions',
        data: [8, 15, 12, 20, 18, 25, 23],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
      },
    ],
  };

  const defaultEngagementData: ChartData = {
    labels: ['0-30s', '30s-1m', '1-2m', '2-5m', '5-10m', '10m+'],
    datasets: [
      {
        label: 'Utilisateurs',
        data: [25, 30, 45, 60, 40, 20],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ] as string[],
      },
    ],
  };

  const defaultABTestData: ChartData = {
    labels: ['Variant 1', 'Variant 2', 'Variant 3', 'Variant 4'],
    datasets: [
      {
        label: 'CTR (%)',
        data: [3.2, 4.1, 2.8, 3.9],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
      },
      {
        label: 'Taux de Conversion (%)',
        data: [1.8, 2.3, 1.5, 2.1],
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(168, 85, 247, 0.6)',
        ],
      },
    ],
  };

  const defaultUserDistribution: ChartData = {
    labels: ['Débutants', 'Intermédiaires', 'Avancés', 'Experts'],
    datasets: [
      {
        label: 'Utilisateurs',
        data: [45, 30, 20, 5],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Options communes pour les graphiques
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  // Options spécifiques pour chaque type de graphique
  const lineOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'Tendances de Conversion - 7 derniers jours',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 8,
      },
      line: {
        tension: 0.4,
      },
    },
  };

  const barOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'Performance A/B Testing - Comparaison des Variantes',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const doughnutOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      title: {
        display: true,
        text: 'Distribution des Utilisateurs par Niveau',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    cutout: '60%',
  };

  return (
    <div className="space-y-8">
      {/* Graphique de tendances de conversion */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="h-80">
          <Line
            data={conversionData || defaultConversionData}
            options={lineOptions}
          />
        </div>
      </div>

      {/* Graphiques côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique A/B Testing */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="h-80">
            <Bar
              data={abTestData || defaultABTestData}
              options={barOptions}
            />
          </div>
        </div>

        {/* Distribution des utilisateurs */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="h-80">
            <Doughnut
              data={userDistribution || defaultUserDistribution}
              options={doughnutOptions}
            />
          </div>
        </div>
      </div>

      {/* Graphique d'engagement utilisateur */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="h-80">
          <Bar
            data={engagementData || defaultEngagementData}
            options={{
              ...barOptions,
              plugins: {
                ...barOptions.plugins,
                title: {
                  display: true,
                  text: 'Temps d\'Engagement des Utilisateurs',
                  font: {
                    size: 16,
                    weight: 'bold' as const,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Métriques de performance en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">2.4s</div>
            <div className="text-sm text-blue-700">Temps de chargement moyen</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">94%</div>
            <div className="text-sm text-green-700">Score de performance</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">87</div>
            <div className="text-sm text-purple-700">Score d'accessibilité</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCharts;
