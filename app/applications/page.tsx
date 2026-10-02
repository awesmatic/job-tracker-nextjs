'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

type Application = {
  id: string;
  company: string;
  role: string;
  url: string | null;
  status: string;
  appliedAt: string;
};

type FormValues = {
  company: string;
  role: string;
  url: string;
};

const STATUSES = ['applied', 'interviewing', 'rejected', 'offer'];

export default function ApplicationsPage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset } = useForm<FormValues>();

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/');
    }
  }, [sessionStatus, router]);

  const { data: apps = [], isLoading } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: async () => {
      const res = await fetch('/api/applications');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: sessionStatus === 'authenticated',
  });

  const addApp = useMutation({
    mutationFn: async (newApp: FormValues) => {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp),
      });
      if (!res.ok) throw new Error('Failed to add');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      reset();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const deleteApp = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  if (sessionStatus === 'loading' || isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Applications</h1>
        <Link href="/" className="text-sm text-gray-500 underline">
          Home
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="border rounded-lg p-3">
          <div className="text-2xl font-semibold">{apps.length}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="border rounded-lg p-3">
          <div className="text-2xl font-semibold">
            {apps.filter((a) => a.status === 'interviewing').length}
          </div>
          <div className="text-xs text-gray-500">Interviewing</div>
        </div>
        <div className="border rounded-lg p-3">
          <div className="text-2xl font-semibold">
            {apps.filter((a) => a.status === 'offer').length}
          </div>
          <div className="text-xs text-gray-500">Offers</div>
        </div>
        <div className="border rounded-lg p-3">
          <div className="text-2xl font-semibold">
            {apps.filter((a) => a.status === 'rejected').length}
          </div>
          <div className="text-xs text-gray-500">Rejected</div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) => addApp.mutate(data))}
        className="space-y-3 mb-8 p-4 border rounded-lg"
      >
        <input
          {...register('company', { required: true })}
          placeholder="Company"
          className="w-full border p-2 rounded"
        />
        <input
          {...register('role', { required: true })}
          placeholder="Role"
          className="w-full border p-2 rounded"
        />
        <input
          {...register('url')}
          placeholder="Job URL (optional)"
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          disabled={addApp.isPending}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {addApp.isPending ? 'Adding...' : 'Add application'}
        </button>
      </form>

      {apps.length === 0 ? (
        <p className="text-gray-500">No applications yet. Add your first one above.</p>
      ) : (
        <ul className="space-y-3">
          {apps.map((app) => (
            <li key={app.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="font-semibold">{app.company}</div>
                  <div className="text-sm text-gray-600">{app.role}</div>
                  {app.url && (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener"
                      className="text-xs text-blue-600 underline"
                    >
                      Job posting
                    </a>
                  )}
                </div>
                <button
                  onClick={() => deleteApp.mutate(app.id)}
                  className="text-xs text-gray-400 hover:text-red-600"
                >
                  Delete
                </button>
              </div>

              <div className="flex gap-2 mt-3">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus.mutate({ id: app.id, status: s })}
                    className={`text-xs px-2 py-1 rounded border capitalize ${
                      app.status === s
                        ? 'bg-black text-white'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
