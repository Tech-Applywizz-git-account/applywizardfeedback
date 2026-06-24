import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import {
  Upload, X, Image, Send, Loader2, ArrowLeft, AlertCircle
} from 'lucide-react';
import { feedbackSchema, FeedbackSchema } from '@/lib/schemas';
import { feedbackApi } from '@/api/feedback.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'BUG', label: '🐛 Bug' },
  { value: 'FEATURE_REQUEST', label: '✨ Feature Request' },
  { value: 'UI_ISSUE', label: '🎨 UI Issue' },
  { value: 'PERFORMANCE', label: '⚡ Performance' },
  { value: 'CRASH', label: '💥 Crash' },
  { value: 'OTHER', label: '📋 Other' },
];

export const SubmitFeedback: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FeedbackSchema>({
    resolver: zodResolver(feedbackSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: { form: FeedbackSchema; files: File[] }) =>
      feedbackApi.create(data.form, data.files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-feedback'] });
      toast({ title: '✅ Feedback submitted!', description: 'Thank you for your report.' });
      navigate('/feedback');
    },
    onError: (err: any) => {
      toast({
        title: 'Submission failed',
        description: err.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > 10) {
      toast({ title: 'Too many files', description: 'Maximum 10 images allowed.', variant: 'destructive' });
      return;
    }
    const newFiles = acceptedFiles.slice(0, 10 - images.length);
    setImages((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }, [images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (fileRejections) => {
      const errorMsg = fileRejections[0]?.errors[0]?.message || 'File not supported or too large';
      toast({
        title: 'Image rejected',
        description: errorMsg,
        variant: 'destructive',
      });
    },
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    } as any,
    maxSize: 10 * 1024 * 1024,
    maxFiles: 10,
  } as any);

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FeedbackSchema) => {
    mutation.mutate({ form: data, files: images });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} id="back-btn">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Submit Feedback</h1>
          <p className="text-muted-foreground text-sm">Report a bug, request a feature, or share your thoughts</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" id="submit-feedback-form">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="feedback-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="feedback-title"
                placeholder="Brief, descriptive title..."
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.title.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Select onValueChange={(v: string) => setValue('category', v as FeedbackSchema['category'])}>
                <SelectTrigger id="feedback-category">
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.category.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="feedback-description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="feedback-description"
                placeholder="Describe the issue in detail. Include steps to reproduce, expected behavior, and actual behavior..."
                className="min-h-[150px]"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.description.message}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <Label>Screenshots (optional, max 10)</Label>
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
                  isDragActive
                    ? 'border-primary bg-primary/5 scale-[1.01]'
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                )}
                id="image-dropzone"
              >
                <input {...(getInputProps() as any)} />
                <Upload className={cn('w-8 h-8 mx-auto mb-2', isDragActive ? 'text-primary' : 'text-muted-foreground')} />
                <p className="text-sm font-medium">
                  {isDragActive ? 'Drop images here...' : 'Drag & drop images here'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse — PNG, JPG, WEBP, max 10MB each
                </p>
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                      <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        id={`remove-image-${i}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
              id="submit-feedback-btn"
            >
              {mutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="w-4 h-4" /> Submit Feedback</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
