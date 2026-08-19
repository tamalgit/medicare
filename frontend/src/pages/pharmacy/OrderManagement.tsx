import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPharmacyOrders, updateOrderStatus, getOrderById } from '../../services/orderApi';
import { useSocket } from '../../context/SocketContext';
import { PackageSearch, Edit, CheckCircle, Truck, Package, XCircle, Printer, Download, ArrowRight } from 'lucide-react';
import { PrintableBill } from '../../components/PrintableBill';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const OrderManagement = () => {
    const queryClient = useQueryClient();
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [viewOrderId, setViewOrderId] = useState<string | null>(null);
    const [newStatus, setNewStatus] = useState<string>('');
    const [remarks, setRemarks] = useState('');
    const billRef = useRef<HTMLDivElement>(null);

    const { socket, isConnected } = useSocket();

    const { data: orders, isLoading } = useQuery({
        queryKey: ['pharmacy-orders'],
        queryFn: getPharmacyOrders,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    const { data: orderDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['order-details', viewOrderId],
        queryFn: () => getOrderById(viewOrderId!),
        enabled: !!viewOrderId
    });

    React.useEffect(() => {
        if (socket && isConnected) {
            socket.on('new_order', () => {
                queryClient.invalidateQueries({ queryKey: ['pharmacy-orders'] });
                queryClient.invalidateQueries({ queryKey: ['pharmacy-dashboard-stats'] });
            });

            return () => {
                socket.off('new_order');
            };
        }
    }, [socket, isConnected, queryClient]);

    const updateMutation = useMutation({
        mutationFn: (data: { id: string, status: string, remarks?: string }) => updateOrderStatus(data.id, data.status, data.remarks),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['pharmacy-orders'] });
            if (variables.id === viewOrderId) {
                queryClient.invalidateQueries({ queryKey: ['order-details', viewOrderId] });
            } else {
                setSelectedOrder(null);
                setRemarks('');
            }
        }
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate({ id: selectedOrder.id, status: newStatus, remarks });
    };

    const handleAddShipping = (orderId: string) => {
        updateMutation.mutate({ id: orderId, status: 'READY_TO_SHIP', remarks: 'Added to shipping workflow' });
    };

    const handlePrintBill = () => {
        if (!billRef.current) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(el => el.outerHTML)
            .join('\n');
            
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Invoice</title>
                    ${styles}
                </head>
                <body class="bg-white m-0 p-0">
                    ${billRef.current.innerHTML}
                </body>
            </html>
        `);
        
        printWindow.document.close();
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    const handleDownloadPDF = async () => {
        if (!billRef.current) return;
        try {
            // Temporarily show for canvas capture
            billRef.current.style.display = 'block';
            const canvas = await html2canvas(billRef.current, { scale: 2 });
            billRef.current.style.display = 'none';

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Invoice_${orderDetails?.order_number || 'Bill'}.pdf`);
        } catch (err) {
            console.error("Failed to generate PDF", err);
        }
    };

    if (isLoading) return <div className="p-8">Loading pharmacy orders...</div>;

    const statuses = ['PENDING', 'PRESCRIPTION_PENDING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center">
                <PackageSearch className="w-8 h-8 mr-3 text-healthcare-blue" /> Order Management
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
                            <th className="p-4 font-semibold">Order ID</th>
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold">Customer</th>
                            <th className="p-4 font-semibold">Contact</th>
                            <th className="p-4 font-semibold">Amount</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders?.map((order: any) => (
                            <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td 
                                    className="p-4 font-mono text-sm text-healthcare-blue hover:underline cursor-pointer"
                                    onClick={() => setViewOrderId(order.id)}
                                >
                                    {order.order_number}
                                </td>
                                <td className="p-4 text-sm text-slate-600">{new Date(order.created_at).toLocaleString()}</td>
                                <td className="p-4 text-sm font-medium text-slate-900">{order.first_name} {order.last_name}</td>
                                <td className="p-4 text-sm text-slate-600">{order.mobile || 'N/A'}</td>
                                <td className="p-4 font-semibold text-slate-900">₹{order.total_amount}</td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                        order.status === 'CANCELLED' || order.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                        order.status === 'READY_TO_SHIP' || order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                        'bg-amber-100 text-amber-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setNewStatus(order.status);
                                        }}
                                        className="text-sm font-medium text-healthcare-blue hover:text-blue-800 flex items-center justify-end w-full"
                                    >
                                        <Edit className="w-4 h-4 mr-1" /> Update
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {orders?.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    No incoming orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Update Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
                            Update Order
                            <span className="text-sm font-mono text-slate-500">{selectedOrder.order_number}</span>
                        </h2>
                        
                        <div className="mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <p className="text-sm text-slate-600 mb-1">Current Status: <strong className="text-slate-900">{selectedOrder.status}</strong></p>
                            <p className="text-sm text-slate-600">Customer: <strong className="text-slate-900">{selectedOrder.first_name} {selectedOrder.last_name}</strong></p>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">New Status</label>
                                <select 
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-healthcare-blue"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Internal Remarks (Optional)</label>
                                <textarea 
                                    rows={2}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-healthcare-blue"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Add notes for the log..."
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button 
                                    type="button" 
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={updateMutation.isPending || newStatus === selectedOrder.status}
                                    className="px-4 py-2 bg-healthcare-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                                >
                                    {updateMutation.isPending ? 'Saving...' : 'Save Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* View Details Modal */}
            {viewOrderId && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center">
                                Order Details
                            </h2>
                            <div className="flex items-center gap-4">
                                {orderDetails && (
                                    <>
                                        <button onClick={handleDownloadPDF} className="text-sm font-medium text-slate-600 hover:text-healthcare-blue flex items-center">
                                            <Download className="w-4 h-4 mr-1.5" /> Download Bill
                                        </button>
                                        <button onClick={handlePrintBill} className="text-sm font-medium text-slate-600 hover:text-healthcare-blue flex items-center">
                                            <Printer className="w-4 h-4 mr-1.5" /> Print Bill
                                        </button>
                                    </>
                                )}
                                <button onClick={() => setViewOrderId(null)} className="text-slate-400 hover:text-slate-600 ml-2">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        {isLoadingDetails ? (
                            <div className="p-8 text-center text-slate-500 animate-pulse">Loading order details...</div>
                        ) : orderDetails ? (
                            <div>
                                {/* Summary */}
                                <div className="grid grid-cols-2 gap-4 mb-6 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <div>
                                        <p className="text-slate-500 mb-1">Order Number</p>
                                        <p className="font-mono font-bold text-slate-900">{orderDetails.order_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 mb-1">Status</p>
                                        <p className="font-semibold text-healthcare-blue">{orderDetails.status.replace(/_/g, ' ')}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 mb-1">Customer</p>
                                        <p className="font-medium text-slate-900">{orderDetails.customer?.first_name} {orderDetails.customer?.last_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 mb-1">Contact Phone</p>
                                        <p className="font-medium text-slate-900">{orderDetails.customer?.mobile || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Items */}
                                <h3 className="font-semibold text-slate-900 mb-3 border-b pb-2 flex items-center">
                                    <Package className="w-4 h-4 mr-2 text-slate-400" /> Order Items
                                </h3>
                                <div className="space-y-3 mb-6">
                                    {orderDetails.items?.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-center text-sm p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-slate-100 rounded-md mr-4 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {item.image_url ? (
                                                        <img src={`http://localhost:5000${item.image_url}`} alt={item.medicine_name} className="w-full h-full object-cover" />
                                                    ) : <Package className="w-6 h-6 text-slate-300" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{item.medicine_name}</p>
                                                    <p className="text-slate-500 mt-0.5">Qty: {item.quantity} × ₹{Number(item.price || 0).toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <div className="font-bold text-slate-900">
                                                ₹{(item.quantity * Number(item.price || 0)).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Bill Details */}
                                <h3 className="font-semibold text-slate-900 mb-3 border-b pb-2">Bill Summary</h3>
                                <div className="bg-slate-50 p-4 rounded-lg mb-6 space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Subtotal</span>
                                        <span className="font-medium text-slate-900">₹{Number(orderDetails.subtotal).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Delivery Charge</span>
                                        <span className="font-medium text-slate-900">₹{Number(orderDetails.delivery_charge).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t border-slate-200 font-bold text-base">
                                        <span className="text-slate-900">Total Amount</span>
                                        <span className="text-healthcare-blue">₹{Number(orderDetails.total_amount).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Address */}
                                {orderDetails.address && (
                                    <>
                                        <h3 className="font-semibold text-slate-900 mb-3 border-b pb-2 flex items-center">
                                            <Truck className="w-4 h-4 mr-2 text-slate-400" /> Shipping Details
                                        </h3>
                                        <div className="text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                                            <p className="font-semibold text-slate-900 mb-1">{orderDetails.address.name}</p>
                                            <p className="text-slate-600">{orderDetails.address.address_line1}</p>
                                            {orderDetails.address.address_line2 && <p className="text-slate-600">{orderDetails.address.address_line2}</p>}
                                            <p className="text-slate-600">{orderDetails.address.city}, {orderDetails.address.state} - {orderDetails.address.pincode}</p>
                                            <p className="text-slate-600 mt-2 flex items-center">
                                                <span className="text-slate-400 mr-2">Phone:</span> {orderDetails.address.mobile}
                                            </p>
                                        </div>
                                    </>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                                    {orderDetails.status === 'PENDING' || orderDetails.status === 'PRESCRIPTION_PENDING' || orderDetails.status === 'PROCESSING' ? (
                                        <button 
                                            onClick={() => handleAddShipping(orderDetails.id)}
                                            disabled={updateMutation.isPending}
                                            className="px-6 py-2.5 bg-healthcare-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center"
                                        >
                                            <Truck className="w-4 h-4 mr-2" />
                                            {updateMutation.isPending ? 'Processing...' : 'Add to Shipping'}
                                        </button>
                                    ) : (
                                        <div className="px-6 py-2.5 bg-slate-50 text-slate-600 rounded-lg font-medium flex items-center border border-slate-200">
                                            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                                            {orderDetails.status === 'READY_TO_SHIP' ? 'Added to Shipping' : orderDetails.status.replace(/_/g, ' ')}
                                        </div>
                                    )}
                                </div>

                                {/* Hidden Printable Area */}
                                <div ref={billRef} style={{ display: 'none' }}>
                                    <PrintableBill order={orderDetails} />
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">Failed to load order details.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
