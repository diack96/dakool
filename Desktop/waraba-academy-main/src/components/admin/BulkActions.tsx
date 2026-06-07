'use client';

import { useState } from 'react';
import { CheckSquare, Square, MoreVertical } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

interface BulkActionsProps<T> {
  items: T[];
  selectedItems: string[];
  onSelectionChange: (selected: string[]) => void;
  onBulkAction: (action: string, itemIds: string[]) => Promise<void>;
  getItemId: (item: T) => string;
  actions?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'danger' | 'success';
    requiresConfirmation?: boolean;
  }>;
}

export default function BulkActions<T>({
  items,
  selectedItems,
  onSelectionChange,
  onBulkAction,
  getItemId,
  actions = [
    { id: 'activate', label: 'Activer', variant: 'success' as const },
    { id: 'deactivate', label: 'Désactiver', variant: 'default' as const },
    { id: 'delete', label: 'Supprimer', variant: 'danger' as const, requiresConfirmation: true },
  ],
}: BulkActionsProps<T>) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  const allSelected = selectedItems.length === items.length && items.length > 0;
  const someSelected = selectedItems.length > 0 && selectedItems.length < items.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(getItemId));
    }
  };

  const handleBulkAction = async (actionId: string) => {
    if (selectedItems.length === 0) {
      showError('Veuillez sélectionner au moins un élément');
      return;
    }

    const action = actions.find(a => a.id === actionId);
    if (!action) return;

    // Si l'action nécessite une confirmation
    if (action.requiresConfirmation && !showConfirmDialog) {
      setShowConfirmDialog(actionId);
      return;
    }

    setIsProcessing(true);
    try {
      await onBulkAction(actionId, selectedItems);
      success(`${selectedItems.length} élément(s) ${action.label.toLowerCase()} avec succès`);
      onSelectionChange([]); // Réinitialiser la sélection
      setShowConfirmDialog(null);
    } catch (err) {
      showError(`Erreur lors de l'action: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      {/* Barre d'actions en masse */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedItems.length} élément(s) sélectionné(s)
            </span>
            <div className="flex gap-2">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleBulkAction(action.id)}
                  disabled={isProcessing}
                  className={`
                    inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${action.variant === 'danger' 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : action.variant === 'success'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {action.icon || <MoreVertical className="w-4 h-4 mr-1" />}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => onSelectionChange([])}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Checkbox pour sélectionner tout */}
      <div className="mb-4">
        <button
          onClick={handleSelectAll}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50"
        >
          {allSelected ? (
            <CheckSquare className="w-5 h-5 text-blue-600" />
          ) : someSelected ? (
            <div className="w-5 h-5 border-2 border-blue-600 rounded bg-blue-100" />
          ) : (
            <Square className="w-5 h-5 text-gray-400" />
          )}
          <span>
            {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
          </span>
        </button>
      </div>

      {/* Dialog de confirmation */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmer l'action
            </h3>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir {actions.find(a => a.id === showConfirmDialog)?.label.toLowerCase()} {selectedItems.length} élément(s) ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => handleBulkAction(showConfirmDialog)}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}




