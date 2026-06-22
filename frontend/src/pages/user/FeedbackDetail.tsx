import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft, Calendar, Clock, MessageSquare, Image as ImageIcon,
  Send, Loader2, Download, Shield, User
} from 'lucide-react';
import { feedbackApi } from '@/api/feedback.api';
import { useAuthStore } from '@/store/auth.store';
import { commentSchema, CommentSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/shared/SkeletonLoader';
import { ErrorState } from '@/components/shared/EmptyState';
import { toast } from '@/hooks/use-toast';
import {
  getStatusColor, getStatusLabel, getCategoryColor, getCategoryLabel,
  formatDate, formatDateTime, formatRelativeTime, getInitials, cn
} from '@/lib/utils';

export const FeedbackDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['feedback', id],
    queryFn: () => feedbackApi.getById(id!),
    enabled: !!id,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentSchema>({
    resolver: zodResolver(commentSchema),
  });

  const commentMutation = useMutation({
    mutationFn: (data: CommentSchema) => feedbackApi.addComment(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', id] });
      reset();
      toast({ title: 'Comment added!' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !data?.data) return <ErrorState onRetry={refetch} />;

  const feedback = data.data;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} id="back-btn">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold tracking-tight">Feedback Details</h1>
      </div>

      {/* Main Card */}
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
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Created {formatDate(feedback.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Updated {formatRelativeTime(feedback.updatedAt)}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Description</h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{feedback.description}</p>
          </div>

          {/* Screenshots */}
          {feedback.images && feedback.images.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Screenshots ({feedback.images.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {feedback.images.map((img) => (
                    <div
                      key={img.id}
                      className="group relative aspect-video rounded-lg overflow-hidden border cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => setSelectedImage(img.imageUrl)}
                      id={`screenshot-${img.id}`}
                    >
                      <img src={img.imageUrl} alt="Screenshot" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a
                          href={img.imageUrl}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 bg-white rounded-lg"
                          id={`download-screenshot-${img.id}`}
                        >
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
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Discussion ({feedback.comments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {/* Comment list */}
          {feedback.comments && feedback.comments.length > 0 ? (
            <div className="space-y-4">
              {feedback.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3" id={`comment-${comment.id}`}>
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
                    <div className={cn(
                      'rounded-xl px-4 py-3 text-sm',
                      comment.isAdmin
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-muted'
                    )}>
                      {comment.comment}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No comments yet. Be the first to comment!</p>
          )}

          <Separator />

          {/* Add comment */}
          <form
            onSubmit={handleSubmit((data) => commentMutation.mutate(data))}
            className="space-y-3"
            id="comment-form"
          >
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="text-xs">{user ? getInitials(user.username) : '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  id="comment-input"
                  placeholder="Add a comment..."
                  className="min-h-[80px]"
                  {...register('comment')}
                />
                {errors.comment && <p className="text-xs text-destructive">{errors.comment.message}</p>}
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={commentMutation.isPending} id="submit-comment-btn">
                    {commentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Comment</>}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} alt="Screenshot" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
};
