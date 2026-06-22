import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import { signUpSchema, SignUpSchema } from '@/lib/schemas';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpSchema) => {
    setIsLoading(true);
    try {
      const res = await authApi.signUp(data);
      setUser(res.data.user);
      setToken(res.data.token);
      toast({ title: 'Account created!', description: 'Welcome to BugTracker.' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({
        title: 'Registration failed',
        description: err.response?.data?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Create account</h2>
        <p className="text-muted-foreground mt-2">Join the beta testing program</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="register-form">
        <div className="space-y-2">
          <Label htmlFor="register-email">Email</Label>
          <Input id="register-email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-username">Username</Label>
          <Input id="register-username" type="text" placeholder="johndoe" {...register('username')} />
          {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">Password</Label>
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 chars with uppercase, number, symbol"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full mt-2" disabled={isLoading} id="register-submit-btn">
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
          ) : (
            <><UserPlus className="w-4 h-4" /> Create Account</>
          )}
        </Button>
      </form>

      <p className="text-sm text-center text-muted-foreground mt-6">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};
