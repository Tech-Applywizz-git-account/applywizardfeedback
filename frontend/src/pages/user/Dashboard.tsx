import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, CheckCircle2, Package, Clock, Plus, ArrowRight, TrendingUp
} from 'lucide-react';
import { feedbackApi } from '@/api/feedback.api';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton, FeedbackCardSkeleton } from '@/components/shared/SkeletonLoader';
import { EmptyState } from '@/components/shared/EmptyState';
import { getStatusColor, getStatusLabel, getCategoryLabel, formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  description?: string;
}> = ({ title, value, icon: Icon, color, description }) => (
  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', color)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: feedbackRes, isLoading } = useQuery({
    queryKey: ['my-feedback', { limit: 5 }],
    queryFn: () => feedbackApi.getAll({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  const { data: allFeedback, isLoading: statsLoading } = useQuery({
    queryKey: ['my-feedback-stats'],
    queryFn: () => feedbackApi.getAll({ limit: 100 }),
  });

  const feedback = feedbackRes?.data?.items || [];
  const allItems = allFeedback?.data?.items || [];

  const stats = {
    total: allFeedback?.data?.total || 0,
    open: allItems.filter((f) => f.status === 'NEW' || f.status === 'IN_PROGRESS').length,
    fixed: allItems.filter((f) => f.status === 'FIXED').length,
    released: allItems.filter((f) => f.status === 'RELEASED').length,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-primary">{user?.username}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your feedback activity</p>
        </div>
        <Button onClick={() => navigate('/feedback/new')} className="gap-2 shadow-lg w-full sm:w-auto" id="dashboard-new-feedback-btn">
          <Plus className="w-4 h-4" /> Submit Feedback
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Submitted" value={stats.total} icon={MessageSquare} color="bg-primary/10 text-primary" description="All time" />
            <StatCard title="Open / In Progress" value={stats.open} icon={Clock} color="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" description="Awaiting review" />
            <StatCard title="Fixed" value={stats.fixed} icon={CheckCircle2} color="bg-green-500/10 text-green-600 dark:text-green-400" description="Resolved" />
            <StatCard title="Released" value={stats.released} icon={Package} color="bg-purple-500/10 text-purple-600 dark:text-purple-400" description="In production" />
          </>
        )}
      </div>

      {/* Recent Feedback */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Recent Submissions</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/feedback')} className="gap-1 text-primary" id="view-all-feedback-btn">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <FeedbackCardSkeleton key={i} />)}
          </div>
        ) : feedback.length === 0 ? (
          <EmptyState
            title="No feedback yet"
            description="Submit your first bug report or feature request to get started."
            action={{ label: 'Submit Feedback', onClick: () => navigate('/feedback/new') }}
          />
        ) : (
          <div className="space-y-3">
            {feedback.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                onClick={() => navigate(`/feedback/${item.id}`)}
                id={`feedback-card-${item.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base group-hover:text-primary transition-colors truncate">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                    </div>
                    <div className={cn('flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full', getStatusColor(item.status))}>
                      {getStatusLabel(item.status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-muted-foreground">{getCategoryLabel(item.category)}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(item.createdAt)}</span>
                    {item._count && item._count.comments > 0 && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{item._count.comments} comments</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
