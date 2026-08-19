import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInventory, updateStock } from '../../services/inventoryApi';
import { Link } from 'react-router-dom';
import { Package, Plus, Minus, AlertTriangle } from 'lucide-react';

export const Inventory = () => {
    const queryClient = useQueryClient();
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [updateQty, setUpdateQty] = useState('');
    const [action, setAction] = useState<'IN' | 'OUT'>('IN');
    const [batchNumber, setBatchNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [sku, setSku] = useState('');

    const openModal = (item: any) => {
        setSelectedItem(item);
        setUpdateQty('');
        setAction('IN');
        setBatchNumber(item.batch_number || '');
        setExpiryDate(item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : '');
        setSku(item.sku || '');
    };

    const { data: inventory, isLoading } = useQuery({
        queryKey: ['pharmacy-inventory'],
        queryFn: getInventory,
    });

    const mutation = useMutation({
        mutationFn: updateStock,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pharmacy-inventory'] });
            setSelectedItem(null);
            setUpdateQty('');
        }
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem || !updateQty) return;
        
        mutation.mutate({
            inventoryId: selectedItem.id,
            medicineId: selectedItem.medicine_id,
            batchId: selectedItem.batch_id,
            batchNumber: batchNumber || undefined,
            expiryDate: expiryDate || undefined,
            sku: sku || undefined,
            quantity: parseInt(updateQty, 10),
            transactionType: action,
            remarks: 'Manual update from dashboard'
        });
    };

    if (isLoading) return <div className="p-8">Loading inventory...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                    <Package className="mr-3 text-healthcare-blue" />
                    Pharmacy Inventory
                </h1>
                <Link 
                    to="/pharmacy/medicines/add"
                    className="flex items-center px-4 py-2.5 bg-healthcare-blue hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm hover:shadow-md transition-all"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Medicine
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                            <th className="p-4 font-semibold">Medicine</th>
                            <th className="p-4 font-semibold">SKU</th>
                            <th className="p-4 font-semibold">Batch</th>
                            <th className="p-4 font-semibold">Expiry</th>
                            <th className="p-4 font-semibold">Stock</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory?.map((item: any) => (
                            <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-4 font-medium text-slate-900">{item.medicine_name}</td>
                                <td className="p-4 text-slate-600">{item.sku || '-'}</td>
                                <td className="p-4 text-slate-600">{item.batch_number || 'N/A'}</td>
                                <td className="p-4 text-slate-600">
                                    {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        item.quantity > 20 ? 'bg-green-100 text-green-800' : 
                                        item.quantity > 0 ? 'bg-amber-100 text-amber-800' : 
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {item.quantity} units
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => openModal(item)}
                                        className="text-sm font-medium text-healthcare-blue hover:text-blue-800"
                                    >
                                        Update Stock
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {inventory?.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    No inventory found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Update Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Update Stock: {selectedItem.medicine_name}</h2>
                        <form onSubmit={handleUpdate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Action</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input type="radio" name="action" checked={action === 'IN'} onChange={() => setAction('IN')} className="mr-2" />
                                        Stock In (+)
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" name="action" checked={action === 'OUT'} onChange={() => setAction('OUT')} className="mr-2" />
                                        Stock Out (-)
                                    </label>
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity to {action}</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    required
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-healthcare-blue"
                                    value={updateQty}
                                    onChange={(e) => setUpdateQty(e.target.value)}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-healthcare-blue"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    placeholder="e.g. MED-001"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Batch Number (Optional)</label>
                                    <input 
                                        type="text" 
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-healthcare-blue"
                                        value={batchNumber}
                                        onChange={(e) => setBatchNumber(e.target.value)}
                                        placeholder="e.g. BATCH-123"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date (Optional)</label>
                                    <input 
                                        type="date" 
                                        className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-healthcare-blue"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button 
                                    type="button" 
                                    onClick={() => setSelectedItem(null)}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={mutation.isPending}
                                    className="px-4 py-2 bg-healthcare-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {mutation.isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
