'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type App = {
  id: string;
  company: string;
  role: string;
  url: string | null;
  status: string;
  appliedAt: string;
};

const STATUS_CONFIG: Record<string, { label: string; badge: string; border: string }> = {
  applied: { label: 'Applied', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', border: 'border-l-blue-500' },
  interviewing: { label: 'Interviewing', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', border: 'border-l-amber-500' },
  offer: { label: 'Offer', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', border: 'border-l-emerald-500' },
  rejected: { label: 'Rejected', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', border: 'border-l-rose-500' },
};

const getInitials = (name: string) => {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
};

export default function ApplicationsPage() {
  const router = useRouter();
  const { status: auth, data: session } = useSession();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const { register, handleSubmit, reset } = useForm<{ company: string; role: string; url: string }>();

  useEffect(() => {
    if (auth === 'unauthenticated') {
      router.push('/');
    }
  }, [auth, router]);

  const { data: apps = [], isLoading } = useQuery<App[]>({
    queryKey: ['applications'],
    queryFn: () => fetch('/api/applications').then((res) => res.json()),
    enabled: auth === 'authenticated',
  });

  const addMutation = useMutation({
    mutationFn: (data: { company: string; role: string; url: string }) =>
      fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      reset();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).then((res) => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/applications/${id}`, { method: 'DELETE' }).then((res) => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
  });

  if (auth === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const filteredApps = filter === 'all' ? apps : apps.filter((a) => a.status === filter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-base text-indigo-400 hover:text-indigo-300 transition">
            Job Tracker
          </Link>
          <span className="text-xs font-medium text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/50">
            {session?.user?.email}
          </span>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold">{apps.length}</div>
            <div className="text-xs text-slate-400 mt-0.5">Total Applications</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-amber-400">{apps.filter(a => a.status === 'interviewing').length}</div>
            <div className="text-xs text-slate-400 mt-0.5">Interviewing</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-emerald-400">{apps.filter(a => a.status === 'offer').length}</div>
            <div className="text-xs text-slate-400 mt-0.5">Offers</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <div className="text-2xl font-bold text-rose-400">{apps.filter(a => a.status === 'rejected').length}</div>
            <div className="text-xs text-slate-400 mt-0.5">Rejected</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition border ${
              filter === 'all'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            All
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition border ${
                filter === key
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* Add Application Form */}
        <form
          onSubmit={handleSubmit((data) => addMutation.mutate(data))}
          className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl mb-8 grid grid-cols-1 md:grid-cols-4 gap-3 shadow-lg"
        >
          <input
            {...register('company', { required: true })}
            placeholder="Company name"
            className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <input
            {...register('role', { required: true })}
            placeholder="Role title"
            className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <input
            {...register('url')}
            placeholder="Job URL (optional)"
            className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl py-2.5 transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {addMutation.isPending ? 'Adding...' : '+ Add Application'}
          </button>
        </form>

        {/* Applications List */}
        {filteredApps.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
            No applications match this filter yet.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApps.map((app) => {
              const statusInfo = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
              return (
                <div
                  key={app.id}
                  className={`bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 ${statusInfo.border} hover:border-slate-700 transition shadow-sm`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(app.company)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-slate-100 text-sm sm:text-base">{app.company}</h3>
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 mb-2">{app.role}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                        {app.url && (
                          <a href={app.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                            Job Link ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                    <select
                      value={app.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: app.id, status: e.target.value })}
                      className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>
                          {cfg.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => deleteMutation.mutate(app.id)}
                      className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-800 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
