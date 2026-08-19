import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPrescriptions, uploadPrescription } from '../services/prescriptionApi';
import { X, UploadCloud, FileText, CheckCircle2, ShieldAlert, Loader2, AlertCircle } from 'lucide-react';

interface PrescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (prescriptionId: string) => void;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState<'SELECT' | 'UPLOAD'>('SELECT');
    const [selectedPrescription, setSelectedPrescription] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    
    const queryClient = useQueryClient();

    const { data: prescriptions, isLoading } = useQuery({
        queryKey: ['customer-prescriptions'],
        queryFn: getPrescriptions,
        enabled: isOpen,
    });

    // Auto-switch to upload if no prescriptions exist
    useEffect(() => {
        if (prescriptions && prescriptions.length === 0) {
            setActiveTab('UPLOAD');
        } else if (prescriptions && prescriptions.length > 0 && activeTab === 'UPLOAD' && !file) {
            setActiveTab('SELECT');
        }
    }, [prescriptions]);

    const uploadMutation = useMutation({
        mutationFn: uploadPrescription,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['customer-prescriptions'] });
            // API returns the uploaded prescription details in data.data
            onSuccess(data.data.id);
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Error uploading prescription');
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

    const handleContinue = () => {
        if (activeTab === 'SELECT') {
            if (!selectedPrescription) {
                setError('Please select a prescription.');
                return;
            }
            onSuccess(selectedPrescription);
            onClose();
        } else {
            if (!file) {
                setError('Please select a file to upload.');
                return;
            }
            const formData = new FormData();
            formData.append('prescription', file);
            uploadMutation.mutate(formData);
        }
    };

    if (!isOpen) return null;

    const hasPrescriptions = prescriptions && prescriptions.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3 text-amber-600">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Prescription Required</h2>
                            <p className="text-xs text-slate-500 font-medium">For controlled medicines in your order</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    <p className="text-sm text-slate-600 mb-6">
                        One or more medicines in your order require a valid prescription. Please select an existing prescription or upload a new one.
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl flex items-start border border-red-100">
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                        {hasPrescriptions && (
                            <button
                                onClick={() => { setActiveTab('SELECT'); setError(''); }}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'SELECT' ? 'bg-white text-healthcare-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Select Existing
                            </button>
                        )}
                        <button
                            onClick={() => { setActiveTab('UPLOAD'); setError(''); }}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'UPLOAD' ? 'bg-white text-healthcare-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            + Upload New
                        </button>
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-healthcare-blue" />
                        </div>
                    ) : activeTab === 'SELECT' ? (
                        <div className="space-y-3">
                            {prescriptions?.map((p: any) => (
                                <label 
                                    key={p.id} 
                                    className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPrescription === p.id ? 'border-healthcare-blue bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <input 
                                        type="radio" 
                                        name="prescription_select"
                                        className="mt-1 mr-3 w-4 h-4 text-healthcare-blue focus:ring-healthcare-blue border-slate-300"
                                        checked={selectedPrescription === p.id}
                                        onChange={() => setSelectedPrescription(p.id)}
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-slate-900">Uploaded on {new Date(p.created_at).toLocaleDateString()}</p>
                                            {selectedPrescription === p.id && <CheckCircle2 className="w-5 h-5 text-healthcare-blue" />}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                                            <span className="inline-block w-2 h-2 rounded-full mr-1.5 bg-green-500"></span>
                                            Status: {p.status}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <div>
                            {!hasPrescriptions && (
                                <div className="text-center mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                    <p className="text-sm font-semibold text-slate-700">No saved prescriptions found.</p>
                                </div>
                            )}
                            
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-healthcare-blue transition-colors cursor-pointer relative group">
                                <input 
                                    type="file" 
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center justify-center pointer-events-none">
                                    {file ? (
                                        <>
                                            <FileText className="w-12 h-12 text-healthcare-blue mb-3 group-hover:scale-110 transition-transform" />
                                            <p className="text-sm font-bold text-slate-900 truncate max-w-full px-4">{file.name}</p>
                                            <p className="text-xs font-medium text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            <p className="text-[10px] text-healthcare-blue mt-3 font-bold uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">Click to change</p>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-12 h-12 text-slate-400 mb-3 group-hover:text-healthcare-blue group-hover:scale-110 transition-all" />
                                            <p className="text-sm font-bold text-slate-700 mb-1">Click or drag file to upload</p>
                                            <p className="text-xs font-medium text-slate-500">PDF, JPG, PNG (Max 10MB)</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleContinue}
                        disabled={uploadMutation.isPending}
                        className="px-8 py-3 bg-healthcare-blue text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-70 flex items-center"
                    >
                        {uploadMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Uploading...</> : 'Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
};
