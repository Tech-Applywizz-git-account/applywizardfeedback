import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { forgotPasswordSchema, ForgotPasswordSchema } from '@/lib/schemas';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Check your email</h2>
        <p className="text-muted-foreground mb-6">
          If an account exists, we've sent a password reset link.
        </p>
        <Link to="/auth/login">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Forgot password?</h2>
        <p className="text-muted-foreground mt-2">Enter your email to receive a reset link</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="forgot-password-form">
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input id="forgot-email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading} id="forgot-password-submit">
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
          ) : (
            <><Mail className="w-4 h-4" /> Send Reset Link</>
          )}
        </Button>
      </form>

      <p className="text-sm text-center text-muted-foreground mt-6">
        <Link to="/auth/login" className="text-primary font-medium hover:underline flex items-center justify-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Back to login
        </Link>
      </p>
    </div>
  );
};
