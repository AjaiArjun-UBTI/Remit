// src/pages/UserDashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { claimsApi } from '../services/claimsApi';

interface Analytics {
  summary: {
    totalSubmitted: number;
    totalClaims: number;
    totalApprovedCount: number;
    pendingCount: number;
    approvalRate: number;
  };
  monthlyTrend: Array<{
    date: string;
    pending: number;
    approved: number;
    fullyApproved: number;
    total: number;
  }>;
  weeklyClaims: Array<{
    day: string;
    claims: number;
  }>;
  claimsByType: Array<{
    name: string;
    percentage: number;
  }>;
  recentPending: Array<{
    id: string;
    title: string;
    amount: number;
    date: string;
    type: string;
  }>;
}

const generateHeatmapData = () => {
  const times = ["6am", "10am", "12pm", "5pm", "8pm"];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const data: Array<{ time: string; day: string; value: number }> = [];

  times.forEach(time => {
    days.forEach(day => {
      let value = 0;
      if (time === "10am") value = day === "F" ? 16 : Math.floor(Math.random() * 7) + 3;
      if (time === "12pm") value = day === "F" ? 26 : Math.floor(Math.random() * 12) + 8;
      if (time === "5pm")  value = day === "F" ? 34 : Math.floor(Math.random() * 18) + 10;
      if (time === "8pm")  value = day === "S" ? 14 : Math.floor(Math.random() * 5);
      data.push({ time, day, value });
    });
  });
  return data;
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [heatmapData] = useState(generateHeatmapData());
  const maxHeat = Math.max(...heatmapData.map(d => d.value)) || 1;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const userData = sessionStorage.getItem('userData');
        if (!userData) { navigate('/login'); return; }
        const { UserID, TenantID } = JSON.parse(userData);
        const data = await claimsApi.getUserAnalytics(UserID.toString(), TenantID.toString());
        setAnalytics(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [navigate]);

  const formatCurrency = (v: number) => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
    </div>
  );

  if (!analytics) return null;

  const topCategory = analytics.claimsByType[0];
  const last7 = analytics.monthlyTrend.slice(-7);
  const sparklineData = {
    submitted: last7.map(m => m.total),
    claims: analytics.weeklyClaims.map(w => w.claims),
    approved: last7.map(m => m.fullyApproved),
    pending: last7.map(m => m.pending),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 px-4 pb-16">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Dashboard Header */}
        <div className="pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-3">
            Your claims overview and insights
          </p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Submitted", value: formatCurrency(analytics.summary.totalSubmitted), trend: sparklineData.submitted, color: "#3b82f6" },
            { label: "Claims Filed", value: analytics.summary.totalClaims, trend: sparklineData.claims, color: "#10b981" },
            { label: "Approved", value: analytics.summary.totalApprovedCount, trend: sparklineData.approved, color: "#059669" },
            { label: "Pending", value: analytics.summary.pendingCount, trend: sparklineData.pending, color: "#f59e0b" },
          ].map((c, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">{c.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{c.value}</p>
              <ResponsiveContainer width="100%" height={28} className="mt-2">
                <AreaChart data={c.trend.map(v => ({ v }))}>
                  <defs>
                    <linearGradient id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c.color} stopOpacity={0.3}/>
                      <stop offset="100%" stopColor={c.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={c.color} strokeWidth={1.5} fill={`url(#g${i})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>

        {/* Main Charts – Now 3 Clean Cards */}

{/* Main Charts – Now with Donut Chart instead of Area Chart */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

  {/* 1. Claims by Type – Beautiful Donut Chart */}
  <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Claims by Type</h3>
    
    <div className="flex flex-col lg:flex-row items-center gap-8">
      {/* Donut Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={analytics.claimsByType}
            dataKey="percentage"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={4}
            cornerRadius={12}
          >
            {analytics.claimsByType.map((_entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"][index % 6]} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `${value}%`}
            contentStyle={{ borderRadius: 12, fontSize: 13, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          />
          {/* Center Text */}
          <text x="50%" y="50%" textAnchor="middle" dominant-baseline="middle" className="text-3xl font-bold fill-gray-900 dark:fill-white">
            {analytics.summary.totalClaims}
          </text>
          <text x="50%" y="58%" textAnchor="middle" className="text-sm fill-gray-500">
            Total Claims
          </text>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-3">
        {analytics.claimsByType.slice(0, 6).map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"][i] }}
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
              <p className="text-xs text-gray-500">{item.percentage}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* 2. Claims by Time of Day – Heatmap */}
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Claims by Time of Day</h3>
    <div className="max-w-xs mx-auto">
      <div className="grid grid-cols-8 gap-2">
        <div className="space-y-5 text-right text-xs font-medium text-gray-600 dark:text-gray-400 pt-3">
          <div>6am</div><div>10am</div><div>12pm</div><div>5pm</div><div>8pm</div>
        </div>
        <div className="col-span-7 grid grid-cols-7 gap-2">
          {["M","T","W","T","F","S","S"].map(day => (
            <div key={day} className="space-y-2">
              {["6am","10am","12pm","5pm","8pm"].map(time => {
                const cell = heatmapData.find(d => d.time === time && d.day === day);
                const intensity = cell ? cell.value / maxHeat : 0;
                const bg = intensity === 0 ? "#f8fafc" :
                          intensity < 0.3 ? "#dbeafe" :
                          intensity < 0.6 ? "#93c5fd" :
                          intensity < 0.8 ? "#3b82f6" : "#1d4ed8";
                return (
                  <div
                    key={time}
                    className="w-full aspect-square rounded-lg transition hover:scale-125 hover:shadow-md"
                    style={{ backgroundColor: bg }}
                    title={`${cell?.value || 0} claims`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-5 mt-4 text-xs font-medium text-gray-600 dark:text-gray-400">
        {["M","T","W","T","F","S","S"].map(d => <span key={d}>{d}</span>)}
      </div>
    </div>
  </div>

</div>

        {/* Right Column – Weekly, Approval Rate, Most Claimed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-xs text-center text-gray-600 dark:text-gray-400 mb-2">This Week</h3>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={analytics.weeklyClaims}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Bar dataKey="claims" fill="#3b82f6" radius={6} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">Approval Rate</p>
            <div className="relative w-32 h-32 mx-auto mt-3">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[{value: analytics.summary.approvalRate}, {value: 100 - analytics.summary.approvalRate}]}
                    dataKey="value"
                    cx="50%" cy="50%"
                    innerRadius={48}
                    outerRadius={64}
                    startAngle={180}
                    endAngle={0}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#e2e8f0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{analytics.summary.approvalRate}%</p>
              </div>
            </div>
          </div>

          {topCategory && (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-10 text-white">
              <p className="text-xs opacity-90">Most Claimed</p>
              <p className="text-xl font-bold mt-1">{topCategory.name}</p>
              <p className="text-4xl font-extrabold mt-3">{topCategory.percentage}%</p>
              <p className="text-xs opacity-80 mt-1">of total spend</p>
            </div>
          )}
        </div>

        {/* Recent Pending Claims */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-base font-semibold">Recent Pending Claims</h2>
            <button onClick={() => navigate('/myclaims')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">View all</button>
          </div>
          {analytics.recentPending.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-sm">No pending claims</div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {analytics.recentPending.slice(0, 4).map(c => (
                <div key={c.id} onClick={() => navigate('/myclaims')} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(c.date)} • {c.type}</p>
                    </div>
                    <p className="text-sm font-bold ml-3">₹{c.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}