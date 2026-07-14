import React, { useState, useEffect, useMemo } from 'react';
import { Search, Users as UsersIcon } from 'lucide-react';
import apiClient from '../api/client';
import DataTable from '../components/ui/DataTable';
import PageLoader from '../components/ui/PageLoader';
import EmptyState from '../components/ui/EmptyState';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiClient.get('/admin/users')
      .then(res => setUsers(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => users.filter(u => u.email.toLowerCase().includes(search.toLowerCase())),
    [users, search]
  );

  const columns = [
    { key: 'email', label: 'Email' },
    {
      key: 'membership_level', label: 'Plan',
      render: (u) => <span className={`badge ${u.membership_level === 'premium' ? 'badge-blue' : 'badge-slate'}`}>{u.membership_level}</span>,
    },
    {
      key: 'created_at', label: 'Joined',
      render: (u) => new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    { key: 'completed_lessons_count', label: 'Lessons Done' },
    { key: 'exam_attempts_count', label: 'Exam Attempts' },
    {
      key: 'total_spent', label: 'Total Spent',
      render: (u) => `$${u.total_spent.toLocaleString()}`,
    },
  ];

  if (loading) return <PageLoader label="Loading users…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Users</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} registered {users.length === 1 ? 'user' : 'users'}.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email…"
            className="field-input !pl-9"
          />
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No users yet" description="Registered students and premium members will show up here." />
      ) : (
        <DataTable columns={columns} rows={filtered} emptyMessage="No users match your search." />
      )}
    </div>
  );
}

export default Users;
