import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronUp, ChevronDown, ExternalLink, Paperclip } from 'lucide-react';
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
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FeedbackCategory | ''>('');
  const [status, setStatus] = useState<FeedbackStatus | ''>((searchParams.get('status') as FeedbackStatus) || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [datePreset, setDatePreset] = useState<string>('all');

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    setPage(1);
    
    const today = new Date();
    // Use local date string YYYY-MM-DD
    const formatDateStr = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (preset === 'all' || preset === 'custom') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      const dateStr = formatDateStr(today);
      setStartDate(dateStr);
      setEndDate(dateStr);
    } else if (preset === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = formatDateStr(yesterday);
      setStartDate(dateStr);
      setEndDate(dateStr);
    } else if (preset === 'last_3') {
      const start = new Date(today);
      start.setDate(start.getDate() - 3);
      setStartDate(formatDateStr(start));
      setEndDate(formatDateStr(today));
    } else if (preset === 'last_15') {
      const start = new Date(today);
      start.setDate(start.getDate() - 15);
      setStartDate(formatDateStr(start));
      setEndDate(formatDateStr(today));
    } else if (preset === 'this_month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(formatDateStr(start));
      setEndDate(formatDateStr(today));
    }
  };

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-feedback', { search: debouncedSearch, category, status, startDate, endDate, page, sortBy, sortOrder }],
    queryFn: () => adminApi.getFeedback({
      search: debouncedSearch || undefined,
      category: category || undefined,
      status: status || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page, limit: 15, sortBy, sortOrder,
    }),
  });

  const feedback = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const hasFilters = !!(debouncedSearch || category || status || startDate || endDate);

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
        <Select value={datePreset} onValueChange={handleDatePresetChange}>
          <SelectTrigger className="w-full sm:w-40" id="admin-date-preset">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="last_3">Last 3 Days</SelectItem>
            <SelectItem value="last_15">Last 15 Days</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {datePreset === 'custom' && (
          <div className="flex items-center gap-2">
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              onClick={(e) => {
                try {
                  if ('showPicker' in e.currentTarget) {
                    (e.currentTarget as HTMLInputElement).showPicker();
                  }
                } catch (err) {}
              }}
              className="w-full sm:w-36 cursor-pointer"
              title="Start Date"
            />
            <span className="text-muted-foreground">-</span>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              onClick={(e) => {
                try {
                  if ('showPicker' in e.currentTarget) {
                    (e.currentTarget as HTMLInputElement).showPicker();
                  }
                } catch (err) {}
              }}
              className="w-full sm:w-36 cursor-pointer"
              title="End Date"
            />
          </div>
        )}
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
                      <div className="flex items-center gap-3">
                        {item.images && item.images.length > 0 ? (
                          <div className="w-10 h-10 rounded-md overflow-hidden border shrink-0 bg-muted">
                            <img src={item.images[0].imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-md border shrink-0 bg-muted/50 flex items-center justify-center" title="No images attached">
                            <span className="text-[10px] text-muted-foreground/50 font-medium">None</span>
                          </div>
                        )}
                        <p className="font-medium line-clamp-2 max-w-xs">{item.title}</p>
                      </div>
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
