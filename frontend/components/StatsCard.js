import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('token')) {
      router.push('/dashboard');
    }
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Login failed');
      return;
    }

    localStorage.setItem('token', data.token);
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border p-8">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-medium">QRIS Monitor</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-800">Sign In</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="admin@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="password" />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition">
            Login
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-500">
          Demo account: <span className="font-medium">admin@example.com / password</span>
        </div>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-blue-600 text-sm">Skip login and open dashboard</Link>
        </div>
      </div>
    </div>
  );
}
