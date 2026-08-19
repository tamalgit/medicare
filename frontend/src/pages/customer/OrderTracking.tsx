import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '../../services/orderApi';
import { MapPin, Navigation, Package, Truck, FileSignature, Receipt, CreditCard, CalendarClock } from 'lucide-react';

export const OrderTracking = () => {
    const { id } = useParams<{ id: string }>(); // This is the order ID
    const { socket, isConnected } = useSocket();
    const [location, setLocation] = useState<{ lat: number, lng: number, timestamp: string } | null>(null);

    const { data: order, isLoading } = useQuery({
        queryKey: ['order-details', id],
        queryFn: () => getOrderById(id as string),
        enabled: !!id
    });

    useEffect(() => {
        if (socket && isConnected && id) {
            socket.emit('join_order_room', id);

            socket.on('location_update', (data) => {
                setLocation(data);
            });

            return () => {
                socket.off('location_update');
            };
        }
    }, [socket, isConnected, id]);

    if (isLoading || !order) return <div className="p-8 text-center text-slate-500">Loading order info...</div>;

    const deliveryDate = new Date(order.created_at);
    deliveryDate.setDate(deliveryDate.getDate() + 2); // Mock 2 days delivery

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                    <Navigation className="mr-3 text-healthcare-blue" /> Live Order Tracking
                </h1>
                <Link to="/orders" className="text-sm font-semibold text-healthcare-blue hover:underline">
                    Back to Orders
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 p-6 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Order Number</p>
                        <p className="font-mono text-lg text-slate-900">{order.order_number}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                            order.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            'bg-amber-100 text-amber-800'
                        }`}>
                            {order.status.replace(/_/g, ' ')}
                        </span>
                    </div>
                </div>

                <div className="p-8 flex flex-col items-center">
                    {order.status === 'IN_TRANSIT' ? (
                        <>
                            <div className="w-full max-w-2xl bg-slate-100 h-64 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center mb-6">
                                {/* Simulated Map View */}
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#94a3b8 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
                                {location ? (
                                    <div className="text-center z-10 bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2 text-healthcare-blue animate-pulse">
                                            <Truck className="w-6 h-6" />
                                        </div>
                                        <p className="font-semibold text-slate-900">Driver Location</p>
                                        <p className="font-mono text-xs text-slate-500 mt-1">Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</p>
                                        <p className="text-xs text-slate-400 mt-2">Last updated: {new Date(location.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                ) : (
                                    <div className="text-center z-10 text-slate-500 flex flex-col items-center">
                                        <div className="w-8 h-8 border-4 border-healthcare-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                                        Waiting for GPS signal from delivery agent...
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-center text-sm text-slate-600 bg-blue-50 px-4 py-3 rounded-lg border border-blue-100 w-full max-w-2xl">
                                <span className="relative flex h-3 w-3 mr-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-healthcare-blue"></span>
                                </span>
                                Connection secured. Receiving live socket events.
                            </div>
                        </>
                    ) : order.status === 'DELIVERED' ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Delivered Successfully!</h2>
                            <p className="text-slate-500">Thank you for choosing Medicare.</p>
                        </div>
                    ) : order.status === 'PRESCRIPTION_PENDING' ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileSignature className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Prescription Required</h2>
                            <p className="text-slate-500 mb-6">This order requires a valid prescription to proceed.</p>
                            <Link to="/customer/prescriptions/upload" className="px-6 py-3 bg-healthcare-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-colors inline-block">
                                Upload Prescription
                            </Link>
                        </div>
                    ) : order.status === 'PENDING' && order.prescription_required ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-blue-100 text-healthcare-blue rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileSignature className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Prescription Under Review</h2>
                            <p className="text-slate-500">Your uploaded prescription is currently being verified by our pharmacist. Once approved, your order will be processed and shipped.</p>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-slate-700 mb-2">Tracking not yet available</h2>
                            <p className="text-slate-500">Live tracking will begin once the delivery agent picks up your order and is en route.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Complete Order Details Section */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center">
                        <Receipt className="mr-2 text-healthcare-blue w-5 h-5" /> Complete Order Details
                    </h2>
                </div>
                
                <div className="p-6 md:p-8">
                    {/* Items Table */}
                    <div className="mb-8 overflow-x-auto">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">Medicines Ordered</h3>
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="text-xs text-slate-500 uppercase bg-slate-50">
                                    <th className="p-3 font-semibold rounded-tl-lg">Item</th>
                                    <th className="p-3 font-semibold">Price</th>
                                    <th className="p-3 font-semibold text-center">Qty</th>
                                    <th className="p-3 font-semibold text-right rounded-tr-lg">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {order.items?.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50">
                                        <td className="p-3">
                                            <p className="font-bold text-slate-900">{item.medicine_name}</p>
                                            <p className="text-xs text-slate-500">SKU: {item.sku || 'N/A'}</p>
                                        </td>
                                        <td className="p-3 text-slate-600">₹{Number(item.price).toFixed(2)}</td>
                                        <td className="p-3 text-center font-medium">{item.quantity}</td>
                                        <td className="p-3 text-right font-bold text-slate-900">₹{Number(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Left Column: Address & Payment */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b pb-2 flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" /> Shipping & Billing Address
                                </h3>
                                {order.address ? (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded mb-2">{order.address.type}</span>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {order.address.street_address}<br/>
                                            {order.address.city}, {order.address.state} - {order.address.pincode}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">Address details unavailable.</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b pb-2 flex items-center">
                                        <CreditCard className="w-4 h-4 mr-2" /> Payment
                                    </h3>
                                    {order.payment ? (
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{order.payment.payment_method === 'COD' ? 'Cash on Delivery' : order.payment.payment_method}</p>
                                            <p className={`text-xs font-semibold mt-1 ${order.payment.status === 'SUCCESS' ? 'text-green-600' : 'text-amber-600'}`}>
                                                Status: {order.payment.status}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">Payment info unavailable.</p>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b pb-2 flex items-center">
                                        <CalendarClock className="w-4 h-4 mr-2" /> Delivery
                                    </h3>
                                    <p className="text-sm font-bold text-slate-900">{deliveryDate.toLocaleDateString()}</p>
                                    <p className="text-xs text-slate-500 mt-1">Estimated delivery</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Bill Details */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b pb-2 flex items-center">
                                <Receipt className="w-4 h-4 mr-2" /> Bill Summary
                            </h3>
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-3">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Subtotal</span>
                                    <span>₹{Number(order.subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Discount</span>
                                    <span className="text-green-600">-₹{Number(order.discount_amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Delivery Charge</span>
                                    <span>{Number(order.delivery_charge) === 0 ? <span className="text-green-600 font-medium">FREE</span> : `₹${Number(order.delivery_charge).toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Taxes</span>
                                    <span>₹{Number(order.tax_amount).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-slate-200 my-3 pt-3 flex justify-between items-center">
                                    <span className="text-base font-bold text-slate-900">Total Paid</span>
                                    <span className="text-2xl font-black text-slate-900">₹{Number(order.total_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
