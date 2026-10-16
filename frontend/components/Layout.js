export default function StatsCard({ title, value, tone = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    amber: 'bg-amber-50 text-amber-700'
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4">
      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${colorMap[tone]}`}>{title}</div>
      <div className="mt-4 text-2xl font-bold text-slate-800">{value}</div>
    </div>
  );
}
