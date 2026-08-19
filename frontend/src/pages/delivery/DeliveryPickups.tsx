import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyDeliveries, updateDeliveryStatus } from '../../services/deliveryApi';
import { Building2, Package, CheckCircle2, ShieldCheck, MapPin, Phone } from 'lucide-react';

export const DeliveryPickups = () => {
    const queryClient = useQueryClient();
    const [selectedPickup, setSelectedPickup] = useState<any>(null);
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');

    const { data: deliveries, isLoading } = useQuery({
        queryKey: ['agent-deliveries'],
        queryFn: getMyDeliveries,
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => updateDeliveryStatus(selectedPickup.id, 'PICKED_UP', 'OTP Verified at Pharmacy'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agent-deliveries'] });
            setSelectedPickup(null);
            setOtp('');
            setOtpError('');
        }
    });

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate OTP verification (In real world, this would verify against backend)
        if (otp === '1234' || otp.length === 4) {
            updateMutation.mutate({});
        } else {
            setOtpError('Invalid OTP. Please check with the Pharmacist.');
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Loading your pickups...</div>;

    const pickups = deliveries?.filter((d: any) => d.status === 'ASSIGNED') || [];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
                    Pending Pickups
                </h1>
                <p className="text-slate-500 font-medium mt-1">Collect these orders from the Pharmacy to begin delivery.</p>
            </div>

            {pickups.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                    <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-800">You're all caught up!</h3>
                    <p className="text-slate-500 mt-2">No pending pickups assigned to you right now.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pickups.map((p: any) => (
                        <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                            <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-start justify-between">
                                <div>
                                    <div className="flex items-center text-amber-600 mb-1">
                                        <Building2 className="w-4 h-4 mr-1.5" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Pickup From</span>
                                    </div>
                                    <h3 className="font-black text-slate-900 text-lg">{p.pharmacy_name || 'Medicare Central Pharmacy'}</h3>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-start text-sm text-slate-600 mb-4">
                                    <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0 mt-0.5" />
                                    <span>{p.pharmacy_address || '123 Health Ave, Mumbai - 400001'}</span>
                                </div>
                                <div className="flex items-center text-sm font-medium text-slate-600 mb-6">
                                    <Phone className="w-4 h-4 text-slate-400 mr-2" />
                                    {p.pharmacy_phone || '+91 98765 43210'}
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 mt-auto">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Order Number</span>
                                        <span className="font-mono font-bold text-slate-900">{p.order_number}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Packages</span>
                                        <span className="font-bold flex items-center bg-white px-2 py-1 rounded shadow-sm text-amber-700">
                                            <Package className="w-3 h-3 mr-1" /> {p.package_count || 1} Item(s)
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setSelectedPickup(p)}
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                                >
                                    Arrived at Pharmacy
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* OTP Verification Modal */}
            {selectedPickup && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">Verify Pickup</h2>
                            <p className="text-slate-500 mt-2 font-medium">Ask the Pharmacist for the 4-digit PIN for order <span className="font-mono font-bold text-slate-700">{selectedPickup.order_number}</span></p>
                        </div>

                        <form onSubmit={handleVerifyOtp}>
                            <div className="mb-6">
                                <input 
                                    type="text" 
                                    maxLength={4}
                                    className={`w-full text-center text-4xl tracking-[1em] font-mono font-black border-2 rounded-2xl py-4 focus:ring-0 outline-none transition-colors ${
                                        otpError ? 'border-red-300 text-red-600 bg-red-50' : 'border-slate-200 focus:border-amber-500 text-slate-900 bg-slate-50'
                                    }`}
                                    placeholder="••••"
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value.replace(/[^0-9]/g, ''));
                                        setOtpError('');
                                    }}
                                    autoFocus
                                />
                                {otpError && <p className="text-red-500 text-sm font-bold mt-2 text-center">{otpError}</p>}
                                <p className="text-xs text-center text-slate-400 mt-3 font-medium">Tip: For demo purposes, any 4-digit number will work.</p>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setSelectedPickup(null);
                                        setOtp('');
                                        setOtpError('');
                                    }}
                                    className="flex-1 py-3 border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={updateMutation.isPending || otp.length !== 4}
                                    className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 disabled:opacity-50 transition-colors"
                                >
                                    {updateMutation.isPending ? 'Verifying...' : 'Confirm Pickup'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
