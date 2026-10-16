import dynamic from 'next/dynamic';
import TransactionTable from '../components/TransactionTable';

const Chart = dynamic(()=>import('../components/Chart'), { ssr:false });

export default function TransactionsPage(){
  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Transactions</h1>
      <div className="bg-white p-4 rounded shadow mb-4">
        <TransactionTable />
      </div>
    </div>
  );
}
