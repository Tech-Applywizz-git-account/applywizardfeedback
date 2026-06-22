import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users, MessageSquare, Clock, CheckCircle2, XCircle, Package, TrendingUp, AlertTriangle
} from 'lucide-react';
import { adminApi } from '@/api/admin.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardSkeleton } from '@/components/shared/SkeletonLoader';
import { ErrorState } from '@/components/shared/EmptyState';
import {
  BarChart, Bar as _Bar, XAxis as _XAxis, YAxis as _YAxis, CartesianGrid, Tooltip as _Tooltip, ResponsiveContainer,
  PieChart, Pie as _Pie, Cell, AreaChart, Area as _Area
} from 'recharts';

// recharts 2.x has known TS typing issues with React 18 strict mode
const Bar = _Bar as any;
const XAxis = _XAxis as any;
const YAxis = _YAxis as any;
const Tooltip = _Tooltip as any;
const Pie = _Pie as any;
const Area = _Area as any;
import { getCategoryLabel, getStatusLabel, formatDate } from '@/lib/utils';

const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bgColor }) => (
  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold tracking-tight mt-0.5">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const AdminDashboard: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={refetch} />;

  const stats = data?.data;
  const feedbackStats = stats?.feedback;
  const userStats = stats?.users;

  // Process chart data
  const byStatus = feedbackStats?.byStatus?.map((s) => ({
    name: getStatusLabel(s.status),
    value: s._count.status,
  })) || [];

  const byCategory = feedbackStats?.byCategory?.map((c) => ({
    name: getCategoryLabel(c.category),
    value: c._count.category,
  })) || [];

  const trend = feedbackStats?.recentTrend?.map((t) => ({
    date: formatDate(t.date),
    count: Number(t.count),
  })) || [];

  const statusMap: Record<string, number> = {};
  feedbackStats?.byStatus?.forEach((s) => { statusMap[s.status] = s._count.status; });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={userStats?.total || 0} icon={Users} color="text-primary" bgColor="bg-primary/10" />
        <StatCard title="Total Feedback" value={feedbackStats?.total || 0} icon={MessageSquare} color="text-blue-600 dark:text-blue-400" bgColor="bg-blue-500/10" />
        <StatCard title="Open / New" value={statusMap['NEW'] || 0} icon={AlertTriangle} color="text-yellow-600 dark:text-yellow-400" bgColor="bg-yellow-500/10" />
        <StatCard title="In Progress" value={statusMap['IN_PROGRESS'] || 0} icon={Clock} color="text-orange-600 dark:text-orange-400" bgColor="bg-orange-500/10" />
        <StatCard title="Fixed" value={statusMap['FIXED'] || 0} icon={CheckCircle2} color="text-green-600 dark:text-green-400" bgColor="bg-green-500/10" />
        <StatCard title="Released" value={statusMap['RELEASED'] || 0} icon={Package} color="text-purple-600 dark:text-purple-400" bgColor="bg-purple-500/10" />
        <StatCard title="Rejected" value={statusMap['REJECTED'] || 0} icon={XCircle} color="text-red-600 dark:text-red-400" bgColor="bg-red-500/10" />
        <StatCard title="Active Users" value={userStats?.active || 0} icon={TrendingUp} color="text-teal-600 dark:text-teal-400" bgColor="bg-teal-500/10" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Feedback by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={byStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {byStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Feedback by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byCategory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Feedback Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
