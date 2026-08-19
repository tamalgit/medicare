import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useQuery } from '@tanstack/react-query';
import { getMyOrders } from '../../services/orderApi';
import { MapPin, Navigation, Package, Truck, FileSignature } from 'lucide-react';

export const OrderTracking = () => {
    const { id } = useParams<{ id: string }>(); // This is the order ID
    const { socket, isConnected } = useSocket();
    const [location, setLocation] = useState<{ lat: number, lng: number, timestamp: string } | null>(null);

    const { data: orders } = useQuery({
        queryKey: ['customer-orders'],
        queryFn: getMyOrders
    });

    const order = orders?.find((o: any) => o.id === id);

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

    if (!order) return <div className="p-8 text-center text-slate-500">Loading tracking info...</div>;

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
        </div>
    );
};
