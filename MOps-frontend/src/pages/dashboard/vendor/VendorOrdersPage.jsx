import React, { useState, useEffect, useCallback } from 'react';
import { vendorService } from '../../../services/vendorService';

const VendorOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await vendorService.getVendorOrders();
            setOrders(data);
        } catch (e) {
            console.error('Error loading vendor orders:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                              o.materialName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleUpdateStatus = async (orderId, newStatus) => {
        setActionLoading(true);
        try {
            await vendorService.updateOrderStatus(orderId, newStatus);
            setToastMessage(`Updated Order PO-${orderId} to ${newStatus.replace('_', ' ')}`);
            setOrders(prev => prev.map(o => String(o.id) === String(orderId) ? { ...o, status: newStatus } : o));
            setSelectedOrder(null);
            setTimeout(() => setToastMessage(null), 3500);
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen pb-24">
            <div className="relative max-w-[1400px] mx-auto px-6 sm:px-8 pt-10 animate-fadeUp">
                
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shadow-sm">
                                📋
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Vendor Order Book</span>
                        </div>
                        <h1 className="text-[28px] font-display font-semibold text-slate-900 tracking-tight">
                            Purchase Orders & Fulfillment
                        </h1>
                        <p className="text-[13px] font-ui text-slate-500 mt-0.5">
                            Track assigned material purchase orders, dispatch status, and store deliveries.
                        </p>
                    </div>
                </div>

                {toastMessage && (
                    <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[14px] font-bold flex items-center justify-between animate-fadeUp">
                        <span>{toastMessage}</span>
                        <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
                    </div>
                )}

                {/* Filter and Search Bar */}
                <div className="mb-6 rounded-2xl bg-white/80 border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative flex-1 w-full">
                        <input
                            type="text"
                            placeholder="Search by PO number or material name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:border-blue-500 transition-all"
                        />
                        <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {['ALL', 'PENDING', 'IN_TRANSIT', 'DELIVERED'].map(st => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`px-4 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all ${statusFilter === st ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                {st.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-[14px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">PO Number</th>
                                <th className="px-6 py-4">Material & Specification</th>
                                <th className="px-6 py-4">Quantity Required</th>
                                <th className="px-6 py-4">Rate / Unit</th>
                                <th className="px-6 py-4">Total Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 italic">Fetching purchase orders...</td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 italic">No purchase orders found matching your filters.</td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 font-bold text-blue-600">
                                            {order.orderNumber}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{order.materialName}</div>
                                            <div className="text-[12px] text-slate-500">{order.specification}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            {order.quantity} {order.unit}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            ₹{Number(order.ratePerUnit || 0).toLocaleString('en-IN')} / {order.unit}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            ₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.status === 'DELIVERED' ? (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">✓ Delivered</span>
                                            ) : order.status === 'IN_TRANSIT' ? (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">🚚 In Transit</span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">⏳ Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                                            >
                                                Details & Update
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Order Detail Modal */}
                {selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeUp">
                        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5">
                            <div className="flex items-center justify-between border-b pb-3">
                                <h3 className="text-[18px] font-bold text-slate-900">
                                    📦 Purchase Order {selectedOrder.orderNumber}
                                </h3>
                                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>

                            <div className="space-y-4 text-[14px]">
                                <div className="bg-slate-50 p-4 rounded-2xl border space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">Material:</span>
                                        <span className="font-bold text-slate-900">{selectedOrder.materialName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">Specification:</span>
                                        <span className="font-bold text-slate-700">{selectedOrder.specification}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">Quantity:</span>
                                        <span className="font-bold text-slate-900">{selectedOrder.quantity} {selectedOrder.unit}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">Total Value:</span>
                                        <span className="font-bold text-blue-600 text-[16px]">₹{Number(selectedOrder.totalPrice || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[12px] text-blue-800">
                                    <span className="font-bold uppercase tracking-wider block mb-1">Delivery Destination:</span>
                                    {selectedOrder.deliveryAddress}
                                </div>
                            </div>

                            <div className="pt-3 border-t flex items-center justify-between gap-3">
                                <span className="text-[12px] text-slate-500 font-bold">Update Status:</span>

                                <div className="flex items-center gap-2">
                                    {selectedOrder.status !== 'IN_TRANSIT' && selectedOrder.status !== 'DELIVERED' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'IN_TRANSIT')}
                                            disabled={actionLoading}
                                            className="px-4 py-2 rounded-xl text-[12px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
                                        >
                                            Mark In Transit
                                        </button>
                                    )}

                                    {selectedOrder.status !== 'DELIVERED' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                                            disabled={actionLoading}
                                            className="px-4 py-2 rounded-xl text-[12px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20"
                                        >
                                            Mark Delivered
                                        </button>
                                    )}

                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold text-[12px]"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default VendorOrdersPage;
