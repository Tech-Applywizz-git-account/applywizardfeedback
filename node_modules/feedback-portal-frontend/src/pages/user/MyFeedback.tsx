import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { feedbackApi } from '@/api/feedback.api';
import { FeedbackCategory, FeedbackStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { FeedbackCardSkeleton } from '@/components/shared/SkeletonLoader';
import { EmptyState, SearchEmptyState, ErrorState } from '@/components/shared/EmptyState';
import {
  getStatusColor, getStatusLabel, getCategoryColor, getCategoryLabel, formatDate, cn
} from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

const CATEGORIES: { value: FeedbackCategory | ''; label: string }[] = [
  { value: '', label: 'All Categories' },
  { value: 'BUG', label: 'Bug' },
  { value: 'FEATURE_REQUEST', label: 'Feature Request' },
  { value: 'UI_ISSUE', label: 'UI Issue' },
  { value: 'PERFORMANCE', label: 'Performance' },
  { value: 'CRASH', label: 'Crash' },
  { value: 'OTHER', label: 'Other' },
];

const STATUSES: { value: FeedbackStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'FIXED', label: 'Fixed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'RELEASED', label: 'Released' },
];

export const MyFeedback: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FeedbackCategory | ''>('');
  const [status, setStatus] = useState<FeedbackStatus | ''>('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-feedback', { search: debouncedSearch, category, status, page }],
    queryFn: () =>
      feedbackApi.getAll({
        search: debouncedSearch || undefined,
        category: category || undefined,
        status: status || undefined,
        page,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  const feedback = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const hasFilters = !!(debouncedSearch || category || status);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Feedback</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data?.data?.total ? `${data.data.total} total submissions` : 'All your submitted feedback'}
          </p>
        </div>
        <Button onClick={() => navigate('/feedback/new')} className="gap-2 w-full sm:w-auto" id="new-feedback-btn">
          <Plus className="w-4 h-4" /> New Feedback
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="feedback-search"
            placeholder="Search feedback..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={(v: string) => { setCategory(v === 'all' ? '' : v as FeedbackCategory); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44" id="category-filter">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value || 'all'}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v: string) => { setStatus(v === 'all' ? '' : v as FeedbackStatus); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40" id="status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => <SelectItem key={s.value} value={s.value || 'all'}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <FeedbackCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : feedback.length === 0 ? (
        hasFilters ? (
          <SearchEmptyState query={debouncedSearch} />
        ) : (
          <EmptyState
            title="No feedback yet"
            description="Start by submitting your first bug report or feature request."
            action={{ label: 'Submit Feedback', onClick: () => navigate('/feedback/new') }}
          />
        )
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedback.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
                onClick={() => navigate(`/feedback/${item.id}`)}
                id={`feedback-item-${item.id}`}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors flex-1">
                      {item.title}
                    </h3>
                    <span className={cn('flex-shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full', getStatusColor(item.status))}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

                  <div className="flex items-center flex-wrap gap-2">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-md', getCategoryColor(item.category))}>
                      {getCategoryLabel(item.category)}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>

                    <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                      {item._count && item._count.comments > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {item._count.comments}
                        </span>
                      )}
                      {item.images.length > 0 && (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> {item.images.length}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)} id="prev-page-btn">
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} id="next-page-btn">
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
