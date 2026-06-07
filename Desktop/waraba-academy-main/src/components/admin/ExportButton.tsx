'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

interface ExportButtonProps {
  data: any[];
  filename: string;
  fields: Array<{ key: string; label: string; transform?: (value: any) => string }>;
  label?: string;
  variant?: 'default' | 'outline';
}

export default function ExportButton({
  data,
  filename,
  fields,
  label = 'Exporter',
  variant = 'default',
}: ExportButtonProps) {
  const { success, error: showError } = useToast();
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    if (data.length === 0) {
      showError('Aucune donnée à exporter');
      return;
    }

    setExporting(true);
    try {
      // Créer les en-têtes
      const headers = fields.map(f => f.label).join(',');

      // Créer les lignes
      const rows = data.map(item => {
        return fields.map(field => {
          let value = item[field.key];
          
          // Appliquer la transformation si fournie
          if (field.transform) {
            value = field.transform(value);
          } else if (value === null || value === undefined) {
            value = '';
          } else if (typeof value === 'object') {
            value = JSON.stringify(value);
          } else {
            value = String(value);
          }

          // Échapper les virgules et guillemets
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = `"${value.replace(/"/g, '""')}"`;
          }

          return value;
        }).join(',');
      });

      // Combiner tout
      const csvContent = [headers, ...rows].join('\n');

      // Créer le blob et télécharger
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      success(`${data.length} éléments exportés avec succès`);
    } catch (err: any) {
      showError(err.message || 'Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  };

  const buttonClass = variant === 'outline'
    ? 'px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2'
    : 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2';

  return (
    <button
      onClick={exportToCSV}
      disabled={exporting || data.length === 0}
      className={`${buttonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {exporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Export...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          {label}
        </>
      )}
    </button>
  );
}

