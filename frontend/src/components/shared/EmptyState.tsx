import React from 'react';
import { Inbox, SearchX, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nothing here yet',
  description = 'Get started by creating your first item.',
  icon: Icon = Inbox,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
    {action && (
      <Button onClick={action.onClick} variant="default">
        {action.label}
      </Button>
    )}
  </div>
);

export const SearchEmptyState: React.FC<{ query?: string }> = ({ query }) => (
  <EmptyState
    icon={SearchX}
    title="No results found"
    description={query ? `No items match "${query}". Try adjusting your search or filters.` : 'No items match your current filters.'}
  />
);

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong.',
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
    <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
      <AlertCircle className="w-8 h-8 text-destructive" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">Error</h3>
    <p className="text-sm text-muted-foreground max-w-sm mb-6">{message}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    )}
  </div>
);
