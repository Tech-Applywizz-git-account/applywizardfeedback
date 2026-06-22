import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { adminApi } from '@/api/admin.api';
import { FeedbackCategory, FeedbackStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';
import { EmptyState, SearchEmptyState, ErrorState } from '@/components/shared/EmptyState';
import { getStatusColor, getStatusLabel, getCategoryColor, getCategoryLabel, formatDate, cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

export const AdminFeedback: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FeedbackCategory | ''>('');
  const [status, setStatus] = useState<FeedbackStatus | ''>('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-feedback', { search: debouncedSearch, category, status, page, sortBy, sortOrder }],
    queryFn: () => adminApi.getFeedback({
      search: debouncedSearch || undefined,
      category: category || undefined,
      status: status || undefined,
      page, limit: 15, sortBy, sortOrder,
    }),
  });

  const feedback = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const hasFilters = !!(debouncedSearch || category || status);

  const toggleSort = (col: 'createdAt' | 'updatedAt') => {
    if (sortBy === col) setSortOrder((o) => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortOrder('desc'); }
  };

  const SortIcon = ({ col }: { col: string }) =>
    sortBy === col
      ? sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3 opacity-30" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Feedback</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {data?.data?.total ? `${data.data.total} total entries` : 'Manage all user feedback'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="admin-feedback-search"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={(v: string) => { setCategory(v === 'all' ? '' : v as FeedbackCategory); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44" id="admin-category-filter">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {[
              { value: 'all', label: 'All Categories' },
              { value: 'BUG', label: 'Bug' },
              { value: 'FEATURE_REQUEST', label: 'Feature Request' },
              { value: 'UI_ISSUE', label: 'UI Issue' },
              { value: 'PERFORMANCE', label: 'Performance' },
              { value: 'CRASH', label: 'Crash' },
              { value: 'OTHER', label: 'Other' },
            ].map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v: string) => { setStatus(v === 'all' ? '' : v as FeedbackStatus); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40" id="admin-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {[
              { value: 'all', label: 'All Statuses' },
              { value: 'NEW', label: 'New' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'FIXED', label: 'Fixed' },
              { value: 'REJECTED', label: 'Rejected' },
              { value: 'RELEASED', label: 'Released' },
            ].map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        {isLoading ? (
          <CardContent className="p-4"><TableSkeleton rows={8} /></CardContent>
        ) : isError ? (
          <CardContent className="p-4"><ErrorState onRetry={refetch} /></CardContent>
        ) : feedback.length === 0 ? (
          <CardContent className="p-4">
            {hasFilters ? <SearchEmptyState query={debouncedSearch} /> : <EmptyState title="No feedback yet" />}
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th
                    className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort('createdAt')}
                  >
                    <span className="flex items-center gap-1">Created <SortIcon col="createdAt" /></span>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((item, i) => (
                  <tr
                    key={item.id}
                    className={cn('border-b hover:bg-accent/50 cursor-pointer transition-colors', i % 2 === 0 ? '' : 'bg-muted/20')}
                    onClick={() => navigate(`/admin/feedback/${item.id}`)}
                    id={`admin-feedback-row-${item.id}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium line-clamp-1 max-w-xs">{item.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{item.user?.username || '-'}</p>
                        <p className="text-xs text-muted-foreground">{item.user?.email || '-'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-md text-xs font-medium', getCategoryColor(item.category))}>
                        {getCategoryLabel(item.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold', getStatusColor(item.status))}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); navigate(`/admin/feedback/${item.id}`); }}>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)} id="admin-prev-page">Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} id="admin-next-page">Next</Button>
        </div>
      )}
    </div>
  );
};
