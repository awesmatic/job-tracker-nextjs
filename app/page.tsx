'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      {/* Simple Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-lg text-gray-800">Job Tracker</h1>

          {session && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user?.email}</span>
              <button
                onClick={() => signOut()}
                className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-12 w-full">
        <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center">
          {!session ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Land your next job
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Keep track of all your job applications in one place.
              </p>

              <button
                onClick={() => signIn('google')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded transition"
              >
                Sign in with Google
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Welcome back!
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                You are logged in as {session.user?.email}
              </p>

              <Link
                href="/applications"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
              >
                Go to Applications
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="text-center py-4 text-xs text-gray-500">
        Job Tracker App - Built with Next.js
      </footer>
    </div>
  );
}
