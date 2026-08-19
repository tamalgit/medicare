import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../services/api';
import { Trash2, Plus, Minus, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PrescriptionModal } from '../../components/PrescriptionModal';

export const Cart = () => {
    const { cart, updateQuantity, removeFromCart, cartTotal, requiresPrescription } = useCart();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (cart.length === 0) {
        return (
            <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-48 h-48 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-6xl">🛒</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
                <p className="text-slate-500 mb-8">Looks like you haven't added any medicines to your cart yet.</p>
                <Link to="/" className="px-8 py-3 bg-healthcare-blue text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                    Browse Medicines
                </Link>
            </div>
        );
    }

    const deliveryCharge = cartTotal > 500 ? 0 : 50;
    const totalPayable = cartTotal + deliveryCharge;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Shopping Cart</h1>
            
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="w-full lg:w-2/3 space-y-4">
                    {requiresPrescription && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start text-amber-800">
                            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-sm">Prescription Required</h4>
                                <p className="text-sm opacity-90">One or more items in your cart require a prescription. You will need to upload it during checkout.</p>
                            </div>
                        </div>
                    )}

                    {cart.map((item) => (
                        <div key={item.medicine_id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-2">
                                {item.image_url ? (
                                    <img src={item.image_url.startsWith('http') ? item.image_url : `${API_BASE_URL}${item.image_url}`} alt={item.name} className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <span className="text-2xl">💊</span>
                                )}
                            </div>
                            
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900 text-lg">{item.name}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="font-bold text-slate-900">₹{item.price}</span>
                                    {item.mrp > item.price && (
                                        <span className="text-sm text-slate-400 line-through">₹{item.mrp}</span>
                                    )}
                                </div>
                                {item.prescription_required && (
                                    <span className="inline-block mt-2 text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded">
                                        Rx Required
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-4 sm:pt-0 mt-4 sm:mt-0">
                                <div className="flex items-center border border-slate-300 rounded-lg">
                                    <button 
                                        onClick={() => updateQuantity(item.medicine_id, item.quantity - 1)}
                                        className="p-2 hover:bg-slate-50 rounded-l-lg text-slate-600"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-10 text-center font-medium">{item.quantity}</span>
                                    <button 
                                        onClick={() => updateQuantity(item.medicine_id, item.quantity + 1)}
                                        className="p-2 hover:bg-slate-50 rounded-r-lg text-slate-600"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <button 
                                    onClick={() => removeFromCart(item.medicine_id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-1/3">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-6">Bill Details</h2>
                        
                        <div className="space-y-4 text-slate-600 mb-6 border-b border-slate-200 pb-6">
                            <div className="flex justify-between">
                                <span>Item Total (MRP)</span>
                                <span>₹{cartTotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Charge</span>
                                <span>{deliveryCharge === 0 ? <span className="text-green-600 font-medium">FREE</span> : `₹${deliveryCharge}`}</span>
                            </div>
                            {deliveryCharge > 0 && (
                                <p className="text-xs text-slate-400">Free delivery on orders above ₹500</p>
                            )}
                        </div>
                        
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-lg font-bold text-slate-900">To Pay</span>
                            <span className="text-2xl font-bold text-slate-900">₹{totalPayable}</span>
                        </div>

                        <button 
                            onClick={() => {
                                if (requiresPrescription) {
                                    setIsModalOpen(true);
                                } else {
                                    navigate('/checkout');
                                }
                            }}
                            className="w-full bg-healthcare-blue text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm"
                        >
                            Proceed to Checkout
                            <ShieldCheck className="w-5 h-5 ml-2 opacity-80" />
                        </button>
                    </div>
                </div>
            </div>

            <PrescriptionModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={(prescriptionId) => {
                    navigate('/checkout', { state: { selectedPrescriptionIds: [prescriptionId] } });
                }}
            />
        </div>
    );
};
