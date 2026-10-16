import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { fetchWithToken } from '../lib/api';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';

const Chart = dynamic(() => import('../components/Chart'), { ssr: false });

export default function DashboardPage() {
  const [overview, setOverview] = useState({ summary: {}, daily: [] });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const overviewRes = await fetchWithToken('/api/analytics/overview');
        const overviewData = await overviewRes.json();
        setOverview(overviewData);

        const txRes = await fetchWithToken('/api/transactions?limit=8');
        const txData = await txRes.json();
        setTransactions(txData.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const summary = overview.summary || {};
  const chartData = overview.daily || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Overview</p>
            <h1 className="text-3xl font-bold text-slate-800">Payment Monitoring Dashboard</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard title="Total Transactions" value={summary.total_transactions || 0} tone="blue" />
          <StatsCard title="Success" value={summary.success_count || 0} tone="green" />
          <StatsCard title="Failed" value={summary.failed_count || 0} tone="red" />
          <StatsCard title="Revenue" value={`Rp ${Number(summary.successful_amount || 0).toLocaleString()}`} tone="amber" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border p-4">
            <h2 className="font-semibold text-lg mb-4">Daily Transaction Trend</h2>
            <Chart data={chartData} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h2 className="font-semibold text-lg mb-4">Recent Transactions</h2>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="border-b pb-3 last:border-none last:pb-0">
                  <div className="flex justify-between">
                    <span className="font-medium">{tx.qrisId}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${tx.status === 'success' ? 'bg-green-100 text-green-700' : tx.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Rp {Number(tx.amount).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
