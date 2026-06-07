'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  label?: string;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
  label = 'résultats',
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [20, 50, 100],
}: PaginationProps) {
  if (totalPages <= 1 && !onPageSizeChange) return null;

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (page <= 3) {
      for (let i = 1; i <= maxVisible; i++) pages.push(i);
    } else if (page >= totalPages - 2) {
      for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = page - 2; i <= page + 2; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-gray-200"
    >
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-600">
          Page {page} sur {totalPages} ({total} {label})
        </p>
        {onPageSizeChange && pageSize && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Afficher</label>
            <select
              value={pageSize}
              onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
              className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {pageSizeOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500">par page</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Page précédente"
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Précédent
        </button>
        {getPageNumbers().map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            aria-label={`Page ${pageNum}`}
            aria-current={page === pageNum ? 'page' : undefined}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              page === pageNum
                ? 'bg-blue-600 text-white font-semibold'
                : 'border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {pageNum}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label="Page suivante"
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Suivant
        </button>
      </div>
    </nav>
  );
}
