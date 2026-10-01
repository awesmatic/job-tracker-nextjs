'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <main className="min-h-screen p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Job Tracker</h1>

      {!session ? (
        <button
          onClick={() => signIn('google')}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Sign in with Google
        </button>
      ) : (
        <div className="space-y-4">
          <p>
            Signed in as <strong>{session.user?.email}</strong>
          </p>
          <Link
            href="/applications"
            className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Go to Applications
          </Link>
          <button
            onClick={() => signOut()}
            className="block text-sm text-gray-600 underline"
          >
            Sign out
          </button>
        </div>
      )}
    </main>
  );
}
