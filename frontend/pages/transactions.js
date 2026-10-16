import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { fetchWithToken } from '../lib/api';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const url = status === 'all' ? '/api/transactions?limit=20' : `/api/transactions?limit=20&status=${status}`;
        const res = await fetchWithToken(url);
        const data = await res.json();
        setTransactions(data.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [status]);

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Transactions</p>
            <h1 className="text-3xl font-bold text-slate-800">All Payments</h1>
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none">
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
                {transactions.length === 0 ? (
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
        </div>
      </div>
    </Layout>
  );
}
