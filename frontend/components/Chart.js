import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();

  const navs = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/transactions', label: 'Transactions' },
  ];

  function logout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white p-6">
        <div className="text-2xl font-bold">QRIS Pay</div>
        <div className="mt-8 space-y-2">
          {navs.map((item) => (
            <Link key={item.href} href={item.href} className={`block px-3 py-2 rounded-lg ${router.pathname === item.href ? 'bg-slate-700' : 'hover:bg-slate-800'}`}>
              {item.label}
            </Link>
          ))}
        </div>

        <button onClick={logout} className="mt-10 w-full bg-red-500 hover:bg-red-600 p-2 rounded-lg text-sm font-medium">
          Logout
        </button>
      </aside>

      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
