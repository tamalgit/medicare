import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyOrders } from '../../services/orderApi';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
export const Orders = () => {
    const { data: orders, isLoading } = useQuery({
        queryKey: ['customer-orders'],
        queryFn: getMyOrders,
    });

    if (isLoading) return <div className="p-8 text-center">Loading orders...</div>;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">My Orders</h1>

            <div className="space-y-6">
                {orders?.map((order: any) => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Order Placed</p>
                                <p className="text-sm font-semibold text-slate-900">{new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total</p>
                                <p className="text-sm font-bold text-slate-900">₹{order.total_amount}</p>
                            </div>
                            <div className="sm:text-right">
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Order #</p>
                                <p className="text-sm font-mono text-slate-700">{order.order_number}</p>
                            </div>
                        </div>
                        
                        <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${
                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-600' :
                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                                    'bg-blue-100 text-healthcare-blue'
                                }`}>
                                    {order.status === 'DELIVERED' ? <CheckCircle className="w-6 h-6" /> :
                                     order.status === 'CANCELLED' ? <XCircle className="w-6 h-6" /> :
                                     <Package className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 mb-1">
                                        Status: <span className="text-healthcare-blue">{order.status.replace(/_/g, ' ')}</span>
                                    </h3>
                                    {order.prescription_required && (
                                        <p className="text-xs text-slate-500 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" /> Requires Prescription Verification
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Link 
                                to={`/orders/${order.id}/track`}
                                className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap text-center block"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}

                {orders?.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-700">No orders yet</h2>
                        <p className="text-slate-500 mt-2">You haven't placed any orders on the platform.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
