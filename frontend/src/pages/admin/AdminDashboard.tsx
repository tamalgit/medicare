import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../../services/adminApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Package, Activity, ArrowUpRight, ArrowDownRight, ShieldCheck, Server } from 'lucide-react';

export const AdminDashboard = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: getDashboardStats,
    });

    if (isLoading) return <div className="p-8 text-slate-500 font-medium animate-pulse">Loading global system statistics...</div>;

    const kpis = [
        { title: 'Global Users', value: stats?.totalUsers || 0, trend: '+12%', isPositive: true, icon: Users, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
        { title: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, trend: '+18%', isPositive: true, icon: TrendingUp, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
        { title: 'Global Orders', value: stats?.totalOrders || 0, trend: '-2%', isPositive: false, icon: Package, color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/20' },
        { title: 'System Health', value: '100%', trend: 'Optimum', isPositive: true, icon: Activity, color: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/20' },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Executive Overview</h1>
                    <p className="text-slate-500 font-medium mt-1">Real-time metrics across all global pharmacy operations.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100 flex items-center">
                        <Server className="w-3.5 h-3.5 mr-1.5" /> Core Services Online
                    </span>
                    <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 flex items-center">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Secure Connection
                    </span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {kpis.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={idx} className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-xl ${kpi.shadow} relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white shadow-lg`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-md ${kpi.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {kpi.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                        {kpi.trend}
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{kpi.title}</p>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</h3>
                            </div>
                            {/* Decorative background element */}
                            <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-br ${kpi.color} opacity-5 group-hover:scale-150 transition-transform duration-500`}></div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900">Revenue Trajectory</h2>
                        <select className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 rounded-lg px-3 py-1.5 outline-none">
                            <option>Last 6 Months</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.monthlyRevenue || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.2}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Bar dataKey="value" fill="url(#colorRevenue)" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Medicines */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-indigo-600" /> Top Performing Inventory
                    </h2>
                    <div className="space-y-4 flex-1">
                        {stats?.topMedicines?.map((m: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors group border border-transparent hover:border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                                        #{idx + 1}
                                    </div>
                                    <span className="font-bold text-slate-700 group-hover:text-slate-900">{m.name}</span>
                                </div>
                                <span className="bg-indigo-50 px-3 py-1 rounded-full text-xs font-black text-indigo-700 border border-indigo-100">
                                    {m.sold} Units
                                </span>
                            </div>
                        ))}
                        {(!stats?.topMedicines || stats?.topMedicines.length === 0) && (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                <Package className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm font-medium">No sales data available yet.</p>
                            </div>
                        )}
                    </div>
                    <button className="w-full mt-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl transition-colors border border-slate-200">
                        View Full Report
                    </button>
                </div>
            </div>
        </div>
    );
};
