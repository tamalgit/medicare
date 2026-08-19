import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getCategories, getManufacturers, addMedicine } from '../../services/medicineApi';
import { Plus, ArrowLeft, Loader2, Pill, Activity, BriefcaseMedical, UploadCloud } from 'lucide-react';

export const AddMedicine = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        genericName: '',
        brandName: '',
        sku: '',
        categoryId: '',
        manufacturerId: '',
        prescriptionRequired: false,
        strength: '',
        packSize: '',
        mrp: '',
        sellingPrice: '',
        description: '',
        uses: '',
        directions: '',
        storageInfo: '',
        safetyAdvice: '',
        imageUrl: ''
    });

    const [imageFile, setImageFile] = useState<File | null>(null);

    const [error, setError] = useState('');

    const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
    const { data: manufacturers } = useQuery({ queryKey: ['manufacturers'], queryFn: getManufacturers });

    const mutation = useMutation({
        mutationFn: addMedicine,
        onSuccess: () => {
            navigate('/pharmacy/inventory');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to add medicine');
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Validation
        if (!formData.categoryId || !formData.manufacturerId) {
            return setError('Please select a category and manufacturer');
        }
        
        const submitData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'mrp' || key === 'sellingPrice') {
                submitData.append(key, parseFloat(value as string).toString());
            } else if (key === 'prescriptionRequired') {
                submitData.append(key, value.toString());
            } else if (value !== null && value !== '') {
                submitData.append(key, value as string);
            }
        });

        if (imageFile) {
            submitData.append('image', imageFile);
        }

        mutation.mutate(submitData);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto pb-24">
            <div className="flex items-center mb-8">
                <button 
                    onClick={() => navigate('/pharmacy/inventory')}
                    className="mr-4 p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors border border-slate-200"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Add New Medicine</h1>
                    <p className="text-slate-500 mt-1">Register a new medicine into the global system database.</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Basic Info Section */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center mb-6">
                        <Pill className="w-5 h-5 mr-2 text-healthcare-blue" /> Basic Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Medicine Name <span className="text-rose-500">*</span></label>
                            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:ring-0 focus:border-[#10353a] bg-slate-50 focus:bg-white transition-colors" placeholder="e.g. Paracetamol 500mg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">SKU (Stock Keeping Unit)</label>
                            <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:ring-0 focus:border-[#10353a] bg-slate-50 focus:bg-white transition-colors" placeholder="e.g. MED-001" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Generic Name</label>
                            <input type="text" name="genericName" value={formData.genericName} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:ring-0 focus:border-[#10353a] bg-slate-50 focus:bg-white transition-colors" placeholder="e.g. Paracetamol" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Brand Name</label>
                            <input type="text" name="brandName" value={formData.brandName} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:ring-0 focus:border-[#10353a] bg-slate-50 focus:bg-white transition-colors" placeholder="e.g. Crocin" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Medicine Image</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors relative">
                                <div className="space-y-1 text-center">
                                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                                    <div className="flex text-sm text-slate-600 justify-center">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-healthcare-blue hover:text-[#10353a] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#10353a]">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                                    {imageFile && (
                                        <p className="text-sm font-semibold text-[#10353a] mt-2">Selected: {imageFile.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Classification Section */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center mb-6">
                        <Activity className="w-5 h-5 mr-2 text-healthcare-blue" /> Classification & Pricing
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Category <span className="text-rose-500">*</span></label>
                            <select name="categoryId" required value={formData.categoryId} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:ring-0 focus:border-[#10353a] bg-slate-50 focus:bg-white transition-colors">
                                <option value="">Select Category</option>
                                {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Manufacturer <span className="text-rose-500">*</span></label>
                            <select name="manufacturerId" required value={formData.manufacturerId} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:ring-0 focus:border-[#10353a] bg-slate-50 focus:bg-white transition-colors">
                                <option value="">Select Manufacturer</option>
                                {manufacturers?.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">MRP (₹) <span className="text-rose-500">*</span></label>
                            <input type="number" step="0.01" min="0" name="mrp" required value={formData.mrp} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:ring-0 focus:border-[#10353a] bg-slate-50 focus:bg-white transition-colors" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Selling Price (₹) <span className="text-rose-500">*</span></label>
                            <input type="number" step="0.01" min="0" name="sellingPrice" required value={formData.sellingPrice} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:ring-0 focus:border-[#10353a] bg-slate-50 focus:bg-white transition-colors" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Strength</label>
                            <input type="text" name="strength" value={formData.strength} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:ring-0 focus:border-[#10353a] bg-slate-50 focus:bg-white transition-colors" placeholder="e.g. 500mg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Pack Size</label>
                            <input type="text" name="packSize" value={formData.packSize} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:ring-0 focus:border-[#10353a] bg-slate-50 focus:bg-white transition-colors" placeholder="e.g. 10 Tablets" />
                        </div>
                    </div>
                    
                    <div className="flex items-center p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <input type="checkbox" id="prescriptionRequired" name="prescriptionRequired" checked={formData.prescriptionRequired} onChange={handleChange} className="w-5 h-5 text-amber-600 rounded border-amber-300 focus:ring-amber-500" />
                        <label htmlFor="prescriptionRequired" className="ml-3 text-sm font-bold text-amber-900">
                            Prescription Required (Rx Only)
                        </label>
                    </div>
                </div>

                {/* Additional Details */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center mb-6">
                        <BriefcaseMedical className="w-5 h-5 mr-2 text-healthcare-blue" /> Details & Advice
                    </h2>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                            <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:ring-0 focus:border-[#10353a] bg-slate-50 focus:bg-white transition-colors"></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Uses</label>
                                <textarea name="uses" rows={2} value={formData.uses} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:ring-0 focus:border-[#10353a] bg-slate-50 focus:bg-white transition-colors"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Directions</label>
                                <textarea name="directions" rows={2} value={formData.directions} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:ring-0 focus:border-[#10353a] bg-slate-50 focus:bg-white transition-colors"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Storage Info</label>
                                <textarea name="storageInfo" rows={2} value={formData.storageInfo} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:ring-0 focus:border-[#10353a] bg-slate-50 focus:bg-white transition-colors"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Safety Advice</label>
                                <textarea name="safetyAdvice" rows={2} value={formData.safetyAdvice} onChange={handleChange} className="w-full border-2 border-slate-100 rounded-xl p-3 focus:ring-0 focus:border-[#10353a] bg-slate-50 focus:bg-white transition-colors"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={mutation.isPending}
                        className="flex items-center px-8 py-4 bg-gradient-to-r from-[#10353a] to-[#1a555c] hover:from-[#0a2529] hover:to-[#10353a] text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 group"
                    >
                        {mutation.isPending ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Plus className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />}
                        Save Medicine
                    </button>
                </div>
            </form>
        </div>
    );
};
