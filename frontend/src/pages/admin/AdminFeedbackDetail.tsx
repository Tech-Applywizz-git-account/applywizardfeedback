import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft, Calendar, Clock, User, Send, Loader2, Download, Shield, Save
} from 'lucide-react';
import { feedbackApi } from '@/api/feedback.api';
import { adminApi } from '@/api/admin.api';
import { useAuthStore } from '@/store/auth.store';
import { commentSchema, CommentSchema } from '@/lib/schemas';
import { FeedbackStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/shared/SkeletonLoader';
import { ErrorState } from '@/components/shared/EmptyState';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
  getStatusColor, getStatusLabel, getCategoryColor, getCategoryLabel,
  formatDate, formatRelativeTime, getInitials, cn
} from '@/lib/utils';

const STATUSES: { value: FeedbackStatus; label: string }[] = [
  { value: 'NEW', label: '🔵 New' },
  { value: 'IN_PROGRESS', label: '🟡 In Progress' },
  { value: 'FIXED', label: '🟢 Fixed' },
  { value: 'REJECTED', label: '🔴 Rejected' },
  { value: 'RELEASED', label: '🟣 Released' },
];

export const AdminFeedbackDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<FeedbackStatus | ''>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-feedback-detail', id],
    queryFn: () => feedbackApi.getById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (data?.data) setSelectedStatus(data.data.status);
  }, [data?.data?.status]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentSchema>({
    resolver: zodResolver(commentSchema),
  });

  const statusMutation = useMutation({
    mutationFn: (status: FeedbackStatus) => adminApi.updateFeedbackStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      toast({ title: 'Status updated!' });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.response?.data?.message, variant: 'destructive' }),
  });

  const commentMutation = useMutation({
    mutationFn: (data: CommentSchema) => feedbackApi.addComment(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback-detail', id] });
      reset();
      toast({ title: 'Comment added!' });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.response?.data?.message, variant: 'destructive' }),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data?.data) return <ErrorState onRetry={refetch} />;

  const feedback = data.data;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} id="back-btn">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold tracking-tight">Feedback Management</h1>
      </div>

      {/* Status Update */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-sm font-semibold">Update Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(v) => setSelectedStatus(v as FeedbackStatus)}
              >
                <SelectTrigger className="mt-1.5 bg-background" id="admin-status-select">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="mt-5"
              disabled={statusMutation.isPending || selectedStatus === feedback.status}
              onClick={() => selectedStatus && statusMutation.mutate(selectedStatus)}
              id="save-status-btn"
            >
              {statusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main content */}
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-bold">{feedback.title}</h2>
            <span className={cn('flex-shrink-0 px-3 py-1 rounded-full text-sm font-semibold', getStatusColor(feedback.status))}>
              {getStatusLabel(feedback.status)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={cn('px-2.5 py-1 rounded-md text-xs font-semibold', getCategoryColor(feedback.category))}>
              {getCategoryLabel(feedback.category)}
            </span>
            {feedback.user && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" /> {feedback.user.username} ({feedback.user.email})
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" /> {formatDate(feedback.createdAt)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" /> Updated {formatRelativeTime(feedback.updatedAt)}
            </div>
          </div>

          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Description</h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{feedback.description}</p>
          </div>

          {feedback.images && feedback.images.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Screenshots ({feedback.images.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {feedback.images.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-video rounded-lg overflow-hidden border cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => setSelectedImage(img.imageUrl)}
                    >
                      <img src={img.imageUrl} alt="Screenshot" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a href={img.imageUrl} download onClick={(e) => e.stopPropagation()} className="p-1.5 bg-white rounded-lg" id={`admin-download-${img.id}`}>
                          <Download className="w-4 h-4 text-gray-700" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Discussion ({feedback.comments?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {feedback.comments && feedback.comments.length > 0 ? (
            <div className="space-y-4">
              {feedback.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={cn('text-xs', comment.isAdmin ? 'bg-primary text-primary-foreground' : '')}>
                      {getInitials(comment.user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">{comment.user.username}</span>
                      {comment.isAdmin && (
                        <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                          <Shield className="w-3 h-3" /> Admin
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    <div className={cn('rounded-xl px-4 py-3 text-sm', comment.isAdmin ? 'bg-primary/10 border border-primary/20' : 'bg-muted')}>
                      {comment.comment}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No comments yet.</p>
          )}

          <Separator />

          <form onSubmit={handleSubmit((data) => commentMutation.mutate(data))} className="space-y-3" id="admin-comment-form">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">{user ? getInitials(user.username) : 'A'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea id="admin-comment-input" placeholder="Add admin response..." className="min-h-[80px]" {...register('comment')} />
                {errors.comment && <p className="text-xs text-destructive">{errors.comment.message}</p>}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Posting as Admin</p>
                  <Button type="submit" size="sm" disabled={commentMutation.isPending} id="admin-submit-comment">
                    {commentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Reply</>}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Screenshot" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
};
