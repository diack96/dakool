'use client';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="animate-pulse" role="status" aria-label="Chargement des données">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="py-4 px-6">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b border-gray-100">
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <td key={colIdx} className="py-4 px-6">
                    <div className={`h-4 bg-gray-${colIdx === 0 ? '200' : '100'} rounded`}
                      style={{ width: `${60 + ((rowIdx * 7 + colIdx * 13) % 40)}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <span className="sr-only">Chargement en cours...</span>
    </div>
  );
}
