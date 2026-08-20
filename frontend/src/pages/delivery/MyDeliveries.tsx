import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyDeliveries, updateDeliveryStatus } from '../../services/deliveryApi';
import { Truck, MapPin, Package, Navigation, Phone, Calendar } from 'lucide-react';

export const MyDeliveries = () => {
    const queryClient = useQueryClient();
    const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
    const [newStatus, setNewStatus] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [otp, setOtp] = useState('');

    const { data: deliveries, isLoading } = useQuery({
        queryKey: ['agent-deliveries'],
        queryFn: getMyDeliveries,
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => updateDeliveryStatus(selectedDelivery.id, data.status, data.notes, data.otp),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agent-deliveries'] });
            setSelectedDelivery(null);
            setNotes('');
            setOtp('');
        }
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate({ status: newStatus, notes, otp });
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Loading your deliveries...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
                    My Deliveries
                </h1>
                <p className="text-slate-500 font-medium mt-1">Manage all your assigned delivery routes.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Address</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Items</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned</th>
                                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {deliveries?.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                                        No deliveries found.
                                    </td>
                                </tr>
                            ) : (
                                deliveries?.map((d: any) => (
                                    <tr key={d.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-5">
                                            <span className="font-mono font-bold text-slate-900">{d.order_number}</span>
                                        </td>
                                        <td className="p-5">
                                            <p className="font-bold text-slate-900">{d.first_name} {d.last_name}</p>
                                            <p className="text-xs text-slate-500 flex items-center mt-1">
                                                <Phone className="w-3 h-3 mr-1" /> {d.mobile}
                                            </p>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-start max-w-xs">
                                                <MapPin className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {d.customer_street}, {d.customer_city} - {d.customer_pincode}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 font-bold w-8 h-8 rounded-lg">
                                                {d.package_count || 1}
                                            </span>
                                        </td>
                                        <td className="p-5 font-black text-slate-900">
                                            ₹{d.total_amount}
                                        </td>
                                        <td className="p-5">
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
                                        <td className="p-5">
                                            <div className="flex items-center text-sm font-medium text-slate-500">
                                                <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                                                {new Date(d.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            {d.status !== 'DELIVERED' && d.status !== 'FAILED' && (
                                                <button 
                                                    onClick={() => {
                                                        setSelectedDelivery(d);
                                                        setNewStatus(d.status);
                                                    }}
                                                    className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-lg text-sm transition-colors"
                                                >
                                                    Update
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Update Modal */}
            {selectedDelivery && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Update Status</h2>
                        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-sm text-slate-600 mb-1">Order: <strong className="font-mono text-slate-900">{selectedDelivery.order_number}</strong></p>
                            <p className="text-sm text-slate-600">Customer: <strong className="text-slate-900">{selectedDelivery.first_name} {selectedDelivery.last_name}</strong></p>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="mb-5">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Change Status To</label>
                                <select 
                                    className="w-full border border-slate-300 rounded-lg p-3 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    <option value="ASSIGNED" disabled>ASSIGNED</option>
                                    <option value="PICKED_UP">PICKED UP (From Pharmacy)</option>
                                    <option value="IN_TRANSIT">IN TRANSIT (On the way)</option>
                                    <option value="DELIVERED">DELIVERED (Successfully)</option>
                                    <option value="FAILED">FAILED</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Notes (Optional)</label>
                                <textarea 
                                    rows={3}
                                    className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Enter reason for failure, who received it, etc..."
                                />
                            </div>
                            {newStatus === 'DELIVERED' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Delivery Code (OTP)</label>
                                    <input 
                                        type="text"
                                        required
                                        maxLength={6}
                                        className="w-full border border-slate-300 rounded-lg p-3 font-mono text-center tracking-widest focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        placeholder="000000"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Ask the customer for the 6-digit code sent to their email/SMS.</p>
                                </div>
                            )}
                            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setSelectedDelivery(null);
                                        setOtp('');
                                    }}
                                    className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={updateMutation.isPending || newStatus === selectedDelivery.status}
                                    className="px-5 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 font-bold transition-colors"
                                >
                                    {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
