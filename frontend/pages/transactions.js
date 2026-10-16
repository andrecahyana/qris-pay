import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { fetchWithToken } from '../lib/api';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState('all');
  const [merchant, setMerchant] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [meta, setMeta] = useState({ total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, [status, merchant, from, to, q, page]);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      if (merchant) params.append('merchantId', merchant);
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      if (q) params.append('q', q);
      params.append('page', page);
      params.append('limit', limit);

      const res = await fetchWithToken(`/api/transactions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setTransactions(data.data || []);
      setMeta(data.meta || { total: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function exportCsv() {
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      if (merchant) params.append('merchantId', merchant);
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      if (q) params.append('q', q);

      const token = localStorage.getItem('token');
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const url = `${base}/api/transactions/export?${params.toString()}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = `transactions_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (err) {
      console.error(err);
      alert('Export failed');
    }
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Transactions</p>
            <h1 className="text-3xl font-bold text-slate-800">All Payments</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={exportCsv} className="bg-blue-600 text-white px-4 py-2 rounded">Export CSV</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="border rounded px-3 py-2">
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <input value={merchant} onChange={(e) => { setMerchant(e.target.value); setPage(1); }} placeholder="Merchant ID" className="border rounded px-3 py-2" />
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="border rounded px-3 py-2" />
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="border rounded px-3 py-2" />
          </div>

          <div className="mb-4">
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search QRIS ID or Merchant" className="w-full border rounded px-3 py-2" />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">QRIS ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Merchant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="p-6 text-center">Loading...</td></tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-gray-500 text-center" colSpan={6}>No transactions found.</td>
                  </tr>
                ) : transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">#{tx.id}</td>
                    <td className="px-4 py-3 font-medium">{tx.qrisId}</td>
                    <td className="px-4 py-3">{tx.merchantId || '-'}</td>
                    <td className="px-4 py-3">Rp {Number(tx.amount).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${tx.status === 'success' ? 'bg-green-100 text-green-700' : tx.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(tx.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Total: {meta.total}</div>
            <div className="space-x-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 border rounded">Prev</button>
              <span className="px-3 py-1">Page {page}</span>
              <button onClick={() => setPage(p => p+1)} className="px-3 py-1 border rounded">Next</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
