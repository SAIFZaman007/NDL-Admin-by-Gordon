import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Layers, HelpCircle, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import apiClient from '../api/client';
import StatCard from '../components/ui/StatCard';
import PageLoader from '../components/ui/PageLoader';

const CHART_TOOLTIP_STYLE = {
  background: '#12141C',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  fontSize: '12px',
  color: '#E2E8F0',
};

function toSeries(dict) {
  return Object.entries(dict || {}).map(([label, value]) => ({ label, value }));
}

function ChartCard({ title, children }) {
  return (
    <div className="glass-card-static rounded-2xl p-6 space-y-4">
      <h3 className="font-display font-bold text-white text-sm">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiClient.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader label="Loading platform stats…" />;
  if (error || !stats) {
    return <div className="glass-card-static rounded-2xl p-10 text-center text-slate-500">Couldn't load stats. Try refreshing.</div>;
  }

  const revenueSeries = toSeries(stats.revenue_growth);
  const userSeries = toSeries(stats.user_growth);
  const enrollmentSeries = stats.enrollments.map(e => ({
    title: e.title.length > 18 ? `${e.title.slice(0, 18)}…` : e.title,
    fullTitle: e.title,
    enrollments: e.enrollment_count,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Platform-wide stats, updated in real time from the database.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.total_users} accent="#3B82F6" />
        <StatCard icon={BookOpen} label="Courses" value={stats.total_courses} accent="#8B5CF6" />
        <StatCard icon={Layers} label="Lessons" value={stats.total_lessons} accent="#10B981" />
        <StatCard icon={HelpCircle} label="Exam Questions" value={stats.total_questions} accent="#F97316" />
        <StatCard icon={DollarSign} label="Total Revenue" value={`$${stats.total_revenue.toLocaleString()}`} accent="#F59E0B" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue Growth">
          {revenueSeries.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-600 text-sm">No payments yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0066FF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0066FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [`$${v}`, 'Revenue']} />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="User Growth (Cumulative)">
          {userSeries.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-600 text-sm">No users yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="userFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [v, 'Users']} />
                <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} fill="url(#userFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Enrollments by Course">
        {enrollmentSeries.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 text-sm">No courses yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={enrollmentSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="title" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                formatter={(v) => [v, 'Enrollments']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullTitle || ''}
              />
              <Bar dataKey="enrollments" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}

export default Overview;
