import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPrescriptions, verifyPrescription, getPrescriptionFileUrl } from '../../services/prescriptionApi';
import { ShieldCheck, FileSearch, XCircle, CheckCircle, Clock, Package } from 'lucide-react';

export const PrescriptionVerification = () => {
    const queryClient = useQueryClient();
    const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
    const [action, setAction] = useState<string>('APPROVED');
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState('');

    const { data: prescriptions, isLoading } = useQuery({
        queryKey: ['pharmacist-prescriptions'],
        queryFn: getPrescriptions,
    });

    const verifyMutation = useMutation({
        mutationFn: (data: any) => verifyPrescription(selectedPrescription.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pharmacist-prescriptions'] });
            setSelectedPrescription(null);
            setRemarks('');
            setError('');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Error verifying prescription');
        }
    });

    const { data: fileUrl, isLoading: isFileLoading } = useQuery({
        queryKey: ['prescription-file', selectedPrescription?.id],
        queryFn: () => getPrescriptionFileUrl(selectedPrescription.id),
        enabled: !!selectedPrescription
    });

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        verifyMutation.mutate({ action, remarks, items: [] });
    };

    if (isLoading) return <div className="p-8">Loading prescriptions...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto flex h-[calc(100vh-64px)] gap-6">
            {/* List Section */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <h2 className="font-bold text-slate-900 flex items-center">
                        <ShieldCheck className="w-5 h-5 text-healthcare-blue mr-2" />
                        Verification Queue
                    </h2>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                        {prescriptions?.filter((p: any) => p.status === 'UPLOADED' || p.status === 'UNDER_REVIEW').length || 0} Pending
                    </span>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {prescriptions?.map((p: any) => (
                        <div 
                            key={p.id} 
                            onClick={() => setSelectedPrescription(p)}
                            className={`p-4 rounded-lg cursor-pointer border transition-colors ${
                                selectedPrescription?.id === p.id 
                                ? 'border-healthcare-blue bg-blue-50' 
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-slate-900 truncate pr-2">{p.first_name} {p.last_name}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium ${
                                    p.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                    p.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                    p.status === 'UPLOADED' ? 'bg-amber-100 text-amber-800' :
                                    'bg-slate-100 text-slate-800'
                                }`}>
                                    {p.status}
                                </span>
                            </div>
                            <div className="flex items-center text-xs text-slate-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(p.created_at).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Viewer & Action Section */}
            <div className="w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                {selectedPrescription ? (
                    <>
                        <div className="flex-1 bg-slate-100 relative p-4 flex items-center justify-center">
                            {isFileLoading ? (
                                <div className="text-slate-500 animate-pulse flex flex-col items-center">
                                    <FileSearch className="w-8 h-8 mb-2 opacity-50" />
                                    Loading document...
                                </div>
                            ) : fileUrl ? (
                                <iframe 
                                    src={fileUrl} 
                                    className="w-full h-full bg-white rounded-lg shadow-sm border border-slate-300"
                                    title="Prescription Viewer"
                                />
                            ) : (
                                <div className="text-red-500">Failed to load prescription document</div>
                            )}
                        </div>

                        {/* Linked Orders Panel */}
                        {selectedPrescription.linked_orders && selectedPrescription.linked_orders.length > 0 && (
                            <div className="bg-slate-50 border-t border-b border-slate-200 p-4 max-h-48 overflow-y-auto">
                                <h3 className="font-bold text-slate-800 mb-3 flex items-center text-sm">
                                    <Package className="w-4 h-4 mr-2 text-healthcare-blue" />
                                    Medicines Ordered by Customer
                                </h3>
                                <div className="space-y-3">
                                    {selectedPrescription.linked_orders.map((order: any, idx: number) => (
                                        <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3">
                                            <div className="text-xs font-semibold text-slate-500 mb-2">Order #{order.order_number}</div>
                                            <ul className="space-y-1">
                                                {order.items?.map((item: any, i: number) => (
                                                    <li key={i} className="text-sm flex justify-between items-center bg-slate-50 p-2 rounded">
                                                        <span className="font-medium text-slate-700">{item.medicine_name}</span>
                                                        <span className="text-slate-500 text-xs bg-white px-2 py-1 rounded border">Qty: {item.quantity}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Action Panel */}
                        {selectedPrescription.status !== 'APPROVED' && selectedPrescription.status !== 'REJECTED' && (
                            <div className="p-6 border-t border-slate-200 bg-white">
                                {error && (
                                    <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center border border-red-200">
                                        <XCircle className="w-5 h-5 mr-2 flex-shrink-0" /> {error}
                                    </div>
                                )}
                                <form onSubmit={handleVerify}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Verification Action</label>
                                        <div className="flex gap-4">
                                            <label className="flex flex-1 cursor-pointer">
                                                <input type="radio" name="action" className="peer sr-only" checked={action === 'APPROVED'} onChange={() => setAction('APPROVED')} />
                                                <div className="w-full p-3 text-center border rounded-lg peer-checked:bg-green-50 peer-checked:border-green-500 peer-checked:text-green-700 transition-colors">
                                                    <CheckCircle className="w-5 h-5 mx-auto mb-1" /> Approve
                                                </div>
                                            </label>
                                            <label className="flex flex-1 cursor-pointer">
                                                <input type="radio" name="action" className="peer sr-only" checked={action === 'HOLD'} onChange={() => setAction('HOLD')} />
                                                <div className="w-full p-3 text-center border rounded-lg peer-checked:bg-orange-50 peer-checked:border-orange-500 peer-checked:text-orange-700 transition-colors">
                                                    <Clock className="w-5 h-5 mx-auto mb-1" /> Hold
                                                </div>
                                            </label>
                                            <label className="flex flex-1 cursor-pointer">
                                                <input type="radio" name="action" className="peer sr-only" checked={action === 'CLARIFICATION_REQUIRED'} onChange={() => setAction('CLARIFICATION_REQUIRED')} />
                                                <div className="w-full p-3 text-center border rounded-lg peer-checked:bg-amber-50 peer-checked:border-amber-500 peer-checked:text-amber-700 transition-colors">
                                                    <FileSearch className="w-5 h-5 mx-auto mb-1" /> Clarify
                                                </div>
                                            </label>
                                            <label className="flex flex-1 cursor-pointer">
                                                <input type="radio" name="action" className="peer sr-only" checked={action === 'REJECTED'} onChange={() => setAction('REJECTED')} />
                                                <div className="w-full p-3 text-center border rounded-lg peer-checked:bg-red-50 peer-checked:border-red-500 peer-checked:text-red-700 transition-colors">
                                                    <XCircle className="w-5 h-5 mx-auto mb-1" /> Reject
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Remarks (Required for Reject/Clarify)</label>
                                        <textarea 
                                            rows={2}
                                            required={action !== 'APPROVED'}
                                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-healthcare-blue"
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            placeholder="Enter reason or pharmacist notes..."
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button 
                                            type="submit" 
                                            disabled={verifyMutation.isPending}
                                            className="px-6 py-2.5 bg-healthcare-blue text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {verifyMutation.isPending ? 'Submitting...' : 'Submit Verification'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <FileSearch className="w-16 h-16 mb-4 text-slate-200" />
                        <p className="text-lg">Select a prescription from the queue to verify</p>
                    </div>
                )}
            </div>
        </div>
    );
};
