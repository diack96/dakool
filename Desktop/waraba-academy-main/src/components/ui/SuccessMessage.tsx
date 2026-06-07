import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export default function SuccessMessage ({ message, className = '' }: SuccessMessageProps) {
  if (!message) return null;

  return (
    <div className={`flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 ${className}`}>
      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
