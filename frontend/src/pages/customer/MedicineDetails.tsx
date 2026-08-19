import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMedicineDetails } from '../../services/medicineApi';
import { API_BASE_URL } from '../../services/api';
import { ShieldAlert, Package, Pill, CheckCircle, Clock, ShoppingCart, Star, BadgePercent } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const MedicineDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { cart, addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);
    
    const hasItems = cart.length > 0;

    const { data: med, isLoading, error } = useQuery({
        queryKey: ['medicine', id],
        queryFn: () => getMedicineDetails(id as string),
        enabled: !!id
    });

    if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-blue"></div></div>;
    if (error || !med) return <div className="text-center py-20 text-red-500">Error loading medicine details.</div>;

    const discountPercentage = med.mrp > med.selling_price 
        ? Math.round(((med.mrp - med.selling_price) / med.mrp) * 100) 
        : 0;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans bg-slate-50 min-h-screen">
            {/* Breadcrumb Mock */}
            <div className="text-xs text-slate-500 mb-6 flex items-center">
                Home <span className="mx-2">›</span> Healthcare <span className="mx-2">›</span> <span className="text-slate-800 font-medium">{med.name}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* LEFT MAIN COLUMN */}
                <div className="w-full lg:w-2/3 space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Image Section */}
                            <div className="md:w-5/12 flex items-center justify-center p-4 border border-slate-100 rounded-xl relative group">
                                {med.image_url ? (
                                    <img src={med.image_url.startsWith('http') ? med.image_url : `${API_BASE_URL}${med.image_url}`} alt={med.name} className="max-w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <Pill className="w-32 h-32 text-slate-200" />
                                )}
                                {/* Thumbnails Mock */}
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white px-2 py-1 shadow-sm rounded-lg border border-slate-100">
                                    <div className="w-10 h-10 border-2 border-healthcare-blue rounded bg-slate-50"></div>
                                    <div className="w-10 h-10 border border-slate-200 rounded bg-slate-50 opacity-50"></div>
                                </div>
                            </div>
                            
                            {/* Details Section */}
                            <div className="md:w-7/12 flex flex-col">
                                <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{med.name}</h1>
                                <p className="text-sm text-healthcare-blue font-semibold mb-4 cursor-pointer hover:underline">Visit {med.manufacturer_name || 'Store'}</p>
                                
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex text-yellow-400">
                                        {[1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                                        <Star className="w-4 h-4 fill-current opacity-30" />
                                    </div>
                                    <span className="text-xs text-slate-500">(432 ratings)</span>
                                </div>
                                
                                <div className="flex items-end gap-3 mb-1">
                                    <span className="text-3xl font-extrabold text-slate-900">₹{Number(med.selling_price).toFixed(2)}</span>
                                    {discountPercentage > 0 && (
                                        <>
                                            <span className="text-sm text-slate-400 line-through mb-1">MRP ₹{Number(med.mrp).toFixed(2)}</span>
                                            <span className="text-xs font-bold text-white bg-rose-400 px-2 py-0.5 rounded-sm mb-1">{discountPercentage}% OFF</span>
                                        </>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mb-4">Inclusive of all taxes</p>
                                
                                <p className="text-sm text-slate-600 mb-6 font-medium">Delivery by <span className="font-bold text-slate-800">Tomorrow, 12:00 pm - 1:00 pm</span></p>

                                {/* Variants Mock */}
                                <div className="mb-8 border-t border-slate-100 pt-6">
                                    <h4 className="text-sm font-bold text-slate-800 mb-3">Select Available Variant</h4>
                                    <p className="text-xs text-slate-500 mb-2">Pack Size</p>
                                    <div className="flex gap-3">
                                        <button className="px-4 py-2 border-2 border-healthcare-blue text-healthcare-blue font-bold rounded-lg bg-blue-50 text-sm">{med.pack_size || 'Standard'}</button>
                                        <button className="px-4 py-2 border border-slate-200 text-slate-600 font-medium rounded-lg hover:border-slate-300 text-sm">Large Pack</button>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <button 
                                        onClick={() => {
                                            addToCart({
                                                medicine_id: med.id,
                                                name: med.name,
                                                price: med.selling_price,
                                                mrp: med.mrp,
                                                quantity: 1,
                                                prescription_required: med.prescription_required,
                                                image_url: med.image_url ? (med.image_url.startsWith('http') ? med.image_url : `${API_BASE_URL}${med.image_url}`) : undefined
                                            });
                                            setIsAdded(true);
                                            setTimeout(() => setIsAdded(false), 2000);
                                        }}
                                        className={`w-48 flex items-center justify-center font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm text-base ${
                                            isAdded 
                                            ? 'bg-green-500 hover:bg-green-600 text-white' 
                                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                                        }`}
                                    >
                                        {isAdded ? (
                                            <><CheckCircle className="w-5 h-5 mr-2" /> Added</>
                                        ) : (
                                            'Add To Cart'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Tabs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Product Details</h2>
                        
                        <div className="space-y-6">
                            {med.description && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 mb-2">Description</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">{med.description}</p>
                                </div>
                            )}
                            
                            {med.uses && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 mb-2">Uses</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">{med.uses}</p>
                                </div>
                            )}

                            {med.directions && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 mb-2">Directions for Use</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">{med.directions}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Similar Products (Mock Carousel) */}
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Similar Products</h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="min-w-[180px] bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer">
                                    <div className="h-24 bg-slate-50 rounded-lg flex items-center justify-center mb-3">
                                        <Pill className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2 mb-2">Similar Item {i} - 100ml</h4>
                                    <span className="text-sm font-extrabold text-slate-900">₹{(med.selling_price * 0.8).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR COLUMN */}
                <div className="w-full lg:w-1/3 space-y-6">
                    {/* View Cart Box */}
                    <div className={`bg-white rounded-2xl shadow-sm border p-6 transition-colors ${hasItems ? 'border-healthcare-blue bg-blue-50/30' : 'border-slate-200'}`}>
                        <p className={`text-sm font-semibold mb-4 ${hasItems ? 'text-healthcare-blue' : 'text-slate-600'}`}>
                            {hasItems ? `${cart.length} item(s) in your cart. You can now checkout!` : 'Please add item(s) to proceed'}
                        </p>
                        <button 
                            onClick={() => navigate('/cart')}
                            className={`w-full text-white font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center shadow-sm ${hasItems ? 'bg-healthcare-blue hover:bg-blue-800' : 'bg-slate-400 hover:bg-slate-500'}`}
                        >
                            View Cart <span className="ml-2 font-black text-xl leading-none">›</span>
                        </button>
                    </div>

                    {/* Offers Box */}
                    <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">
                        <div className="bg-rose-50/50 p-4 border-b border-rose-100 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center">
                                <span className="mr-2 text-rose-500">%%</span> Offers Just for you
                            </h3>
                            <span className="text-xs font-bold text-healthcare-blue cursor-pointer">View All</span>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-start">
                                <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center mr-3 flex-shrink-0">
                                    <BadgePercent className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-700 leading-tight mb-1">Get 27% OFF on Orders with 12-Month Plus Membership at ₹149</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center mr-3 flex-shrink-0">
                                    <BadgePercent className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-700 leading-tight mb-1">Get 23% OFF on Orders with 12-Month Plus Membership at ₹149</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
