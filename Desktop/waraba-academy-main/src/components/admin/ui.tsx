

export function cn (...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function Card ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-gray-100 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800', className)} {...props} />;
}

export function Button ({ variant = 'primary', className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600',
    secondary: 'bg-orange-600 hover:bg-orange-700 text-white',
    ghost: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800',
  } as const;
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function Input (props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-950 dark:border-gray-800"
      {...props}
    />
  );
}

export function Select (props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-950 dark:border-gray-800" {...props} />
  );
}

export function Modal ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
          <h3 id="modal-title" className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900"
            aria-label="Fermer la boîte de dialogue"
          >
            ✕
          </button>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}

