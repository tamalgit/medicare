import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getMyDeliveries } from '../../services/deliveryApi';
import { Truck, MapPin, Package, Clock, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DeliveryDashboard = () => {
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['delivery-stats'],
        queryFn: getDashboardStats,
    });

    const { data: deliveries, isLoading: deliveriesLoading } = useQuery({
        queryKey: ['agent-deliveries'],
        queryFn: getMyDeliveries,
    });

    if (statsLoading || deliveriesLoading) return <div className="p-8 text-center text-slate-500 font-medium">Loading your dashboard...</div>;

    const todaysDeliveries = deliveries?.filter((d: any) => {
        const today = new Date().toISOString().split('T')[0];
        const assignedDate = new Date(d.created_at).toISOString().split('T')[0];
        return today === assignedDate;
    }) || [];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
                    Dashboard Overview
                </h1>
                <p className="text-slate-500 font-medium mt-1">Here is your delivery summary for today.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-amber-300 transition-colors">
                    <div className="text-amber-600 bg-amber-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900">{stats?.assigned_count || 0}</p>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Assigned</p>
                    </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-purple-300 transition-colors">
                    <div className="text-purple-600 bg-purple-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Truck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900">{stats?.pickup_count || 0}</p>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Pickup</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-blue-300 transition-colors">
                    <div className="text-blue-600 bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Navigation className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900">{stats?.transit_count || 0}</p>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">In Transit</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-green-300 transition-colors">
                    <div className="text-green-600 bg-green-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900">{stats?.delivered_count || 0}</p>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Delivered</p>
                    </div>
                </div>
            </div>

            {/* Today's Deliveries Table */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Today's Deliveries</h2>
                    <Link to="/delivery/my-deliveries" className="text-sm font-bold text-amber-600 hover:text-amber-700">View All</Link>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {todaysDeliveries.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">
                                            No deliveries assigned for today yet.
                                        </td>
                                    </tr>
                                ) : (
                                    todaysDeliveries.map((d: any) => (
                                        <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-mono font-medium text-slate-900">{d.order_number}</td>
                                            <td className="p-4 font-bold text-slate-700">{d.first_name} {d.last_name}</td>
                                            <td className="p-4 font-bold text-slate-900">₹{d.total_amount}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    d.status === 'ASSIGNED' ? 'bg-slate-100 text-slate-700' :
                                                    d.status === 'PICKED_UP' ? 'bg-purple-100 text-purple-700' :
                                                    d.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' :
                                                    d.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {d.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
