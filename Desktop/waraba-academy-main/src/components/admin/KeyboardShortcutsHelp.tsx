'use client';

import { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Afficher l'aide avec Ctrl+? ou Ctrl+/
      if ((event.ctrlKey || event.metaKey) && (event.key === '?' || event.key === '/')) {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center z-40"
        title="Aide raccourcis clavier (Ctrl+?)"
        aria-label="Aide raccourcis clavier"
      >
        <Keyboard className="w-5 h-5" />
      </button>
    );
  }

  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Recherche globale' },
    { keys: ['Ctrl', 'N'], description: 'Nouveau cours/catégorie' },
    { keys: ['Ctrl', 'S'], description: 'Sauvegarder' },
    { keys: ['Ctrl', 'G'], description: 'Aller au dashboard' },
    { keys: ['Esc'], description: 'Fermer modal/annuler' },
    { keys: ['Ctrl', '?'], description: 'Afficher cette aide' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Raccourcis clavier</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-700">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <span key={keyIndex}>
                    {keyIndex > 0 && <span className="text-gray-400 mx-1">+</span>}
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono text-gray-700">
                      {key}
                    </kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
          Appuyez sur <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">Esc</kbd> pour fermer
        </div>
      </div>
    </div>
  );
}

