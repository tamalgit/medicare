import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { uploadPrescription, getPrescriptions, linkPrescription } from '../../services/prescriptionApi';
import { getMyOrders } from '../../services/orderApi';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Clock, CheckCircle2, XCircle, Eye, Package, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrescriptionUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [selectedLinkOrderId, setSelectedLinkOrderId] = useState<{ [key: string]: string }>({});
    const [error, setError] = useState('');
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Fetch existing prescriptions
    const { data: prescriptions, isLoading } = useQuery({
        queryKey: ['customer-prescriptions'],
        queryFn: getPrescriptions
    });

    // Fetch pending orders
    const { data: orders } = useQuery({
        queryKey: ['customer-orders'],
        queryFn: getMyOrders
    });

    const pendingOrders = orders?.filter((o: any) => o.status === 'PRESCRIPTION_PENDING' || o.status === 'PENDING') || [];

    const mutation = useMutation({
        mutationFn: uploadPrescription,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer-prescriptions'] });
            queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
            if (selectedOrderId) {
                navigate('/orders');
            } else {
                navigate('/checkout');
            }
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Error uploading prescription');
        }
    });

    const linkMutation = useMutation({
        mutationFn: ({ prescriptionId, orderId }: { prescriptionId: string, orderId: string }) => linkPrescription(prescriptionId, orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer-prescriptions'] });
            queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
            navigate('/orders');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Error linking prescription');
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            if (selected.size > 10 * 1024 * 1024) {
                setError('File size exceeds 10MB limit.');
                return;
            }
            setFile(selected);
            setError('');
        }
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('prescription', file);
        if (selectedOrderId) {
            formData.append('orderId', selectedOrderId);
        }
        mutation.mutate(formData);
    };

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'VERIFIED': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'REJECTED': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Clock className="w-5 h-5 text-amber-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'VERIFIED': return 'text-green-700 bg-green-50 border-green-200';
            case 'REJECTED': return 'text-red-700 bg-red-50 border-red-200';
            default: return 'text-amber-700 bg-amber-50 border-amber-200';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 mt-6">
            
            {/* My Prescriptions Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">My Prescriptions</h2>
                {isLoading ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">Loading...</div>
                ) : prescriptions && prescriptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {prescriptions.map((p: any) => (
                            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col hover:border-healthcare-blue transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4 text-healthcare-blue">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">Uploaded on {new Date(p.created_at).toLocaleDateString()}</p>
                                            <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${getStatusColor(p.status)}`}>
                                                {getStatusIcon(p.status)}
                                                <span className="ml-1 uppercase">{p.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <a 
                                        href={p.file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-2 text-slate-400 hover:text-healthcare-blue hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                                        title="View Prescription"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </a>
                                </div>

                                {pendingOrders.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                                        <select
                                            value={selectedLinkOrderId[p.id] || pendingOrders[0].id}
                                            onChange={(e) => setSelectedLinkOrderId({ ...selectedLinkOrderId, [p.id]: e.target.value })}
                                            className="flex-1 p-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-healthcare-blue focus:border-healthcare-blue bg-slate-50"
                                        >
                                            {pendingOrders.map((o: any) => (
                                                <option key={o.id} value={o.id}>Order #{o.order_number}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => linkMutation.mutate({ prescriptionId: p.id, orderId: selectedLinkOrderId[p.id] || pendingOrders[0].id })}
                                            disabled={linkMutation.isPending}
                                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-colors flex items-center shadow-sm disabled:opacity-50 whitespace-nowrap"
                                        >
                                            {linkMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                                            Attach
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
                        <p className="text-slate-500">You haven't uploaded any prescriptions yet.</p>
                    </div>
                )}
            </div>

            {/* Upload Form Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Upload New Prescription</h2>
                <p className="text-slate-600 mb-8 text-sm">Please upload a valid prescription from a registered medical practitioner to purchase controlled medicines.</p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-lg flex items-center border border-red-100">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleUpload}>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 hover:border-healthcare-blue transition-colors cursor-pointer relative group">
                        <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center pointer-events-none">
                            {file ? (
                                <>
                                    <FileText className="w-16 h-16 text-healthcare-blue mb-4 group-hover:scale-110 transition-transform" />
                                    <p className="text-lg font-bold text-slate-900">{file.name}</p>
                                    <p className="text-sm font-medium text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <p className="text-xs text-healthcare-blue mt-4 font-bold uppercase tracking-wider">Click to change file</p>
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="w-16 h-16 text-slate-400 mb-4 group-hover:text-healthcare-blue group-hover:scale-110 transition-all" />
                                    <p className="text-lg font-bold text-slate-700 mb-1">Click to browse or drag and drop</p>
                                    <p className="text-sm font-medium text-slate-500">PDF, JPG, PNG up to 10MB</p>
                                </>
                            )}
                        </div>
                    </div>

                    {pendingOrders.length > 0 && (
                        <div className="mt-8 bg-amber-50 p-6 rounded-xl border border-amber-200">
                            <h3 className="font-bold text-slate-800 mb-2 flex items-center">
                                <Package className="w-5 h-5 mr-2 text-amber-600" /> Link to Specific Order (Optional)
                            </h3>
                            <p className="text-sm text-slate-600 mb-4">If you are uploading this prescription for an order you already placed, select it here.</p>
                            <select
                                value={selectedOrderId}
                                onChange={(e) => setSelectedOrderId(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-healthcare-blue focus:border-healthcare-blue text-sm"
                            >
                                <option value="">Do not link to any order</option>
                                {pendingOrders.map((o: any) => (
                                    <option key={o.id} value={o.id}>
                                        Order #{o.order_number} ({new Date(o.created_at).toLocaleDateString()}) - {o.status.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="mt-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4">Valid Prescription Guide</h3>
                        <ul className="space-y-3 text-sm font-medium text-slate-600">
                            <li className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                                Must contain Doctor's name, qualifications, and registration number.
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                                Patient's name and date of prescription must be clearly visible.
                            </li>
                            <li className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                                Medicine names, dosage, and duration must be readable.
                            </li>
                        </ul>
                    </div>

                    <div className="mt-8">
                        <button 
                            type="submit"
                            disabled={!file || mutation.isPending}
                            className="w-full bg-healthcare-blue text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-lg flex justify-center items-center"
                        >
                            {mutation.isPending ? 'Uploading...' : 'Upload & Proceed'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
