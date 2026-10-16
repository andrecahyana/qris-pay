import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { fetchWithToken } from '../../lib/api';

export default function TxDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [tx, setTx] = useState(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await fetchWithToken(`/api/transactions/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setTx(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [id]);

  if (!tx) return (
    <Layout>
      <div className="p-6">Loading...</div>
    </Layout>
  );

  return (
    <Layout>
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-2xl font-bold">Transaction {tx.qrisId}</h1>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Amount</div>
              <div className="text-lg font-medium">Rp {Number(tx.amount).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div className={`inline-flex px-2 py-1 text-xs rounded-full ${tx.status === 'success' ? 'bg-green-100 text-green-700' : tx.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{tx.status}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Merchant</div>
              <div className="font-medium">{tx.merchantId || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Payment Method</div>
              <div className="font-medium">{tx.paymentMethod || '-'}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-gray-500">Raw Payload</div>
            <pre className="mt-2 bg-slate-50 p-3 rounded text-sm overflow-auto">{JSON.stringify(tx.rawPayload || {}, null, 2)}</pre>
          </div>
        </div>
      </div>
    </Layout>
  );
}
