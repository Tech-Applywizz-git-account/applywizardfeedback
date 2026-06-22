import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Shield, ShieldOff, UserX, UserCheck } from 'lucide-react';
import { adminApi } from '@/api/admin.api';
import { Profile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';
import { EmptyState, SearchEmptyState, ErrorState } from '@/components/shared/EmptyState';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { toast } from '@/hooks/use-toast';
import { formatDate, getInitials, cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/store/auth.store';

type Action = 'promote' | 'demote' | 'disable' | 'enable' | null;

interface ActionConfig {
  title: string;
  description: string;
  confirmLabel: string;
  variant: 'default' | 'destructive';
}

const ACTION_CONFIG: Record<NonNullable<Action>, ActionConfig> = {
  promote: { title: 'Promote to Admin', description: 'This user will gain full admin access.', confirmLabel: 'Promote', variant: 'default' },
  demote: { title: 'Remove Admin Privileges', description: 'This user will lose admin access.', confirmLabel: 'Demote', variant: 'destructive' },
  disable: { title: 'Disable Account', description: 'This user will be unable to log in.', confirmLabel: 'Disable', variant: 'destructive' },
  enable: { title: 'Enable Account', description: 'This user will be able to log in again.', confirmLabel: 'Enable', variant: 'default' },
};

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [targetUser, setTargetUser] = useState<Profile | null>(null);
  const [action, setAction] = useState<Action>(null);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users', { search: debouncedSearch, page }],
    queryFn: () => adminApi.getUsers({ search: debouncedSearch || undefined, page, limit: 15 }),
  });

  const mutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: NonNullable<Action> }) => {
      switch (action) {
        case 'promote': return adminApi.promoteUser(userId);
        case 'demote': return adminApi.demoteUser(userId);
        case 'disable': return adminApi.disableUser(userId);
        case 'enable': return adminApi.enableUser(userId);
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Success!', description: `User ${vars.action}d successfully.` });
      setTargetUser(null);
      setAction(null);
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message, variant: 'destructive' });
    },
  });

  const handleAction = (user: Profile, act: NonNullable<Action>) => {
    setTargetUser(user);
    setAction(act);
  };

  const users = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {data?.data?.total ? `${data.data.total} registered users` : 'Manage platform users'}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id="user-search"
          placeholder="Search users..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-9"
        />
      </div>

      <Card>
        {isLoading ? (
          <div className="p-4"><TableSkeleton rows={8} /></div>
        ) : isError ? (
          <div className="p-4"><ErrorState onRetry={refetch} /></div>
        ) : users.length === 0 ? (
          <div className="p-4">
            {debouncedSearch ? <SearchEmptyState query={debouncedSearch} /> : <EmptyState title="No users found" />}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Registered</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Feedback</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    key={u.id}
                    className={cn('border-b hover:bg-accent/30 transition-colors', i % 2 === 0 ? '' : 'bg-muted/10')}
                    id={`user-row-${u.id}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">{getInitials(u.username)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.username}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold',
                        u.role === 'ADMIN'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary text-secondary-foreground'
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold',
                        u.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      )}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u._count?.feedback || 0}</td>
                    <td className="px-4 py-3">
                      {u.id !== currentUser?.id && (
                        <div className="flex items-center gap-1">
                          {u.role === 'USER' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction(u, 'promote')}
                              className="h-7 text-xs gap-1"
                              id={`promote-user-${u.id}`}
                            >
                              <Shield className="w-3 h-3" /> Promote
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction(u, 'demote')}
                              className="h-7 text-xs gap-1 text-orange-600 hover:text-orange-700"
                              id={`demote-user-${u.id}`}
                            >
                              <ShieldOff className="w-3 h-3" /> Demote
                            </Button>
                          )}
                          {u.isActive ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction(u, 'disable')}
                              className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                              id={`disable-user-${u.id}`}
                            >
                              <UserX className="w-3 h-3" /> Disable
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAction(u, 'enable')}
                              className="h-7 text-xs gap-1 text-green-600 hover:text-green-700"
                              id={`enable-user-${u.id}`}
                            >
                              <UserCheck className="w-3 h-3" /> Enable
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)} id="users-prev-page">Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} id="users-next-page">Next</Button>
        </div>
      )}

      {/* Confirm Modal */}
      {action && targetUser && (
        <ConfirmModal
          open={true}
          onOpenChange={() => { setAction(null); setTargetUser(null); }}
          title={ACTION_CONFIG[action].title}
          description={`${ACTION_CONFIG[action].description} User: ${targetUser.username}`}
          confirmLabel={ACTION_CONFIG[action].confirmLabel}
          variant={ACTION_CONFIG[action].variant}
          isLoading={mutation.isPending}
          onConfirm={() => mutation.mutate({ userId: targetUser.id, action })}
        />
      )}
    </div>
  );
};
