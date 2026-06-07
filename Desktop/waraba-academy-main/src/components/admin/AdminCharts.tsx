'use client';

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

interface AdminChartsProps {
  stats: {
    users: { total: number; growth: number; active: number };
    courses: { total: number; growth: number; published: number };
    enrollments: { total: number; growth: number; thisMonth: number };
    revenue: { total: number; growth: number; thisMonth: number };
    averageRating: number;
    completionRate: number;
  };
  enrollmentData?: {
    labels: string[];
    data: number[];
  };
  revenueData?: {
    labels: string[];
    data: number[];
  };
}

export default function AdminCharts({ stats, enrollmentData, revenueData }: AdminChartsProps) {
  // Données par défaut pour les graphiques si non fournies
  const defaultEnrollmentLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const defaultEnrollmentData = enrollmentData?.data || [0, 0, 0, 0, 0, 0, 0];

  const defaultRevenueLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
  const defaultRevenueData = revenueData?.data || [0, 0, 0, 0, 0, 0];

  // Graphique d'évolution des inscriptions
  const enrollmentChartData = {
    labels: enrollmentData?.labels || defaultEnrollmentLabels,
    datasets: [
      {
        label: 'Inscriptions',
        data: defaultEnrollmentData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const enrollmentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          precision: 0,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Graphique d'évolution des revenus
  const revenueChartData = {
    labels: revenueData?.labels || defaultRevenueLabels,
    datasets: [
      {
        label: 'Revenus (FCFA)',
        data: defaultRevenueData,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(168, 85, 247)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y.toLocaleString()} FCFA`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return `${(value / 1000).toFixed(0)}k`;
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Graphique en barres - Distribution des cours
  const coursesChartData = {
    labels: ['Publiés', 'Brouillons'],
    datasets: [
      {
        label: 'Cours',
        data: [
          stats.courses.published,
          stats.courses.total - stats.courses.published,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(245, 158, 11)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const coursesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          precision: 0,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Graphique en donut - Distribution des utilisateurs
  const usersChartData = {
    labels: ['Actifs', 'Inactifs'],
    datasets: [
      {
        label: 'Utilisateurs',
        data: [
          stats.users.active,
          Math.max(0, stats.users.total - stats.users.active),
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(156, 163, 175)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const usersChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
      },
    },
    cutout: '60%',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Évolution des inscriptions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Évolution des inscriptions</h3>
          <span className="text-sm font-semibold text-green-600">
            +{stats.enrollments.growth.toFixed(1)}%
          </span>
        </div>
        <div className="h-64">
          <Line data={enrollmentChartData} options={enrollmentChartOptions} />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total: {stats.enrollments.total.toLocaleString()}</span>
            <span className="text-gray-600">Ce mois: {stats.enrollments.thisMonth}</span>
          </div>
        </div>
      </div>

      {/* Évolution des revenus */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Évolution des revenus</h3>
          <span className={`text-sm font-semibold ${stats.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.revenue.growth >= 0 ? '+' : ''}{stats.revenue.growth.toFixed(1)}%
          </span>
        </div>
        <div className="h-64">
          <Line data={revenueChartData} options={revenueChartOptions} />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total: {stats.revenue.total.toLocaleString()} FCFA</span>
            <span className="text-gray-600">Ce mois: {stats.revenue.thisMonth.toLocaleString()} FCFA</span>
          </div>
        </div>
      </div>

      {/* Distribution des cours */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Distribution des cours</h3>
          <span className="text-sm text-gray-600">{stats.courses.total} cours</span>
        </div>
        <div className="h-64">
          <Bar data={coursesChartData} options={coursesChartOptions} />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600 font-medium">
              {stats.courses.published} publiés
            </span>
            <span className="text-orange-600 font-medium">
              {stats.courses.total - stats.courses.published} brouillons
            </span>
          </div>
        </div>
      </div>

      {/* Distribution des utilisateurs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Distribution des utilisateurs</h3>
          <span className="text-sm text-gray-600">{stats.users.total.toLocaleString()} utilisateurs</span>
        </div>
        <div className="h-64">
          <Doughnut data={usersChartData} options={usersChartOptions} />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-600 font-medium">
              {stats.users.active} actifs
            </span>
            <span className="text-gray-600 font-medium">
              {Math.max(0, stats.users.total - stats.users.active)} inactifs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
