import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPharmacyOrders, updateOrderStatus } from '../../services/orderApi';
import { PackageSearch, Edit, CheckCircle, Truck, Package, XCircle } from 'lucide-react';

export const OrderManagement = () => {
    const queryClient = useQueryClient();
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [newStatus, setNewStatus] = useState<string>('');
    const [remarks, setRemarks] = useState('');

    const { data: orders, isLoading } = useQuery({
        queryKey: ['pharmacy-orders'],
        queryFn: getPharmacyOrders,
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => updateOrderStatus(selectedOrder.id, data.status, data.remarks),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pharmacy-orders'] });
            setSelectedOrder(null);
            setRemarks('');
        }
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate({ status: newStatus, remarks });
    };

    if (isLoading) return <div className="p-8">Loading pharmacy orders...</div>;

    const statuses = ['PENDING', 'PRESCRIPTION_PENDING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center">
                <PackageSearch className="w-8 h-8 mr-3 text-healthcare-blue" /> Order Management
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                            <th className="p-4 font-semibold">Order ID</th>
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold">Customer</th>
                            <th className="p-4 font-semibold">Amount</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders?.map((order: any) => (
                            <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-mono text-sm text-slate-700">{order.order_number}</td>
                                <td className="p-4 text-sm text-slate-600">{new Date(order.created_at).toLocaleString()}</td>
                                <td className="p-4 text-sm font-medium text-slate-900">{order.first_name} {order.last_name}</td>
                                <td className="p-4 font-semibold text-slate-900">₹{order.total_amount}</td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                        order.status === 'CANCELLED' || order.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                        order.status === 'READY_TO_SHIP' || order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                        'bg-amber-100 text-amber-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setNewStatus(order.status);
                                        }}
                                        className="text-sm font-medium text-healthcare-blue hover:text-blue-800 flex items-center justify-end w-full"
                                    >
                                        <Edit className="w-4 h-4 mr-1" /> Update
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {orders?.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    No incoming orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Update Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
                            Update Order
                            <span className="text-sm font-mono text-slate-500">{selectedOrder.order_number}</span>
                        </h2>
                        
                        <div className="mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <p className="text-sm text-slate-600 mb-1">Current Status: <strong className="text-slate-900">{selectedOrder.status}</strong></p>
                            <p className="text-sm text-slate-600">Customer: <strong className="text-slate-900">{selectedOrder.first_name} {selectedOrder.last_name}</strong></p>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">New Status</label>
                                <select 
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-healthcare-blue"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Internal Remarks (Optional)</label>
                                <textarea 
                                    rows={2}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-healthcare-blue"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Add notes for the log..."
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button 
                                    type="button" 
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={updateMutation.isPending || newStatus === selectedOrder.status}
                                    className="px-4 py-2 bg-healthcare-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                                >
                                    {updateMutation.isPending ? 'Saving...' : 'Save Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
