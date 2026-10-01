'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/admin');
      } else {
        setError('Incorrect password');
      }
    } catch {
      setError('Something went wrong, try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main id="main" className="safe-x flex min-h-dvh flex-col items-center justify-center py-16">
      <form onSubmit={handleSubmit} className="flex w-full max-w-xs animate-rise flex-col">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mark.webp" width={56} height={56} alt="" className="mx-auto h-14 w-14" />
        <h1 className="mt-6 text-center font-display text-2xl font-light text-white">Admin</h1>
        <p className="mt-2 text-center text-sm text-neutral-400">Staff only. (It’s a staff of one.)</p>

        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'login-error' : undefined}
          autoFocus
          required
          className="field mt-8"
        />
        <p id="login-error" role="alert" className="min-h-6 pt-2 text-center text-sm text-rose-300">
          {error}
        </p>
        <button type="submit" disabled={loading} className="button-primary mt-2 w-full py-3">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <Link href="/" className="text-link mt-10 text-sm">
        Back to the photos
      </Link>
    </main>
  );
}
