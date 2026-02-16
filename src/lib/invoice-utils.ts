import { Invoice } from '@/types';
import { CheckCircle2, FileText, DollarSign, Clock, AlertCircle } from 'lucide-react';

// Get status icon, color, and label
export function getStatusInfo(status: string) {
  switch (status) {
    case 'paid':
      return {
        icon: CheckCircle2,
        color: 'text-green-600 bg-green-50 border-green-200',
        label: 'Paid',
      };
    case 'partial':
      return {
        icon: DollarSign,
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        label: 'Partial',
      };
    case 'pending':
      return {
        icon: Clock,
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        label: 'Pending',
      };
    case 'overdue':
      return {
        icon: AlertCircle,
        color: 'text-red-600 bg-red-50 border-red-200',
        label: 'Overdue',
      };
    default:
      return {
        icon: FileText,
        color: 'text-gray-600 bg-gray-50 border-gray-200',
        label: 'Draft',
      };
  }
}
