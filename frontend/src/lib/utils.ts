import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy HH:mm');
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    FIXED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    RELEASED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    BUG: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    FEATURE_REQUEST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    UI_ISSUE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    PERFORMANCE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    CRASH: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    OTHER: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  };
  return map[category] || 'bg-gray-100 text-gray-700';
}

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    BUG: 'Bug',
    FEATURE_REQUEST: 'Feature Request',
    UI_ISSUE: 'UI Issue',
    PERFORMANCE: 'Performance',
    CRASH: 'Crash',
    OTHER: 'Other',
  };
  return map[category] || category;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    NEW: 'New',
    IN_PROGRESS: 'In Progress',
    FIXED: 'Fixed',
    REJECTED: 'Rejected',
    RELEASED: 'Released',
  };
  return map[status] || status;
}

export function getInitials(name: string): string {
  return name
    .split(/[\s_]+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
