import React, { forwardRef } from 'react';

interface PrintableBillProps {
    order: any;
}

export const PrintableBill = forwardRef<HTMLDivElement, PrintableBillProps>(({ order }, ref) => {
    if (!order) return null;

    return (
        <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto printable-bill" style={{ color: '#000' }}>
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">MEDICARE</h1>
                    <p className="text-sm text-slate-600">Your Trusted Online Pharmacy</p>
                    <p className="text-sm text-slate-600 mt-2">123 Health Ave, Medical District</p>
                    <p className="text-sm text-slate-600">contact@medicare.com | +91 1800-123-4567</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-widest mb-2">Invoice</h2>
                    <p className="text-sm font-semibold text-slate-900">Order ID: {order.order_number}</p>
                    <p className="text-sm text-slate-600">Date: {new Date(order.created_at).toLocaleString()}</p>
                    <p className="text-sm text-slate-600 mt-1">Payment Status: <span className="font-semibold">{order.payment?.status || 'N/A'}</span></p>
                </div>
            </div>

            <div className="flex justify-between mb-8">
                <div className="w-1/2 pr-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Billed To</h3>
                    <p className="font-bold text-slate-900">{order.customer?.first_name} {order.customer?.last_name}</p>
                    <p className="text-sm text-slate-700">Phone: {order.customer?.mobile || 'N/A'}</p>
                    <p className="text-sm text-slate-700">Email: {order.customer?.email || 'N/A'}</p>
                </div>
                <div className="w-1/2 pl-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">Shipped To</h3>
                    {order.address ? (
                        <>
                            <p className="font-bold text-slate-900">{order.address.name}</p>
                            <p className="text-sm text-slate-700">{order.address.address_line1}</p>
                            {order.address.address_line2 && <p className="text-sm text-slate-700">{order.address.address_line2}</p>}
                            <p className="text-sm text-slate-700">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                            <p className="text-sm text-slate-700">Phone: {order.address.mobile}</p>
                        </>
                    ) : (
                        <p className="text-sm text-slate-500 italic">No shipping address provided.</p>
                    )}
                </div>
            </div>

            <table className="w-full text-left border-collapse mb-8">
                <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-800 text-sm">
                        <th className="py-2 px-3 font-bold text-slate-800">SKU</th>
                        <th className="py-2 px-3 font-bold text-slate-800">Description</th>
                        <th className="py-2 px-3 font-bold text-slate-800 text-center">Qty</th>
                        <th className="py-2 px-3 font-bold text-slate-800 text-right">Unit Price</th>
                        <th className="py-2 px-3 font-bold text-slate-800 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {order.items?.map((item: any, index: number) => (
                        <tr key={item.id || index} className="text-sm">
                            <td className="py-3 px-3 text-slate-700">{item.sku || 'N/A'}</td>
                            <td className="py-3 px-3 font-semibold text-slate-900">{item.medicine_name}</td>
                            <td className="py-3 px-3 text-center text-slate-700">{item.quantity}</td>
                            <td className="py-3 px-3 text-right text-slate-700">₹{Number(item.price || 0).toFixed(2)}</td>
                            <td className="py-3 px-3 text-right font-semibold text-slate-900">₹{(item.quantity * Number(item.price || 0)).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end">
                <div className="w-1/2 max-w-sm">
                    <table className="w-full text-sm">
                        <tbody>
                            <tr className="border-b border-slate-200">
                                <td className="py-2 text-slate-700">Subtotal</td>
                                <td className="py-2 text-right font-semibold">₹{Number(order.subtotal || 0).toFixed(2)}</td>
                            </tr>
                            <tr className="border-b border-slate-200">
                                <td className="py-2 text-slate-700">Delivery Charge</td>
                                <td className="py-2 text-right font-semibold">₹{Number(order.delivery_charge || 0).toFixed(2)}</td>
                            </tr>
                            {Number(order.discount_amount) > 0 && (
                                <tr className="border-b border-slate-200">
                                    <td className="py-2 text-slate-700">Discount</td>
                                    <td className="py-2 text-right font-semibold text-green-600">-₹{Number(order.discount_amount).toFixed(2)}</td>
                                </tr>
                            )}
                            <tr className="text-base">
                                <td className="py-3 font-bold text-slate-900">Total Amount</td>
                                <td className="py-3 text-right font-bold text-slate-900">₹{Number(order.total_amount || 0).toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {order.prescription_required && (
                <div className="mt-8 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500">* This order contains prescription medicines and requires a valid prescription to be presented at delivery/pickup.</p>
                </div>
            )}
            
            <div className="mt-12 text-center text-xs text-slate-500">
                <p>Thank you for choosing Medicare.</p>
                <p>This is a computer generated invoice and does not require a physical signature.</p>
            </div>
        </div>
    );
});

PrintableBill.displayName = 'PrintableBill';
