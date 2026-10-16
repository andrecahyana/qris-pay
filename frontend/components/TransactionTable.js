import useSWR from 'swr';
import { fetchWithToken } from '../lib/api';

export default function TransactionTable() {
  const { data, error } = useSWR(['/api/transactions', null], () => fetchWithToken('/api/transactions').then(r => r.json()));

  if (error) return <div className="p-4">Failed to load</div>;
  if (!data) return <div className="p-4">Loading...</div>;

  const items = data.data || [];
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2 border">ID</th>
            <th className="px-4 py-2 border">QRIS ID</th>
            <th className="px-4 py-2 border">Amount</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Merchant</th>
            <th className="px-4 py-2 border">Created At</th>
          </tr>
        </thead>
        <tbody>
          {items.map(tx => (
            <tr key={tx.id}>
              <td className="px-4 py-2 border">{tx.id}</td>
              <td className="px-4 py-2 border">{tx.qrisId}</td>
              <td className="px-4 py-2 border">{tx.amount}</td>
              <td className="px-4 py-2 border">{tx.status}</td>
              <td className="px-4 py-2 border">{tx.merchantId}</td>
              <td className="px-4 py-2 border">{new Date(tx.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
