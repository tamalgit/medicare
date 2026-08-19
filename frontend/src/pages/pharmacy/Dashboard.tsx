import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPharmacyDashboardStats } from '../../services/pharmacyApi';
import { useSocket } from '../../context/SocketContext';
import { 
    ShoppingCart, 
    FileSignature, 
    CheckSquare, 
    PackageSearch, 
    Truck, 
    AlertTriangle,
    TrendingUp,
    FileText,
    Clock
} from 'lucide-react';

export const PharmacyDashboard = () => {
    const { user } = useAuth();
    const isPharmacist = user?.role === 'PHARMACIST';

    const queryClient = useQueryClient();
    const { socket, isConnected } = useSocket();

    const { data: statsData, isLoading } = useQuery({
        queryKey: ['pharmacy-dashboard-stats'],
        queryFn: getPharmacyDashboardStats,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    React.useEffect(() => {
        if (socket && isConnected) {
            socket.on('new_order', () => {
                queryClient.invalidateQueries({ queryKey: ['pharmacy-dashboard-stats'] });
                queryClient.invalidateQueries({ queryKey: ['pharmacy-orders'] });
            });

            return () => {
                socket.off('new_order');
            };
        }
    }, [socket, isConnected, queryClient]);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto animate-pulse">
                <div className="h-10 bg-slate-200 rounded-lg w-1/3 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-8"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start justify-between">
                            <div className="w-full">
                                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                                <div className="h-10 bg-slate-200 rounded w-1/3 mb-2"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-slate-200 flex-shrink-0 ml-4"></div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-200 h-64"></div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 h-64"></div>
                </div>
            </div>
        );
    }

    const { adminStats: adminData, clinicalStats: clinicalData } = statsData || {};

    // Admin Stats
    const adminStats = [
        { title: 'New Orders', value: adminData?.newOrders || 0, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100', trend: 'Current' },
        { title: 'Processing Orders', value: adminData?.processingOrders || 0, icon: PackageSearch, color: 'text-purple-600', bg: 'bg-purple-100', trend: 'Current' },
        { title: 'Completed Orders', value: adminData?.completedOrders || 0, icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-100', trend: 'Current' },
        { title: 'Cancelled Orders', value: adminData?.cancelledOrders || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', trend: 'Current' }
    ];

    // Pharmacist Stats
    const clinicalStats = [
        { title: 'Pending Approval', value: clinicalData?.pendingApproval || 0, icon: FileSignature, color: 'text-amber-600', bg: 'bg-amber-100', trend: 'Current' },
        { title: 'Approved Today', value: clinicalData?.approvedToday || 0, icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-100', trend: 'Today' },
        { title: 'Clarification Needed', value: clinicalData?.clarificationNeeded || 0, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100', trend: 'Current' },
    ];

    const stats = isPharmacist ? clinicalStats : adminStats;

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {isPharmacist ? 'Clinical Dashboard' : 'Pharmacy Operations Dashboard'}
            </h1>
            <p className="text-slate-500 mb-8">Welcome back, {user?.first_name}. Here is your overview for today.</p>

            {/* Stats Grid */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${isPharmacist ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6 mb-8`}>
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 mb-1">{stat.title}</p>
                                <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                                <div className="mt-2 flex items-center text-xs font-semibold">
                                    <span className="text-slate-400">
                                        {stat.trend}
                                    </span>
                                </div>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                <Icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900">
                                {isPharmacist ? 'Priority Clinical Reviews' : 'Recent Customer Orders'}
                            </h2>
                            <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">View All</button>
                        </div>
                        <div className="flex-1 overflow-x-auto">
                            {isPharmacist ? (
                                clinicalData?.urgentPrescriptions?.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                                                <th className="p-4 font-semibold">Date</th>
                                                <th className="p-4 font-semibold">Customer</th>
                                                <th className="p-4 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {clinicalData.urgentPrescriptions.map((p: any) => (
                                                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                    <td className="p-4 text-sm text-slate-600">{new Date(p.created_at).toLocaleDateString()}</td>
                                                    <td className="p-4 text-sm font-medium text-slate-900">{p.first_name} {p.last_name}</td>
                                                    <td className="p-4">
                                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                                            {p.status.replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 p-6">
                                        <FileText className="w-12 h-12 text-slate-300 mb-3" />
                                        <p className="font-medium text-slate-600">No urgent prescriptions waiting.</p>
                                        <p className="text-sm">Navigate to 'Pending Approval' for the full list.</p>
                                    </div>
                                )
                            ) : (
                                adminData?.recentOrders?.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                                                <th className="p-4 font-semibold">Order</th>
                                                <th className="p-4 font-semibold">Date</th>
                                                <th className="p-4 font-semibold">Customer</th>
                                                <th className="p-4 font-semibold">Contact</th>
                                                <th className="p-4 font-semibold">Price</th>
                                                <th className="p-4 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {adminData.recentOrders.map((o: any) => (
                                                <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                    <td className="p-4 font-mono text-sm text-slate-700">{o.order_number}</td>
                                                    <td className="p-4 text-sm text-slate-600">{new Date(o.created_at).toLocaleDateString()}</td>
                                                    <td className="p-4 text-sm font-medium text-slate-900">{o.first_name} {o.last_name}</td>
                                                    <td className="p-4 text-sm text-slate-600">{o.mobile || 'N/A'}</td>
                                                    <td className="p-4 font-semibold text-slate-900">₹{Number(o.total_amount).toFixed(2)}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                            o.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                            o.status === 'CANCELLED' || o.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                            o.status === 'READY_TO_SHIP' || o.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {o.status.replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 p-6">
                                        <ShoppingCart className="w-12 h-12 text-slate-300 mb-3" />
                                        <p className="font-medium text-slate-600">No recent orders found.</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Action Widget */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100">
                            <h2 className="text-md font-bold text-slate-900 flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" /> Action Required
                            </h2>
                        </div>
                        <div className="p-5">
                            {isPharmacist ? (
                                <>
                                    <p className="text-sm text-slate-600 mb-4">2 prescriptions require clarification from the doctor/customer.</p>
                                    <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors text-sm">
                                        Review Clarifications
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-600 mb-4">3 medicines have fallen below their reorder level.</p>
                                    <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors text-sm">
                                        Review Inventory
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
