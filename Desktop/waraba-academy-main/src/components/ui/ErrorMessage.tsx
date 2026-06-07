import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export default function ErrorMessage ({ message, className = '' }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className={`flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 ${className}`}>
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
