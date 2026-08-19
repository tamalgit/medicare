import React from 'react';
import { useAuth } from '../../context/AuthContext';
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

    // Admin Stats
    const adminStats = [
        { title: 'New Orders (Today)', value: '12', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+20%' },
        { title: 'Ready to Ship', value: '8', icon: PackageSearch, color: 'text-purple-600', bg: 'bg-purple-100', trend: '+4' },
        { title: 'Shipped Today', value: '15', icon: Truck, color: 'text-green-600', bg: 'bg-green-100', trend: '+15%' },
        { title: 'Low Stock Alerts', value: '3', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', trend: '+1' },
        { title: 'Total Revenue (Today)', value: '₹4,250', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: '+10%' },
    ];

    // Pharmacist Stats
    const clinicalStats = [
        { title: 'Pending Approval', value: '5', icon: FileSignature, color: 'text-amber-600', bg: 'bg-amber-100', trend: '+2' },
        { title: 'Approved Today', value: '24', icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-100', trend: '+5' },
        { title: 'Clarification Needed', value: '2', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100', trend: '-1' },
    ];

    const stats = isPharmacist ? clinicalStats : adminStats;

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {isPharmacist ? 'Clinical Dashboard' : 'Pharmacy Operations Dashboard'}
            </h1>
            <p className="text-slate-500 mb-8">Welcome back, {user?.first_name}. Here is your overview for today.</p>

            {/* Stats Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 ${isPharmacist ? 'lg:grid-cols-3' : 'lg:grid-cols-3'} gap-6 mb-8`}>
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 mb-1">{stat.title}</p>
                                <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                                <div className="mt-2 flex items-center text-xs font-semibold">
                                    <span className={stat.trend.startsWith('+') ? 'text-green-600' : 'text-amber-600'}>
                                        {stat.trend}
                                    </span>
                                    <span className="text-slate-400 ml-1">vs yesterday</span>
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
                        <div className="p-6 flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-50/50">
                            {isPharmacist ? (
                                <>
                                    <FileText className="w-12 h-12 text-slate-300 mb-3" />
                                    <p className="font-medium text-slate-600">No urgent prescriptions waiting.</p>
                                    <p className="text-sm">Navigate to 'Pending Approval' for the full list.</p>
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="w-12 h-12 text-slate-300 mb-3" />
                                    <p className="font-medium text-slate-600">The advanced order table will be implemented in Phase 3.</p>
                                    <p className="text-sm">Navigate to 'Orders' to see the current basic view.</p>
                                </>
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
