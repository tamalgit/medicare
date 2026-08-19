import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createOrder } from '../../services/orderApi';
import { getPrescriptions } from '../../services/prescriptionApi';
import { getAddresses, addAddress } from '../../services/userApi';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, CreditCard, ShieldAlert, CheckCircle2, Plus, Loader2, FileText, FileSignature } from 'lucide-react';
import { PrescriptionModal } from '../../components/PrescriptionModal';

export const Checkout = () => {
    const { cart, cartTotal, requiresPrescription, clearCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [selectedPrescriptions, setSelectedPrescriptions] = useState<string[]>(
        location.state?.selectedPrescriptionIds || []
    );
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'COD'>('UPI');
    const [error, setError] = useState('');
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    
    const [newAddress, setNewAddress] = useState({
        type: 'HOME',
        streetAddress: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
    });

    const { data: prescriptions } = useQuery({
        queryKey: ['customer-prescriptions'],
        queryFn: getPrescriptions,
        enabled: requiresPrescription
    });

    const { data: addresses, isLoading: isAddressesLoading } = useQuery({
        queryKey: ['customer-addresses'],
        queryFn: getAddresses
    });

    // Auto-select first address if available and none selected
    useEffect(() => {
        if (addresses && addresses.length > 0 && !selectedAddress) {
            const def = addresses.find((a: any) => a.is_default);
            setSelectedAddress(def ? def.id : addresses[0].id);
        }
    }, [addresses]);

    const addAddressMutation = useMutation({
        mutationFn: addAddress,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
            setSelectedAddress(data.data.id);
            setIsAddingAddress(false);
            setNewAddress({ type: 'HOME', streetAddress: '', city: '', state: '', pincode: '', isDefault: false });
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to add address');
        }
    });

    const orderMutation = useMutation({
        mutationFn: createOrder,
        onSuccess: (data) => {
            clearCart();
            queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
            navigate('/orders', { state: { success: true, orderId: data.data.orderId } });
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to place order');
        }
    });

    const handlePlaceOrder = () => {
        setError('');
        if (!selectedAddress) {
            setError('Please select a delivery address.');
            return;
        }
        if (requiresPrescription && selectedPrescriptions.length === 0) {
            setError('You must select a prescription for this order.');
            return;
        }

        orderMutation.mutate({
            addressId: selectedAddress,
            cartItems: cart,
            prescriptionIds: selectedPrescriptions,
            paymentMethod,
            deliveryType: 'STANDARD'
        });
    };

    const handleSaveAddress = (e: React.FormEvent) => {
        e.preventDefault();
        addAddressMutation.mutate(newAddress);
    };

    if (cart.length === 0) return <div className="p-8 text-center text-slate-500">Cart is empty. Redirecting...</div>;

    const deliveryCharge = cartTotal > 500 ? 0 : 50;
    const totalPayable = cartTotal + deliveryCharge;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center border border-red-200">
                    <ShieldAlert className="w-5 h-5 mr-2 flex-shrink-0" /> {error}
                </div>
            )}

            <div className="space-y-6">
                {/* Step 1: Delivery Address */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center">
                            <MapPin className="mr-2 text-healthcare-blue" /> Delivery Address
                        </h2>
                        {!isAddingAddress && (
                            <button 
                                onClick={() => setIsAddingAddress(true)}
                                className="text-sm font-bold text-healthcare-blue flex items-center hover:text-blue-800"
                            >
                                <Plus className="w-4 h-4 mr-1" /> Add New
                            </button>
                        )}
                    </div>
                    
                    {isAddressesLoading ? (
                        <div className="p-4 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-healthcare-blue" /></div>
                    ) : isAddingAddress ? (
                        <form onSubmit={handleSaveAddress} className="bg-white p-6 md:p-8 rounded-2xl border-2 border-blue-50 shadow-sm space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-teal-400"></div>
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Add New Address</h3>
                                <p className="text-sm text-slate-500 mt-1">Please enter your delivery details carefully.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Street Address</label>
                                    <input type="text" required value={newAddress.streetAddress} onChange={e => setNewAddress({...newAddress, streetAddress: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-healthcare-blue/50 focus:bg-white transition-colors" placeholder="House/Flat No., Building Name, Street" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">City</label>
                                    <input type="text" required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-healthcare-blue/50 focus:bg-white transition-colors" placeholder="e.g. Mumbai" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">State</label>
                                    <input type="text" required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-healthcare-blue/50 focus:bg-white transition-colors" placeholder="e.g. Maharashtra" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Pincode</label>
                                    <input type="text" required value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-healthcare-blue/50 focus:bg-white transition-colors" placeholder="e.g. 400001" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Address Type</label>
                                    <select value={newAddress.type} onChange={e => setNewAddress({...newAddress, type: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-healthcare-blue/50 focus:bg-white transition-colors appearance-none">
                                        <option value="HOME">Home</option>
                                        <option value="WORK">Work</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div className="col-span-1 md:col-span-2 flex items-center bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
                                    <input type="checkbox" id="isDefault" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} className="w-5 h-5 mr-3 rounded text-healthcare-blue focus:ring-healthcare-blue border-slate-300" />
                                    <label htmlFor="isDefault" className="text-sm font-bold text-slate-700 cursor-pointer select-none">Set as default address</label>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsAddingAddress(false)} className="px-6 py-3 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors">Cancel</button>
                                <button type="submit" disabled={addAddressMutation.isPending} className="px-6 py-3 bg-healthcare-blue text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                                    {addAddressMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Saving...</> : 'Save Address'}
                                </button>
                            </div>
                        </form>
                    ) : addresses?.length === 0 ? (
                        <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-slate-500 mb-3">No delivery addresses found.</p>
                            <button onClick={() => setIsAddingAddress(true)} className="px-4 py-2 bg-healthcare-blue text-white rounded-lg text-sm font-bold shadow-sm">Add an Address</button>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {addresses?.map((address: any) => (
                                <label key={address.id} className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${selectedAddress === address.id ? 'border-healthcare-blue bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
                                    <div className="flex items-start">
                                        <input 
                                            type="radio" 
                                            name="address" 
                                            value={address.id}
                                            checked={selectedAddress === address.id}
                                            onChange={() => setSelectedAddress(address.id)}
                                            className="mt-1 mr-3 text-healthcare-blue focus:ring-healthcare-blue"
                                        />
                                        <div>
                                            <div className="flex items-center mb-1">
                                                <span className="font-bold text-slate-900 mr-2">{address.type}</span>
                                                {address.is_default && <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded uppercase">Default</span>}
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                {address.street_address}<br/>
                                                {address.city}, {address.state} - <span className="font-medium text-slate-800">{address.pincode}</span>
                                            </p>
                                        </div>
                                    </div>
                                    {selectedAddress === address.id && <CheckCircle2 className="text-healthcare-blue flex-shrink-0" />}
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Step 2: Prescription Selection */}
                {requiresPrescription && (
                    <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center">
                                <ShieldAlert className="mr-2 text-amber-500" /> Required Prescriptions
                            </h2>
                        </div>
                        
                        {selectedPrescriptions.length > 0 ? (
                            <div className="bg-blue-50 border border-healthcare-blue rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3 text-healthcare-blue shadow-sm">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 flex items-center">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mr-1.5" /> 
                                            Prescription Selected
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">Will be verified by our pharmacist</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsPrescriptionModalOpen(true)}
                                    className="px-4 py-2 bg-white text-healthcare-blue text-sm font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <div className="text-center p-6 bg-red-50 border border-red-100 rounded-xl">
                                <FileSignature className="w-10 h-10 text-red-400 mx-auto mb-3" />
                                <p className="text-sm font-bold text-red-800 mb-1">Prescription is missing</p>
                                <p className="text-xs text-red-600 mb-4">You must select or upload a prescription to continue.</p>
                                <button 
                                    onClick={() => setIsPrescriptionModalOpen(true)}
                                    className="px-6 py-2.5 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                                >
                                    Select / Upload Prescription
                                </button>
                            </div>
                        )}
                        
                        <PrescriptionModal 
                            isOpen={isPrescriptionModalOpen}
                            onClose={() => setIsPrescriptionModalOpen(false)}
                            onSuccess={(id) => setSelectedPrescriptions([id])}
                        />
                    </div>
                )}

                {/* Step 3: Payment */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <CreditCard className="mr-2 text-healthcare-blue" /> Payment Method
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {['UPI', 'CARD', 'COD'].map((method) => (
                            <label key={method} className={`p-4 border rounded-lg cursor-pointer flex items-center justify-center font-medium transition-colors ${paymentMethod === method ? 'border-healthcare-blue bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                <input 
                                    type="radio" 
                                    name="payment" 
                                    className="sr-only" 
                                    checked={paymentMethod === method}
                                    onChange={() => setPaymentMethod(method as 'UPI' | 'CARD' | 'COD')}
                                />
                                {method === 'COD' ? 'Cash on Delivery' : method}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Final Review & Submit */}
                <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center shadow-lg">
                    <div className="mb-4 sm:mb-0 text-center sm:text-left">
                        <p className="text-slate-300 text-sm">Total Payable Amount</p>
                        <p className="text-3xl font-bold">₹{totalPayable}</p>
                        <p className="text-xs text-slate-400 mt-1">{cart.length} items • Delivery: ₹{deliveryCharge}</p>
                    </div>
                    <button 
                        onClick={handlePlaceOrder}
                        disabled={orderMutation.isPending}
                        className="w-full sm:w-auto px-10 py-4 bg-healthcare-blue hover:bg-blue-600 text-white font-bold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md text-lg"
                    >
                        {orderMutation.isPending ? 'Processing...' : 'Confirm & Pay'}
                    </button>
                </div>
            </div>
        </div>
    );
};
